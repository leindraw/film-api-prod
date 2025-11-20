require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('./middleware/authMiddleware.js');

const app = express();
const PORT = process.env.PORT || 3300;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

app.get('/status', (req, res) => {
    res.json({ ok: true, service: 'film-api' });
});

// === AUTH ROUTES ===
app.post('/auth/register', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const sql = `
        INSERT INTO users (username, password, role) 
        VALUES ($1, $2, $3) 
        RETURNING id, username`;

        const result = await db.query(sql, [username.toLowerCase(), hashedPassword, 'user']);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username sudah digunakan' });
        }
        next(err);
    }
});

app.post('/auth/register-admin', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const sql = `
        INSERT INTO users (username, password, role) 
        VALUES ($1, $2, $3) 
        RETURNING id, username`;

        const result = await db.query(sql, [username.toLowerCase(), hashedPassword, 'admin']);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username sudah digunakan' });
        }
        next(err);
    }
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    try {
        const sql = "SELECT * FROM users WHERE username $1";
        const result = await db.query(sql, [username.toLowerCase()]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Kredensial tidak valid' });
        }
        const payload = { user: { id: user.id, username: user.username, role: user.role } };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login berhasil', token: token });
    } catch (err) {
        next(err);
    }
});

app.get('/movies', async (req, res, next) => {
    const sql = `
    SELECT m.id, m.title, m.year, d.id as director_id, d.name as director_name 
    FROM movies m
    LEFT JOIN directors d
    ON m.director_id = d.id
    ORDER BY m.id ASC
    `;

    try {
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});