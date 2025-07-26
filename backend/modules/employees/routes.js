const express = require('express');
const { getAll, getRow, runQuery } = require('../../database');
const { authenticateToken, requireRole } = require('../auth/routes');

const router = express.Router();

// Get all employees (with optional filtering)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, is_active, search } = req.query;
    
    let sql = `
      SELECT e.*, u.username, u.email, u.role,
             m.first_name as manager_first_name, m.last_name as manager_last_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE 1=1
    `;
    const params = [];

    // Apply filters
    if (department) {
      sql += ' AND e.department = ?';
      params.push(department);
    }

    if (is_active !== undefined) {
      sql += ' AND e.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY e.last_name, e.first_name';

    const employees = await getAll(sql, params);

    res.json({ employees });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);

    const employee = await getRow(`
      SELECT e.*, u.username, u.email, u.role,
             m.first_name as manager_first_name, m.last_name as manager_last_name
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = ?
    `, [employeeId]);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new employee (admin/manager only)
router.post('/', authenticateToken, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      employee_id,
      department,
      position,
      hire_date,
      salary,
      manager_id,
      user_id
    } = req.body;

    if (!first_name || !last_name || !employee_id) {
      return res.status(400).json({ error: 'First name, last name, and employee ID are required' });
    }

    // Check if employee ID already exists
    const existingEmployee = await getRow(
      'SELECT id FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (existingEmployee) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    // Create employee
    const result = await runQuery(`
      INSERT INTO employees (
        user_id, first_name, last_name, employee_id, department, 
        position, hire_date, salary, manager_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [user_id || null, first_name, last_name, employee_id, department, 
        position, hire_date, salary, manager_id || null]);

    res.status(201).json({
      message: 'Employee created successfully',
      employeeId: result.id
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee (admin/manager only, or own profile)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const {
      first_name,
      last_name,
      department,
      position,
      hire_date,
      salary,
      manager_id
    } = req.body;

    // Check permissions
    const employee = await getRow('SELECT user_id FROM employees WHERE id = ?', [employeeId]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Users can only update their own profile, admins/managers can update any employee
    if (!['admin', 'manager'].includes(req.user.role) && employee.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (first_name !== undefined) {
      updates.push('first_name = ?');
      params.push(first_name);
    }

    if (last_name !== undefined) {
      updates.push('last_name = ?');
      params.push(last_name);
    }

    if (department !== undefined) {
      updates.push('department = ?');
      params.push(department);
    }

    if (position !== undefined) {
      updates.push('position = ?');
      params.push(position);
    }

    if (hire_date !== undefined) {
      updates.push('hire_date = ?');
      params.push(hire_date);
    }

    if (salary !== undefined && ['admin', 'manager'].includes(req.user.role)) {
      updates.push('salary = ?');
      params.push(salary);
    }

    if (manager_id !== undefined && ['admin', 'manager'].includes(req.user.role)) {
      updates.push('manager_id = ?');
      params.push(manager_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(employeeId);

    await runQuery(
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'Employee updated successfully' });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);

    // Check if employee exists
    const existingEmployee = await getRow('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Soft delete - set is_active to false
    await runQuery(
      'UPDATE employees SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [employeeId]
    );

    res.json({ message: 'Employee deactivated successfully' });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reactivate employee (admin only)
router.post('/:id/reactivate', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);

    // Check if employee exists
    const existingEmployee = await getRow('SELECT id FROM employees WHERE id = ?', [employeeId]);
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await runQuery(
      'UPDATE employees SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [employeeId]
    );

    res.json({ message: 'Employee reactivated successfully' });

  } catch (error) {
    console.error('Reactivate employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get departments (for dropdowns)
router.get('/departments/list', authenticateToken, async (req, res) => {
  try {
    const departments = await getAll(
      'SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND department != "" ORDER BY department'
    );

    res.json({ departments: departments.map(d => d.department) });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get managers (for dropdowns)
router.get('/managers/list', authenticateToken, async (req, res) => {
  try {
    const managers = await getAll(`
      SELECT id, first_name, last_name, employee_id, department
      FROM employees 
      WHERE is_active = 1 
      ORDER BY last_name, first_name
    `);

    res.json({ managers });

  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 