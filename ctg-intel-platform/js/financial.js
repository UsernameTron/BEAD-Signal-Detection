(function() {
  'use strict';

  var D = window.DATA;
  var S = window.shared;

  var finSliders = { partners: 10, avgSubs: 12000, pspm: 3.0, retention: 2 };

  function init(container) {
    function rebuild() { container.innerHTML = ''; init(container); }

    var annualRev = finSliders.partners * finSliders.avgSubs * finSliders.pspm * 12;
    var retainedRev = finSliders.retention * 450000;
    var totalRev = annualRev + retainedRev;
    var devCost = 45000;
    var opsCost = 2400;
    var totalCost = devCost + opsCost;
    var roi = ((totalRev - totalCost) / totalCost * 100).toFixed(0);

    var wrap = S.el('div', { className: 'fin-wrap' });
    wrap.appendChild(S.Label('FINANCIAL INTELLIGENCE MODEL', { color: 'var(--accent)' }));
    wrap.appendChild(S.el('div', { className: 'fin-subtitle', textContent: 'Model revenue impact, ROI, and cost economics of the Partner Intelligence Platform' }));

    var grid = S.el('div', { className: 'fin-grid' });

    // ─── Input Column ───
    var inputCol = S.el('div');
    var paramCard = S.Card(null, { padding: '20px', marginBottom: '12px' });
    paramCard.appendChild(S.Label('SCENARIO PARAMETERS', { marginBottom: '16px' }));

    var sliderDefs = [
      { key: 'partners', label: 'New Partnerships (Year 1)', min: 1, max: 25, step: 1, display: '' + finSliders.partners },
      { key: 'avgSubs', label: 'Avg Subscribers per Partner', min: 2000, max: 30000, step: 1000, display: D.fmtN(finSliders.avgSubs) },
      { key: 'pspm', label: 'Per-Subscriber-Per-Month Rate', min: 1.5, max: 5.0, step: 0.25, display: '$' + finSliders.pspm.toFixed(2) },
      { key: 'retention', label: 'Terminations Prevented', min: 0, max: 5, step: 1, display: '' + finSliders.retention }
    ];
    sliderDefs.forEach(function(s) {
      var row = S.el('div', { className: 'fin-slider-row' });
      var header = S.el('div', { className: 'fin-slider-header' });
      header.appendChild(S.el('span', { className: 'fin-slider-label', textContent: s.label }));
      header.appendChild(S.el('span', { className: 'fin-slider-value', textContent: s.display }));
      row.appendChild(header);
      var input = S.el('input', { type: 'range', min: '' + s.min, max: '' + s.max, step: '' + s.step, value: '' + finSliders[s.key] });
      input.addEventListener('input', function(e) { finSliders[s.key] = Number(e.target.value); rebuild(); });
      row.appendChild(input);
      paramCard.appendChild(row);
    });
    inputCol.appendChild(paramCard);

    // Investment
    var investCard = S.Card(null, { padding: '20px' });
    investCard.appendChild(S.Label('PLATFORM INVESTMENT', { marginBottom: '12px' }));
    var investData = [
      { label: 'Development (one-time)', value: '$' + (devCost / 1000).toFixed(0) + 'K' },
      { label: 'Annual Operations (APIs, tools)', value: '$' + (opsCost / 1000).toFixed(1) + 'K' },
      { label: 'Total Year 1 Investment', value: '$' + (totalCost / 1000).toFixed(0) + 'K', accent: true }
    ];
    investData.forEach(function(r, i) {
      var row = S.el('div', { className: 'fin-invest-row', style: { borderBottom: i < 2 ? '1px solid var(--border)' : 'none' } });
      row.appendChild(S.el('span', { className: 'fin-invest-label', textContent: r.label }));
      row.appendChild(S.el('span', { className: 'fin-invest-value', style: { fontWeight: r.accent ? '600' : '400', color: r.accent ? 'var(--accent)' : 'var(--text)' }, textContent: r.value }));
      investCard.appendChild(row);
    });
    inputCol.appendChild(investCard);
    grid.appendChild(inputCol);

    // ─── Results Column ───
    var resultCol = S.el('div');

    // ROI
    var roiCard = S.Card(null, { padding: '24px', textAlign: 'center', marginBottom: '12px', border: '1px solid var(--accent-border)', background: 'var(--accent-dim)' });
    roiCard.appendChild(S.Label('RETURN ON INVESTMENT'));
    roiCard.appendChild(S.el('div', { className: 'fin-roi-value', textContent: (roi > 9999 ? '\u221E' : roi) + ':1' }));
    roiCard.appendChild(S.el('div', { className: 'fin-roi-sub', textContent: 'Platform pays for itself with a fraction of the first deal' }));
    resultCol.appendChild(roiCard);

    // Metric pair
    var metricGrid = S.el('div', { className: 'fin-metric-grid' });
    var newRevCard = S.Card(null, { padding: '16px', textAlign: 'center' });
    newRevCard.appendChild(S.Label('NEW ANNUAL REVENUE'));
    newRevCard.appendChild(S.el('div', { className: 'fin-metric-value', style: { color: 'var(--accent)' }, textContent: D.fmt(annualRev) }));
    newRevCard.appendChild(S.el('div', { className: 'fin-metric-sub', textContent: finSliders.partners + ' partners \u00D7 ' + D.fmtN(finSliders.avgSubs) + ' subs' }));
    metricGrid.appendChild(newRevCard);

    var retCard = S.Card(null, { padding: '16px', textAlign: 'center' });
    retCard.appendChild(S.Label('RETAINED REVENUE'));
    retCard.appendChild(S.el('div', { className: 'fin-metric-value', style: { color: 'var(--warning)' }, textContent: D.fmt(retainedRev) }));
    retCard.appendChild(S.el('div', { className: 'fin-metric-sub', textContent: finSliders.retention + ' terminations prevented' }));
    metricGrid.appendChild(retCard);
    resultCol.appendChild(metricGrid);

    // Total
    var totalCard = S.Card(null, { padding: '16px', textAlign: 'center', marginBottom: '12px' });
    totalCard.appendChild(S.Label('TOTAL REVENUE IMPACT'));
    totalCard.appendChild(S.el('div', { className: 'fin-total-value', textContent: D.fmt(totalRev) }));
    totalCard.appendChild(S.el('div', { className: 'fin-total-sub', textContent: 'new revenue + retained revenue annually' }));
    resultCol.appendChild(totalCard);

    // Composition
    var compCard = S.Card(null, { padding: '16px' });
    compCard.appendChild(S.Label('REVENUE COMPOSITION', { marginBottom: '10px' }));
    var bar = S.el('div', { className: 'fin-comp-bar' });
    var newPct = totalRev > 0 ? (annualRev / totalRev * 100) : 0;
    var retPct = totalRev > 0 ? (retainedRev / totalRev * 100) : 0;
    bar.appendChild(S.el('div', { style: { width: newPct + '%', background: 'var(--accent)', transition: 'width 0.5s' } }));
    bar.appendChild(S.el('div', { style: { width: retPct + '%', background: 'var(--warning)', transition: 'width 0.5s' } }));
    compCard.appendChild(bar);
    var legend = S.el('div', { className: 'fin-comp-legend' });
    legend.appendChild(S.el('span', { innerHTML: '<span style="color:var(--accent)">\u25CF</span> New partnerships (' + Math.round(newPct) + '%)' }));
    legend.appendChild(S.el('span', { innerHTML: '<span style="color:var(--warning)">\u25CF</span> Retention impact (' + Math.round(retPct) + '%)' }));
    compCard.appendChild(legend);
    resultCol.appendChild(compCard);

    grid.appendChild(resultCol);
    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  function destroy() {}

  window.modules = window.modules || {};
  window.modules['financial'] = { init: init, destroy: destroy };
})();
