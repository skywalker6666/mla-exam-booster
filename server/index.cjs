const express = require('express');
const cors = require('cors');
const db = require('./database.cjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all exam history
app.get('/api/history', (req, res) => {
    const sql = 'SELECT * FROM exam_sessions ORDER BY startedAt DESC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // Parse answers JSON string back to object
        const sessions = rows.map(row => ({
            ...row,
            answers: JSON.parse(row.answers),
            questionIds: [] // We might not store this explicitly if answers has it, but let's keep it simple
        }));
        res.json({ data: sessions });
    });
});

// Save exam session
app.post('/api/history', (req, res) => {
    const { id, startedAt, finishedAt, totalScore, totalQuestions, timeSpentSeconds, answers } = req.body;

    const sql = `INSERT INTO exam_sessions (id, startedAt, finishedAt, totalScore, totalQuestions, timeSpentSeconds, answers) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [id, startedAt, finishedAt, totalScore, totalQuestions, timeSpentSeconds, JSON.stringify(answers)];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: req.body,
            id: this.lastID
        });
    });
});

// Clear history
app.delete('/api/history', (req, res) => {
    const sql = 'DELETE FROM exam_sessions';
    db.run(sql, [], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'deleted', changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
