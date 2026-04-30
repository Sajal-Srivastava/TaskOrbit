const express = require('express');

const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const {
  memberAssignSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
} = require('../validation/schemas');

const router = express.Router();

const getProjectById = async (projectId) => {
  const result = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
  return result.rows[0];
};

const isProjectMember = async (projectId, userId) => {
  const result = await query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId],
  );
  return result.rowCount > 0;
};

const ensureProjectAccess = async (projectId, user) => {
  const project = await getProjectById(projectId);
  if (!project) {
    return { error: { status: 404, message: 'Project not found.' } };
  }

  const member = await isProjectMember(projectId, user.id);
  if (!member) {
    return { error: { status: 403, message: 'You are not a member of this project.' } };
  }

  return { project };
};

router.use(authenticate);

router.get('/users', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role FROM users ORDER BY name ASC, email ASC',
    );
    return res.json({ users: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.description, p.owner_id, p.created_at,
              u.name AS owner_name,
              (
                SELECT COUNT(*)::int
                FROM tasks t
                WHERE t.project_id = p.id
              ) AS task_count
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       JOIN users u ON u.id = p.owner_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id],
    );

    return res.json({ projects: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/', validateBody(projectCreateSchema), async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const created = await query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, req.user.id],
    );

    const project = created.rows[0];

    await query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
      [project.id, req.user.id],
    );

    return res.status(201).json({ project });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const { error, project } = await ensureProjectAccess(projectId, req.user);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const members = await query(
      `SELECT u.id, u.name, u.email, u.role
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY u.name ASC`,
      [projectId],
    );

    return res.json({ project, members: members.rows });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', validateBody(projectUpdateSchema), async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const project = await getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Only owner or admin can update project.' });
    }

    const updated = await query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [req.body.name ?? null, req.body.description ?? null, projectId],
    );

    return res.json({ project: updated.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const project = await getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Only owner or admin can delete project.' });
    }

    await query('DELETE FROM projects WHERE id = $1', [projectId]);
    return res.json({ message: 'Project deleted.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/members', validateBody(memberAssignSchema), async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const project = await getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Only owner or admin can manage members.' });
    }

    const { userId } = req.body;

    const userExists = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (!userExists.rowCount) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [projectId, userId],
    );

    return res.status(201).json({ message: 'Member added to project.' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id/members/:userId', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const targetUserId = Number(req.params.userId);

    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Only owner or admin can manage members.' });
    }

    if (project.owner_id === targetUserId) {
      return res.status(400).json({ message: 'Project owner cannot be removed.' });
    }

    await query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [
      projectId,
      targetUserId,
    ]);

    return res.json({ message: 'Member removed from project.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/tasks', async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const { error } = await ensureProjectAccess(projectId, req.user);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const result = await query(
      `SELECT t.id, t.project_id, t.title, t.description, t.status, t.due_date,
              t.assignee_id, t.created_by, t.created_at, t.updated_at,
              assignee.name AS assignee_name,
              creator.name AS creator_name,
              (t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status <> 'done') AS is_overdue
       FROM tasks t
       LEFT JOIN users assignee ON assignee.id = t.assignee_id
       JOIN users creator ON creator.id = t.created_by
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId],
    );

    return res.json({ tasks: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/tasks', validateBody(taskCreateSchema), async (req, res, next) => {
  try {
    const projectId = Number(req.params.id);
    const { error } = await ensureProjectAccess(projectId, req.user);

    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (req.body.assigneeId) {
      const isAssigneeMember = await isProjectMember(projectId, req.body.assigneeId);
      if (!isAssigneeMember) {
        return res.status(400).json({ message: 'Assignee must be a project member.' });
      }
    }

    const created = await query(
      `INSERT INTO tasks (project_id, title, description, status, due_date, assignee_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        projectId,
        req.body.title,
        req.body.description || null,
        req.body.status || 'todo',
        req.body.dueDate || null,
        req.body.assigneeId || null,
        req.user.id,
      ],
    );

    return res.status(201).json({ task: created.rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
