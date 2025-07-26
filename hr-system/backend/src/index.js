require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/hrdb',
});

// User roles
const ROLES = ['admin', 'hr', 'employee'];

// Middleware: authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware: authorize roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
}

// Auth routes
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [username, hash, role]);
    res.sendStatus(201);
  } catch (e) {
    res.status(400).json({ error: 'User exists or DB error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.json({ token, role: user.role });
});

// Example protected route
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!`, role: req.user.role });
});

// Placeholder: Module loader
// TODO: Dynamically load modules from ./modules and mount their routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));