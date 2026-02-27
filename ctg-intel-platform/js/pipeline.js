(function() {
  'use strict';

  var D = window.DATA;
  var S = window.shared;

  function init(container) {
    var state = window.appState;
    var filtered = D.filterAndSort(state.tierFilter, state.sortBy);
    var selected = state.getSelected();

    var grid = S.el('div', { className: 'pl-grid ' + (selected ? 'with-panel' : 'no-panel') });

    // ─── Prospect List ───
    var list = S.el('div', { className: 'pl-list' });

    var header = S.el('div', { className: 'pl-header' });
    var headerLeft = S.el('div');
    headerLeft.appendChild(S.Label('PIPELINE INTELLIGENCE', { color: 'var(--accent)' }));
    headerLeft.appendChild(S.el('div', { className: 'pl-header-info', textContent: filtered.length + ' prospects scored across ' + D.uniqueStates + ' states' }));
    header.appendChild(headerLeft);
    header.appendChild(S.TierFilterBar(state.tierFilter, function(t) {
      state.tierFilter = t;
      container.innerHTML = '';
      init(container);
    }));
    list.appendChild(header);

    filtered.forEach(function(p) {
      var score = D.calcScore(p);
      var isSelected = state.selectedId === p.id;
      var card = S.el('div', {
        className: 'pl-card',
        style: {
          background: isSelected ? 'var(--accent-dim)' : 'var(--surface)',
          border: '1px solid ' + (isSelected ? 'var(--accent-border)' : 'var(--border)')
        },
        onClick: function() {
          state.selectedId = p.id;
          container.innerHTML = '';
          init(container);
        }
      });

      var top = S.el('div', { className: 'pl-card-top' });
      var left2 = S.el('div', { className: 'pl-card-left' });

      var circle = S.el('div', {
        className: 'pl-score-circle',
        style: { background: D.scoreBg(score), borderColor: D.scoreColor(score) }
      });
      circle.appendChild(S.el('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '600', color: D.scoreColor(score) }, textContent: '' + score }));
      left2.appendChild(circle);

      var info = S.el('div');
      var nameRow = S.el('div', { className: 'pl-card-name', textContent: p.name });
      if (p.name === 'LigTel Communications') {
        nameRow.appendChild(S.el('span', { style: { marginLeft: '8px', fontSize: '9px', padding: '2px 6px', borderRadius: '3px', background: 'var(--strategic-dim)', color: 'var(--strategic)', fontWeight: '600' }, textContent: 'EX-PARTNER' }));
      }
      info.appendChild(nameRow);
      info.appendChild(S.el('div', { className: 'pl-card-meta', textContent: p.state + ' \u00B7 ' + p.tech + ' \u00B7 Founded ' + p.founded }));
      left2.appendChild(info);
      top.appendChild(left2);

      var right = S.el('div', { style: { textAlign: 'right' } });
      right.appendChild(S.el('div', { className: 'pl-card-award', textContent: D.fmt(p.award) }));
      right.appendChild(S.el('div', { className: 'pl-card-locs', textContent: D.fmtN(p.locs) + ' locations' }));
      top.appendChild(right);

      card.appendChild(top);
      card.appendChild(S.el('div', { className: 'pl-card-notes', textContent: p.notes }));
      list.appendChild(card);
    });

    grid.appendChild(list);

    // ─── Detail Panel ───
    if (selected) {
      var panel = S.el('div', { className: 'pl-panel' });
      var panelHeader = S.el('div', { className: 'pl-panel-header' });
      var panelTitle = S.el('div');
      panelTitle.appendChild(S.Label('PROSPECT DETAIL', { color: 'var(--accent)', marginBottom: '4px' }));
      panelTitle.appendChild(S.el('div', { className: 'pl-panel-name', textContent: selected.name }));
      panelHeader.appendChild(panelTitle);
      panelHeader.appendChild(S.el('button', {
        className: 'pl-close-btn', textContent: '\u00D7',
        onClick: function() { state.selectedId = null; container.innerHTML = ''; init(container); }
      }));
      panel.appendChild(panelHeader);

      // Score Card
      var score = D.calcScore(selected);
      var scoreBox = S.el('div', { className: 'pl-score-box' });
      scoreBox.appendChild(S.Metric('' + score, null, D.scoreColor(score), 40));
      scoreBox.appendChild(S.el('div', { style: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }, textContent: 'COMPOSITE STRAIN SCORE' }));
      scoreBox.appendChild(S.Badge(selected.tier));
      panel.appendChild(scoreBox);

      // Radar
      var factors = D.calcFactors(selected);
      var radarWrap = S.el('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: '12px' } });
      radarWrap.appendChild(S.RadarChart(factors, 200));
      panel.appendChild(radarWrap);

      // Factor Breakdown
      panel.appendChild(S.Label('FACTOR BREAKDOWN', { marginBottom: '8px' }));
      var factorData = [
        { label: 'Growth Velocity', display: selected.gvi >= 99 ? '\u221E' : selected.gvi.toFixed(2) + 'x', max: 20, score: factors[0] },
        { label: 'Org Maturity', display: selected.oms + '/5', max: 20, score: factors[1] },
        { label: 'Tech Complexity', display: selected.ttc + 'x', max: 15, score: factors[2] },
        { label: 'Workforce Strain', display: selected.wsi + '/20', max: 20, score: factors[3] },
        { label: 'Timeline Pressure', display: selected.dtp + '/15', max: 15, score: factors[4] },
        { label: 'Quality Degradation', display: selected.sqds + '/10', max: 10, score: factors[5] }
      ];
      factorData.forEach(function(f) {
        var row = S.el('div', { className: 'pl-factor-row' });
        var header = S.el('div', { className: 'pl-factor-header' });
        header.appendChild(S.el('span', { className: 'pl-factor-label', textContent: f.label }));
        header.appendChild(S.el('span', { className: 'pl-factor-value', textContent: f.display + ' \u2192 ' + f.score + 'pts' }));
        row.appendChild(header);
        row.appendChild(S.MiniBar(f.score, f.max));
        panel.appendChild(row);
      });

      // Services
      panel.appendChild(S.Label('ISPN SERVICE ALIGNMENT', { marginTop: '16px', marginBottom: '8px' }));
      selected.services.forEach(function(s) {
        panel.appendChild(S.el('div', { className: 'pl-service-item' }, [
          S.el('span', { style: { color: 'var(--accent)' }, textContent: '\u25CF' }),
          document.createTextNode(s)
        ]));
      });

      // Decision Month
      if (selected.decisionMonth !== 'N/A') {
        var decBox = S.el('div', { className: 'pl-decision-box', style: { background: 'var(--warm-dim)', border: '1px solid rgba(245,158,11,0.2)' } });
        decBox.appendChild(S.Label('PREDICTED DECISION MONTH', { color: 'var(--warm)' }));
        decBox.appendChild(S.el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '600', color: 'var(--warm)', marginTop: '4px' }, textContent: selected.decisionMonth }));
        decBox.appendChild(S.el('div', { style: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }, textContent: 'Begin outreach 90 days prior' }));
        panel.appendChild(decBox);
      }

      // Key Intel
      var intel = S.el('div', { className: 'pl-intel-box' });
      intel.appendChild(S.Label('KEY INTEL', { color: 'var(--accent)', marginBottom: '4px' }));
      var intelContent = S.el('div', { className: 'pl-intel-row' });
      var intelItems = [
        ['Award', D.fmt(selected.award)],
        ['Locations', D.fmtN(selected.locs)],
        ['Current Subs', selected.subs === 0 ? 'Greenfield' : D.fmtN(selected.subs)],
        ['CEO', selected.ceo],
        ['Contact Path', selected.contact]
      ];
      intelItems.forEach(function(item) {
        var row = S.el('div');
        row.appendChild(S.el('span', { className: 'pl-intel-key', textContent: item[0] + ': ' }));
        row.appendChild(document.createTextNode(item[1]));
        intelContent.appendChild(row);
      });
      intelContent.appendChild(S.el('div', { style: { marginTop: '6px', fontStyle: 'italic', color: 'var(--text-muted)' }, textContent: selected.notes }));
      intel.appendChild(intelContent);
      panel.appendChild(intel);

      grid.appendChild(panel);
    }

    container.appendChild(grid);
  }

  function destroy() {}

  window.modules = window.modules || {};
  window.modules['pipeline'] = { init: init, destroy: destroy };
})();
