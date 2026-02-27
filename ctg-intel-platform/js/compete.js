(function() {
  'use strict';

  var D = window.DATA;
  var S = window.shared;

  function init(container) {
    // Compute white space
    var compStates = {};
    D.COMPETITORS.forEach(function(comp) {
      comp.states.split(',').forEach(function(s) {
        compStates[s] = (compStates[s] || []).concat(comp.name);
      });
    });
    var prospectStates = {};
    D.PROSPECTS.forEach(function(p) {
      var states = p.state === 'Multi' ? ['MO','KS','NE'] : [p.state];
      states.forEach(function(s) { prospectStates[s] = true; });
    });
    var whiteSpaceStates = Object.keys(prospectStates).filter(function(s) { return !compStates[s]; });

    var wrap = S.el('div', { className: 'cm-wrap' });
    wrap.appendChild(S.Label('COMPETITIVE LANDSCAPE MAP', { color: 'var(--accent)' }));
    wrap.appendChild(S.el('div', { className: 'cm-subtitle', textContent: 'Known competitors, partnership networks, white space identification' }));

    var grid = S.el('div', { className: 'cm-grid' });

    // ─── Left: Competitors ───
    var leftCol = S.el('div');
    D.COMPETITORS.forEach(function(comp) {
      var card = S.Card(null, { padding: '16px', marginBottom: '10px' });
      var header = S.el('div', { className: 'cm-comp-header' });
      var nameWrap = S.el('div');
      nameWrap.appendChild(S.el('span', { className: 'cm-comp-name', textContent: comp.name }));
      var threatColor = comp.threat === 'High' ? 'var(--hot)' : comp.threat === 'Medium' ? 'var(--warm)' : 'var(--nurture)';
      var threatBg = comp.threat === 'High' ? 'var(--hot-dim)' : comp.threat === 'Medium' ? 'var(--warm-dim)' : 'var(--nurture-dim)';
      nameWrap.appendChild(S.el('span', { className: 'cm-threat-badge', style: { background: threatBg, color: threatColor }, textContent: comp.threat + ' Threat' }));
      header.appendChild(nameWrap);
      header.appendChild(S.el('span', { className: 'cm-comp-partners', textContent: comp.partners + ' partners' }));
      card.appendChild(header);

      var details = S.el('div', { className: 'cm-comp-details' });
      details.appendChild(S.el('div', { innerHTML: '<span class="cm-comp-detail-label">Active States: </span><span class="cm-comp-detail-states">' + comp.states + '</span>' }));
      details.appendChild(S.el('div', { innerHTML: '<span class="cm-comp-detail-label">Strength: </span><span class="cm-comp-detail-strength">' + comp.strength + '</span>' }));
      details.appendChild(S.el('div', { className: 'cm-comp-detail-full', innerHTML: '<span class="cm-comp-detail-label">Vulnerability: </span><span class="cm-comp-detail-weakness">' + comp.weakness + '</span>' }));
      card.appendChild(details);
      leftCol.appendChild(card);
    });

    // White Space
    var wsCard = S.Card(null, { padding: '16px', marginTop: '16px', borderLeft: '3px solid var(--accent)' });
    wsCard.appendChild(S.Label('WHITE SPACE \u2014 UNCONTESTED STATES', { color: 'var(--accent)', marginBottom: '8px' }));
    var tags = S.el('div', { className: 'cm-white-tags' });
    whiteSpaceStates.forEach(function(s) {
      tags.appendChild(S.el('span', { className: 'cm-white-tag', textContent: s }));
    });
    wsCard.appendChild(tags);
    wsCard.appendChild(S.el('div', { className: 'cm-white-note', textContent: 'No known managed services competitor active in these prospect states' }));
    leftCol.appendChild(wsCard);
    grid.appendChild(leftCol);

    // ─── Right: ISPN Positioning ───
    var rightCol = S.el('div');
    var posCard = S.Card(null, { padding: '16px', marginBottom: '12px' });
    posCard.appendChild(S.Label('ISPN COMPETITIVE POSITION', { marginBottom: '10px' }));
    var posData = [
      { label: 'FCR Rate', value: '93%', benchmark: 'Industry: 72%' },
      { label: 'CSAT', value: '90%+', benchmark: 'Industry: 78%' },
      { label: 'Existing Partnerships', value: '200', benchmark: 'Largest competitor: 12' },
      { label: 'Agent Capacity', value: '165', benchmark: 'Growing' },
      { label: 'BEAD Compliance Ready', value: 'Yes', benchmark: 'Most competitors: No' }
    ];
    posData.forEach(function(m, i) {
      var row = S.el('div', { className: 'cm-pos-row', style: { borderBottom: i < 4 ? '1px solid var(--border)' : 'none' } });
      var header = S.el('div', { className: 'cm-pos-header' });
      header.appendChild(S.el('span', { className: 'cm-pos-label', textContent: m.label }));
      header.appendChild(S.el('span', { className: 'cm-pos-value', style: { color: 'var(--accent)' }, textContent: m.value }));
      row.appendChild(header);
      row.appendChild(S.el('div', { className: 'cm-pos-benchmark', textContent: m.benchmark }));
      posCard.appendChild(row);
    });
    rightCol.appendChild(posCard);

    // Structural Advantage
    var advCard = S.Card(null, { padding: '16px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' });
    advCard.appendChild(S.Label('STRUCTURAL ADVANTAGE', { color: 'var(--accent)', marginBottom: '8px' }));
    advCard.appendChild(S.el('div', { className: 'cm-advantage-text', textContent: 'ISPN\u2019s 200-partnership base, 93% FCR, and existing workforce intelligence infrastructure create a compound advantage no competitor can replicate. The platform amplifies this by ensuring ISPN reaches every qualified prospect first.' }));
    rightCol.appendChild(advCard);
    grid.appendChild(rightCol);

    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  function destroy() {}

  window.modules = window.modules || {};
  window.modules['compete'] = { init: init, destroy: destroy };
})();
