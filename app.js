/* ══════════════════════════════════════
   SABER UnB — Banco de Questões · app.js
   ══════════════════════════════════════ */

'use strict';

const State = {
  manifest: null,
  allQuestionSets: {},
  allQuestions: [],
  filters: {
    subject: null,
    group: null,
    section: null,
    type: null,
  },
  selectedQuestions: [],
  qty: 10,
  questions: [],
  answers: {},
  currentIdx: 0,
};

const $ = id => document.getElementById(id);
const screens = {
  welcome: $('screen-welcome'),
  config: $('screen-config'),
  quiz: $('screen-quiz'),
  results: $('screen-results'),
};
const loader = $('loader');

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const showLoader = () => loader.classList.add('visible');
const hideLoader = () => loader.classList.remove('visible');

// ════ WELCOME SCREEN ════
$('btn-start').addEventListener('click', async () => {
  showScreen('config');
  if (!State.manifest) await initializeApp();
  else buildConfigUI();
});

async function initializeApp() {
  showLoader();
  try {
    const manifestRes = await fetch('json/index.json');
    if (!manifestRes.ok) throw new Error('Manifesto não encontrado.');
    State.manifest = await manifestRes.json();

    for (const set of State.manifest.sets) {
      const setRes = await fetch('json/' + set.file);
      if (!setRes.ok) {
        console.warn(`Falha ao carregar ${set.file}`);
        continue;
      }
      const data = await setRes.json();
      State.allQuestionSets[set.file] = { ...data.meta, ...data, setFile: set.file };
      normalizeQuestionSet(set.file, data);
    }

    if (State.allQuestions.length === 0) {
      throw new Error('Nenhuma questão carregada.');
    }
    buildConfigUI();
  } catch (err) {
    alert('Erro ao carregar questões. ' + err.message);
    console.error(err);
    showScreen('welcome');
  } finally {
    hideLoader();
  }
}

function normalizeQuestionSet(setFile, data) {
  const meta = data.meta || {};
  (data.sections || []).forEach(section => {
    (section.questions || []).forEach(question => {
      const globalId = `${setFile}::${section.id}::${question.id}`;
      State.allQuestions.push({
        globalId,
        setFile,
        sectionId: section.id,
        sectionTitle: section.title,
        ...meta,
        ...question,
      });
    });
  });
}

// ════ CONFIG SCREEN ════
function buildConfigUI() {
  const subjects = [...new Set(State.allQuestions.map(q => q.subject))].sort();
  const groups = [...new Set(State.allQuestions.map(q => q.group))].sort();
  const sections = [...new Set(State.allQuestions.map(q => q.sectionTitle))].sort();
  const types = [...new Set(State.allQuestions.map(q => q.type))].sort();

  renderFilterUI('filter-subject', subjects, 'subject');
  renderFilterUI('filter-group', groups, 'group');
  renderFilterUI('filter-section', sections, 'section');
  renderFilterUI('filter-type', types, 'type');

  updateConfigInfo();
}

function renderFilterUI(containerId, items, filterKey) {
  const container = $(containerId);
  if (!container) return;

  container.innerHTML = '';
  items.forEach(item => {
    const label = document.createElement('label');
    label.className = 'filter-chip';
    label.innerHTML = `
      <input type="checkbox" value="${item}" />
      <span>${item || 'Sem classificação'}</span>
    `;

    label.querySelector('input').addEventListener('change', e => {
      const value = e.target.value;
      if (e.target.checked) {
        if (!State.filters[filterKey]) State.filters[filterKey] = [];
        if (!State.filters[filterKey].includes(value)) State.filters[filterKey].push(value);
        label.classList.add('checked');
      } else {
        State.filters[filterKey] = State.filters[filterKey].filter(v => v !== value);
        label.classList.remove('checked');
      }
      updateConfigInfo();
    });
    container.appendChild(label);
  });
}

function getFilteredQuestions() {
  return State.allQuestions.filter(q => {
    if (State.filters.subject && !State.filters.subject.includes(q.subject)) return false;
    if (State.filters.group && !State.filters.group.includes(q.group)) return false;
    if (State.filters.section && !State.filters.section.includes(q.sectionTitle)) return false;
    if (State.filters.type && !State.filters.type.includes(q.type)) return false;
    return true;
  });
}

function updateConfigInfo() {
  const info = $('config-info');
  const btn = $('btn-start-quiz');
  const filtered = getFilteredQuestions();
  const available = filtered.length;

  if (available === 0) {
    info.textContent = 'Nenhuma questão encontrada com os filtros selecionados.';
    btn.disabled = true;
    return;
  }

  const effective = Math.min(State.qty, available);
  info.textContent = `${available} questões disponíveis · ${effective} serão sorteadas.`;
  btn.disabled = false;
}

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

$('btn-back-config').addEventListener('click', () => showScreen('welcome'));

$('btn-start-quiz').addEventListener('click', () => {
  const filtered = getFilteredQuestions();
  State.questions = shuffle(filtered).slice(0, State.qty);
  State.answers = {};
  State.currentIdx = 0;
  renderQuestion();
  showScreen('quiz');
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ════ QUIZ SCREEN ════
function renderQuestion() {
  const idx = State.currentIdx;
  const q = State.questions[idx];
  const total = State.questions.length;

  $('progress-bar').style.width = ((idx + 1) / total * 100) + '%';
  $('quiz-counter').textContent = `${idx + 1} / ${total}`;
  $('quiz-chapter-tag').textContent = `${q.sectionTitle}`;
  $('question-command').textContent = q.command;

  const list = $('alternatives-list');
  list.innerHTML = '';

  const renderFn = {
    'single_correct': renderSingleCorrect,
    'true_false': renderTrueFalse,
    'multiple_correct': renderMultipleCorrect,
    'single_incorrect': renderSingleIncorrect,
  }[q.type] || renderSingleCorrect;

  renderFn(q, list, idx);

  $('btn-prev-q').disabled = idx === 0;

  const nextBtn = $('btn-next-q');
  if (idx === total - 1) {
    nextBtn.innerHTML = `Finalizar <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M5 10l4 4 6-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    nextBtn.innerHTML = `Próxima <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  nextBtn.disabled = !State.answers[idx];
}

function renderSingleCorrect(q, list, idx) {
  (q.alternatives || []).forEach((alt, i) => {
    const li = document.createElement('li');
    li.className = 'alt-item' + (State.answers[idx] && State.answers[idx].includes(alt.id) ? ' selected' : '');
    li.dataset.id = alt.id;
    li.innerHTML = `<span class="alt-letter">${alt.id.toUpperCase()}</span><span class="alt-text">${alt.text}</span>`;
    li.addEventListener('click', () => {
      State.answers[idx] = [alt.id];
      document.querySelectorAll('.alt-item').forEach(li => li.classList.remove('selected'));
      li.classList.add('selected');
      $('btn-next-q').disabled = false;
    });
    list.appendChild(li);
  });
}

function renderTrueFalse(q, list, idx) {
  (q.alternatives || []).forEach(alt => {
    const li = document.createElement('li');
    li.className = 'alt-item' + (State.answers[idx] && State.answers[idx].includes(alt.id) ? ' selected' : '');
    li.dataset.id = alt.id;
    li.innerHTML = `<span class="alt-text">${alt.text}</span>`;
    li.addEventListener('click', () => {
      State.answers[idx] = [alt.id];
      document.querySelectorAll('.alt-item').forEach(li => li.classList.remove('selected'));
      li.classList.add('selected');
      $('btn-next-q').disabled = false;
    });
    list.appendChild(li);
  });
}

function renderMultipleCorrect(q, list, idx) {
  (q.alternatives || []).forEach((alt, i) => {
    const li = document.createElement('li');
    const isSelected = State.answers[idx] && State.answers[idx].includes(alt.id);
    li.className = 'alt-item' + (isSelected ? ' selected' : '');
    li.dataset.id = alt.id;
    li.innerHTML = `<input type="checkbox" ${isSelected ? 'checked' : ''} /><span class="alt-letter">${alt.id.toUpperCase()}</span><span class="alt-text">${alt.text}</span>`;
    li.addEventListener('click', () => {
      const answers = State.answers[idx] || [];
      if (answers.includes(alt.id)) {
        State.answers[idx] = answers.filter(a => a !== alt.id);
        li.classList.remove('selected');
        li.querySelector('input').checked = false;
      } else {
        State.answers[idx] = [...answers, alt.id].sort();
        li.classList.add('selected');
        li.querySelector('input').checked = true;
      }
      $('btn-next-q').disabled = !State.answers[idx] || State.answers[idx].length === 0;
    });
    list.appendChild(li);
  });
}

function renderSingleIncorrect(q, list, idx) {
  (q.alternatives || []).forEach(alt => {
    const li = document.createElement('li');
    li.className = 'alt-item' + (State.answers[idx] && State.answers[idx].includes(alt.id) ? ' selected' : '');
    li.dataset.id = alt.id;
    li.innerHTML = `<span class="alt-letter">${alt.id.toUpperCase()}</span><span class="alt-text">${alt.text}</span>`;
    li.addEventListener('click', () => {
      State.answers[idx] = [alt.id];
      document.querySelectorAll('.alt-item').forEach(li => li.classList.remove('selected'));
      li.classList.add('selected');
      $('btn-next-q').disabled = false;
    });
    list.appendChild(li);
  });
}

$('btn-back-quiz').addEventListener('click', () => {
  if (Object.keys(State.answers).length > 0) {
    if (!confirm('Tem certeza que deseja sair? Seu progresso será perdido.')) return;
  }
  State.answers = {};
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

// ════ RESULTS SCREEN ════
function isAnswerCorrect(question, userAnswer) {
  const expected = normalizeAnswer(question.answer);
  const received = normalizeAnswer(userAnswer || []);
  return arraysEqual(expected, received);
}

function normalizeAnswer(ans) {
  return (ans || []).map(a => String(a).toLowerCase()).sort();
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function buildResults() {
  const qs = State.questions;
  const ans = State.answers;
  const total = qs.length;
  const correct = qs.filter((q, i) => isAnswerCorrect(q, ans[i])).length;
  const pct = Math.round((correct / total) * 100);

  $('score-pct').textContent = pct + '%';
  $('score-message').textContent = scoreMessage(pct);

  const circumference = 2 * Math.PI * 50;
  const offset = circumference * (1 - pct / 100);
  setTimeout(() => {
    const ring = $('ring-fill');
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = pct >= 70 ? '#4dffab' : pct >= 50 ? '#ffd600' : '#ff6b6b';
  }, 100);

  const summary = $('results-summary');
  summary.innerHTML = `<h3 style="font-family:'Fraunces',serif;font-size:1.4rem;font-weight:700;margin-bottom:4px;">${correct} de ${total} acertos</h3>`;

  qs.forEach((q, i) => {
    const userAns = ans[i] || [];
    const isCorrect = isAnswerCorrect(q, userAns);

    const card = document.createElement('div');
    card.className = 'result-card';

    const userAnsText = userAns.length > 0
      ? userAns.map(id => {
          const alt = (q.alternatives || []).find(a => a.id === id);
          return alt ? `${id.toUpperCase()}) ${alt.text}` : id;
        }).join(' + ')
      : '—';

    const correctAnsText = q.answer.map(id => {
      const alt = (q.alternatives || []).find(a => a.id === id);
      return alt ? `${id.toUpperCase()}) ${alt.text}` : id;
    }).join(' + ');

    card.innerHTML = `
      <div class="result-card-header">
        <div class="result-icon ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '✓' : '✗'}</div>
        <div>
          <p class="result-q-num">Questão ${i + 1} · ${q.sectionTitle}</p>
          <p class="result-command">${q.command}</p>
        </div>
      </div>
      <div class="result-card-body">
        <div class="result-answer-row">
          <span class="answer-tag ${isCorrect ? 'user-correct' : 'user-wrong'}">Sua resposta</span>
          <span>${userAnsText}</span>
        </div>
        ${!isCorrect ? `
        <div class="result-answer-row">
          <span class="answer-tag correct-ans">Correta</span>
          <span>${correctAnsText}</span>
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

function scoreMessage(pct) {
  if (pct === 100) return '🏆 Perfeito! Domínio total do conteúdo!';
  if (pct >= 80) return '🌟 Excelente! Continue assim!';
  if (pct >= 70) return '✅ Muito bom! Você está no caminho certo.';
  if (pct >= 50) return '📚 Bom esforço! Revise os conteúdos errados.';
  return '💡 Continue estudando! Você vai melhorar!';
}

$('btn-retry').addEventListener('click', () => {
  State.answers = {};
  State.currentIdx = 0;
  renderQuestion();
  showScreen('quiz');
});

$('btn-new-quiz').addEventListener('click', () => {
  State.filters = { subject: null, group: null, section: null, type: null };
  buildConfigUI();
  showScreen('config');
});
