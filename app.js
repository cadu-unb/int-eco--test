/* ══════════════════════════════════════
   SABER UnB — Economia Quiz · app.js
   ══════════════════════════════════════ */

'use strict';

// ── Estado Global ──────────────────────
const State = {
  allData:         {},   // JSON completo
  provaFilter:     1,    // 1 ou 2
  selectedChapters: [],  // IDs selecionados
  qty:             10,
  questions:       [],   // questões sorteadas [{id, chapterId, chapterName, ...}]
  answers:         {},   // { idx: 'A' | 'B' | ... }
  currentIdx:      0,
};

// ── Referências DOM ────────────────────
const $ = id => document.getElementById(id);

const screens = {
  welcome: $('screen-welcome'),
  config:  $('screen-config'),
  quiz:    $('screen-quiz'),
  results: $('screen-results'),
};
const loader = $('loader');

// ── Navegação entre telas ──────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Loader ─────────────────────────────
const showLoader = () => loader.classList.add('visible');
const hideLoader = () => loader.classList.remove('visible');

// ═══════════════════════════════════════
//  TELA 1 — WELCOME
// ═══════════════════════════════════════
$('btn-start').addEventListener('click', async () => {
  showScreen('config');
  if (Object.keys(State.allData).length === 0) await loadData();
  else buildConfigUI();
});

async function loadData() {
  showLoader();
  try {
    const res = await fetch('json/questions.json');
    if (!res.ok) throw new Error('Falha ao carregar questões.');
    State.allData = await res.json();
    buildConfigUI();
  } catch (err) {
    alert('Não foi possível carregar as questões. Verifique se o arquivo json/questions.json existe.');
    console.error(err);
    showScreen('welcome');
  } finally {
    hideLoader();
  }
}

// ═══════════════════════════════════════
//  TELA 2 — CONFIG
// ═══════════════════════════════════════
function buildConfigUI() {
  const keys = Object.keys(State.allData).map(Number).sort((a, b) => a - b);

  // Verificar se há capítulos > 18
  const hasProva2 = keys.some(k => k > 18);
  const btn2 = $('btn-prova2');
  if (!hasProva2) {
    btn2.disabled = true;
    btn2.setAttribute('data-tooltip', 'Coming Soon');
  }

  // Renderizar capítulos do filtro atual
  renderChapterGrid();
  updateConfigInfo();
}

function getFilteredKeys() {
  const keys = Object.keys(State.allData).map(Number).sort((a, b) => a - b);
  return State.provaFilter === 1
    ? keys.filter(k => k <= 18)
    : keys.filter(k => k > 18);
}

function renderChapterGrid() {
  const grid = $('chapters-grid');
  grid.innerHTML = '';

  const filteredKeys = getFilteredKeys();

  filteredKeys.forEach(key => {
    const ch = State.allData[key];
    const strKey = String(key);
    const isChecked = State.selectedChapters.includes(strKey);

    const label = document.createElement('label');
    label.className = 'chapter-chip' + (isChecked ? ' checked' : '');
    label.innerHTML = `
      <input type="checkbox" value="${strKey}" ${isChecked ? 'checked' : ''} />
      <span class="chip-check"></span>
      <span>Cap. ${key}</span>
    `;
    label.title = ch.name || '';

    label.querySelector('input').addEventListener('change', e => {
      const val = e.target.value;
      if (e.target.checked) {
        if (!State.selectedChapters.includes(val)) State.selectedChapters.push(val);
        label.classList.add('checked');
      } else {
        State.selectedChapters = State.selectedChapters.filter(v => v !== val);
        label.classList.remove('checked');
      }
      updateConfigInfo();
    });

    grid.appendChild(label);
  });

  // Sincronizar checkboxes com filtro atual
  State.selectedChapters = State.selectedChapters.filter(k => filteredKeys.map(String).includes(k));
  updateConfigInfo();
}

// Botões "Todos" / "Nenhum"
$('btn-select-all').addEventListener('click', () => {
  const filteredKeys = getFilteredKeys().map(String);
  State.selectedChapters = [...filteredKeys];
  document.querySelectorAll('#chapters-grid .chapter-chip').forEach(chip => {
    chip.classList.add('checked');
    chip.querySelector('input').checked = true;
  });
  updateConfigInfo();
});

$('btn-clear-all').addEventListener('click', () => {
  State.selectedChapters = [];
  document.querySelectorAll('#chapters-grid .chapter-chip').forEach(chip => {
    chip.classList.remove('checked');
    chip.querySelector('input').checked = false;
  });
  updateConfigInfo();
});

// Toggle Prova
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    State.provaFilter = Number(btn.dataset.prova);
    State.selectedChapters = [];
    renderChapterGrid();
  });
});

// Range quantidade
const qtyRange = $('qty-range');
const qtyDisplay = $('qty-display');
qtyRange.addEventListener('input', () => {
  State.qty = Number(qtyRange.value);
  qtyDisplay.textContent = State.qty;
  updateRangeGradient();
  updateConfigInfo();
});

function updateRangeGradient() {
  const min = Number(qtyRange.min), max = Number(qtyRange.max), val = Number(qtyRange.value);
  const pct = ((val - min) / (max - min)) * 100;
  qtyRange.style.setProperty('--val', pct + '%');
}
updateRangeGradient();

function updateConfigInfo() {
  const info = $('config-info');
  const btn  = $('btn-start-quiz');

  if (State.selectedChapters.length === 0) {
    info.textContent = 'Selecione ao menos um capítulo.';
    btn.disabled = true;
    return;
  }

  // Calcular total de questões disponíveis
  const available = State.selectedChapters.reduce((acc, key) => {
    const ch = State.allData[key];
    if (!ch) return acc;
    return acc + Object.keys(ch.questions || {}).length;
  }, 0);

  if (available === 0) {
    info.textContent = 'Nenhuma questão encontrada nos capítulos selecionados.';
    btn.disabled = true;
    return;
  }

  const effective = Math.min(State.qty, available);
  const cap = State.selectedChapters.length;
  info.textContent = `${cap} capítulo(s) · ${available} questões disponíveis · ${effective} serão sorteadas.`;
  btn.disabled = false;
}

$('btn-back-config').addEventListener('click', () => showScreen('welcome'));

$('btn-start-quiz').addEventListener('click', () => {
  State.questions = drawQuestions();
  State.answers   = {};
  State.currentIdx = 0;
  renderQuestion();
  showScreen('quiz');
});

// ── Sorteio distribuído ────────────────
function drawQuestions() {
  const chapterPools = {};

  State.selectedChapters.forEach(key => {
    const ch = State.allData[key];
    if (!ch) return;
    const qs = Object.entries(ch.questions || {}).map(([id, q]) => ({
      id,
      chapterId: key,
      chapterName: ch.name || `Capítulo ${key}`,
      ...q,
    }));
    if (qs.length) chapterPools[key] = shuffle(qs);
  });

  const poolKeys = Object.keys(chapterPools);
  const total = Object.values(chapterPools).reduce((a, p) => a + p.length, 0);
  const qty = Math.min(State.qty, total);

  // Distribuição igualitária com resto
  const base  = Math.floor(qty / poolKeys.length);
  let   extra = qty % poolKeys.length;

  const selected = [];
  poolKeys.forEach(key => {
    const take = base + (extra > 0 ? 1 : 0);
    extra = Math.max(0, extra - 1);
    selected.push(...chapterPools[key].slice(0, take));
  });

  return shuffle(selected).slice(0, qty);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════
//  TELA 3 — QUIZ
// ═══════════════════════════════════════
function renderQuestion() {
  const idx = State.currentIdx;
  const q   = State.questions[idx];
  const total = State.questions.length;

  // Progresso
  $('progress-bar').style.width = ((idx + 1) / total * 100) + '%';
  $('quiz-counter').textContent = `${idx + 1} / ${total}`;
  $('quiz-chapter-tag').textContent = `Cap. ${q.chapterId}`;

  // Enunciado
  $('question-command').textContent = q.command;

  // Alternativas
  const list = $('alternatives-list');
  list.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];

  q.alternatives.forEach((alt, i) => {
    const li = document.createElement('li');
    li.className = 'alt-item' + (State.answers[idx] === letters[i] ? ' selected' : '');
    li.dataset.letter = letters[i];
    li.innerHTML = `
      <span class="alt-letter">${letters[i]}</span>
      <span class="alt-text">${alt}</span>
    `;
    li.addEventListener('click', () => selectAnswer(letters[i]));
    list.appendChild(li);
  });

  // Botões de navegação
  $('btn-prev-q').disabled = idx === 0;

  const nextBtn = $('btn-next-q');
  if (idx === total - 1) {
    nextBtn.innerHTML = `Finalizar <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 10l4 4 6-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    nextBtn.innerHTML = `Próxima <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  nextBtn.disabled = State.answers[idx] === undefined;
}

function selectAnswer(letter) {
  State.answers[State.currentIdx] = letter;

  document.querySelectorAll('.alt-item').forEach(li => {
    li.classList.toggle('selected', li.dataset.letter === letter);
  });

  $('btn-next-q').disabled = false;
}

// Botão de retorno do quiz → configuração
$('btn-back-quiz').addEventListener('click', () => {
  if (Object.keys(State.answers).length > 0) {
    const confirmar = confirm('Tem certeza que deseja sair? Seu progresso será perdido.');
    if (!confirmar) return;
  }
  State.answers    = {};
  State.currentIdx = 0;
  showScreen('config');
});

$('btn-prev-q').addEventListener('click', () => {
  if (State.currentIdx > 0) {
    State.currentIdx--;
    renderQuestion();
  }
});

$('btn-next-q').addEventListener('click', () => {
  if (State.currentIdx < State.questions.length - 1) {
    State.currentIdx++;
    renderQuestion();
  } else {
    buildResults();
    showScreen('results');
  }
});

// ═══════════════════════════════════════
//  TELA 4 — RESULTS
// ═══════════════════════════════════════
function buildResults() {
  const qs     = State.questions;
  const ans    = State.answers;
  const total  = qs.length;
  const correct = qs.filter((q, i) => (ans[i] || '').toUpperCase() === q.answer.toUpperCase()).length;
  const pct    = Math.round((correct / total) * 100);

  // Anel de pontuação
  $('score-pct').textContent = pct + '%';
  $('score-message').textContent = scoreMessage(pct);

  const circumference = 2 * Math.PI * 50; // r=50
  const offset = circumference * (1 - pct / 100);
  setTimeout(() => {
    const ring = $('ring-fill');
    ring.style.strokeDasharray  = circumference;
    ring.style.strokeDashoffset = offset;
    // Cor por desempenho
    ring.style.stroke = pct >= 70 ? '#4dffab' : pct >= 50 ? '#ffd600' : '#ff6b6b';
  }, 100);

  // Listagem
  const summary = $('results-summary');
  summary.innerHTML = `<h3 style="font-family:'Fraunces',serif;font-size:1.4rem;font-weight:700;margin-bottom:4px;">${correct} de ${total} acertos</h3>`;

  qs.forEach((q, i) => {
    const userAns    = (ans[i] || '—').toUpperCase();
    const correctAns = q.answer.toUpperCase();
    const isCorrect  = userAns === correctAns;

    const userAltText = getAltText(q, userAns);
    const corrAltText = getAltText(q, correctAns);

    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-card-header">
        <div class="result-icon ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '✓' : '✗'}</div>
        <div>
          <p class="result-q-num">Questão ${i + 1} · Cap. ${q.chapterId}</p>
          <p class="result-command">${q.command}</p>
        </div>
      </div>
      <div class="result-card-body">
        <div class="result-answer-row">
          <span class="answer-tag ${isCorrect ? 'user-correct' : 'user-wrong'}">Sua resposta</span>
          <span>${userAns !== '—' ? `${userAns}) ${userAltText}` : '—'}</span>
        </div>
        ${!isCorrect ? `
        <div class="result-answer-row">
          <span class="answer-tag correct-ans">Correta</span>
          <span>${correctAns}) ${corrAltText}</span>
        </div>` : ''}
        ${q.justification ? `
        <div class="result-justification">
          <p class="just-label">Justificativa</p>
          <p>${q.justification}</p>
        </div>` : ''}
      </div>
    `;
    summary.appendChild(card);
  });
}

function getAltText(q, letter) {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const idx = letters.indexOf(letter.toUpperCase());
  return (idx >= 0 && q.alternatives[idx]) ? q.alternatives[idx] : '';
}

function scoreMessage(pct) {
  if (pct === 100) return '🏆 Perfeito! Domínio total do conteúdo!';
  if (pct >= 80)  return '🌟 Excelente! Continue assim!';
  if (pct >= 70)  return '✅ Muito bom! Você está no caminho certo.';
  if (pct >= 50)  return '📚 Bom esforço! Revise os conteúdos errados.';
  return '💡 Continue estudando! Você vai melhorar!';
}

// Botões de resultado
$('btn-retry').addEventListener('click', () => {
  State.answers    = {};
  State.currentIdx = 0;
  renderQuestion();
  showScreen('quiz');
});

$('btn-new-quiz').addEventListener('click', () => {
  State.selectedChapters = [];
  renderChapterGrid();
  updateConfigInfo();
  showScreen('config');
});
