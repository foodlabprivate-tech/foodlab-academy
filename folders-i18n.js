// Должностные папки Food Lab: язык, доступ и перевод.
// Русский текст страницы — исходник. Каждый переводимый блок помечен data-t="ключ";
// словарь folders-en.js / folders-id.js подставляет перевод по ключу.
// Язык берётся из выбора в Академии (foodlab-lang).
(function () {
  var KEY = 'foodlab-lang';
  var lang = 'ru';
  try { lang = localStorage.getItem(KEY) || 'ru'; } catch (e) {}
  if (['ru', 'en', 'id'].indexOf(lang) < 0) lang = 'ru';
  window.FL_LOC = { ru: 'ru-RU', en: 'en-GB', id: 'id-ID' }[lang];
  document.documentElement.lang = lang;
  if (lang !== 'ru') {
    // словарь грузится синхронно, чтобы перевод встал до первой отрисовки
    document.write('<script src="folders-' + lang + '.js"><\/script>');
  }

  var UI = {
    ru: { back: '← Академия', folders: 'Все папки', denied: 'Нет доступа',
          deniedText: 'Эта папка открыта только руководителям: администраторам, шеф-повару, су-шефам и HR-менеджеру. Войдите в Академию под своей учётной записью.',
          login: 'Сначала войдите в Академию.', toAcademy: '← В Академию', partial: '' },
    en: { back: '← Academy', folders: 'All folders', denied: 'No access',
          deniedText: 'This folder is open to managers only: administrators, the head chef, sous chefs and the HR manager. Sign in to the Academy with your own account.',
          login: 'Please sign in to the Academy first.', toAcademy: '← To the Academy',
          partial: 'Automatic translation from Russian. If anything is unclear, the Russian original prevails.' },
    id: { back: '← Akademi', folders: 'Semua map', denied: 'Tidak ada akses',
          deniedText: 'Map ini hanya untuk pemimpin: admin, head chef, sous chef, dan HR manager. Masuk ke Akademi dengan akun Anda sendiri.',
          login: 'Silakan masuk ke Akademi terlebih dahulu.', toAcademy: '← Ke Akademi',
          partial: 'Terjemahan otomatis dari bahasa Rusia. Jika ada yang kurang jelas, yang berlaku adalah naskah asli berbahasa Rusia.' }
  };
  var LEAD_POS = ['Шеф-повар', 'Су-шеф', 'HR-менеджер'];

  function session() {
    try { return JSON.parse(localStorage.getItem('foodlab-session') || 'null'); } catch (e) { return null; }
  }
  function allowed(level, u) {
    if (!u) return false;
    if (level === 'all') return true;
    return u.role === 'admin' || u.role === 'sous' || LEAD_POS.indexOf(u.position) >= 0;
  }

  // Строки, которые скрипт страницы дорисовывает сам (часы смен, кнопки «Копировать»)
  var DYN = {};
  function translateDyn(root) {
    var D = window.FL_FOLD_DICT;
    if (!D || lang === 'ru') return;
    var it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = it.nextNode())) {
      var src = n.nodeValue.replace(/\s+/g, ' ').trim();
      if (!/[А-Яа-яЁё]/.test(src)) continue;
      var k = DYN[src], out = k && D[k];
      if (out == null) {
        // строки с числами: «2 чел.» переводится по шаблону «# чел.»
        var nums = src.match(/\d+/g) || [];
        k = DYN[src.replace(/\d+/g, '#')];
        if (k && D[k] != null) { var i = 0; out = D[k].replace(/#/g, function () { return nums[i++] || '#'; }); }
      }
      if (out != null) n.nodeValue = n.nodeValue.replace(/\S[\s\S]*\S|\S/, out);
    }
  }

  function apply() {
    var u = session();
    var meta = document.querySelector('meta[name="fl-access"]');
    var level = meta ? meta.getAttribute('content') : 'lead';
    var T = UI[lang];
    var gate = document.getElementById('fl-gate');
    if (!allowed(level, u)) {
      document.body.classList.add('fl-locked');
      if (gate) {
        gate.innerHTML = '<h2>' + T.denied + '</h2><p>' + (u ? T.deniedText : T.login) + '</p><a href="Академия.dc.html">' + T.toAcademy + '</a>';
      }
    }
    // подписи навигации
    [].forEach.call(document.querySelectorAll('[data-fl-ui]'), function (el) {
      el.textContent = T[el.getAttribute('data-fl-ui')];
    });
    [].forEach.call(document.querySelectorAll('[data-fl-lang]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-fl-lang') === lang ? 'true' : 'false');
      b.addEventListener('click', function () {
        try { localStorage.setItem(KEY, b.getAttribute('data-fl-lang')); } catch (e) {}
        location.reload();
      });
    });
    if (lang === 'ru') return;
    var D = window.FL_FOLD_DICT || {};
    var missing = 0;
    [].forEach.call(document.querySelectorAll('[data-t]'), function (el) {
      var v = D[el.getAttribute('data-t')];
      if (v == null) { missing++; return; }
      if (el.tagName === 'TITLE') document.title = v.replace(/<[^>]+>/g, '');
      else el.innerHTML = v;
    });
    [].forEach.call(document.querySelectorAll('[data-ta]'), function (el) {
      el.getAttribute('data-ta').split(';').forEach(function (p) {
        var i = p.indexOf(':'), a = p.slice(0, i), v = D[p.slice(i + 1)];
        if (v != null) el.setAttribute(a, v);
      });
    });
    if (missing && T.partial) {
      var note = document.createElement('div');
      note.className = 'fl-partial';
      note.setAttribute('role', 'note');
      note.textContent = T.partial;
      var main = document.getElementById('main');
      if (main) main.insertBefore(note, main.firstChild);
    }
    // Чего нет в словаре — автоперевод, по мере прокрутки (сначала то, что на экране)
    machine();
    // дорисованное скриптом страницы
    window.addEventListener('load', function () { translateDyn(document.body); autoNodes(document.body); });
    try {
      new MutationObserver(function (ms) {
        ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (x) {
          var r = x.nodeType === 1 ? x : x.parentNode;
          if (!r || applying) return;
          translateDyn(r);
          autoNodes(r);
        }); });
      }).observe(document.body, { childList: true, subtree: true, characterData: false });
    } catch (e) {}
  }

  // ── Автоперевод ─────────────────────────────────────────────────────────
  // Тот же сервис, что в Академии (fl-lang.js). Результат копится в кэше браузера,
  // поэтому каждую строку переводим один раз. Оригинал — русский текст.
  var CYR = /[А-Яа-яЁё]/;
  var CKEY = 'foodlab-fold-tr-' + lang;
  var cache = {};
  try { cache = JSON.parse(localStorage.getItem(CKEY) || '{}'); } catch (e) {}
  var saveTimer = null;
  function saveCache() {
    if (saveTimer) return;
    saveTimer = setTimeout(function () {
      saveTimer = null;
      try { localStorage.setItem(CKEY, JSON.stringify(cache)); } catch (e) {}
    }, 1500);
  }
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  async function ask(text) {
    try {
      var r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=' + lang +
        '&dt=t&q=' + encodeURIComponent(text));
      var j = await r.json();
      var out = (j[0] || []).map(function (x) { return x[0]; }).join('');
      if (out) return out;
    } catch (e) {}
    if (text.length <= 480) {
      try {
        var r2 = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=ru|' + lang);
        var j2 = await r2.json();
        var o2 = j2.responseData && j2.responseData.translatedText;
        if (o2 && o2.indexOf('MYMEMORY WARNING') < 0) return o2;
      } catch (e) {}
    }
    return '';
  }

  // очередь: несколько запросов параллельно, одинаковые строки — один запрос
  var waiting = {}, queue = [], active = 0, MAX = 6, applying = false;
  function want(text, cb) {
    if (cache[text]) { cb(cache[text]); return; }
    if (waiting[text]) { waiting[text].push(cb); return; }
    waiting[text] = [cb];
    queue.push(text);
    pump();
  }
  function done(text, out) {
    var cbs = waiting[text] || [];
    delete waiting[text];
    if (out) { cache[text] = out; saveCache(); cbs.forEach(function (cb) { cb(out); }); }
  }
  // Короткие строки идут пачкой: одна строка — одна линия запроса, ответ режется по переводам строк.
  // Если число линий не сошлось, каждую строку переводим отдельно.
  var single = {};
  function pump() {
    while (active < MAX && queue.length) {
      var batch = [], size = 0;
      while (queue.length && batch.length < 40) {
        var t = queue[0];
        if (single[t]) { if (!batch.length) { batch.push(queue.shift()); } break; }
        if (batch.length && size + t.length > 1600) break;
        batch.push(queue.shift());
        size += t.length + 1;
      }
      (function (batch) {
        active++;
        ask(batch.join('\n')).then(function (out) {
          active--;
          var lines = out ? out.split('\n') : [];
          if (batch.length === 1) done(batch[0], out);
          else if (lines.length === batch.length) batch.forEach(function (t, i) { done(t, lines[i].trim()); });
          else batch.forEach(function (t) { single[t] = 1; queue.unshift(t); });
          pump();
        });
      })(batch);
    }
  }
  window.addEventListener('pagehide', function () { try { localStorage.setItem(CKEY, JSON.stringify(cache)); } catch (e) {} });

  function autoNodes(root) {
    if (lang === 'ru' || !root || root.closest && root.closest('script,style')) return;
    var it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = it.nextNode())) {
      var p = n.parentNode;
      if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) continue;
      if (CYR.test(n.nodeValue)) list.push(n);
    }
    list.forEach(function (node) {
      var src = node.nodeValue, k = norm(src);
      if (!k) return;
      want(k, function (out) {
        if (node.nodeValue !== src) return;
        var m = /^(\s*)[\s\S]*?(\s*)$/.exec(src);
        applying = true;
        node.nodeValue = m[1] + out + m[2];
        applying = false;
      });
    });
  }

  function autoAttrs(el) {
    ['aria-label', 'title', 'placeholder', 'alt', 'data-done'].forEach(function (a) {
      var v = el.getAttribute(a);
      if (v && CYR.test(v)) want(norm(v), function (out) { el.setAttribute(a, out); });
    });
  }

  function machine() {
    var blocks = [].filter.call(document.querySelectorAll('[data-t]'), function (el) { return CYR.test(el.textContent); });
    var title = document.querySelector('title');
    if (title && CYR.test(title.textContent)) want(norm(title.textContent), function (out) { document.title = out; });
    [].forEach.call(document.querySelectorAll('[data-ta]'), autoAttrs);
    if (!('IntersectionObserver' in window)) { blocks.forEach(autoNodes); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); autoNodes(e.target); } });
    }, { rootMargin: '1200px 0px' });
    blocks.forEach(function (el) { io.observe(el); });
    // оглавление и шапка видны сразу
    [].forEach.call(document.querySelectorAll('.rail [data-t], .topbar [data-t]'), function (el) { io.unobserve(el); autoNodes(el); });
  }

  window.FL_FOLD = { lang: lang, apply: apply, dyn: function (map) { DYN = map; }, allowed: allowed, session: session };
})();
