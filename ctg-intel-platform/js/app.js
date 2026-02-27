(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // APP.JS — Module Loader, Navigation, Lifecycle Management
  // Lazy-loads CSS and JS per module on demand
  // ═══════════════════════════════════════════════════════════════

  window.modules = window.modules || {};

  var currentView = null;
  var loadedCSS = {};
  var loadedJS = {};

  // ─── Lazy Load Helpers ───
  function loadCSS(href) {
    if (loadedCSS[href]) return Promise.resolve();
    return new Promise(function(resolve) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = function() { loadedCSS[href] = true; resolve(); };
      link.onerror = function() { loadedCSS[href] = true; resolve(); };
      document.head.appendChild(link);
    });
  }

  function loadJS(src) {
    if (loadedJS[src]) return Promise.resolve();
    return new Promise(function(resolve) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = function() { loadedJS[src] = true; resolve(); };
      script.onerror = function() { loadedJS[src] = true; resolve(); };
      document.body.appendChild(script);
    });
  }

  // ─── Build Shell ───
  function buildShell() {
    var D = window.DATA;
    var shell = document.getElementById('app');
    shell.className = 'shell';

    // Header
    var header = shared.el('header', { className: 'header' });
    var brand = shared.el('div', { style: { display: 'flex', alignItems: 'center', gap: '16px' } }, [
      shared.el('div', {}, [
        shared.el('div', { className: 'header-brand-label', textContent: 'BROADBAND PARTNER INTELLIGENCE' }),
        shared.el('div', { className: 'header-brand-title', textContent: 'Strategic Operating System' })
      ])
    ]);

    var stats = shared.el('div', { className: 'header-stats' });
    var statData = [
      { value: D.fmt(D.totalMarket), label: 'addressable market', color: 'var(--accent)' },
      { value: '500+', label: 'funded ISPs', color: 'var(--text)' },
      { value: '' + D.hotCount, label: 'critical prospects', color: 'var(--warning)' }
    ];
    statData.forEach(function(s) {
      var wrap = shared.el('div');
      wrap.appendChild(shared.el('span', { className: 'header-stat-value', style: { color: s.color }, textContent: s.value }));
      wrap.appendChild(shared.el('span', { className: 'header-stat-label', textContent: s.label }));
      stats.appendChild(wrap);
    });
    var live = shared.el('div', { className: 'header-live' }, [
      shared.el('span', { className: 'header-live-dot' }),
      shared.el('span', { className: 'header-live-text', textContent: 'AGENTS ONLINE' })
    ]);
    stats.appendChild(live);
    header.appendChild(brand);
    header.appendChild(stats);

    // Body
    var body = shared.el('div', { className: 'body' });

    // Sidebar
    var sidebar = shared.el('nav', { className: 'sidebar' });
    D.NAV_ITEMS.forEach(function(n) {
      var btn = shared.el('button', { className: 'nav-btn', 'data-view': n.id }, [
        shared.el('span', { className: 'nav-btn-icon', textContent: n.icon }),
        document.createTextNode(n.label)
      ]);
      btn.addEventListener('click', function() { navigateTo(n.id); });
      sidebar.appendChild(btn);
    });

    // Sidebar footer
    var moneyLine = shared.el('div', { className: 'sidebar-card' }, [
      shared.el('div', { className: 'sidebar-card-title', textContent: 'THE MONEY LINE' }),
      shared.el('div', { className: 'sidebar-card-text', textContent: '"$48B in broadband funding just created 500+ ISPs that need what we sell. This platform gets us there first."' })
    ]);
    sidebar.appendChild(moneyLine);

    var credit = shared.el('div', { className: 'sidebar-credit' }, [
      shared.el('div', { className: 'sidebar-credit-label', textContent: 'DESIGNED BY' }),
      shared.el('div', { className: 'sidebar-credit-name', textContent: 'Pete Connor' }),
      shared.el('div', { className: 'sidebar-credit-role', textContent: 'Director, TC Operations' })
    ]);
    sidebar.appendChild(credit);

    // Main content
    var main = shared.el('main', { className: 'main-content', id: 'main-content' });

    body.appendChild(sidebar);
    body.appendChild(main);
    shell.appendChild(header);
    shell.appendChild(body);
  }

  // ─── Module File Map ───
  // Maps view IDs to actual filenames (when they differ from the ID)
  var FILE_MAP = {
    'command': 'command-center',
    'strain': 'strain-sim'
  };

  // ─── Navigation ───
  function navigateTo(viewId) {
    // Destroy current module
    if (currentView && window.modules[currentView] && window.modules[currentView].destroy) {
      window.modules[currentView].destroy();
    }

    currentView = viewId;

    // Update active nav
    var navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(function(btn) {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    var main = document.getElementById('main-content');
    main.innerHTML = '';

    // Load module CSS and JS, then init
    var fileName = FILE_MAP[viewId] || viewId;
    var cssPath = 'css/' + fileName + '.css';
    var jsPath = 'js/' + fileName + '.js';

    Promise.all([loadCSS(cssPath), loadJS(jsPath)]).then(function() {
      if (window.modules[viewId] && window.modules[viewId].init) {
        window.modules[viewId].init(main, null);
      } else {
        main.innerHTML = '<div style="padding:40px;color:var(--text-muted);">Module "' + viewId + '" not found.</div>';
      }
    });
  }

  // ─── App State (shared between modules) ───
  window.appState = {
    tierFilter: 'all',
    sortBy: 'score',
    selectedId: null,
    feedIdx: 5,

    getSelected: function() {
      if (!this.selectedId) return null;
      return window.DATA.PROSPECTS.find(function(p) { return p.id === window.appState.selectedId; }) || null;
    },

    navigateTo: navigateTo
  };

  // ─── Init ───
  function init() {
    buildShell();
    navigateTo('command');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
