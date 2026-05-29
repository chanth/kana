// public/app.js (static client-only)
/* Client-only app.js
   - Quiz (simple kana -> romaji)
   - Navigation + table rendering (5-col grid)
   - Flashcards: multiple-choice 4 options with 2s timer
   - Memory game (5x5)
*/

let currentKana = null;
let currentType = 'hiragana';

// Quiz
const startBtn = document.getElementById('start');
if (startBtn) startBtn.addEventListener('click', () => {
  currentType = document.querySelector('input[name="type"]:checked').value;
  nextQuiz();
  document.getElementById('quiz').style.display = '';
  const res = document.getElementById('result'); if (res) res.textContent = '';
});
const submitBtn = document.getElementById('submit'); if (submitBtn) submitBtn.addEventListener('click', submitAnswer);
const answerEl = document.getElementById('answer'); if (answerEl) answerEl.addEventListener('keydown', e => { if (e.key === 'Enter') submitAnswer(); });

function nextQuiz() {
  const list = currentType === 'katakana' ? katakana : hiragana;
  const kana = list[Math.floor(Math.random() * list.length)];
  currentKana = kana;
  const char = document.getElementById('kana-char'); if (char) char.textContent = kana.kana;
  if (answerEl) { answerEl.value = ''; answerEl.focus(); }
}

function submitAnswer() {
  if (!currentKana) return;
  const answer = (answerEl && answerEl.value) ? answerEl.value.trim().toLowerCase() : '';
  const correct = answer === currentKana.romaji;
  const res = document.getElementById('result'); if (res) res.textContent = correct ? 'Correct!' : `Wrong! (${currentKana.romaji})`;
  setTimeout(() => nextQuiz(), 600);
}

// Navigation + sections
const navButtons = document.querySelectorAll('.nav-btn');
function showSection(id) {
  document.querySelectorAll('section').forEach(s => s.style.display = 'none');
  const el = document.getElementById(id); if (el) el.style.display = '';
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.section === id));
  if (id === 'hiragana-table-section') loadHiraganaTable();
  if (id === 'katakana-table-section') loadKatakanaTable();
  if (id === 'flashcard-section') initFlashcards();
  if (id === 'memory-section') initMemoryGame();
}
navButtons.forEach(b => b.addEventListener('click', () => showSection(b.dataset.section)));
showSection('quiz-section');

function loadHiraganaTable() {
  const table = hiragana;
  const container = document.getElementById('hiragana-table');
  if (!container) return;
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
  if (!container) return;
  let html = '<div class="grid five-cols">';
  table.forEach(item => {
    html += `<div class="cell"><div class="kana">${item.kana}</div><div class="romaji">${item.romaji}</div></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
}

// Flashcards (multiple-choice)
let flashcards = [];
let flashIndex = 0;
let flashTimer = null;

function initFlashcards() {
  const radios = document.querySelectorAll('input[name="flashcard-type"]');
  const selected = Array.from(radios).find(r => r.checked);
  const type = selected ? selected.value : 'hiragana';
  flashcards = (type === 'katakana') ? katakana.slice() : hiragana.slice();
  flashIndex = 0;
  showFlashcard();
  document.querySelectorAll('input[name="flashcard-type"]').forEach(r => r.addEventListener('change', initFlashcards));
}

function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; } }

function showFlashcard() {
  clearTimeout(flashTimer);
  const container = document.getElementById('choices');
  const kanaEl = document.getElementById('flashcard-kana');
  const resultEl = document.getElementById('flashcard-result');
  if (!container || !kanaEl) return;
  if (!flashcards.length) { container.innerHTML = ''; if (resultEl) resultEl.textContent = ''; return; }
  const item = flashcards[flashIndex];
  kanaEl.textContent = item.kana;
  if (resultEl) resultEl.textContent = '';

  // build 4 choices (1 correct + 3 random)
  const pool = (flashcards.length >= 4) ? flashcards.slice() : hiragana.concat(katakana);
  shuffle(pool);
  const choices = [item];
  for (let i = 0; i < pool.length && choices.length < 4; i++) {
    if (pool[i].romaji !== item.romaji) choices.push(pool[i]);
  }
  shuffle(choices);

  container.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c.romaji;
    btn.dataset.romaji = c.romaji;
    btn.addEventListener('click', () => handleChoice(btn, item));
    container.appendChild(btn);
  });

  // 2s timer to auto-reveal
  flashTimer = setTimeout(() => {
    revealCorrect(item);
  }, 3500);
}

function handleChoice(btn, correctItem) {
  clearTimeout(flashTimer);
  const selected = btn.dataset.romaji;
  const resultEl = document.getElementById('flashcard-result');
  if (selected === correctItem.romaji) {
    btn.classList.add('correct');
    if (resultEl) resultEl.textContent = 'Correct!';
    // advance to next after short pause
    setTimeout(() => {
      flashIndex = (flashIndex + 1) % flashcards.length;
      showFlashcard();
    }, 1000);
  } else {
    btn.classList.add('wrong');
    revealCorrect(correctItem);
    if (resultEl) resultEl.textContent = `Wrong — correct: ${correctItem.romaji}`;
    // advance to next after short pause
    setTimeout(() => {
      flashIndex = (flashIndex + 1) % flashcards.length;
      showFlashcard();
    }, 2500);
  }

}

function revealCorrect(item) {
  const container = document.getElementById('choices');
  if (!container) return;
  Array.from(container.children).forEach(btn => {
    if (btn.dataset.romaji === item.romaji) btn.classList.add('correct');
    else btn.classList.add('disabled');
  });
  const resultEl = document.getElementById('flashcard-result');
  if (resultEl && !resultEl.textContent) resultEl.textContent = `Answer: ${item.romaji}`;
  // auto-advance
  setTimeout(() => {
    flashIndex = (flashIndex + 1) % flashcards.length;
    showFlashcard();
  }, 2000);  // show correct answer for 2s before next
}

// Memory Game (5x5 random)
let memoryCards = [];
function initMemoryGame() {
  const start = document.getElementById('start-memory'); if (start) start.onclick = startMemoryGame;
  const reset = document.getElementById('reset-memory'); if (reset) reset.onclick = resetMemoryGame;
}

function startMemoryGame() {
  const type = document.querySelector('input[name="memory-type"]:checked')?.value || 'hiragana';
  const chars = (type === 'katakana') ? katakana.slice() : hiragana.slice();
  shuffle(chars);
  memoryCards = chars.slice(0, 25);
  renderMemoryGrid();
}

function resetMemoryGame() { memoryCards = []; const g = document.getElementById('memory-grid'); if (g) g.innerHTML = ''; }

function renderMemoryGrid() {
  const container = document.getElementById('memory-grid'); if (!container) return;
  container.innerHTML = '';
  const grid = document.createElement('div'); grid.className = 'memory-grid';
  memoryCards.forEach(c => {
    const card = document.createElement('div'); card.className = 'memory-card';
    card.dataset.romaji = c.romaji;
    card.innerHTML = `<div class="kana">${c.kana}</div><div class="romaji">${c.romaji}</div>`;
    card.addEventListener('click', () => card.classList.toggle('revealed'));
    grid.appendChild(card);
  });
  container.appendChild(grid);
}
