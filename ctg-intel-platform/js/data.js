(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════
  // DATA LAYER — All data objects and utility functions
  // Consumed by all 7 view modules via window.DATA
  // ═══════════════════════════════════════════════════════════════

  var PROSPECTS = [
    { id:1, name:"Wisper ISP", state:"MO", award:350264521, locs:37140, tech:"Fiber/FWA", ceo:"Nathan Stooke", contact:"verified", tier:"hot", founded:"2003", subs:45000, notes:"Largest MO BEAD recipient. FWA-to-fiber transition.", gvi:0.83, oms:3, ttc:2, wsi:18, dtp:13, sqds:5, decisionMonth:"2026-09", services:["Tier 1 Support","NOC","BSS/OSS Integration","BEAD Compliance","Network Monitoring"] },
    { id:2, name:"Strategic Mgmt LLC", state:"Multi", award:268100000, locs:28400, tech:"Fiber", ceo:"Undisclosed", contact:"regulatory", tier:"hot", founded:"2019", subs:2000, notes:"Multi-state fiber builder. Thin org structure for scale.", gvi:14.2, oms:2, ttc:1, wsi:16, dtp:14, sqds:3, decisionMonth:"2026-07", services:["Full Operations","Subscriber Mgmt","Compliance","Field Dispatch","Billing Platform"] },
    { id:3, name:"SkyFiber Inc", state:"NV", award:181000000, locs:15600, tech:"FWA→Fiber", ceo:"Mark Feest", contact:"linkedin", tier:"hot", founded:"2009", subs:8000, notes:"Nevada's largest BEAD winner. FWA converting to fiber—needs dual-platform BSS/OSS.", gvi:1.95, oms:3, ttc:2.5, wsi:14, dtp:12, sqds:4, decisionMonth:"2026-11", services:["BSS/OSS Integration","Tier 1 Support","NOC","Tech Transition Support","BEAD Compliance"] },
    { id:4, name:"Stimulus Technologies", state:"NV", award:142000000, locs:12100, tech:"Fiber", ceo:"Adam Dawson", contact:"verified", tier:"hot", founded:"2005", subs:3500, notes:"MSP pivoting to ISP. Strong tech DNA, no subscriber ops experience.", gvi:3.46, oms:2, ttc:1.5, wsi:15, dtp:11, sqds:2, decisionMonth:"2026-10", services:["Subscriber Operations","Helpdesk","Billing","BEAD Compliance","Workforce Training"] },
    { id:5, name:"Maverix Broadband", state:"CO", award:103018133, locs:10232, tech:"Fiber", ceo:"TBD", contact:"website", tier:"hot", founded:"2021", subs:0, notes:"Greenfield fiber builder. Zero existing ops. Needs everything.", gvi:99, oms:1, ttc:3, wsi:20, dtp:14, sqds:0, decisionMonth:"2026-06", services:["Full Managed Services","BSS/OSS Build","NOC","Tier 1-3 Support","BEAD Compliance"] },
    { id:6, name:"IdeaTek Telcom", state:"KS", award:87500000, locs:9800, tech:"Fiber", ceo:"Daniel Friesen", contact:"verified", tier:"warm", founded:"2007", subs:12000, notes:"Established Kansas ISP. Growing but has some operational maturity.", gvi:0.82, oms:3, ttc:1, wsi:10, dtp:10, sqds:3, decisionMonth:"2027-02", services:["Tier 1 Support","Overflow Handling","BEAD Compliance","After-Hours NOC"] },
    { id:7, name:"Visionary Communications", state:"CO", award:76200000, locs:7500, tech:"Fiber", ceo:"Jim Baum", contact:"conference", tier:"warm", founded:"1996", subs:22000, notes:"Mature telco. Needs capacity for BEAD subscriber surge.", gvi:0.34, oms:4, ttc:1, wsi:8, dtp:9, sqds:6, decisionMonth:"2027-04", services:["Overflow Support","BEAD Compliance","After-Hours Coverage","Seasonal Scaling"] },
    { id:8, name:"White Cloud Comm", state:"ID", award:64300000, locs:6200, tech:"Fiber/FWA", ceo:"Janet Roberts", contact:"linkedin", tier:"warm", founded:"2020", subs:1800, notes:"Young Idaho ISP. Dual-technology deployment.", gvi:3.44, oms:2, ttc:2, wsi:12, dtp:11, sqds:2, decisionMonth:"2026-12", services:["Full Operations","BSS/OSS","Tier 1 Support","Network Monitoring","BEAD Compliance"] },
    { id:9, name:"Pine Telephone Co", state:"OK", award:52800000, locs:5400, tech:"Fiber", ceo:"Tom Winn", contact:"verified", tier:"warm", founded:"1953", subs:9500, notes:"Legacy telco upgrading to fiber. Strong local roots.", gvi:0.57, oms:4, ttc:1.5, wsi:7, dtp:8, sqds:4, decisionMonth:"2027-06", services:["Tech Support Augmentation","BEAD Compliance","After-Hours NOC"] },
    { id:10, name:"Nuvera Communications", state:"MN", award:48700000, locs:4800, tech:"Fiber", ceo:"Glenn Zerbe", contact:"conference", tier:"warm", founded:"2009", subs:14000, notes:"Minnesota fiber provider. Moderate growth trajectory.", gvi:0.34, oms:4, ttc:1, wsi:6, dtp:8, sqds:3, decisionMonth:"2027-08", services:["Overflow Support","BEAD Compliance"] },
    { id:11, name:"Valley Electric Assn", state:"NV", award:41200000, locs:3900, tech:"Fiber", ceo:"Angela Evans", contact:"regulatory", tier:"nurture", founded:"1965", subs:7200, notes:"Electric co-op entering broadband. Zero telecom ops experience.", gvi:0.54, oms:2, ttc:2, wsi:9, dtp:9, sqds:1, decisionMonth:"2027-03", services:["Full Operations Build","Training","BSS/OSS","NOC"] },
    { id:12, name:"Citizens Telephone Co", state:"VA", award:38500000, locs:3600, tech:"Fiber", ceo:"Greg Sapp", contact:"verified", tier:"nurture", founded:"1914", subs:11000, notes:"110-year-old telco. Conservative operations culture.", gvi:0.33, oms:4, ttc:1, wsi:4, dtp:7, sqds:5, decisionMonth:"2027-10", services:["BEAD Compliance","After-Hours Support"] },
    { id:13, name:"Consolidated Telcom", state:"ND", award:35100000, locs:3200, tech:"Fiber", ceo:"Paul Schutt", contact:"conference", tier:"nurture", founded:"1952", subs:8500, notes:"Legacy provider modernizing. Slow, steady growth.", gvi:0.38, oms:4, ttc:1, wsi:5, dtp:7, sqds:3, decisionMonth:"2027-12", services:["BEAD Compliance","Seasonal Overflow"] },
    { id:14, name:"Sho-Me Technologies", state:"MO", award:29800000, locs:2800, tech:"Fiber", ceo:"Charlie Kempf", contact:"verified", tier:"nurture", founded:"1951", subs:6000, notes:"Missouri cooperative. Community-rooted operations.", gvi:0.47, oms:3, ttc:1, wsi:6, dtp:8, sqds:2, decisionMonth:"2027-09", services:["Tier 1 Support","BEAD Compliance","Training"] },
    { id:15, name:"LigTel Communications", state:"IN", award:4800000, locs:600, tech:"Fiber", ceo:"Joe Zarr", contact:"known", tier:"strategic", founded:"1906", subs:4000, notes:"FORMER ISPN PARTNER. Terminated while receiving BEAD funding.", gvi:0.15, oms:3, ttc:1, wsi:3, dtp:6, sqds:7, decisionMonth:"N/A", services:["Re-engagement Opportunity","BEAD Compliance","Growth Support"] }
  ];

  var INTEL_FEED = [
    { time:"4m", type:"alert", agent:"Scout", text:"Maverix Broadband posts VP of Operations role on LinkedIn — structural gap confirmed", prospect:"Maverix Broadband", impact:"+8 WSI" },
    { time:"18m", type:"signal", agent:"Scout", text:"Wisper ISP lists 12 NOC technician openings in Springfield, MO", prospect:"Wisper ISP", impact:"+4 WSI" },
    { time:"42m", type:"score", agent:"Analyst", text:"White Cloud Communications crosses HOT threshold — score now 82", prospect:"White Cloud Comm", impact:"Tier ↑" },
    { time:"1.2h", type:"brief", agent:"Strategist", text:"Executive outreach brief generated for Stimulus Technologies — Decision Month approaching", prospect:"Stimulus Technologies", impact:"Brief ready" },
    { time:"2.5h", type:"capacity", agent:"Planner", text:"Pipeline projects +35 FTE need over next 18 months — training lead time required", prospect:"Portfolio", impact:"Hiring signal" },
    { time:"3.1h", type:"compete", agent:"Scout", text:"Competitor 'NorthStar BPO' announces partnership with Kansas ISP — IdeaTek white space narrows", prospect:"IdeaTek Telcom", impact:"Competitive" },
    { time:"5h", type:"signal", agent:"Scout", text:"SkyFiber CEO Mark Feest confirmed speaker at Fiber Connect 2026", prospect:"SkyFiber Inc", impact:"Warm path" },
    { time:"6.4h", type:"health", agent:"Monitor", text:"Pine Telephone engagement metrics declining 12% QoQ — proactive review recommended", prospect:"Pine Telephone Co", impact:"Retention" },
    { time:"8h", type:"award", agent:"Scout", text:"Arkansas announces BEAD subgrantee list — 14 new ISPs identified for scoring", prospect:"New Pipeline", impact:"+14 prospects" },
    { time:"12h", type:"compliance", agent:"Scout", text:"NTIA issues updated BEAD reporting requirements — compliance module updated", prospect:"All Prospects", impact:"Policy change" }
  ];

  var COMPETITORS = [
    { name:"NorthStar BPO", partners:8, states:"KS,MO,NE,OK", strength:"Price", weakness:"Quality metrics", threat:"Medium" },
    { name:"TeleCom Ops Inc", partners:12, states:"CO,UT,WY,MT", strength:"Western US coverage", weakness:"Scale limitations", threat:"High" },
    { name:"ConnectCare Services", partners:5, states:"VA,WV,NC,TN", strength:"Legacy telco expertise", weakness:"No fiber experience", threat:"Low" },
    { name:"Rural Support Group", partners:3, states:"MN,WI,ND", strength:"Co-op relationships", weakness:"Startup, thin bench", threat:"Medium" }
  ];

  var NAV_ITEMS = [
    { id:'command',   label:'Command Center',       icon:'\u25C9' },
    { id:'pipeline',  label:'Pipeline Intelligence', icon:'\u25A4' },
    { id:'strain',    label:'Strain Simulator',      icon:'\u25C8' },
    { id:'financial', label:'Financial Model',       icon:'$' },
    { id:'agents',    label:'Agent Architecture',    icon:'\u2B21' },
    { id:'compete',   label:'Competitive Map',       icon:'\u25C7' },
    { id:'roadmap',   label:'Deployment Roadmap',    icon:'\u25B8' }
  ];

  // ─── Scoring ───
  function calcScore(p) {
    var gviScore = Math.min(20, p.gvi >= 3 ? 20 : p.gvi >= 1.5 ? 16 : p.gvi >= 0.5 ? 10 : 5);
    var omsScore = Math.min(20, (5 - p.oms) * 5);
    var ttcScore = Math.min(15, p.ttc >= 2.5 ? 15 : p.ttc >= 2 ? 12 : p.ttc >= 1.5 ? 8 : 4);
    return gviScore + omsScore + ttcScore + p.wsi + p.dtp + p.sqds;
  }

  function calcFactors(p) {
    return [
      Math.min(20, p.gvi >= 3 ? 20 : p.gvi >= 1.5 ? 16 : p.gvi >= 0.5 ? 10 : 5),
      Math.min(20, (5 - p.oms) * 5),
      Math.min(15, p.ttc >= 2.5 ? 15 : p.ttc >= 2 ? 12 : p.ttc >= 1.5 ? 8 : 4),
      p.wsi,
      p.dtp,
      p.sqds
    ];
  }

  // ─── Formatters ───
  function fmt(n) {
    return n >= 1e9 ? '$' + (n / 1e9).toFixed(1) + 'B' :
           n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M' :
           n >= 1e3 ? '$' + (n / 1e3).toFixed(0) + 'K' : '$' + n;
  }

  function fmtN(n) {
    return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' :
           n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : '' + n;
  }

  // ─── Color Helpers ───
  function tierColor(t) {
    return { hot:'var(--hot)', warm:'var(--warm)', nurture:'var(--nurture)', strategic:'var(--strategic)' }[t] || 'var(--text-muted)';
  }

  function tierBg(t) {
    return { hot:'var(--hot-dim)', warm:'var(--warm-dim)', nurture:'var(--nurture-dim)', strategic:'var(--strategic-dim)' }[t] || 'var(--surface)';
  }

  function agentColor(a) {
    return { Scout:'var(--scout)', Analyst:'var(--analyst)', Strategist:'var(--strategist)', Planner:'var(--planner)', Monitor:'var(--monitor)' }[a] || 'var(--accent)';
  }

  function scoreColor(score) {
    return score >= 80 ? 'var(--hot)' : score >= 60 ? 'var(--warm)' : score >= 40 ? 'var(--nurture)' : 'var(--text-muted)';
  }

  function scoreBg(score) {
    return score >= 80 ? 'var(--hot-dim)' : score >= 60 ? 'var(--warm-dim)' : score >= 40 ? 'var(--nurture-dim)' : 'var(--surface-alt)';
  }

  // ─── Computed Aggregates ───
  var totalMarket = PROSPECTS.reduce(function(s, p) { return s + p.award; }, 0);
  var hotCount = PROSPECTS.filter(function(p) { return p.tier === 'hot'; }).length;
  var warmCount = PROSPECTS.filter(function(p) { return p.tier === 'warm'; }).length;
  var stateCount = (function() {
    var counts = {};
    PROSPECTS.forEach(function(p) {
      var states = p.state === 'Multi' ? ['MO','KS','NE'] : [p.state];
      states.forEach(function(s) { counts[s] = (counts[s] || 0) + 1; });
    });
    return counts;
  })();
  var uniqueStates = Object.keys(stateCount).length;

  // ─── Filtering / Sorting ───
  function filterAndSort(tierFilter, sortBy) {
    var list = tierFilter === 'all' ? PROSPECTS.slice() : PROSPECTS.filter(function(p) { return p.tier === tierFilter; });
    list.sort(function(a, b) {
      if (sortBy === 'score') return calcScore(b) - calcScore(a);
      if (sortBy === 'award') return b.award - a.award;
      return a.name.localeCompare(b.name);
    });
    return list;
  }

  // ─── Export ───
  window.DATA = {
    PROSPECTS: PROSPECTS,
    INTEL_FEED: INTEL_FEED,
    COMPETITORS: COMPETITORS,
    NAV_ITEMS: NAV_ITEMS,
    calcScore: calcScore,
    calcFactors: calcFactors,
    fmt: fmt,
    fmtN: fmtN,
    tierColor: tierColor,
    tierBg: tierBg,
    agentColor: agentColor,
    scoreColor: scoreColor,
    scoreBg: scoreBg,
    totalMarket: totalMarket,
    hotCount: hotCount,
    warmCount: warmCount,
    uniqueStates: uniqueStates,
    filterAndSort: filterAndSort
  };
})();
