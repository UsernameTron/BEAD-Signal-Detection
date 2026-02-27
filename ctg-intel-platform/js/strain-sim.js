(function() {
  'use strict';

  var D = window.DATA;
  var S = window.shared;

  var simFactors = { gvi: 2.0, oms: 2, ttc: 2, wsi: 14, dtp: 12, sqds: 4 };

  function init(container) {
    var wrap = S.el('div', { className: 'ss-wrap' });
    wrap.appendChild(S.Label('OPERATIONAL STRAIN SIMULATOR', { color: 'var(--accent)' }));
    wrap.appendChild(S.el('div', { className: 'ss-subtitle', textContent: 'Adjust factors to model any ISP\u2019s operational trajectory and predicted decision timeline' }));

    var grid = S.el('div', { className: 'ss-grid' });

    // Compute scores
    function compute() {
      var gvi = Math.min(20, simFactors.gvi >= 3 ? 20 : simFactors.gvi >= 1.5 ? 16 : simFactors.gvi >= 0.5 ? 10 : 5);
      var oms = Math.min(20, (5 - simFactors.oms) * 5);
      var ttc = Math.min(15, simFactors.ttc >= 2.5 ? 15 : simFactors.ttc >= 2 ? 12 : simFactors.ttc >= 1.5 ? 8 : 4);
      var total = gvi + oms + ttc + simFactors.wsi + simFactors.dtp + simFactors.sqds;
      return { gvi: gvi, oms: oms, ttc: ttc, total: total, factors: [gvi, oms, ttc, simFactors.wsi, simFactors.dtp, simFactors.sqds] };
    }

    function rebuild() { container.innerHTML = ''; init(container); }

    var scores = compute();
    var simColor = scores.total >= 80 ? 'var(--hot)' : scores.total >= 60 ? 'var(--warm)' : scores.total >= 40 ? 'var(--nurture)' : 'var(--text-muted)';
    var simTier = scores.total >= 80 ? 'CRITICAL' : scores.total >= 60 ? 'HIGH' : scores.total >= 40 ? 'MODERATE' : 'LOW';
    var monthsToDecision = Math.max(1, Math.round(24 - (scores.total / 100) * 18));

    // ─── Sliders ───
    var sliderCol = S.el('div');
    var sliders = [
      { key: 'gvi', label: 'Growth Velocity Index', sub: '(new locations \u00F7 current subscribers)', min: 0, max: 5, step: 0.1, display: simFactors.gvi.toFixed(1) + 'x', score: scores.gvi, maxScore: 20 },
      { key: 'oms', label: 'Organizational Maturity', sub: '(1=startup, 5=mature operator)', min: 1, max: 5, step: 1, display: simFactors.oms + '/5', score: scores.oms, maxScore: 20 },
      { key: 'ttc', label: 'Technology Transition Complexity', sub: '(1x=same tech, 3x=greenfield multi)', min: 1, max: 3, step: 0.5, display: simFactors.ttc + 'x', score: scores.ttc, maxScore: 15 },
      { key: 'wsi', label: 'Workforce Strain Index', sub: '(job postings, hiring gaps)', min: 0, max: 20, step: 1, display: simFactors.wsi + '/20', score: simFactors.wsi, maxScore: 20 },
      { key: 'dtp', label: 'Deployment Timeline Pressure', sub: '(construction deadlines, milestones)', min: 0, max: 15, step: 1, display: simFactors.dtp + '/15', score: simFactors.dtp, maxScore: 15 },
      { key: 'sqds', label: 'Service Quality Degradation', sub: '(FCC complaints, reviews, outages)', min: 0, max: 10, step: 1, display: simFactors.sqds + '/10', score: simFactors.sqds, maxScore: 10 }
    ];

    sliders.forEach(function(s) {
      var card = S.Card(null, { padding: '16px', marginBottom: '10px' });
      var header = S.el('div', { className: 'ss-slider-header' });
      var labelWrap = S.el('div');
      labelWrap.appendChild(S.el('span', { className: 'ss-slider-label', textContent: s.label }));
      labelWrap.appendChild(S.el('span', { className: 'ss-slider-sub', textContent: s.sub }));
      header.appendChild(labelWrap);
      var vals = S.el('div', { className: 'ss-slider-vals' });
      vals.appendChild(S.el('span', { className: 'ss-slider-display', textContent: s.display }));
      vals.appendChild(S.el('span', { className: 'ss-slider-score', textContent: '\u2192 ' + s.score + '/' + s.maxScore }));
      header.appendChild(vals);
      card.appendChild(header);
      var input = S.el('input', { type: 'range', min: '' + s.min, max: '' + s.max, step: '' + s.step, value: '' + simFactors[s.key] });
      input.style.marginTop = '8px';
      input.addEventListener('input', function(e) { simFactors[s.key] = Number(e.target.value); rebuild(); });
      card.appendChild(input);
      sliderCol.appendChild(card);
    });

    // Presets
    var presets = S.el('div', { className: 'ss-presets' });
    [
      { label: 'Greenfield Startup', vals: { gvi: 5, oms: 1, ttc: 3, wsi: 18, dtp: 14, sqds: 0 } },
      { label: 'Mature Telco', vals: { gvi: 0.4, oms: 4, ttc: 1, wsi: 4, dtp: 7, sqds: 5 } },
      { label: 'FWA\u2192Fiber Transition', vals: { gvi: 1.8, oms: 3, ttc: 2.5, wsi: 12, dtp: 12, sqds: 4 } },
      { label: 'Electric Co-op ISP', vals: { gvi: 0.6, oms: 2, ttc: 2, wsi: 10, dtp: 10, sqds: 1 } }
    ].forEach(function(preset) {
      presets.appendChild(S.el('button', {
        className: 'ss-preset-btn', textContent: preset.label,
        onClick: function() { Object.assign(simFactors, preset.vals); rebuild(); }
      }));
    });
    sliderCol.appendChild(presets);
    grid.appendChild(sliderCol);

    // ─── Results Panel ───
    var resultCol = S.el('div');

    // Score
    var scoreCard = S.Card(null, { padding: '20px', textAlign: 'center', marginBottom: '12px', border: '1px solid ' + simColor + '33', background: simColor.replace('var(', '').replace(')', '') ? simColor + '08' : 'transparent' });
    scoreCard.style.background = scores.total >= 80 ? 'var(--hot-dim)' : scores.total >= 60 ? 'var(--warm-dim)' : scores.total >= 40 ? 'var(--nurture-dim)' : 'var(--surface)';
    scoreCard.appendChild(S.Label('COMPOSITE STRAIN SCORE'));
    scoreCard.appendChild(S.el('div', { className: 'ss-result-score', style: { color: simColor }, textContent: '' + scores.total }));
    scoreCard.appendChild(S.el('div', { className: 'ss-result-tier', style: { color: simColor }, textContent: simTier }));
    scoreCard.appendChild(S.el('div', { className: 'ss-result-sub', textContent: 'of 100 maximum' }));
    resultCol.appendChild(scoreCard);

    // Decision Month
    var decCard = S.Card(null, { padding: '20px', textAlign: 'center', marginBottom: '12px' });
    decCard.appendChild(S.Label('PREDICTED DECISION MONTH'));
    decCard.appendChild(S.el('div', { className: 'ss-decision-value', textContent: '' + monthsToDecision }));
    decCard.appendChild(S.el('div', { style: { fontSize: '11px', color: 'var(--text-muted)' }, textContent: 'months from now' }));
    decCard.appendChild(S.el('div', { style: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }, textContent: 'Begin outreach in ' + Math.max(1, monthsToDecision - 3) + ' months' }));
    resultCol.appendChild(decCard);

    // Radar
    var radarCard = S.Card(null, { padding: '16px' });
    var radarWrap = S.el('div', { style: { display: 'flex', justifyContent: 'center' } });
    radarWrap.appendChild(S.RadarChart(scores.factors, 200));
    radarCard.appendChild(radarWrap);
    resultCol.appendChild(radarCard);

    // Action
    var actionCard = S.Card(null, { padding: '16px', marginTop: '12px' });
    actionCard.appendChild(S.Label('RECOMMENDED ACTION', { marginBottom: '8px' }));
    var actionText = scores.total >= 80 ? 'Immediate executive engagement. This ISP is within 90 days of needing managed services. Prepare contextual outreach brief referencing specific operational signals.' :
      scores.total >= 60 ? 'Schedule outreach within 30 days. Lead with capability presentation aligned to highest-scoring strain factors. Target conference encounters if available.' :
      scores.total >= 40 ? 'Place in nurture sequence. Quarterly touchpoints with relevant thought leadership content. Monitor for signal changes that could accelerate timeline.' :
      'Early stage \u2014 monitor for changes. Add to annual review cycle. Watch for funding milestones that trigger re-assessment.';
    actionCard.appendChild(S.el('div', { className: 'ss-action-text', textContent: actionText }));
    resultCol.appendChild(actionCard);

    grid.appendChild(resultCol);
    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  function destroy() {}

  window.modules = window.modules || {};
  window.modules['strain'] = { init: init, destroy: destroy };
})();
