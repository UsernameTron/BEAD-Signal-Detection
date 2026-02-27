(function() {
  'use strict';

  var D = window.DATA;
  var S = window.shared;

  var simState = { running: false, step: 0, log: [] };
  var simTimeouts = [];

  function init(container) {
    var agents = [
      { name: 'SCOUT', sub: 'The Eyes', color: 'var(--scout)', desc: 'Monitors 50+ data sources continuously. Detects signals from press releases, job postings, FCC complaints, conference calendars, and regulatory filings. Average latency: 2\u20136 hours.', triggers: 'RSS feeds, web scrapes, API monitors', outputs: 'Tagged signal events \u2192 Analyst' },
      { name: 'ANALYST', sub: 'The Brain', color: 'var(--analyst)', desc: 'Transforms raw signals into scored intelligence. Recalculates Operational Strain Scores, identifies tier threshold crossings, and maintains rolling Decision Month estimates.', triggers: 'Signal events from Scout', outputs: 'Scored profiles, tier alerts \u2192 Strategist' },
      { name: 'STRATEGIST', sub: 'The Voice', color: 'var(--strategist)', desc: 'Generates contextual executive outreach briefs using Claude API. Recommends channel, timing, and message angle for each prospect based on their specific situation.', triggers: 'Tier changes, Decision Month approaching', outputs: 'Outreach briefs \u2192 Sales team' },
      { name: 'PLANNER', sub: 'The Operator', color: 'var(--planner)', desc: 'Translates pipeline into operational readiness. Calculates required agent headcount by skill type, identifies training gaps, and feeds the WCS forecasting model.', triggers: 'Pipeline demand changes', outputs: 'Capacity alerts \u2192 Tech Center' },
      { name: 'MONITOR', sub: 'The Memory', color: 'var(--monitor)', desc: 'Closes the feedback loop. Ingests outreach outcomes, correlates with scoring factors, and generates quarterly model performance reports.', triggers: 'Sales outcome data', outputs: 'Weight adjustments \u2192 All agents' }
    ];

    var wrap = S.el('div', { className: 'ag-wrap' });
    wrap.appendChild(S.Label('AGENTIC AI ARCHITECTURE', { color: 'var(--accent)' }));
    wrap.appendChild(S.el('div', { className: 'ag-subtitle', textContent: 'Five autonomous agents coordinated by n8n orchestration layer' }));

    var grid = S.el('div', { className: 'ag-grid' });
    var leftCol = S.el('div');

    // Agent cards
    agents.forEach(function(a) {
      var card = S.Card(null, { padding: '0', marginBottom: '10px', overflow: 'hidden', borderLeft: '3px solid ' + a.color });
      var inner = S.el('div', { className: 'ag-card-inner' });
      var header = S.el('div', { className: 'ag-card-header' });
      header.appendChild(S.el('span', { className: 'ag-card-name', style: { color: a.color }, textContent: a.name }));
      header.appendChild(S.el('span', { className: 'ag-card-sub', textContent: '\u2014 ' + a.sub }));
      // Active indicator
      var agentLower = a.name.charAt(0) + a.name.slice(1).toLowerCase();
      if (simState.running && simState.log.some(function(l) { return l.agent === agentLower; })) {
        var active = S.el('span', { className: 'ag-card-active' });
        active.appendChild(S.el('span', { className: 'ag-card-active-dot', style: { background: a.color } }));
        active.appendChild(S.el('span', { className: 'ag-card-active-text', style: { color: a.color }, textContent: 'ACTIVE' }));
        header.appendChild(active);
      }
      inner.appendChild(header);
      inner.appendChild(S.el('div', { className: 'ag-card-desc', textContent: a.desc }));
      var meta = S.el('div', { className: 'ag-card-meta' });
      meta.appendChild(S.el('div', { innerHTML: '<span class="ag-card-meta-label">Triggers: </span><span class="ag-card-meta-value">' + a.triggers + '</span>' }));
      inner.appendChild(meta);
      var outputs = S.el('div', { className: 'ag-card-outputs' });
      outputs.innerHTML = '<span class="ag-card-outputs-label">Outputs: </span><span style="color:' + a.color + ';font-weight:500">' + a.outputs + '</span>';
      inner.appendChild(outputs);
      card.appendChild(inner);
      leftCol.appendChild(card);
    });

    // Run button
    var runBtn = S.el('button', {
      className: 'ag-run-btn',
      textContent: simState.running ? '\u27F3 SIMULATION RUNNING...' : '\u25B6 RUN AGENT CHAIN SIMULATION',
      onClick: function() { if (!simState.running) runSim(container); }
    });
    if (simState.running) runBtn.disabled = true;
    leftCol.appendChild(runBtn);
    grid.appendChild(leftCol);

    // ─── Simulation Log ───
    var rightCol = S.el('div');
    var logWrap = S.Card(null, { padding: '0', overflow: 'hidden', position: 'sticky', top: '24px' });
    var logHeader = S.el('div', { className: 'ag-log-header' });
    logHeader.appendChild(S.Label('SIMULATION LOG', { color: 'var(--accent)' }));
    if (simState.running) {
      var proc = S.el('span', { className: 'ag-log-processing' });
      proc.appendChild(S.el('span', { className: 'ag-log-processing-dot' }));
      proc.appendChild(S.el('span', { className: 'ag-log-processing-text', textContent: 'PROCESSING' }));
      logHeader.appendChild(proc);
    }
    logWrap.appendChild(logHeader);

    var logList = S.el('div', { className: 'ag-log-list' });
    if (simState.log.length === 0) {
      logList.appendChild(S.el('div', { className: 'ag-log-empty', textContent: 'Press "Run Simulation" to see the agent chain process a real signal' }));
    } else {
      simState.log.forEach(function(entry) {
        var entryEl = S.el('div', { className: 'ag-log-entry' });
        var header2 = S.el('div', { className: 'ag-log-entry-header' });
        var agColor = D.agentColor(entry.agent.charAt(0).toUpperCase() + entry.agent.slice(1));
        header2.appendChild(S.el('span', { className: 'ag-log-entry-agent', style: { color: agColor }, textContent: entry.agent.toUpperCase() }));
        header2.appendChild(S.el('span', { className: 'ag-log-entry-time', textContent: entry.ts }));
        entryEl.appendChild(header2);
        entryEl.appendChild(S.el('div', { className: 'ag-log-entry-text', textContent: entry.action }));
        logList.appendChild(entryEl);
      });
    }
    logWrap.appendChild(logList);
    rightCol.appendChild(logWrap);
    grid.appendChild(rightCol);

    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  function runSim(container) {
    simState = { running: true, step: 0, log: [] };
    container.innerHTML = '';
    init(container);

    var steps = [
      { agent: 'Scout', action: 'Signal detected: Maverix Broadband posts VP Operations on LinkedIn', delay: 800 },
      { agent: 'Scout', action: 'Extracting structured signal \u2192 type: workforce_strain, confidence: 0.94', delay: 1200 },
      { agent: 'Analyst', action: 'Receiving signal from Scout. Recalculating Operational Strain Score...', delay: 1000 },
      { agent: 'Analyst', action: 'WSI factor +8 points. New composite: 92 (was 84). Tier threshold crossed \u2192 CRITICAL', delay: 1400 },
      { agent: 'Strategist', action: 'Tier change trigger fired. Generating executive outreach brief...', delay: 1000 },
      { agent: 'Strategist', action: 'Brief complete: References $103M BEAD award, VP gap, Decision Month Jun 2026', delay: 1800 },
      { agent: 'Planner', action: 'Pipeline demand updated: +10,232 projected subscribers in capacity model', delay: 1200 },
      { agent: 'Planner', action: 'Hiring alert: +4 FTE needed by Q3 2026 for fiber Tier 1 support skills', delay: 1000 },
      { agent: 'Monitor', action: 'Logging event chain. Updating model performance metrics.', delay: 800 },
      { agent: 'Monitor', action: 'WSI factor accuracy: 87% correlation with conversion at 90-day lag', delay: 1200 }
    ];

    var cumulativeDelay = 0;
    steps.forEach(function(s, i) {
      cumulativeDelay += s.delay;
      var t = setTimeout(function() {
        simState.step = i + 1;
        simState.log.push({ agent: s.agent, action: s.action, ts: new Date().toLocaleTimeString() });
        container.innerHTML = '';
        init(container);
        // Scroll log to bottom
        var logList = container.querySelector('.ag-log-list');
        if (logList) logList.scrollTop = logList.scrollHeight;
        if (i === steps.length - 1) {
          var t2 = setTimeout(function() {
            simState.running = false;
            container.innerHTML = '';
            init(container);
          }, 1500);
          simTimeouts.push(t2);
        }
      }, cumulativeDelay);
      simTimeouts.push(t);
    });
  }

  function destroy() {
    simTimeouts.forEach(function(t) { clearTimeout(t); });
    simTimeouts = [];
    simState = { running: false, step: 0, log: [] };
  }

  window.modules = window.modules || {};
  window.modules['agents'] = { init: init, destroy: destroy };
})();
