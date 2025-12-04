const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'exam_booster.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath, err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS exam_sessions (
    id TEXT PRIMARY KEY,
    startedAt TEXT,
    finishedAt TEXT,
    totalScore INTEGER,
    totalQuestions INTEGER,
    timeSpentSeconds INTEGER,
    answers TEXT
  )`);
});

module.exports = db;
