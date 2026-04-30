const express = require('express');

const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { taskUpdateSchema } = require('../validation/schemas');

const router = express.Router();

const getTaskById = async (taskId) => {
  const result = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
  return result.rows[0];
};

const isProjectMember = async (projectId, userId) => {
  const result = await query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId],
  );
  return result.rowCount > 0;
};

router.use(authenticate);

router.get('/dashboard', async (req, res, next) => {
  try {
    const { status, projectId, overdue } = req.query;

    const values = [req.user.id];
    const where = ['pm.user_id = $1'];

    if (status && ['todo', 'in_progress', 'done'].includes(status)) {
      values.push(status);
      where.push(`t.status = $${values.length}`);
    }

    if (projectId && Number(projectId)) {
      values.push(Number(projectId));
      where.push(`t.project_id = $${values.length}`);
    }

    if (overdue === 'true') {
      where.push("t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status <> 'done'");
    }

    const result = await query(
      `SELECT t.id, t.project_id, t.title, t.description, t.status, t.due_date,
              t.assignee_id, t.created_by, t.created_at, t.updated_at,
              p.name AS project_name,
              assignee.name AS assignee_name,
              creator.name AS creator_name,
              (t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status <> 'done') AS is_overdue
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       JOIN project_members pm ON pm.project_id = t.project_id
       LEFT JOIN users assignee ON assignee.id = t.assignee_id
       JOIN users creator ON creator.id = t.created_by
       WHERE ${where.join(' AND ')}
       ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC`,
      values,
    );

    return res.json({ tasks: result.rows });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', validateBody(taskUpdateSchema), async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const task = await getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const allowed = await isProjectMember(task.project_id, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not a member of this project.' });
    }

    if (req.body.assigneeId) {
      const isAssigneeMember = await isProjectMember(task.project_id, req.body.assigneeId);
      if (!isAssigneeMember) {
        return res.status(400).json({ message: 'Assignee must be a project member.' });
      }
    }

    const updated = await query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           due_date = COALESCE($4, due_date),
           assignee_id = COALESCE($5, assignee_id),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        req.body.title ?? null,
        req.body.description ?? null,
        req.body.status ?? null,
        req.body.dueDate ?? null,
        req.body.assigneeId ?? null,
        taskId,
      ],
    );

    return res.json({ task: updated.rows[0] });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const task = await getTaskById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const allowed = await isProjectMember(task.project_id, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: 'You are not a member of this project.' });
    }

    if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
      return res.status(403).json({ message: 'Only admin or task creator can delete task.' });
    }

    await query('DELETE FROM tasks WHERE id = $1', [taskId]);
    return res.json({ message: 'Task deleted.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
