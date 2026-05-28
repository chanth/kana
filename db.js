const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'progress.db'));

const hiragana = [
  { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' },
  { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' },
  // ... add more hiragana
];
const katakana = [
  { kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' },
  { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' },
  // ... add more katakana
];

// Create table if not exists
const init = () => {
  db.run(`CREATE TABLE IF NOT EXISTS progress (
    kana TEXT PRIMARY KEY,
    correct INTEGER DEFAULT 0,
    incorrect INTEGER DEFAULT 0
  )`);
};

init();

function getRandomKana(type, cb) {
  let list = type === 'katakana' ? katakana : hiragana;
  const kana = list[Math.floor(Math.random() * list.length)];
  cb(null, kana);
}

function updateProgress(kana, correct, cb) {
  db.run(
    `INSERT INTO progress (kana, correct, incorrect) VALUES (?, ?, ?)
     ON CONFLICT(kana) DO UPDATE SET
       correct = correct + ?,
       incorrect = incorrect + ?`,
    [kana, correct ? 1 : 0, correct ? 0 : 1, correct ? 1 : 0, correct ? 0 : 1],
    cb
  );
}

function getProgress(cb) {
  db.all('SELECT * FROM progress', cb);
}

module.exports = { getRandomKana, updateProgress, getProgress };
