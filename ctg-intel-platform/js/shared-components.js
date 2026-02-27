(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // SHARED COMPONENTS — Reusable DOM-creating UI helpers
  // All view modules consume these via window.shared
  // ═══════════════════════════════════════════════════════════════

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function(key) {
        if (key === 'style' && typeof attrs[key] === 'object') {
          Object.assign(node.style, attrs[key]);
        } else if (key === 'className') {
          node.className = attrs[key];
        } else if (key.indexOf('on') === 0) {
          node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
        } else if (key === 'textContent') {
          node.textContent = attrs[key];
        } else if (key === 'innerHTML') {
          node.innerHTML = attrs[key];
        } else {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children) {
      if (typeof children === 'string') {
        node.textContent = children;
      } else if (Array.isArray(children)) {
        children.forEach(function(child) {
          if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
      } else {
        node.appendChild(children);
      }
    }
    return node;
  }

  // ─── Label ───
  function Label(text, extraStyle) {
    return el('div', {
      style: Object.assign({
        fontSize: '9px', fontWeight: '500', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)'
      }, extraStyle || {}),
      textContent: text
    });
  }

  // ─── Metric ───
  function Metric(value, unit, accentColor, size) {
    var wrap = el('span');
    wrap.appendChild(el('span', {
      style: {
        fontFamily: 'var(--font-mono)', fontSize: (size || 28) + 'px',
        fontWeight: '600', letterSpacing: '-0.02em',
        color: accentColor || 'var(--text)'
      },
      textContent: value
    }));
    if (unit) {
      wrap.appendChild(el('span', {
        style: { fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' },
        textContent: unit
      }));
    }
    return wrap;
  }

  // ─── Badge ───
  function Badge(tier) {
    var color = window.DATA.tierColor(tier);
    var bg = window.DATA.tierBg(tier);
    return el('span', {
      style: {
        padding: '3px 8px', borderRadius: '4px', fontSize: '10px',
        fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase',
        color: color, background: bg, border: '1px solid ' + color + '22',
        display: 'inline-block'
      },
      textContent: tier
    });
  }

  // ─── Card ───
  function Card(children, extraStyle, onClick) {
    var card = el('div', {
      style: Object.assign({
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '20px',
        cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.2s'
      }, extraStyle || {})
    });
    if (onClick) card.addEventListener('click', onClick);
    if (Array.isArray(children)) {
      children.forEach(function(child) { if (child) card.appendChild(child); });
    } else if (children) {
      card.appendChild(children);
    }
    return card;
  }

  // ─── MiniBar ───
  function MiniBar(val, max, color) {
    var track = el('div', {
      style: {
        width: '100%', height: '4px', background: 'var(--border)',
        borderRadius: '2px', overflow: 'hidden'
      }
    });
    track.appendChild(el('div', {
      style: {
        width: Math.min(100, (val / max) * 100) + '%', height: '100%',
        background: color || 'var(--accent)', borderRadius: '2px',
        transition: 'width 0.5s ease'
      }
    }));
    return track;
  }

  // ─── RadarChart (SVG) ───
  function RadarChart(factors, size) {
    size = size || 220;
    var labels = ['GVI','OMS','TTC','WSI','DTP','SQDS'];
    var maxes = [20, 20, 15, 20, 15, 10];
    var cx = size / 2, cy = size / 2, r = size / 2 - 30;

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

    // Grid rings
    [0.25, 0.5, 0.75, 1].forEach(function(s) {
      var points = [];
      for (var i = 0; i < 6; i++) {
        var a = (Math.PI * 2 * i / 6) - Math.PI / 2;
        points.push((cx + r * s * Math.cos(a)) + ',' + (cy + r * s * Math.sin(a)));
      }
      var ring = document.createElementNS(ns, 'polygon');
      ring.setAttribute('points', points.join(' '));
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', 'var(--border)');
      ring.setAttribute('stroke-width', '1');
      ring.setAttribute('opacity', s === 1 ? '0.5' : '0.3');
      svg.appendChild(ring);
    });

    // Axis lines
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI * 2 * i / 6) - Math.PI / 2;
      var line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', cx + r * Math.cos(a));
      line.setAttribute('y2', cy + r * Math.sin(a));
      line.setAttribute('stroke', 'var(--border)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.3');
      svg.appendChild(line);
    }

    // Data polygon
    var dataPoints = [];
    var pointCoords = [];
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI * 2 * i / 6) - Math.PI / 2;
      var pct = factors[i] / maxes[i];
      var px = cx + r * pct * Math.cos(a);
      var py = cy + r * pct * Math.sin(a);
      dataPoints.push(px + ',' + py);
      pointCoords.push({ x: px, y: py, lx: cx + (r + 18) * Math.cos(a), ly: cy + (r + 18) * Math.sin(a) });
    }
    var poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('points', dataPoints.join(' '));
    poly.setAttribute('fill', 'var(--accent-dim)');
    poly.setAttribute('stroke', 'var(--accent)');
    poly.setAttribute('stroke-width', '2');
    svg.appendChild(poly);

    // Points and labels
    pointCoords.forEach(function(pt, i) {
      var circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', 'var(--accent)');
      svg.appendChild(circle);

      var text = document.createElementNS(ns, 'text');
      text.setAttribute('x', pt.lx);
      text.setAttribute('y', pt.ly);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'var(--text-muted)');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-family', 'var(--font-mono)');
      text.setAttribute('font-weight', '500');
      text.textContent = labels[i];
      svg.appendChild(text);
    });

    return svg;
  }

  // ─── Tier Filter Buttons ───
  function TierFilterBar(currentFilter, onChange) {
    var bar = el('div', { style: { display: 'flex', gap: '6px' } });
    ['all','hot','warm','nurture','strategic'].forEach(function(t) {
      var active = currentFilter === t;
      var color = t === 'all' ? 'var(--accent)' : window.DATA.tierColor(t);
      var bg = t === 'all' ? 'var(--accent-dim)' : window.DATA.tierBg(t);
      var btn = el('button', {
        style: {
          padding: '3px 10px', borderRadius: '4px',
          border: '1px solid ' + (active ? color : 'var(--border)'),
          background: active ? bg : 'transparent',
          color: active ? color : 'var(--text-muted)',
          fontSize: '10px', fontWeight: '500', cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: '0.05em'
        },
        textContent: t,
        onClick: function() { onChange(t); }
      });
      bar.appendChild(btn);
    });
    return bar;
  }

  // ─── Hover Row Behavior ───
  function addRowHover(row, isSelected) {
    row.addEventListener('mouseenter', function() {
      row.style.background = 'var(--surface-alt)';
    });
    row.addEventListener('mouseleave', function() {
      row.style.background = isSelected ? 'var(--accent-dim)' : 'transparent';
    });
  }

  // ─── Export ───
  window.shared = {
    el: el,
    Label: Label,
    Metric: Metric,
    Badge: Badge,
    Card: Card,
    MiniBar: MiniBar,
    RadarChart: RadarChart,
    TierFilterBar: TierFilterBar,
    addRowHover: addRowHover
  };
})();
