// public/app.js (static client-only)
let currentKana = null;
let currentType = 'hiragana';

document.getElementById('start').onclick = () => {
  currentType = document.querySelector('input[name="type"]:checked').value;
  nextQuiz();
  document.getElementById('quiz').style.display = '';
  document.getElementById('result').textContent = '';
};

document.getElementById('submit').onclick = submitAnswer;
document.getElementById('answer').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitAnswer();
});

function nextQuiz() {
  const list = currentType === 'katakana' ? katakana : hiragana;
  const kana = list[Math.floor(Math.random() * list.length)];
  currentKana = kana;
  document.getElementById('kana-char').textContent = kana.kana;
  document.getElementById('answer').value = '';
  document.getElementById('answer').focus();
}

function submitAnswer() {
  const answer = document.getElementById('answer').value.trim().toLowerCase();
  const correct = currentKana && answer === currentKana.romaji;
  document.getElementById('result').textContent = correct ? 'Correct!' : `Wrong! (${currentKana ? currentKana.romaji : ''})`;
  setTimeout(() => nextQuiz(), 600);
}

// ----- Navigation and other UI features -----
const navButtons = document.querySelectorAll('.nav-btn');

function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id);
  if (el) el.style.display = '';
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.section === id));

  if (id === 'hiragana-table-section') loadHiraganaTable();
  if (id === 'katakana-table-section') loadKatakanaTable();
  if (id === 'flashcard-section') initFlashcards();
  if (id === 'memory-section') initMemoryGame();
}

navButtons.forEach(b => b.addEventListener('click', () => showSection(b.dataset.section)));

// Default view
showSection('quiz-section');

function loadHiraganaTable() {
  const table = hiragana;
  const container = document.getElementById('hiragana-table');
  let html = '<div class="grid five-cols">';
  table.forEach(item => {
    html += `<div class="cell"><div class="kana">${item.kana}</div><div class="romaji">${item.romaji}</div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

function loadKatakanaTable() {
  const table = katakana;
  const container = document.getElementById('katakana-table');
  let html = '<div class="grid five-cols">';
  table.forEach(item => {
    html += `<div class="cell"><div class="kana">${item.kana}</div><div class="romaji">${item.romaji}</div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// Flashcards
let flashcards = [];
let flashIndex = 0;

function initFlashcards() {
  const type = document.querySelector('input[name="flashcard-type"]:checked').value;
  flashcards = (type === 'katakana') ? katakana.slice() : hiragana.slice();
  flashIndex = 0;
  showFlashcard();

  document.getElementById('show-romaji').onclick = () => {
    document.getElementById('flashcard-romaji').style.display = '';
    document.getElementById('hide-romaji').style.display = '';
    document.getElementById('show-romaji').style.display = 'none';
  };
  document.getElementById('hide-romaji').onclick = () => {
    document.getElementById('flashcard-romaji').style.display = 'none';
    document.getElementById('hide-romaji').style.display = 'none';
    document.getElementById('show-romaji').style.display = '';
  };
  document.getElementById('next-flashcard').onclick = () => {
    if (!flashcards.length) return;
    flashIndex = (flashIndex + 1) % flashcards.length;
    showFlashcard();
  };
  document.querySelectorAll('input[name="flashcard-type"]').forEach(r => r.addEventListener('change', initFlashcards));
}

function showFlashcard() {
  if (!flashcards.length) return;
  const f = flashcards[flashIndex];
  document.getElementById('flashcard-kana').textContent = f.kana;
  document.getElementById('flashcard-romaji').textContent = f.romaji;
  document.getElementById('flashcard-romaji').style.display = 'none';
  document.getElementById('show-romaji').style.display = '';
  document.getElementById('hide-romaji').style.display = 'none';
}

// Memory Game
let memoryCards = [];

function initMemoryGame() {
  document.getElementById('start-memory').onclick = startMemoryGame;
  document.getElementById('reset-memory').onclick = resetMemoryGame;
}

function startMemoryGame() {
  const type = document.querySelector('input[name="memory-type"]:checked').value;
  const chars = (type === 'katakana') ? katakana.slice() : hiragana.slice();
  // shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  memoryCards = chars.slice(0, 25);
  renderMemoryGrid();
}

function resetMemoryGame() {
  memoryCards = [];
  document.getElementById('memory-grid').innerHTML = '';
}

function renderMemoryGrid() {
  const container = document.getElementById('memory-grid');
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'memory-grid';
  memoryCards.forEach((c, idx) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.romaji = c.romaji;
    card.innerHTML = `<div class="kana">${c.kana}</div><div class="romaji">${c.romaji}</div>`;
    card.addEventListener('click', () => {
      card.classList.toggle('revealed');
    });
    grid.appendChild(card);
  });
  container.appendChild(grid);
}
