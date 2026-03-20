/* ============================================================
   SYNAPSES — Interactive Course JavaScript
   ============================================================ */

// ── Reading Progress Bar ──────────────────────────────────────
function initProgressBar() {
  const bar = document.createElement('div');
  bar.className = 'progress-bar-top';
  bar.id = 'reading-progress';
  document.body.prepend(bar);

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
}

// ── Active Section Highlighting ───────────────────────────────
function initSidebarHighlight() {
  const links = document.querySelectorAll('.sidebar-nav-list a');
  if (!links.length) return;

  const sections = [];
  links.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const el = document.getElementById(id);
    if (el) sections.push({ id, el, link });
  });

  function update() {
    const scrollY = window.scrollY + 130;
    let current = sections[0];

    sections.forEach(sec => {
      if (sec.el.offsetTop <= scrollY) current = sec;
    });

    sections.forEach(s => s.link.classList.remove('active'));
    if (current) current.link.classList.add('active');
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── Scroll Reveal ─────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

// ── Tab System ────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-system').forEach(system => {
    const buttons = system.querySelectorAll('.tab-btn');
    const panels = system.querySelectorAll('.tab-panel');

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panels[i].classList.add('active');
      });
    });
  });
}

// ── Accordion ─────────────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');

      // Close all in same accordion
      const accordion = header.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      }

      if (!wasOpen) item.classList.add('open');
    });
  });
}

// ── Copy Code Button ──────────────────────────────────────────
function initCodeCopy() {
  document.querySelectorAll('.code-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-block');
      const code = block ? block.querySelector('code') : null;
      if (!code) return;

      const text = code.textContent;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }).catch(() => {
        // Fallback for environments without clipboard API
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    });
  });
}

// ── Animated Counters ─────────────────────────────────────────
function animateCounter(el, target, duration = 1500) {
  const isPercent = target.includes('%');
  const num = parseFloat(target.replace(/[^0-9.]/g, ''));
  const suffix = target.replace(/[0-9.]/g, '');
  const start = Date.now();

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * num * 10) / 10;
    el.textContent = (Number.isInteger(num) ? Math.round(current) : current) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const els = document.querySelectorAll('[data-counter]');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, entry.target.dataset.counter);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}

// ── Quiz Engine ───────────────────────────────────────────────
class Quiz {
  constructor(container, questions) {
    this.container = container;
    this.questions = questions;
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.render();
  }

  render() {
    const body = this.container.querySelector('.quiz-body');
    if (!body) return;

    if (this.currentIndex >= this.questions.length) {
      this.showScore(body);
      return;
    }

    const q = this.questions[this.currentIndex];
    this.answered = false;

    body.innerHTML = `
      <div class="question-counter">Question ${this.currentIndex + 1} / ${this.questions.length}</div>
      <div class="question-text">${q.question}</div>
      <div class="question-options">
        ${q.options.map((opt, i) => `
          <button class="option-btn" data-index="${i}">
            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
            ${opt}
          </button>
        `).join('')}
      </div>
      <div class="quiz-explanation" id="quiz-explanation"></div>
    `;

    body.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectAnswer(btn, q));
    });

    // Update nav
    const nav = this.container.querySelector('.quiz-nav');
    if (nav) {
      nav.innerHTML = `
        <span class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">
          Score: ${this.score}/${this.currentIndex}
        </span>
        <button class="btn btn-primary btn-sm" id="quiz-next" disabled>
          ${this.currentIndex < this.questions.length - 1 ? 'Next Question →' : 'View Results →'}
        </button>
      `;
      document.getElementById('quiz-next').addEventListener('click', () => {
        this.currentIndex++;
        this.render();
      });
    }
  }

  selectAnswer(btn, question) {
    if (this.answered) return;
    this.answered = true;

    const selectedIdx = parseInt(btn.dataset.index);
    const isCorrect = selectedIdx === question.correct;

    if (isCorrect) this.score++;

    // Mark buttons
    this.container.querySelectorAll('.option-btn').forEach((b, i) => {
      b.disabled = true;
      if (i === question.correct) b.classList.add('correct');
      else if (i === selectedIdx && !isCorrect) b.classList.add('incorrect');
    });

    // Show explanation
    const explanation = this.container.querySelector('#quiz-explanation');
    if (explanation && question.explanation) {
      explanation.innerHTML = `
        <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
        ${question.explanation}
      `;
      explanation.style.background = isCorrect
        ? 'rgba(16,185,129,0.08)'
        : 'rgba(239,68,68,0.08)';
      explanation.style.borderColor = isCorrect
        ? 'rgba(16,185,129,0.2)'
        : 'rgba(239,68,68,0.2)';
      if (!isCorrect) {
        explanation.querySelector('strong').style.color = 'var(--accent-red)';
      }
      explanation.classList.add('visible');
    }

    // Enable next
    const nextBtn = this.container.querySelector('#quiz-next');
    if (nextBtn) nextBtn.disabled = false;
  }

  showScore(body) {
    const pct = Math.round((this.score / this.questions.length) * 100);
    const grade = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good job!' : '📚 Keep studying!';
    const color = pct >= 80 ? 'var(--accent-green)' : pct >= 60 ? 'var(--accent-orange)' : 'var(--accent-red)';

    body.innerHTML = `
      <div class="quiz-score">
        <div class="score-circle" style="border: 4px solid ${color}; color: ${color}">
          ${pct}%
        </div>
        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem">${grade}</h3>
        <p>You scored <strong>${this.score}</strong> out of <strong>${this.questions.length}</strong> questions correctly.</p>
        <button class="btn btn-outline btn-sm" style="margin-top: 1rem" onclick="location.reload()">
          Retry Quiz
        </button>
      </div>
    `;

    const nav = this.container.querySelector('.quiz-nav');
    if (nav) nav.innerHTML = '';
  }
}

// ── Interactive SVG Flow Diagram ──────────────────────────────
function initFlowDiagrams() {
  document.querySelectorAll('.interactive-flow').forEach(flow => {
    const nodes = flow.querySelectorAll('.flow-node');
    const infoPanel = flow.nextElementSibling;

    nodes.forEach(node => {
      node.addEventListener('click', () => {
        nodes.forEach(n => n.classList.remove('active'));
        node.classList.add('active');

        if (infoPanel && infoPanel.classList.contains('flow-info-panel')) {
          const info = node.dataset.info;
          if (info) {
            infoPanel.innerHTML = `<p>${info}</p>`;
            infoPanel.style.display = 'block';
          }
        }
      });
    });
  });
}

// ── Module Progress Tracking ──────────────────────────────────
const STORAGE_KEY = 'synapses_progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function markModuleVisited(moduleId) {
  const progress = getProgress();
  progress[moduleId] = { visited: true, timestamp: Date.now() };
  saveProgress(progress);
}

function updateProgressDisplay() {
  const progress = getProgress();
  const total = 6;
  const completed = Object.keys(progress).length;
  const pct = Math.round((completed / total) * 100);

  const fills = document.querySelectorAll('.progress-fill[data-module-progress]');
  fills.forEach(fill => { fill.style.width = pct + '%'; });

  const labels = document.querySelectorAll('[data-progress-label]');
  labels.forEach(label => { label.textContent = `${pct}% complete`; });

  // Update module cards
  document.querySelectorAll('[data-module-id]').forEach(card => {
    const id = card.dataset.moduleId;
    if (progress[id]) {
      let badge = card.querySelector('.completion-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'completion-badge';
        badge.style.cssText = `
          display: inline-flex; align-items: center; gap: 0.3rem;
          background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
          border-radius: 9999px; padding: 0.2rem 0.6rem;
          font-size: 0.7rem; font-weight: 600; color: var(--accent-green);
          position: absolute; top: 1rem; right: 1rem;
        `;
        badge.textContent = '✓ Visited';
        if (card.style.position !== 'relative') card.style.position = 'relative';
        card.appendChild(badge);
      }
    }
  });
}

// ── Card Glow Effect ──────────────────────────────────────────
function initCardGlow() {
  document.querySelectorAll('.card, .module-card, .concept-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });
}

// ── Syntax Highlighting (lightweight) ────────────────────────
const KEYWORDS = /\b(import|from|def|class|return|if|else|elif|for|while|in|not|and|or|True|False|None|with|as|async|await|yield|pass|try|except|finally|raise|lambda|global|nonlocal|del|assert|break|continue|is|const|let|var|function|export|default|new|typeof|instanceof|this|super|extends|implements|interface|type|enum|readonly|public|private|protected|static|abstract|void|null|undefined|true|false|throw|catch|switch|case|do|of|package|import|struct|func|go|chan|map|range|make|append|len|cap)\b/g;
const STRINGS = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
const COMMENTS_PY = /#.*/g;
const COMMENTS_C = /\/\/.*/g;
const NUMBERS = /\b\d+\.?\d*\b/g;
const FUNCTIONS = /\b([a-zA-Z_]\w*)\s*(?=\()/g;

function highlightCode(code, lang) {
  // Escape HTML first
  let h = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply highlighting (order matters)
  h = h.replace(STRINGS, (m, q, s) => `<span class="token-string">${m}</span>`);

  if (lang === 'python' || lang === 'py') {
    h = h.replace(COMMENTS_PY, m => `<span class="token-comment">${m}</span>`);
  } else {
    h = h.replace(COMMENTS_C, m => `<span class="token-comment">${m}</span>`);
  }

  h = h.replace(NUMBERS, m => `<span class="token-number">${m}</span>`);
  h = h.replace(KEYWORDS, m => `<span class="token-keyword">${m}</span>`);
  h = h.replace(FUNCTIONS, (m, fn) => `<span class="token-function">${fn}</span>(`);

  return h;
}

function initSyntaxHighlighting() {
  document.querySelectorAll('.code-block code[data-lang]').forEach(el => {
    const lang = el.dataset.lang;
    el.innerHTML = highlightCode(el.textContent, lang);
  });
}

// ── Tooltip Enhancement ───────────────────────────────────────
function initTooltips() {
  // Already handled via CSS, but add keyboard support
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', el.dataset.tooltip);
  });
}

// ── Smooth Scroll ─────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Keyboard Navigation ───────────────────────────────────────
function initKeyboardNav() {
  const prevLink = document.querySelector('.module-nav-link.prev');
  const nextLink = document.querySelector('.module-nav-link.next');

  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'ArrowLeft' && prevLink && !prevLink.classList.contains('disabled')) {
      prevLink.click();
    }
    if (e.altKey && e.key === 'ArrowRight' && nextLink && !nextLink.classList.contains('disabled')) {
      nextLink.click();
    }
  });
}

// ── Main Init ─────────────────────────────────────────────────
function init() {
  initProgressBar();
  initSidebarHighlight();
  initScrollReveal();
  initTabs();
  initAccordions();
  initCodeCopy();
  initCounters();
  initFlowDiagrams();
  initCardGlow();
  initSyntaxHighlighting();
  initTooltips();
  initSmoothScroll();
  initKeyboardNav();
  updateProgressDisplay();

  // Mark current module as visited
  const moduleId = document.body.dataset.moduleId;
  if (moduleId) {
    markModuleVisited(moduleId);
    setTimeout(updateProgressDisplay, 100);
  }

  // Initialize quizzes
  document.querySelectorAll('.quiz-container[data-quiz]').forEach(container => {
    const quizId = container.dataset.quiz;
    if (window.QUIZ_DATA && window.QUIZ_DATA[quizId]) {
      new Quiz(container, window.QUIZ_DATA[quizId]);
    }
  });
}

// ── Quiz Data Registry ────────────────────────────────────────
window.QUIZ_DATA = {};

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
