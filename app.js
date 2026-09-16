(function() {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const state = {
    activeTab: 'cheatsheet',
    searchQuery: '',
    studied: new Set(JSON.parse(localStorage.getItem('gh300-studied') || '[]'))
  };

  function init() {
    renderCheatsheet();
    renderChapters();
    setupTabs();
    setupSearch();
    setupScrollSpy();
    setupKeyboard();
    setupProgress();
    setupPrint();
    revealObserver();
  }

  function renderCheatsheet() {
    const grid = $('#cheatsheet-grid');
    const icons = {
      plans: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
      clock: 'M12 8v4l3 3M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      chart: 'M3 3v18h18M7 16l4-4 4 4 6-6',
      prompt: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 10h.01M16 10h.01M8 14c1.3 1.3 6.7 1.3 8 0',
      terminal: 'M4 17l6-6-6-6M12 19h8',
      code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
      chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
      scale: 'M12 3v18M3 12h18M5 7l7-4 7 4M5 17l7 4 7-4',
      flow: 'M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2 2-2 2M18 13l2 2-2 2M5 12h14',
      cycle: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
      star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    };

    grid.innerHTML = CHEATSHEET.map(section => `
      <article class="cs-card reveal">
        <div class="cs-card-head">
          <div class="cs-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="${icons[section.icon] || icons.code}"/>
            </svg>
          </div>
          <h3>${section.title}</h3>
          <span class="cs-count">${section.items.length} fatos</span>
        </div>
        <dl class="cs-items">
          ${section.items.map(it => `
            <div class="cs-item">
              <dt>${it.k}</dt>
              <dd>${it.v}</dd>
            </div>
          `).join('')}
        </dl>
      </article>
    `).join('');

    $('#stat-topics').textContent = CHEATSHEET.length;
    $('#stat-facts').textContent = CHEATSHEET.reduce((sum, s) => sum + s.items.length, 0);
  }

  function renderChapters() {
    const container = $('#chapters-container');
    const navList = $('#chapter-list');

    const grouped = {};
    QUESTIONS.forEach(q => {
      if (!grouped[q.ch]) grouped[q.ch] = [];
      grouped[q.ch].push(q);
    });

    navList.innerHTML = CHAPTERS.map(ch => {
      const count = (grouped[ch.id] || []).length;
      return `
        <li>
          <a href="#${ch.id}" data-chapter="${ch.id}">
            <span class="nav-num">${String(ch.num).padStart(2, '0')}</span>
            <span class="nav-title">${ch.title}</span>
            <span class="nav-count">${count}</span>
          </a>
        </li>
      `;
    }).join('');

    container.innerHTML = CHAPTERS.map(ch => {
      const questions = (grouped[ch.id] || []).sort((a, b) => a.n - b.n);
      return `
        <section class="chapter reveal" id="${ch.id}">
          <div class="chapter-head">
            <div class="chapter-bignum">${String(ch.num).padStart(2, '0')}</div>
            <div>
              <span class="chapter-kicker">Capítulo ${ch.num}</span>
              <h3>${ch.title}</h3>
              <p>${ch.desc}</p>
            </div>
            <div class="chapter-meta">
              <strong>${questions.length}</strong>
              questões
            </div>
          </div>
          <div class="chapter-questions">
            ${questions.map(q => renderQuestion(q)).join('')}
          </div>
        </section>
      `;
    }).join('');

    updateProgress();
  }

  function renderQuestion(q) {
    const studied = state.studied.has(q.n);
    return `
      <article class="q-card ${studied ? 'studied' : ''}" data-q="${q.n}">
        <div class="q-top">
          <span class="q-badge">Q${q.n}</span>
          <span class="q-tag">${q.a.length > 1 ? `${q.a.length} respostas` : '1 resposta'}</span>
          <label class="q-studied-label">
            <input type="checkbox" ${studied ? 'checked' : ''} data-study="${q.n}">
            <span>Estudado</span>
          </label>
        </div>
        <div class="q-text">${q.q}</div>
        <div class="q-answers">
          <div class="q-answers-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Resposta correta
          </div>
          ${q.a.map(([letter, text]) => `
            <div class="q-answer">
              <span class="q-letter">${letter}</span>
              <span>${text}</span>
            </div>
          `).join('')}
        </div>
      </article>
    `;
  }

  function setupTabs() {
    $$('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        if (state.activeTab === target) return;

        state.activeTab = target;
        $$('.tab').forEach(t => {
          t.classList.toggle('active', t.dataset.tab === target);
          t.setAttribute('aria-selected', t.dataset.tab === target);
        });
        $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${target}`));

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function setupSearch() {
    const input = $('#search');
    let debounce;

    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.searchQuery = input.value.trim().toLowerCase();
        filterContent();
      }, 200);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        input.value = '';
        state.searchQuery = '';
        filterContent();
      }
    });
  }

  function filterContent() {
    const query = state.searchQuery;

    if (state.activeTab === 'cheatsheet') {
      const cards = $$('.cs-card');
      let visible = 0;

      cards.forEach(card => {
        const title = $('h3', card).textContent.toLowerCase();
        const items = $$('.cs-item', card);
        let cardVisible = false;

        items.forEach(item => {
          const text = item.textContent.toLowerCase();
          const match = !query || text.includes(query);
          item.style.display = match ? '' : 'none';
          if (match) cardVisible = true;
        });

        card.style.display = cardVisible ? '' : 'none';
        if (cardVisible) visible++;
      });

      $('#cs-empty').classList.toggle('hidden', visible > 0);
    } else {
      const chapters = $$('.chapter');
      let visible = 0;

      chapters.forEach(chapter => {
        const title = $('h3', chapter).textContent.toLowerCase();
        const questions = $$('.q-card', chapter);
        let chapterVisible = false;

        questions.forEach(q => {
          const text = q.textContent.toLowerCase();
          const match = !query || text.includes(query);
          q.style.display = match ? '' : 'none';
          if (match) chapterVisible = true;
        });

        chapter.style.display = chapterVisible ? '' : 'none';
        if (chapterVisible) visible++;
      });

      $('#ch-empty').classList.toggle('hidden', visible > 0);
    }
  }

  function setupScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          $$('.chapter-nav a').forEach(a => {
            a.classList.toggle('current', a.dataset.chapter === id);
          });
        }
      });
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });

    $$('.chapter').forEach(ch => observer.observe(ch));
  }

  function setupKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        $('#search').focus();
      }
    });
  }

  function setupProgress() {
    document.addEventListener('change', e => {
      if (!e.target.matches('[data-study]')) return;

      const num = parseInt(e.target.dataset.study, 10);
      const card = e.target.closest('.q-card');

      if (e.target.checked) {
        state.studied.add(num);
        card.classList.add('studied');
      } else {
        state.studied.delete(num);
        card.classList.remove('studied');
      }

      localStorage.setItem('gh300-studied', JSON.stringify([...state.studied]));
      updateProgress();
    });

    $('#btn-reset')?.addEventListener('click', () => {
      if (!confirm('Limpar todas as marcações de estudo?')) return;
      state.studied.clear();
      localStorage.removeItem('gh300-studied');
      $$('.q-card.studied').forEach(c => c.classList.remove('studied'));
      $$('.q-studied-label input').forEach(i => i.checked = false);
      updateProgress();
    });
  }

  function updateProgress() {
    const total = QUESTIONS.length;
    const done = state.studied.size;
    const pct = total > 0 ? (done / total) * 100 : 0;

    $('#progress-text').textContent = `${done} / ${total}`;
    $('#progress-fill').style.width = `${pct}%`;
  }

  function setupPrint() {
    $('#btn-print')?.addEventListener('click', () => window.print());
  }

  function revealObserver() {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
