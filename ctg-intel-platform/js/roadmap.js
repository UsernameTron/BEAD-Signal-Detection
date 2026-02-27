(function() {
  'use strict';

  var S = window.shared;

  var activePhase = 1;

  function init(container) {
    var phases = [
      { num: 1, name: 'Foundation', weeks: '1\u20134', status: 'ready', items: [
        { task: 'Scrape and normalize all BEAD subgrantee data', output: 'Master database of 500+ ISPs', effort: '40 hrs' },
        { task: 'Company intelligence enrichment from public sources', output: 'Enriched profiles with leadership + contact paths', effort: '30 hrs' },
        { task: 'Initial Operational Strain scoring pass', output: 'Scored prospect list ranked by composite index', effort: '20 hrs' },
        { task: 'Deliver scored list to Sales leadership for review', output: 'Top 50 qualified prospects with executive briefs', effort: '10 hrs' }
      ], investment: '80\u2013100 hours + ~$200 API costs', deliverable: 'Scored prospect list of 200+ qualified ISPs' },
      { num: 2, name: 'Intelligence Engine', weeks: '5\u201312', status: 'pending', items: [
        { task: 'Build Operational Strain Prediction Engine', output: 'Six-factor model with automated scoring', effort: '60 hrs' },
        { task: 'Deploy Engagement Orchestration Engine', output: 'Claude API-powered contextual outreach briefs', effort: '40 hrs' },
        { task: 'Configure n8n monitoring workflows', output: 'Continuous signal detection across 50+ sources', effort: '30 hrs' },
        { task: 'Build React dashboard and deploy to Netlify', output: 'Interactive command center for Sales + Leadership', effort: '30 hrs' }
      ], investment: '160 hours + ~$100/mo ongoing', deliverable: 'Predictive scoring + outreach materials for top 50' },
      { num: 3, name: 'Full Platform', weeks: '13\u201320', status: 'future', items: [
        { task: 'Deploy five-agent agentic architecture', output: 'Autonomous Scout \u2192 Analyst \u2192 Strategist \u2192 Planner \u2192 Monitor chain', effort: '80 hrs' },
        { task: 'Build Competitive Landscape Map', output: 'Network graph of competitor partnerships and white space', effort: '30 hrs' },
        { task: 'Integrate Capacity Planning Bridge', output: 'Pipeline demand feeding WCS forecasting model', effort: '40 hrs' },
        { task: 'Partner Lifecycle Intelligence for existing accounts', output: 'Health scoring, churn prediction, expansion detection', effort: '40 hrs' }
      ], investment: '190 hours + ~$200/mo ongoing', deliverable: 'Complete strategic operating system' },
      { num: 4, name: 'Optimization', weeks: '21\u201326', status: 'future', items: [
        { task: 'Model calibration from outreach outcomes', output: 'Validated factor weights based on conversion data', effort: 'Ongoing' },
        { task: 'Financial Intelligence Module', output: 'Dynamic contract value modeling + portfolio diversification', effort: '30 hrs' },
        { task: 'Regulatory & Compliance Intelligence', output: 'BEAD compliance tracking as sales differentiator', effort: '20 hrs' },
        { task: 'Flywheel feedback loops', output: 'Quarterly model performance reports + auto-improvement', effort: 'Ongoing' }
      ], investment: '50+ hours + continuous improvement', deliverable: 'Self-improving learning system' }
    ];

    var active = phases.find(function(p) { return p.num === activePhase; });

    function rebuild() { container.innerHTML = ''; init(container); }

    var wrap = S.el('div', { className: 'rm-wrap' });
    wrap.appendChild(S.Label('DEPLOYMENT ROADMAP', { color: 'var(--accent)' }));
    wrap.appendChild(S.el('div', { className: 'rm-subtitle', textContent: 'Phased deployment from proof-of-value to strategic operating system' }));

    var grid = S.el('div', { className: 'rm-grid' });

    // ─── Phase Nav ───
    var navCol = S.el('div');
    phases.forEach(function(p) {
      var btn = S.el('button', { className: 'rm-phase-btn' + (activePhase === p.num ? ' active' : '') });
      btn.addEventListener('click', function() { activePhase = p.num; rebuild(); });
      var inner = S.el('div', { className: 'rm-phase-btn-inner' });
      inner.appendChild(S.el('div', { className: 'rm-phase-num', textContent: '' + p.num }));
      var info = S.el('div');
      info.appendChild(S.el('div', { className: 'rm-phase-name', textContent: p.name }));
      info.appendChild(S.el('div', { className: 'rm-phase-weeks', textContent: 'Weeks ' + p.weeks }));
      inner.appendChild(info);
      btn.appendChild(inner);
      navCol.appendChild(btn);
    });

    // The Ask
    var askCard = S.Card(null, { padding: '16px', marginTop: '8px', borderLeft: '3px solid var(--accent)', background: 'var(--accent-dim)' });
    askCard.appendChild(S.Label('THE ASK', { color: 'var(--accent)', marginBottom: '6px' }));
    askCard.appendChild(S.el('div', { className: 'rm-ask-text', textContent: 'Permission to build Phase 1. 80\u2013100 hours + $200. Proof of value in 4 weeks.' }));
    navCol.appendChild(askCard);
    grid.appendChild(navCol);

    // ─── Phase Detail ───
    if (active) {
      var detailCol = S.el('div');
      var detailCard = S.Card(null, { padding: '20px', marginBottom: '12px' });
      var detailHeader = S.el('div', { className: 'rm-detail-header' });
      var titleWrap = S.el('div');
      titleWrap.appendChild(S.el('div', { className: 'rm-detail-title', textContent: 'Phase ' + active.num + ': ' + active.name }));
      titleWrap.appendChild(S.el('div', { className: 'rm-detail-weeks', textContent: 'Weeks ' + active.weeks }));
      detailHeader.appendChild(titleWrap);

      var statusColor, statusBg, statusText;
      if (active.status === 'ready') { statusColor = 'var(--accent)'; statusBg = 'var(--accent-dim)'; statusText = 'READY TO START'; }
      else if (active.status === 'pending') { statusColor = 'var(--warm)'; statusBg = 'var(--warm-dim)'; statusText = 'PENDING PHASE 1'; }
      else { statusColor = 'var(--text-muted)'; statusBg = 'var(--surface-alt)'; statusText = 'FUTURE'; }
      detailHeader.appendChild(S.el('span', {
        className: 'rm-status-badge',
        style: { background: statusBg, color: statusColor, border: '1px solid ' + statusColor + '33' },
        textContent: statusText
      }));
      detailCard.appendChild(detailHeader);

      active.items.forEach(function(item) {
        var taskEl = S.el('div', { className: 'rm-task-item' });
        taskEl.appendChild(S.el('div', { className: 'rm-task-name', textContent: item.task }));
        var meta = S.el('div', { className: 'rm-task-meta' });
        meta.appendChild(S.el('span', { innerHTML: '<span class="rm-task-output-label">Output: </span><span class="rm-task-output-value">' + item.output + '</span>' }));
        meta.appendChild(S.el('span', { className: 'rm-task-effort', textContent: item.effort }));
        taskEl.appendChild(meta);
        detailCard.appendChild(taskEl);
      });
      detailCol.appendChild(detailCard);

      // Summary
      var summaryGrid = S.el('div', { className: 'rm-summary-grid' });
      var investCard = S.Card(null, { padding: '16px', textAlign: 'center' });
      investCard.appendChild(S.Label('INVESTMENT'));
      investCard.appendChild(S.el('div', { className: 'rm-summary-value', textContent: active.investment }));
      summaryGrid.appendChild(investCard);

      var delivCard = S.Card(null, { padding: '16px', textAlign: 'center' });
      delivCard.appendChild(S.Label('DELIVERABLE'));
      delivCard.appendChild(S.el('div', { className: 'rm-summary-deliverable', textContent: active.deliverable }));
      summaryGrid.appendChild(delivCard);
      detailCol.appendChild(summaryGrid);

      grid.appendChild(detailCol);
    }

    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  function destroy() {
    activePhase = 1;
  }

  window.modules = window.modules || {};
  window.modules['roadmap'] = { init: init, destroy: destroy };
})();
