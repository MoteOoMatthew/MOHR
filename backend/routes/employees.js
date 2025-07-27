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

// Validate request middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all employees
router.get('/', verifyToken, async (req, res) => {
  try {
    const { department, position, is_active } = req.query;
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];

    if (department) {
      sql += ' AND department = ?';
      params.push(department);
    }

    if (position) {
      sql += ' AND position = ?';
      params.push(position);
    }

    if (is_active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY last_name, first_name';

    const employees = await getAll(sql, params);
    res.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await getRow('SELECT * FROM employees WHERE id = ?', [id]);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/', verifyToken, [
  body('employee_id').notEmpty().withMessage('Employee ID is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('hire_date').isDate().withMessage('Valid hire date is required')
], validateRequest, async (req, res) => {
  try {
    const {
      employee_id,
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      hire_date,
      salary,
      manager_id
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await getRow(
      'SELECT * FROM employees WHERE employee_id = ? OR email = ?',
      [employee_id, email]
    );

    if (existingEmployee) {
      return res.status(400).json({ 
        error: 'Employee already exists with this ID or email' 
      });
    }

    const result = await runQuery(`
      INSERT INTO employees 
      (employee_id, first_name, last_name, email, phone, position, department, hire_date, salary, manager_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [employee_id, first_name, last_name, email, phone, position, department, hire_date, salary, manager_id]);

    const newEmployee = await getRow('SELECT * FROM employees WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Employee created successfully',
      employee: newEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', verifyToken, [
  body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('hire_date').optional().isDate().withMessage('Must be a valid date')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      hire_date,
      salary,
      manager_id,
      is_active
    } = req.body;

    // Check if employee exists
    const existingEmployee = await getRow('SELECT * FROM employees WHERE id = ?', [id]);
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if email is already taken by another employee
    if (email && email !== existingEmployee.email) {
      const emailExists = await getRow('SELECT * FROM employees WHERE email = ? AND id != ?', [email, id]);
      if (emailExists) {
        return res.status(400).json({ error: 'Email is already taken by another employee' });
      }
    }

    const updates = [];
    const params = [];

    if (first_name) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (position) {
      updates.push('position = ?');
      params.push(position);
    }
    if (department) {
      updates.push('department = ?');
      params.push(department);
    }
    if (hire_date) {
      updates.push('hire_date = ?');
      params.push(hire_date);
    }
    if (salary !== undefined) {
      updates.push('salary = ?');
      params.push(salary);
    }
    if (manager_id !== undefined) {
      updates.push('manager_id = ?');
      params.push(manager_id);
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
      UPDATE employees 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);

    const updatedEmployee = await getRow('SELECT * FROM employees WHERE id = ?', [id]);

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee (soft delete)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employee = await getRow('SELECT * FROM employees WHERE id = ?', [id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Soft delete by setting is_active to false
    await runQuery(`
      UPDATE employees 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to deactivate employee' });
  }
});

// Get employee statistics
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const totalEmployees = await getRow('SELECT COUNT(*) as count FROM employees WHERE is_active = 1');
    const totalDepartments = await getRow('SELECT COUNT(DISTINCT department) as count FROM employees WHERE is_active = 1');
    const avgSalary = await getRow('SELECT AVG(salary) as avg FROM employees WHERE is_active = 1 AND salary IS NOT NULL');
    
    // Get department breakdown
    const departmentStats = await getAll(`
      SELECT department, COUNT(*) as count, AVG(salary) as avg_salary
      FROM employees 
      WHERE is_active = 1 
      GROUP BY department
      ORDER BY count DESC
    `);

    // Get recent hires (last 30 days)
    const recentHires = await getAll(`
      SELECT * FROM employees 
      WHERE is_active = 1 
      AND hire_date >= date('now', '-30 days')
      ORDER BY hire_date DESC
    `);

    res.json({
      stats: {
        totalEmployees: totalEmployees.count,
        totalDepartments: totalDepartments.count,
        averageSalary: avgSalary.avg || 0,
        departmentBreakdown: departmentStats,
        recentHires: recentHires.length
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Search employees
router.get('/search/:query', verifyToken, async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query}%`;

    const employees = await getAll(`
      SELECT * FROM employees 
      WHERE is_active = 1 
      AND (
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        email LIKE ? OR 
        position LIKE ? OR 
        department LIKE ? OR
        employee_id LIKE ?
      )
      ORDER BY last_name, first_name
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);

    res.json({ employees });
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({ error: 'Failed to search employees' });
  }
});

module.exports = router; 