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

// Get all leave requests (admin sees all, users see their own)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, leave_type, employee_id } = req.query;
    let sql = `
      SELECT lr.*, 
             e.first_name, e.last_name, e.email as employee_email,
             u.name as approved_by_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // If not admin, only show user's own requests
    if (req.user.role !== 'admin') {
      sql += ' AND lr.employee_id = ?';
      params.push(req.user.userId);
    }

    if (status) {
      sql += ' AND lr.status = ?';
      params.push(status);
    }

    if (leave_type) {
      sql += ' AND lr.leave_type = ?';
      params.push(leave_type);
    }

    if (employee_id && req.user.role === 'admin') {
      sql += ' AND lr.employee_id = ?';
      params.push(employee_id);
    }

    sql += ' ORDER BY lr.created_at DESC';

    const leaveRequests = await getAll(sql, params);
    res.json({ leaveRequests });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Get leave request by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    let sql = `
      SELECT lr.*, 
             e.first_name, e.last_name, e.email as employee_email,
             u.name as approved_by_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE lr.id = ?
    `;
    const params = [id];

    // If not admin, only allow access to own requests
    if (req.user.role !== 'admin') {
      sql += ' AND lr.employee_id = ?';
      params.push(req.user.userId);
    }

    const leaveRequest = await getRow(sql, params);
    
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ leaveRequest });
  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({ error: 'Failed to fetch leave request' });
  }
});

// Create new leave request
router.post('/', verifyToken, [
  body('employee_id').isInt().withMessage('Valid employee ID is required'),
  body('leave_type').notEmpty().withMessage('Leave type is required'),
  body('start_date').isDate().withMessage('Valid start date is required'),
  body('end_date').isDate().withMessage('Valid end date is required'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
], validateRequest, async (req, res) => {
  try {
    const {
      employee_id,
      leave_type,
      start_date,
      end_date,
      reason
    } = req.body;

    // Check if employee exists
    const employee = await getRow('SELECT * FROM employees WHERE id = ? AND is_active = 1', [employee_id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // If not admin, only allow creating requests for self
    if (req.user.role !== 'admin' && req.user.userId !== employee_id) {
      return res.status(403).json({ error: 'You can only create leave requests for yourself' });
    }

    // Calculate days requested
    const start = new Date(start_date);
    const end = new Date(end_date);
    const daysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (daysRequested <= 0) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check for overlapping leave requests
    const overlappingRequest = await getRow(`
      SELECT * FROM leave_requests 
      WHERE employee_id = ? 
      AND status IN ('pending', 'approved')
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `, [employee_id, start_date, start_date, end_date, end_date, start_date, end_date]);

    if (overlappingRequest) {
      return res.status(400).json({ error: 'Leave request overlaps with existing approved or pending request' });
    }

    const result = await runQuery(`
      INSERT INTO leave_requests 
      (employee_id, leave_type, start_date, end_date, days_requested, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [employee_id, leave_type, start_date, end_date, daysRequested, reason]);

    const newLeaveRequest = await getRow(`
      SELECT lr.*, 
             e.first_name, e.last_name, e.email as employee_email
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      WHERE lr.id = ?
    `, [result.lastID]);

    res.status(201).json({
      message: 'Leave request created successfully',
      leaveRequest: newLeaveRequest
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// Update leave request (admin only)
router.put('/:id', verifyToken, requireAdmin, [
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Valid status is required')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    // Check if leave request exists
    const leaveRequest = await getRow('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Update leave request
    await runQuery(`
      UPDATE leave_requests 
      SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, req.user.userId, id]);

    const updatedLeaveRequest = await getRow(`
      SELECT lr.*, 
             e.first_name, e.last_name, e.email as employee_email,
             u.name as approved_by_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE lr.id = ?
    `, [id]);

    res.json({
      message: 'Leave request updated successfully',
      leaveRequest: updatedLeaveRequest
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
});

// Delete leave request (only pending requests can be deleted)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if leave request exists
    const leaveRequest = await getRow('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Only allow deletion of pending requests
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending leave requests can be deleted' });
    }

    // If not admin, only allow deletion of own requests
    if (req.user.role !== 'admin' && leaveRequest.employee_id !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own leave requests' });
    }

    await runQuery('DELETE FROM leave_requests WHERE id = ?', [id]);

    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ error: 'Failed to delete leave request' });
  }
});

// Get leave statistics
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];

    // If not admin, only show user's own stats
    if (req.user.role !== 'admin') {
      whereClause += ' AND employee_id = ?';
      params.push(req.user.userId);
    }

    const totalRequests = await getRow(`SELECT COUNT(*) as count FROM leave_requests ${whereClause}`, params);
    const pendingRequests = await getRow(`SELECT COUNT(*) as count FROM leave_requests ${whereClause} AND status = 'pending'`, params);
    const approvedRequests = await getRow(`SELECT COUNT(*) as count FROM leave_requests ${whereClause} AND status = 'approved'`, params);
    const rejectedRequests = await getRow(`SELECT COUNT(*) as count FROM leave_requests ${whereClause} AND status = 'rejected'`, params);

    // Get leave type breakdown
    const leaveTypeStats = await getAll(`
      SELECT leave_type, COUNT(*) as count, AVG(days_requested) as avg_days
      FROM leave_requests 
      ${whereClause}
      GROUP BY leave_type
      ORDER BY count DESC
    `, params);

    // Get recent requests (last 30 days)
    const recentRequests = await getRow(`
      SELECT COUNT(*) as count 
      FROM leave_requests 
      ${whereClause} AND created_at >= date('now', '-30 days')
    `, params);

    res.json({
      stats: {
        totalRequests: totalRequests.count,
        pendingRequests: pendingRequests.count,
        approvedRequests: approvedRequests.count,
        rejectedRequests: rejectedRequests.count,
        leaveTypeBreakdown: leaveTypeStats,
        recentRequests: recentRequests.count
      }
    });
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({ error: 'Failed to fetch leave statistics' });
  }
});

// Search leave requests
router.get('/search/:query', verifyToken, async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query}%`;

    let sql = `
      SELECT lr.*, 
             e.first_name, e.last_name, e.email as employee_email,
             u.name as approved_by_name
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE (
        e.first_name LIKE ? OR 
        e.last_name LIKE ? OR 
        lr.leave_type LIKE ? OR 
        lr.reason LIKE ?
      )
    `;
    const params = [searchTerm, searchTerm, searchTerm, searchTerm];

    // If not admin, only show user's own requests
    if (req.user.role !== 'admin') {
      sql += ' AND lr.employee_id = ?';
      params.push(req.user.userId);
    }

    sql += ' ORDER BY lr.created_at DESC';

    const leaveRequests = await getAll(sql, params);
    res.json({ leaveRequests });
  } catch (error) {
    console.error('Search leave requests error:', error);
    res.status(500).json({ error: 'Failed to search leave requests' });
  }
});

module.exports = router; 