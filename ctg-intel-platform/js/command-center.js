(function() {
  'use strict';

  var D = window.DATA;
  var S = window.shared;

  function init(container) {
    var state = window.appState;
    var filtered = D.filterAndSort(state.tierFilter, state.sortBy);

    var grid = S.el('div', { className: 'cc-grid' });

    // ─── Left Column ───
    var left = S.el('div');

    // Hero Metrics
    var metrics = S.el('div', { className: 'cc-metrics' });
    var metricData = [
      { label: 'TOTAL ADDRESSABLE MARKET', value: D.fmt(D.totalMarket), accent: true },
      { label: 'HOT PROSPECTS', value: '' + D.hotCount, sub: D.warmCount + ' warm' },
      { label: 'DECISION MONTHS Q2-Q3 2026', value: '6', sub: 'outreach window open' },
      { label: 'PROJECTED YEAR 1 REVENUE', value: '$2.5M\u2013$5M', accent: true, small: true }
    ];
    metricData.forEach(function(m) {
      var inner = S.el('div', { className: 'cc-metric-value' });
      inner.appendChild(S.el('span', {
        style: {
          fontFamily: 'var(--font-mono)', fontSize: m.small ? '20px' : '28px',
          fontWeight: '600', letterSpacing: '-0.02em',
          color: m.accent ? 'var(--accent)' : 'var(--text)'
        },
        textContent: m.value
      }));
      if (m.sub) inner.appendChild(S.el('div', { className: 'cc-metric-sub', textContent: m.sub }));
      var card = S.Card([S.Label(m.label), inner], { padding: '16px' });
      card.classList.add('cc-metric-card');
      metrics.appendChild(card);
    });
    left.appendChild(metrics);

    // Prospect Table
    var tableWrap = S.Card(null, { padding: '0', overflow: 'hidden' });

    var tableHeader = S.el('div', { className: 'cc-table-header' });
    tableHeader.appendChild(S.Label('PROSPECT PIPELINE \u2014 TOP SCORED', { color: 'var(--accent)' }));
    tableHeader.appendChild(S.TierFilterBar(state.tierFilter, function(t) {
      state.tierFilter = t;
      container.innerHTML = '';
      init(container);
    }));
    tableWrap.appendChild(tableHeader);

    var tableScroll = S.el('div', { style: { overflowX: 'auto' } });
    var table = S.el('table', { className: 'cc-table' });

    // Thead
    var thead = S.el('thead');
    var headRow = S.el('tr', { style: { borderBottom: '1px solid var(--border)' } });
    ['Score','Company','State','Award','Locations','Tech','Decision Mo','Tier'].forEach(function(h) {
      var th = S.el('th', { textContent: h });
      if (['Score','Company','Award'].indexOf(h) > -1) {
        th.classList.add('sortable');
        var sortKey = h === 'Score' ? 'score' : h === 'Company' ? 'name' : 'award';
        if (state.sortBy === sortKey) th.textContent = h + ' \u2193';
        th.addEventListener('click', function() {
          state.sortBy = sortKey;
          container.innerHTML = '';
          init(container);
        });
      }
      if (h === 'Score') th.style.textAlign = 'center';
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    // Tbody
    var tbody = S.el('tbody');
    filtered.slice(0, 12).forEach(function(p) {
      var score = D.calcScore(p);
      var tr = S.el('tr');
      tr.style.background = state.selectedId === p.id ? 'var(--accent-dim)' : 'transparent';
      S.addRowHover(tr, state.selectedId === p.id);
      tr.addEventListener('click', function() {
        state.selectedId = p.id;
        state.navigateTo('pipeline');
      });

      // Score
      tr.appendChild(S.el('td', { style: { textAlign: 'center' } }, [
        S.el('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '600', color: D.scoreColor(score) }, textContent: '' + score })
      ]));
      // Company
      var compTd = S.el('td');
      compTd.appendChild(S.el('span', { style: { fontSize: '13px', fontWeight: '500', color: 'var(--text)' }, textContent: p.name }));
      if (p.name === 'LigTel Communications') {
        compTd.appendChild(S.el('span', { style: { marginLeft: '6px', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', background: 'rgba(167,139,250,0.15)', color: 'var(--strategic)', fontWeight: '600' }, textContent: 'EX-PARTNER' }));
      }
      tr.appendChild(compTd);
      // State
      tr.appendChild(S.el('td', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }, textContent: p.state }));
      // Award
      tr.appendChild(S.el('td', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)' }, textContent: D.fmt(p.award) }));
      // Locations
      tr.appendChild(S.el('td', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }, textContent: D.fmtN(p.locs) }));
      // Tech
      tr.appendChild(S.el('td', { style: { fontSize: '11px', color: 'var(--text-secondary)' }, textContent: p.tech }));
      // Decision Month
      tr.appendChild(S.el('td', { style: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: p.decisionMonth === 'N/A' ? 'var(--text-muted)' : 'var(--warning)' }, textContent: p.decisionMonth }));
      // Tier
      var tierTd = S.el('td');
      tierTd.appendChild(S.Badge(p.tier));
      tr.appendChild(tierTd);

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableScroll.appendChild(table);
    tableWrap.appendChild(tableScroll);
    left.appendChild(tableWrap);

    // ─── Right Column ───
    var right = S.el('div');

    // Intel Feed
    var feedWrap = S.Card(null, { padding: '0', overflow: 'hidden' });
    var feedHeader = S.el('div', { className: 'cc-feed-header' });
    feedHeader.appendChild(S.Label('INTELLIGENCE FEED', { color: 'var(--accent)' }));
    var liveInd = S.el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } }, [
      S.el('span', { style: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite', display: 'inline-block' } }),
      S.el('span', { style: { fontSize: '10px', color: 'var(--success)', fontWeight: '500' }, textContent: 'LIVE' })
    ]);
    feedHeader.appendChild(liveInd);
    feedWrap.appendChild(feedHeader);

    var feedList = S.el('div', { className: 'cc-feed-list' });
    D.INTEL_FEED.slice(0, state.feedIdx).forEach(function(item) {
      var feedItem = S.el('div', { className: 'cc-feed-item' });
      var meta = S.el('div', { className: 'cc-feed-meta' });
      var left2 = S.el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } });
      var agColor = D.agentColor(item.agent);
      left2.appendChild(S.el('span', { className: 'cc-feed-agent', style: { color: agColor, background: agColor.replace(')', ',0.08)').replace('var(', 'rgba(').replace('--scout', '52,211,153').replace('--analyst', '59,130,246').replace('--strategist', '167,139,250').replace('--planner', '245,158,11').replace('--monitor', '239,68,68') }, textContent: item.agent.toUpperCase() }));
      // Simpler approach for agent background
      left2.lastChild.style.background = '';
      left2.lastChild.style.backgroundColor = 'rgba(128,128,128,0.1)';
      left2.appendChild(S.el('span', { className: 'cc-feed-time', textContent: item.time }));
      meta.appendChild(left2);
      meta.appendChild(S.el('span', { className: 'cc-feed-impact', textContent: item.impact }));
      feedItem.appendChild(meta);
      feedItem.appendChild(S.el('div', { className: 'cc-feed-text', textContent: item.text }));
      feedList.appendChild(feedItem);
    });
    feedWrap.appendChild(feedList);

    if (state.feedIdx < D.INTEL_FEED.length) {
      var loadMore = S.el('div', { className: 'cc-load-more' });
      loadMore.appendChild(S.el('button', {
        className: 'cc-load-btn',
        textContent: 'Load More Signals',
        onClick: function() {
          state.feedIdx = Math.min(state.feedIdx + 3, D.INTEL_FEED.length);
          container.innerHTML = '';
          init(container);
        }
      }));
      feedWrap.appendChild(loadMore);
    }
    right.appendChild(feedWrap);

    // BEAD Program Status
    var statusCard = S.Card(null, { marginTop: '12px', padding: '16px' });
    statusCard.appendChild(S.Label('BEAD PROGRAM STATUS', { marginBottom: '10px' }));
    [
      { label: 'States Approved', value: '50/56', pct: 89 },
      { label: 'Construction Active', value: '12 states', pct: 21 },
      { label: 'Funds Disbursing', value: '3 states', pct: 5 }
    ].forEach(function(s) {
      var row = S.el('div', { className: 'cc-status-row' });
      var header = S.el('div', { className: 'cc-status-header' });
      header.appendChild(S.el('span', { className: 'cc-status-label', textContent: s.label }));
      header.appendChild(S.el('span', { className: 'cc-status-value', textContent: s.value }));
      row.appendChild(header);
      row.appendChild(S.MiniBar(s.pct, 100));
      statusCard.appendChild(row);
    });
    right.appendChild(statusCard);

    // Technology Mix
    var techCard = S.Card(null, { marginTop: '12px', padding: '16px' });
    techCard.appendChild(S.Label('TECHNOLOGY MIX IN PIPELINE', { marginBottom: '10px' }));
    [
      { label: 'Fiber', pct: 63, color: 'var(--accent)' },
      { label: 'Fiber/FWA Transition', pct: 18, color: 'var(--warm)' },
      { label: 'FWA \u2192 Fiber', pct: 12, color: 'var(--nurture)' },
      { label: 'Multi-Technology', pct: 7, color: 'var(--strategic)' }
    ].forEach(function(t) {
      var row = S.el('div', { className: 'cc-tech-row' });
      var header = S.el('div', { className: 'cc-status-header' });
      header.appendChild(S.el('span', { className: 'cc-status-label', textContent: t.label }));
      header.appendChild(S.el('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: t.color, fontWeight: '500' }, textContent: t.pct + '%' }));
      row.appendChild(header);
      row.appendChild(S.MiniBar(t.pct, 100, t.color));
      techCard.appendChild(row);
    });
    right.appendChild(techCard);

    grid.appendChild(left);
    grid.appendChild(right);
    container.appendChild(grid);
  }

  function destroy() {
    // No intervals to clean up in this module
  }

  window.modules = window.modules || {};
  window.modules['command'] = { init: init, destroy: destroy };
})();
