(function() {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const state = {
    activeTab: 'cheatsheet',
    searchQuery: '',
    studied: new Set(JSON.parse(localStorage.getItem('gh300-studied') || '[]')),
    speech: {
      mode: 'idle',
      card: null,
      utterance: null,
      paused: false,
      queue: [],
      index: -1,
      runId: 0,
      pendingTimer: null,
      voice: null,
      voiceName: ''
    }
  };

  function init() {
    renderCheatsheet();
    renderChapters();
    setupTabs();
    setupSearch();
    setupScrollSpy();
    setupKeyboard();
    setupProgress();
    setupSpeech();
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
        <div class="q-audio-controls">
          <button class="q-audio-btn" type="button" data-speech="play" aria-label="Ouvir questão Q${q.n}" aria-pressed="false">
            <svg class="q-audio-icon-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <svg class="q-audio-icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <span data-speech-label>Ouvir questão e respostas</span>
          </button>
          <button class="q-audio-stop" type="button" data-speech="stop" aria-label="Parar leitura da questão Q${q.n}" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12"></rect>
            </svg>
            <span>Parar</span>
          </button>
        </div>
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
      tab.addEventListener('click', () => activateTab(tab.dataset.tab));
    });
  }

  function activateTab(target, shouldScroll = true) {
    if (state.activeTab === target) return;

    state.activeTab = target;
    $$('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === target);
      tab.setAttribute('aria-selected', tab.dataset.tab === target);
    });
    $$('.view').forEach(view => view.classList.toggle('active', view.id === `view-${target}`));

    if (target !== 'capitulos' && state.speech.mode === 'all' && !state.speech.paused) {
      pauseSpeechPlayback('Leitura pausada. Volte para Capítulos para continuar.');
    }

    if (shouldScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    filterContent();
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

      if (state.speech.mode === 'all') {
        chapters.forEach(chapter => {
          chapter.style.display = '';
          $$('.q-card', chapter).forEach(card => card.style.display = '');
        });
        $('#ch-empty').classList.add('hidden');
        return;
      }

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

  function setupSpeech() {
    const supported = isSpeechSupported();
    const controls = $$('#btn-speech-all, #btn-speech-all-stop, .q-audio-btn, .q-audio-stop');

    if (!supported) {
      controls.forEach(control => {
        control.disabled = true;
        control.title = 'A leitura de áudio não é compatível com este navegador';
      });
      setGlobalSpeechState('idle', 'Leitura de áudio não compatível com este navegador.');
      return;
    }

    refreshSpeechVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshSpeechVoice);
    setGlobalSpeechState('idle', `Pronto para ler ${QUESTIONS.length} questões.`);

    document.addEventListener('click', e => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      if (target.closest('#btn-speech-all')) {
        toggleAllSpeech();
        return;
      }

      if (target.closest('#btn-speech-all-stop')) {
        stopSpeech();
        return;
      }

      const control = target.closest('[data-speech]');
      if (!control) return;

      const card = control.closest('.q-card');
      if (!card) return;

      if (control.dataset.speech === 'stop') {
        stopSpeech();
        return;
      }

      toggleSpeech(card);
    });

    window.addEventListener('beforeunload', () => window.speechSynthesis.cancel());
  }

  function isSpeechSupported() {
    return 'speechSynthesis' in window &&
      typeof window.speechSynthesis.speak === 'function' &&
      typeof window.speechSynthesis.cancel === 'function' &&
      typeof window.speechSynthesis.getVoices === 'function' &&
      'SpeechSynthesisUtterance' in window;
  }

  function refreshSpeechVoice() {
    const voices = window.speechSynthesis.getVoices();
    const voice = chooseSpeechVoice(voices);
    state.speech.voice = voice;
    state.speech.voiceName = voice?.name || 'padrão do navegador';

    const voiceLabel = $('#speech-global-voice');
    if (voiceLabel) voiceLabel.textContent = `Voz: ${state.speech.voiceName}`;

    const globalButton = $('#btn-speech-all');
    if (globalButton) globalButton.title = `Voz selecionada: ${state.speech.voiceName}`;
  }

  function chooseSpeechVoice(voices) {
    const brazilianVoices = voices.filter(voice => voice.lang.toLowerCase() === 'pt-br');
    const portugueseVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith('pt'));
    const candidates = brazilianVoices.length ? brazilianVoices : portugueseVoices;
    if (!candidates.length) return null;

    return candidates.slice().sort((a, b) => scoreSpeechVoice(b) - scoreSpeechVoice(a))[0];
  }

  function scoreSpeechVoice(voice) {
    const name = voice.name.toLowerCase();
    let score = voice.lang.toLowerCase() === 'pt-br' ? 100 : 70;

    if (name.includes('google')) score += 100;
    if (name.includes('brasil') || name.includes('brazil') || name.includes('brazilian')) score += 30;
    if (name.includes('português') || name.includes('portuguese')) score += 10;
    if (voice.default) score += 5;

    return score;
  }

  function toggleAllSpeech() {
    if (state.speech.mode !== 'all') {
      startAllSpeech();
      return;
    }

    if (state.speech.paused) {
      resumeSpeechPlayback();
    } else {
      pauseSpeechPlayback();
    }
  }

  function startAllSpeech() {
    if (!isSpeechSupported()) return;

    stopSpeech();
    state.speech.mode = 'all';
    state.speech.queue = QUESTIONS.slice().sort((a, b) => a.n - b.n);
    state.speech.index = 0;
    state.speech.paused = false;

    activateTab('capitulos', false);
    filterContent();
    startCurrentQuestion(state.speech.runId, true);
  }

  function startCurrentQuestion(runId, shouldScroll) {
    if (runId !== state.speech.runId || state.speech.mode !== 'all' || state.speech.paused) return;

    if (state.speech.index >= state.speech.queue.length) {
      finishAllSpeech(runId);
      return;
    }

    const question = state.speech.queue[state.speech.index];
    const card = getQuestionCard(question.n);
    if (!card) {
      failSpeech(runId, `Não foi possível encontrar a questão Q${question.n}.`);
      return;
    }

    clearSpeechTimer();
    state.speech.card = card;
    state.speech.utterance = null;
    setCurrentSpeechCard(card);
    setSpeechState(card, 'playing');
    setGlobalSpeechState('playing', `Questão ${question.n} de ${state.speech.queue.length} — preparando leitura.`);

    if (shouldScroll) scrollToQuestion(card);

    const delay = shouldScroll && !prefersReducedMotion() ? 350 : 0;
    state.speech.pendingTimer = window.setTimeout(() => {
      state.speech.pendingTimer = null;
      if (runId !== state.speech.runId || state.speech.paused) return;
      startUtterance(card, runId, 'all');
    }, delay);
  }

  function getQuestionCard(number) {
    return $(`.q-card[data-q="${number}"]`);
  }

  function scrollToQuestion(card) {
    const header = $('.site-header');
    if (header) card.style.scrollMarginTop = `${header.getBoundingClientRect().height + 24}px`;

    card.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function startSpeech(card) {
    if (!isSpeechSupported()) return;

    stopSpeech();
    state.speech.mode = 'single';
    state.speech.card = card;
    state.speech.paused = false;
    setCurrentSpeechCard(card);
    setGlobalSpeechState('single', `Leitura individual da questão Q${card.dataset.q}.`);
    startUtterance(card, state.speech.runId, 'single');
  }

  function toggleSpeech(card) {
    if (state.speech.card === card && state.speech.mode !== 'idle') {
      if (state.speech.mode === 'all' && state.activeTab !== 'capitulos') {
        activateTab('capitulos', false);
      }
      toggleSpeechPlayback();
      return;
    }

    startSpeech(card);
  }

  function toggleSpeechPlayback() {
    if (state.speech.paused || window.speechSynthesis.paused) {
      resumeSpeechPlayback();
      return;
    }

    pauseSpeechPlayback();
  }

  function pauseSpeechPlayback(message) {
    if (state.speech.mode === 'idle') return;

    clearSpeechTimer();
    if (state.speech.utterance && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    } else if (state.speech.utterance && !window.speechSynthesis.paused) {
      state.speech.utterance = null;
      window.speechSynthesis.cancel();
    }

    state.speech.paused = true;
    if (state.speech.card) setSpeechState(state.speech.card, 'paused');

    const question = state.speech.card?.dataset.q;
    const defaultMessage = state.speech.mode === 'all'
      ? `Questão ${question} de ${state.speech.queue.length} — leitura pausada.`
      : `Leitura da questão Q${question} pausada.`;
    setGlobalSpeechState('paused', message || defaultMessage);
  }

  function resumeSpeechPlayback() {
    if (state.speech.mode === 'idle') return;

    if (state.speech.mode === 'all' && state.activeTab !== 'capitulos') {
      activateTab('capitulos', false);
    }

    state.speech.paused = false;
    const card = state.speech.card;
    const runId = state.speech.runId;

    if (state.speech.utterance && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      if (card) setSpeechState(card, 'playing');
      setGlobalSpeechState('playing');
      return;
    }

    if (!card) return;

    if (state.speech.utterance && window.speechSynthesis.speaking) {
      if (card) setSpeechState(card, 'playing');
      setGlobalSpeechState('playing');
      return;
    }

    startUtterance(card, runId, state.speech.mode);
  }

  function startUtterance(card, runId, mode) {
    if (!isCurrentSpeechSession(card, runId, mode)) return;

    refreshSpeechVoice();
    const utterance = new SpeechSynthesisUtterance(getSpeechText(card));
    utterance.voice = state.speech.voice || null;
    utterance.lang = state.speech.voice?.lang || 'pt-BR';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      if (!isCurrentSpeechUtterance(utterance, card, runId, mode)) return;
      state.speech.paused = false;
      setSpeechState(card, 'playing');
      updateSpeechProgress('playing');
    };
    utterance.onpause = () => {
      if (!isCurrentSpeechUtterance(utterance, card, runId, mode)) return;
      state.speech.paused = true;
      setSpeechState(card, 'paused');
      updateSpeechProgress('paused');
    };
    utterance.onresume = () => {
      if (!isCurrentSpeechUtterance(utterance, card, runId, mode)) return;
      state.speech.paused = false;
      setSpeechState(card, 'playing');
      updateSpeechProgress('playing');
    };
    utterance.onend = () => {
      if (!isCurrentSpeechUtterance(utterance, card, runId, mode)) return;
      state.speech.utterance = null;
      state.speech.paused = false;

      if (mode === 'all') {
        setSpeechState(card, 'idle');
        state.speech.index += 1;
        startCurrentQuestion(runId, true);
      } else {
        finishSingleSpeech(card, runId);
      }
    };
    utterance.onerror = event => {
      if (!isCurrentSpeechUtterance(utterance, card, runId, mode)) return;
      failSpeech(runId, event.error === 'canceled' || event.error === 'interrupted'
        ? `A leitura da questão Q${card.dataset.q} foi interrompida.`
        : `Não foi possível ler a questão Q${card.dataset.q}.`);
    };

    state.speech.utterance = utterance;
    state.speech.paused = false;
    setSpeechState(card, 'playing');
    updateSpeechProgress('playing');

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      failSpeech(runId, `Não foi possível iniciar a leitura da questão Q${card.dataset.q}.`);
    }
  }

  function isCurrentSpeechSession(card, runId, mode) {
    return state.speech.runId === runId && state.speech.mode === mode && state.speech.card === card;
  }

  function isCurrentSpeechUtterance(utterance, card, runId, mode) {
    return isCurrentSpeechSession(card, runId, mode) && state.speech.utterance === utterance;
  }

  function finishSingleSpeech(card, runId) {
    if (state.speech.runId !== runId) return;
    state.speech.mode = 'idle';
    state.speech.card = null;
    state.speech.utterance = null;
    state.speech.paused = false;
    state.speech.runId += 1;
    setSpeechState(card, 'idle');
    clearCurrentSpeechCard();
    setGlobalSpeechState('idle', `Leitura da questão Q${card.dataset.q} concluída.`);
    filterContent();
  }

  function finishAllSpeech(runId) {
    if (state.speech.runId !== runId) return;
    const total = state.speech.queue.length;
    clearSpeechTimer();
    state.speech.mode = 'idle';
    state.speech.card = null;
    state.speech.utterance = null;
    state.speech.paused = false;
    state.speech.queue = [];
    state.speech.index = -1;
    state.speech.runId += 1;
    clearCurrentSpeechCard();
    setGlobalSpeechState('complete', `Leitura concluída: ${total} de ${total} questões.`);
    filterContent();
  }

  function failSpeech(runId, message) {
    if (state.speech.runId !== runId) return;
    clearSpeechTimer();
    state.speech.utterance = null;
    state.speech.paused = true;
    if (state.speech.card) setSpeechState(state.speech.card, 'paused');
    setGlobalSpeechState('error', message);
  }

  function stopSpeech() {
    const card = state.speech.card;
    state.speech.runId += 1;
    clearSpeechTimer();
    state.speech.mode = 'idle';
    state.speech.card = null;
    state.speech.utterance = null;
    state.speech.paused = false;
    state.speech.queue = [];
    state.speech.index = -1;
    clearCurrentSpeechCard();
    $$('.q-card.speech-playing, .q-card.speech-paused').forEach(activeCard => setSpeechState(activeCard, 'idle'));
    window.speechSynthesis?.cancel();
    if (card) setSpeechState(card, 'idle');
    setGlobalSpeechState('idle');
    filterContent();
  }

  function clearSpeechTimer() {
    if (state.speech.pendingTimer === null) return;
    window.clearTimeout(state.speech.pendingTimer);
    state.speech.pendingTimer = null;
  }

  function setCurrentSpeechCard(card) {
    clearCurrentSpeechCard();
    card.classList.add('speech-current');
  }

  function clearCurrentSpeechCard() {
    $$('.q-card.speech-current').forEach(card => card.classList.remove('speech-current'));
  }

  function updateSpeechProgress(status) {
    if (state.speech.mode === 'all') {
      const number = state.speech.card?.dataset.q || '';
      const message = status === 'paused'
        ? `Questão ${number} de ${state.speech.queue.length} — leitura pausada.`
        : `Questão ${number} de ${state.speech.queue.length} — lendo.`;
      setGlobalSpeechState(status, message);
      return;
    }

    if (state.speech.mode === 'single') {
      const number = state.speech.card?.dataset.q || '';
      setGlobalSpeechState(status === 'paused' ? 'paused' : 'single', `Leitura individual da questão Q${number}${status === 'paused' ? ' pausada.' : '.'}`);
    }
  }

  function setGlobalSpeechState(status, message) {
    const global = $('#speech-global');
    const playButton = $('#btn-speech-all');
    const stopButton = $('#btn-speech-all-stop');
    const label = $('[data-speech-all-label]');
    const statusOutput = $('#speech-global-status');
    if (!global || !playButton || !stopButton || !label || !statusOutput) return;

    const total = QUESTIONS.length;
    const isAll = state.speech.mode === 'all';
    const isActive = state.speech.mode !== 'idle';
    const labels = {
      idle: `Ouvir ${total} questões`,
      single: `Ouvir ${total} questões`,
      playing: isAll ? 'Pausar leitura' : `Ouvir ${total} questões`,
      paused: isAll ? 'Continuar leitura' : `Ouvir ${total} questões`,
      error: isAll ? 'Tentar novamente' : `Ouvir ${total} questões`,
      complete: 'Ouvir novamente'
    };

    global.dataset.state = status;
    global.classList.toggle('is-playing', status === 'playing' && isAll);
    global.classList.toggle('is-paused', status === 'paused' && isAll);
    global.classList.toggle('is-error', status === 'error');
    label.textContent = labels[status] || labels.idle;
    playButton.setAttribute('aria-label', `${labels[status] || labels.idle}${isAll && status === 'playing' ? '' : ''}`);
    playButton.setAttribute('aria-pressed', String(isAll && status === 'playing'));
    stopButton.disabled = !isActive;
    statusOutput.textContent = message || `Pronto para ler ${total} questões.`;
  }

  function getSpeechText(card) {
    const question = $('.q-text', card).textContent.trim();
    const answers = $$('.q-answer', card).map(answer => {
      const letter = $('.q-letter', answer).textContent.trim();
      const text = $$('span', answer)
        .filter(span => !span.classList.contains('q-letter'))
        .map(span => span.textContent.trim())
        .join(' ');
      return `Resposta ${letter}: ${text}`;
    });

    return `Questão ${card.dataset.q}. ${question}. Respostas corretas: ${answers.join('. ')}.`;
  }

  function setSpeechState(card, status) {
    const playButton = $('[data-speech="play"]', card);
    const stopButton = $('[data-speech="stop"]', card);
    const label = $('[data-speech-label]', card);
    const isActive = status !== 'idle';
    const labels = {
      idle: 'Ouvir questão e respostas',
      playing: 'Pausar leitura',
      paused: 'Continuar leitura'
    };

    card.classList.toggle('speech-playing', status === 'playing');
    card.classList.toggle('speech-paused', status === 'paused');
    playButton.setAttribute('aria-label', `${labels[status]} da questão Q${card.dataset.q}`);
    playButton.setAttribute('aria-pressed', String(status === 'playing'));
    label.textContent = labels[status];
    stopButton.disabled = !isActive;
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
