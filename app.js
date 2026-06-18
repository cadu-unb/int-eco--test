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
document.body.classList.add('welcome-active');

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  document.body.classList.toggle('welcome-active', name === 'welcome');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const showLoader = () => loader.classList.add('visible');
const hideLoader = () => loader.classList.remove('visible');

// ════ MODAL DIALOG ════
function showModal(title, message, onConfirm, onCancel) {
  const modal = $('modal-dialog');
  const titleEl = $('modal-title');
  const messageEl = $('modal-message');
  const confirmBtn = $('modal-confirm');
  const cancelBtn = $('modal-cancel');

  titleEl.textContent = title;
  messageEl.textContent = message;

  confirmBtn.onclick = () => {
    modal.hidden = true;
    if (onConfirm) onConfirm();
  };
  cancelBtn.onclick = () => {
    modal.hidden = true;
    if (onCancel) onCancel();
  };

  modal.hidden = false;
  confirmBtn.focus();
}

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
    console.error(err);
    showModal('Erro ao carregar', 'Erro ao carregar questões. ' + err.message, () => showScreen('welcome'));
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
const FILTER_CHAIN = ['subject', 'group', 'section', 'type'];
const FILTER_CONTAINER = { subject: 'filter-subject', group: 'filter-group', section: 'filter-section', type: 'filter-type' };
const FILTER_FIELD = { subject: 'subject', group: 'group', section: 'sectionTitle', type: 'type' };

function buildConfigUI() {
  State.filters = { subject: null, group: null, section: null, type: null };
  rebuildFiltersFrom(0);
  updateConfigInfo();
}

function getQuestionsUpTo(chainIdx) {
  return State.allQuestions.filter(q => {
    for (let i = 0; i < chainIdx; i++) {
      const f = State.filters[FILTER_CHAIN[i]];
      if (f && f.length > 0 && !f.includes(q[FILTER_FIELD[FILTER_CHAIN[i]]])) return false;
    }
    return true;
  });
}

function rebuildFiltersFrom(startIdx) {
  for (let i = startIdx; i < FILTER_CHAIN.length; i++) {
    const key = FILTER_CHAIN[i];
    const pool = getQuestionsUpTo(i);
    const items = [...new Set(pool.map(q => q[FILTER_FIELD[key]]))].filter(Boolean).sort();
    renderFilterUI(FILTER_CONTAINER[key], items, key, i);
  }
}

function renderFilterUI(containerId, items, filterKey, chainIdx) {
  const container = $(containerId);
  if (!container) return;

  container.innerHTML = '';
  items.forEach(item => {
    const label = document.createElement('label');
    label.className = 'filter-chip';
    label.innerHTML = `
      <input type="checkbox" value="${item}" />
      <span>${item}</span>
    `;

    label.querySelector('input').addEventListener('change', e => {
      const value = e.target.value;
      if (e.target.checked) {
        if (!State.filters[filterKey]) State.filters[filterKey] = [];
        if (!State.filters[filterKey].includes(value)) State.filters[filterKey].push(value);
        label.classList.add('checked');
      } else {
        State.filters[filterKey] = (State.filters[filterKey] || []).filter(v => v !== value);
        if (State.filters[filterKey].length === 0) State.filters[filterKey] = null;
        label.classList.remove('checked');
      }
      // Reset + rebuild all downstream filters
      for (let i = chainIdx + 1; i < FILTER_CHAIN.length; i++) {
        State.filters[FILTER_CHAIN[i]] = null;
      }
      rebuildFiltersFrom(chainIdx + 1);
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
  qtyRange.setAttribute('aria-valuenow', State.qty);
  qtyRange.setAttribute('aria-valuetext', `${State.qty} questões`);
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
  const sampled = shuffle(filtered).slice(0, State.qty);
  State.questions = sampled.map(q => {
    if (q.type === 'true_false') return { ...q, alternatives: [...(q.alternatives || [])] };
    return { ...q, alternatives: shuffle([...(q.alternatives || [])]) };
  });
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

// ════ RICH TEXT & MEDIA ════
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizePath(path) {
  if (!path || typeof path !== 'string') return null;
  if (!/^img\/[\w\-.]+(?:\/[\w\-.]+)*\.(png|jpe?g|jpg|svg|pdf)$/i.test(path)) return null;
  return path;
}

function renderMediaHTML(path) {
  const safe = sanitizePath(path);
  if (!safe) return '';
  const ext = safe.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="media-pdf-link">📄 Ver PDF</a>`;
  }
  return `<img src="${safe}" alt="" class="question-media" loading="lazy">`;
}

function renderMedias(imgField) {
  if (!imgField) return '';
  const paths = Array.isArray(imgField) ? imgField : [imgField];
  return paths.map(renderMediaHTML).join('');
}

function isMarkdownTable(lines) {
  const isSep = l => /^\s*\|[\s\-:|]+\|\s*$/.test(l);
  return lines.length >= 2 && lines.some(isSep) && lines.every(l => l.trim().startsWith('|'));
}

function markdownTableToHTML(lines) {
  const isSep = l => /^\s*\|[\s\-:|]+\|\s*$/.test(l);
  const parseRow = line => line.replace(/^\s*\||\|\s*$/g, '').split('|').map(c => c.trim());
  const dataLines = lines.filter(l => !isSep(l));
  if (!dataLines.length) return '';
  const [headerLine, ...bodyLines] = dataLines;
  const headers = parseRow(headerLine);
  const thead = `<thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>`;
  const tbody = bodyLines.length
    ? `<tbody>${bodyLines.map(l => `<tr>${parseRow(l).map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
    : '';
  return `<div class="md-table-wrap"><table class="md-table">${thead}${tbody}</table></div>`;
}

function renderRichText(text) {
  if (!text) return '';
  const blocks = text.split(/\n\n+/);
  return blocks.map(block => {
    const lines = block.split('\n');
    if (isMarkdownTable(lines)) return markdownTableToHTML(lines);
    return `<span class="rich-text-block">${lines.map(escapeHtml).join('<br>')}</span>`;
  }).join('');
}

// ════ QUIZ SCREEN ════
function renderQuestion() {
  const idx = State.currentIdx;
  const q = State.questions[idx];
  const total = State.questions.length;

  $('progress-bar').style.width = ((idx + 1) / total * 100) + '%';
  $('quiz-counter').textContent = `${idx + 1} / ${total}`;
  $('quiz-chapter-tag').textContent = `${q.sectionTitle}`;
  const cmdEl = $('question-command');
  cmdEl.innerHTML = renderRichText(q.command);
  if (q.command_image) cmdEl.insertAdjacentHTML('beforeend', renderMedias(q.command_image));

  const list = $('alternatives-list');
  list.innerHTML = '';

  const renderFn = {
    'single_correct': renderSingleCorrect,
    'true_false': renderTrueFalse,
    'multiple_correct': renderMultipleCorrect,
    'single_incorrect': renderSingleIncorrect,
  }[q.type] || renderSingleCorrect;

  renderFn(q, list, idx);

  // Keyboard navigation
  list.addEventListener('keydown', e => handleAlternativeKeydown(e, idx, q.type));

  const secIdEl = $('question-section-id');
  if (secIdEl) secIdEl.textContent = q.sectionId || '';

  $('btn-prev-q').disabled = idx === 0;

  const nextBtn = $('btn-next-q');
  if (idx === total - 1) {
    nextBtn.innerHTML = `Finalizar <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 10l4 4 6-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    nextBtn.innerHTML = `Próxima <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  nextBtn.disabled = !State.answers[idx];
}

function handleAlternativeKeydown(e, idx, qType) {
  const items = [...document.querySelectorAll('.alt-item')];
  const currentIdx = items.findIndex(li => li === document.activeElement || li.contains(document.activeElement));

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault();
    const nextIdx = (currentIdx + 1) % items.length;
    items[nextIdx].focus();
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault();
    const prevIdx = currentIdx === 0 ? items.length - 1 : currentIdx - 1;
    items[prevIdx].focus();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (currentIdx >= 0) {
      items[currentIdx].click();
    }
  }
}

function renderSingleCorrect(q, list, idx) {
  (q.alternatives || []).forEach((alt, i) => {
    const isSelected = State.answers[idx] && State.answers[idx].includes(alt.id);
    const li = document.createElement('li');
    li.className = 'alt-item' + (isSelected ? ' selected' : '');
    li.dataset.id = alt.id;
    li.tabIndex = 0;
    li.role = 'radio';
    li.setAttribute('aria-checked', isSelected);
    li.innerHTML = `<span class="alt-letter">${alt.id.toUpperCase()}</span><span class="alt-text">${renderRichText(alt.text)}${alt.image ? renderMedias(alt.image) : ''}</span>`;
    li.addEventListener('click', () => {
      State.answers[idx] = [alt.id];
      document.querySelectorAll('.alt-item').forEach(item => {
        item.classList.remove('selected');
        item.setAttribute('aria-checked', 'false');
      });
      li.classList.add('selected');
      li.setAttribute('aria-checked', 'true');
      $('btn-next-q').disabled = false;
    });
    list.appendChild(li);
  });
}

function renderTrueFalse(q, list, idx) {
  (q.alternatives || []).forEach(alt => {
    const isSelected = State.answers[idx] && State.answers[idx].includes(alt.id);
    const li = document.createElement('li');
    li.className = 'alt-item' + (isSelected ? ' selected' : '');
    li.dataset.id = alt.id;
    li.tabIndex = 0;
    li.role = 'radio';
    li.setAttribute('aria-checked', isSelected);
    li.innerHTML = `<span class="alt-text">${renderRichText(alt.text)}${alt.image ? renderMedias(alt.image) : ''}</span>`;
    li.addEventListener('click', () => {
      State.answers[idx] = [alt.id];
      document.querySelectorAll('.alt-item').forEach(item => {
        item.classList.remove('selected');
        item.setAttribute('aria-checked', 'false');
      });
      li.classList.add('selected');
      li.setAttribute('aria-checked', 'true');
      $('btn-next-q').disabled = false;
    });
    list.appendChild(li);
  });
}

function renderMultipleCorrect(q, list, idx) {
  (q.alternatives || []).forEach((alt, i) => {
    const isSelected = State.answers[idx] && State.answers[idx].includes(alt.id);
    const li = document.createElement('li');
    li.className = 'alt-item' + (isSelected ? ' selected' : '');
    li.dataset.id = alt.id;
    li.tabIndex = 0;
    li.role = 'checkbox';
    li.setAttribute('aria-checked', isSelected);
    li.innerHTML = `<input type="checkbox" ${isSelected ? 'checked' : ''} tabindex="-1" /><span class="alt-letter">${alt.id.toUpperCase()}</span><span class="alt-text">${renderRichText(alt.text)}${alt.image ? renderMedias(alt.image) : ''}</span>`;
    li.addEventListener('click', () => {
      const answers = State.answers[idx] || [];
      if (answers.includes(alt.id)) {
        State.answers[idx] = answers.filter(a => a !== alt.id);
        li.classList.remove('selected');
        li.setAttribute('aria-checked', 'false');
        li.querySelector('input').checked = false;
      } else {
        State.answers[idx] = [...answers, alt.id].sort();
        li.classList.add('selected');
        li.setAttribute('aria-checked', 'true');
        li.querySelector('input').checked = true;
      }
      $('btn-next-q').disabled = !State.answers[idx] || State.answers[idx].length === 0;
    });
    list.appendChild(li);
  });
}

function renderSingleIncorrect(q, list, idx) {
  (q.alternatives || []).forEach(alt => {
    const isSelected = State.answers[idx] && State.answers[idx].includes(alt.id);
    const li = document.createElement('li');
    li.className = 'alt-item' + (isSelected ? ' selected' : '');
    li.dataset.id = alt.id;
    li.tabIndex = 0;
    li.role = 'radio';
    li.setAttribute('aria-checked', isSelected);
    li.innerHTML = `<span class="alt-letter">${alt.id.toUpperCase()}</span><span class="alt-text">${renderRichText(alt.text)}${alt.image ? renderMedias(alt.image) : ''}</span>`;
    li.addEventListener('click', () => {
      State.answers[idx] = [alt.id];
      document.querySelectorAll('.alt-item').forEach(item => {
        item.classList.remove('selected');
        item.setAttribute('aria-checked', 'false');
      });
      li.classList.add('selected');
      li.setAttribute('aria-checked', 'true');
      $('btn-next-q').disabled = false;
    });
    list.appendChild(li);
  });
}

$('btn-back-quiz').addEventListener('click', () => {
  if (Object.keys(State.answers).length > 0) {
    showModal(
      'Descartar progresso?',
      'Tem certeza que deseja sair? Seu progresso será perdido.',
      () => {
        State.answers = {};
        State.currentIdx = 0;
        showScreen('config');
      }
    );
  } else {
    State.answers = {};
    State.currentIdx = 0;
    showScreen('config');
  }
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
          return alt ? `${escapeHtml(id.toUpperCase())}) ${escapeHtml(alt.text)}` : escapeHtml(id);
        }).join(' + ')
      : '—';

    const correctAnsText = q.answer.map(id => {
      const alt = (q.alternatives || []).find(a => a.id === id);
      return alt ? `${escapeHtml(id.toUpperCase())}) ${escapeHtml(alt.text)}` : escapeHtml(id);
    }).join(' + ');

    card.innerHTML = `
      <div class="result-card-header">
        <div class="result-icon ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '✓' : '✗'}</div>
        <div>
          <p class="result-q-num">Questão ${i + 1} · ${escapeHtml(q.sectionTitle)}</p>
          <div class="result-command">${renderRichText(q.command)}${renderMedias(q.command_image)}</div>
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
          <div>${renderRichText(q.justification)}${renderMedias(q.justification_image)}</div>
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

// ════ THEME ════
function applyTheme(dark, save) {
  document.body.classList.toggle('theme-dark', dark);
  if (save) localStorage.setItem('quiz_app_theme', dark ? 'dark' : 'light');
  const moonIcon = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const sunIcon = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.innerHTML = dark ? moonIcon : sunIcon;
    btn.setAttribute('aria-label', dark ? 'Mudar para tema claro' : 'Mudar para tema escuro');
    btn.title = dark ? 'Mudar para tema claro' : 'Mudar para tema escuro';
  });
}

(function initTheme() {
  const saved = localStorage.getItem('quiz_app_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved !== null ? saved === 'dark' : prefersDark, false);
})();

document.querySelectorAll('.btn-theme').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(!document.body.classList.contains('theme-dark'), true));
});
