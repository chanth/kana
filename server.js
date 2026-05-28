const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();
const PORT = 3030;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get full hiragana table
app.get('/api/hiragana', (req, res) => {
  res.json(db.getHiragana());
});

// API: Get full katakana table
app.get('/api/katakana', (req, res) => {
  res.json(db.getKatakana());
});

// API: Get random kana (hiragana or katakana)
app.get('/api/kana', (req, res) => {
  const { type } = req.query; // 'hiragana' or 'katakana'
  db.getRandomKana(type, (err, kana) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(kana);
  });
});

// API: Submit answer and update progress
app.post('/api/progress', (req, res) => {
  const { kana, correct } = req.body;
  db.updateProgress(kana, correct, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

// API: Get progress
app.get('/api/progress', (req, res) => {
  db.getProgress((err, progress) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(progress);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
