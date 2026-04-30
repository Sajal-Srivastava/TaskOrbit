const express = require('express');
const bcrypt = require('bcryptjs');

const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { loginSchema, signUpSchema } = require('../validation/schemas');
const { signToken } = require('../utils/jwt');

const router = express.Router();

router.post('/signup', validateBody(signUpSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let safeRole = 'member';
    if (role === 'admin') {
      const adminCountResult = await query(
        "SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'",
      );
      if (adminCountResult.rows[0].count === 0) {
        safeRole = 'admin';
      }
    }

    const inserted = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, safeRole],
    );

    const user = inserted.rows[0];
    const token = signToken(user);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [email],
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const matches = await bcrypt.compare(password, user.password_hash);

    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id],
    );

    if (!result.rowCount) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
