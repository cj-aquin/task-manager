//src/server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const { timeStamp } = require('console');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const dbPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'db', 'tasks.db')
    : path.join(__dirname, 'tasks.db');
 const db = new sqlite3.Database(dbPath);

//Create a task table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0
    )`);
});

// API Endpoints
// Get all tasks
app.get('/api/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY id DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a new task
app.post('/api/tasks', (req, res)=> {
    const {title} = req.body;
    if (!title) {
        res.status(400).json({error: 'Title is required'});
        return;
    }

const stmt = db.prepare('INSERT INTO tasks (title) VALUES (?)');
stmt.run(title, function(err) {
    if (err) {
        res.status(500).json({error: err.message});
        return;
    }
    res.json({id: this.lastID, title, completed: false});
});
stmt.finalize();
});

// Update a task 
app.put('/api/tasks/:id', (req, res) => {
    const { id} = req.params;
    const {completed} = req.body;

    const stmt = db.prepare('UPDATE tasks SET completed = ? WHERE id = ? ');
    stmt.run(completed, id , function(err) {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({error: 'Task not found'});
            return;
        }
        res.json({id, completed});
    });
    stmt.finalize();
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
    const {id} = req.params;
     
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id, function(err) {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({error: 'Task not found'});
            return;
        }
        res.json({message: 'Task deleted successfully'});
    });
    stmt.finalize();
});

// Serve the main page 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({status: 'OK', timestamp: new Date().toISOString()});
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

