const express = require('express');
const { body, validationResult } = require('express-validator');
const { runQuery, getRow, getAll } = require('../database/init');

const router = express.Router();

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Validate request middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all users (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { role, is_active } = req.query;
    let sql = 'SELECT id, username, email, name, role, is_active, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY created_at DESC';

    const users = await getAll(sql, params);
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (admin only)
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getRow(
      'SELECT id, username, email, name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', verifyToken, requireAdmin, [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')
], validateRequest, async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await getRow('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await runQuery(`
      INSERT INTO users (username, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `, [username, email, hashedPassword, name, role]);

    const newUser = await getRow(
      'SELECT id, username, email, name, role, is_active, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', verifyToken, requireAdmin, [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, role, is_active } = req.body;

    // Check if user exists
    const existingUser = await getRow('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email/username is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await getRow('SELECT * FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailExists) {
        return res.status(400).json({ error: 'Email is already taken by another user' });
      }
    }

    if (username && username !== existingUser.username) {
      const usernameExists = await getRow('SELECT * FROM users WHERE username = ? AND id != ?', [username, id]);
      if (usernameExists) {
        return res.status(400).json({ error: 'Username is already taken by another user' });
      }
    }

    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await runQuery(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);

    const updatedUser = await getRow(
      'SELECT id, username, email, name, role, is_active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only - soft delete)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await getRow('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await getRow('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = 1');
      if (adminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Soft delete by setting is_active to false
    await runQuery(`
      UPDATE users 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Change user password (admin only)
router.put('/:id/password', verifyToken, requireAdmin, [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Check if user exists
    const user = await getRow('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await runQuery(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [hashedPassword, id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await getRow('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const adminUsers = await getRow('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = 1');
    const regularUsers = await getRow('SELECT COUNT(*) as count FROM users WHERE role = "user" AND is_active = 1');
    
    // Get recent registrations (last 30 days)
    const recentRegistrations = await getRow(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE is_active = 1 
      AND created_at >= date('now', '-30 days')
    `);

    // Get users with Google integration
    const googleUsers = await getRow('SELECT COUNT(*) as count FROM users WHERE google_id IS NOT NULL AND is_active = 1');

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        adminUsers: adminUsers.count,
        regularUsers: regularUsers.count,
        recentRegistrations: recentRegistrations.count,
        googleUsers: googleUsers.count
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Search users (admin only)
router.get('/search/:query', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query}%`;

    const users = await getAll(`
      SELECT id, username, email, name, role, is_active, created_at
      FROM users 
      WHERE is_active = 1 
      AND (
        username LIKE ? OR 
        email LIKE ? OR 
        name LIKE ?
      )
      ORDER BY name
    `, [searchTerm, searchTerm, searchTerm]);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router; 