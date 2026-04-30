const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const { pool } = require('../config/db');

const run = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const adminPassword = await bcrypt.hash('admin123', 10);
    const memberPassword = await bcrypt.hash('member123', 10);

    const adminResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Demo Admin', 'admin@demo.local', adminPassword, 'admin'],
    );

    const memberResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Demo Member', 'member@demo.local', memberPassword, 'member'],
    );

    const adminId = adminResult.rows[0].id;
    const memberId = memberResult.rows[0].id;

    const projectResult = await client.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [
        'Team Launch Sprint',
        'Demo project seeded for quick walkthrough of the app.',
        adminId,
      ],
    );

    let projectId;

    if (projectResult.rowCount) {
      projectId = projectResult.rows[0].id;
    } else {
      const existingProject = await client.query(
        'SELECT id FROM projects WHERE name = $1 ORDER BY id ASC LIMIT 1',
        ['Team Launch Sprint'],
      );
      projectId = existingProject.rows[0].id;
    }

    await client.query(
      `INSERT INTO project_members (project_id, user_id)
       VALUES ($1, $2), ($1, $3)
       ON CONFLICT DO NOTHING`,
      [projectId, adminId, memberId],
    );

    await client.query('DELETE FROM tasks WHERE project_id = $1', [projectId]);

    await client.query(
      `INSERT INTO tasks (project_id, title, description, status, due_date, assignee_id, created_by)
       VALUES
       ($1, 'Set up repository rules', 'Define branch protection and PR templates.', 'todo', CURRENT_DATE + INTERVAL '2 day', $2, $3),
       ($1, 'Implement API authentication', 'JWT login and signup flow.', 'in_progress', CURRENT_DATE + INTERVAL '1 day', $2, $3),
       ($1, 'Create dashboard UI', 'Build responsive cards and filters.', 'done', CURRENT_DATE - INTERVAL '1 day', $3, $2),
       ($1, 'Resolve legacy bug', 'Investigate and patch login edge case.', 'todo', CURRENT_DATE - INTERVAL '2 day', $3, $2)
      `,
      [projectId, memberId, adminId],
    );

    await client.query('COMMIT');

    console.log('Demo seed complete.');
    console.log('Admin login: admin@demo.local / admin123');
    console.log('Member login: member@demo.local / member123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Demo seed failed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
