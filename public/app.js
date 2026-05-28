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
