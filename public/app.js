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
  fetch(`/api/kana?type=${currentType}`)
    .then(res => res.json())
    .then(kana => {
      currentKana = kana;
      document.getElementById('kana-char').textContent = kana.kana;
      document.getElementById('answer').value = '';
      document.getElementById('answer').focus();
    });
}

function submitAnswer() {
  const answer = document.getElementById('answer').value.trim().toLowerCase();
  const correct = answer === currentKana.romaji;
  document.getElementById('result').textContent = correct ? 'Correct!' : `Wrong! (${currentKana.romaji})`;
  fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kana: currentKana.kana, correct })
  }).then(() => {
    setTimeout(() => {
      nextQuiz();
      loadProgress();
    }, 800);
  });
}

function loadProgress() {
  fetch('/api/progress')
    .then(res => res.json())
    .then(progress => {
      let html = '<h2>Progress</h2><table><tr><th>Kana</th><th>Correct</th><th>Incorrect</th></tr>';
      progress.forEach(row => {
        html += `<tr><td>${row.kana}</td><td>${row.correct}</td><td>${row.incorrect}</td></tr>`;
      });
      html += '</table>';
      document.getElementById('progress').innerHTML = html;
    });
}

// Load progress on page load
loadProgress();

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
  fetch('/api/hiragana')
    .then(res => res.json())
    .then(table => {
      const container = document.getElementById('hiragana-table');
      let html = '<div class="grid">';
      table.forEach(item => {
        html += `<div class="cell"><div class="kana">${item.kana}</div><div class="romaji">${item.romaji}</div></div>`;
      });
      html += '</div>';
      container.innerHTML = html;
    })
    .catch(() => { document.getElementById('hiragana-table').textContent = 'Failed to load.'; });
}

function loadKatakanaTable() {
  fetch('/api/katakana')
    .then(res => res.json())
    .then(table => {
      const container = document.getElementById('katakana-table');
      let html = '<div class="grid">';
      table.forEach(item => {
        html += `<div class="cell"><div class="kana">${item.kana}</div><div class="romaji">${item.romaji}</div></div>`;
      });
      html += '</div>';
      container.innerHTML = html;
    })
    .catch(() => { document.getElementById('katakana-table').textContent = 'Failed to load.'; });
}

// Flashcards
let flashcards = [];
let flashIndex = 0;

function initFlashcards() {
  const type = document.querySelector('input[name="flashcard-type"]:checked').value;
  fetch(`/api/${type}`)
    .then(res => res.json())
    .then(chars => {
      flashcards = chars;
      flashIndex = 0;
      showFlashcard();
    });

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

// ----- Memory Game -----
let memoryCards = [];

function initMemoryGame() {
  document.getElementById('start-memory').onclick = startMemoryGame;
  document.getElementById('reset-memory').onclick = resetMemoryGame;
}

function startMemoryGame() {
  const type = document.querySelector('input[name="memory-type"]:checked').value;
  fetch(`/api/${type}`)
    .then(res => res.json())
    .then(chars => {
      // shuffle and take first 25 distinct kana
      const shuffled = chars.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      memoryCards = shuffled.slice(0, 25);
      renderMemoryGrid();
    })
    .catch(() => { document.getElementById('memory-grid').textContent = 'Failed to load.'; });
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
