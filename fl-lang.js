// Живой перевод страниц академии.
// Русский текст на странице — исходник. Словарь translations.js переводит его
// на язык, выбранный сотрудником; чего нет в словаре (например, шаг, который
// шеф только что дописал) уходит в автоперевод и складывается в кэш —
// поэтому индонезийская версия обновляется без ручной работы.
(function () {
  if (window.FL_LANG) return;

  var KEY = 'foodlab-lang';
  var CACHE = 'foodlab-tr-cache';
  var CYR = /[А-Яа-яЁё]/;
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1 };

  function lang() {
    try { return localStorage.getItem(KEY) || 'ru'; } catch (e) { return 'ru'; }
  }

  var cache = {};
  try { cache = JSON.parse(localStorage.getItem(CACHE) || '{}'); } catch (e) {}
  function saveCache() {
    try { localStorage.setItem(CACHE, JSON.stringify(cache)); } catch (e) {}
  }

  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  // Словарь → кэш автоперевода. Пусто означает «перевода пока нет».
  function lookup(src, to) {
    var k = norm(src);
    if (!k) return '';
    var base = window.FL_TR && window.FL_TR[k];
    if (base && base[to]) return base[to];
    // Строки с числами вроде «Вопрос 3 / 27» переводятся по шаблону «tpl:Вопрос # / #»,
    // иначе каждая цифра требовала бы отдельного перевода. Пробелы вокруг «/»
    // приводятся к одному виду: приложение печатает и «1/27», и «1 / 27».
    if (/\d/.test(k) && window.FL_TR) {
      var nums = k.match(/\d+/g) || [];
      var shape = k.replace(/\d+/g, '#').replace(/\s*\/\s*/g, ' / ');
      var tpl = window.FL_TR['tpl:' + shape] || window.FL_TR['tpl:' + k.replace(/\d+/g, '#')];
      if (tpl && tpl[to]) {
        var i = 0;
        return tpl[to].replace(/#/g, function () {
          var v = nums[i];
          i++;
          return v === undefined ? '#' : v;
        });
      }
    }
    // Кэш автоперевода — последним: словарь и шаблоны всегда главнее машинного.
    return cache[to + '|' + k] || '';
  }

  // ── Автоперевод ────────────────────────────────────────────────────────
  // Строки, собранные в коде из кусков («admin · Админ · Менеджер»), переводятся
  // по частям: что нашлось в словаре — переводится, имена и логины остаются как есть.
  function lookupParts(src, to) {
    var k = norm(src);
    if (k.indexOf(' · ') < 0 && k.indexOf(', ') < 0) return '';
    var parts = k.split(/(\s·\s|,\s)/);
    var got = false;
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (/^(\s·\s|,\s)$/.test(p)) { out.push(p); continue; }
      var t = lookup(p, to);
      if (t) { got = true; out.push(t); } else { out.push(p); }
    }
    return got ? out.join('') : '';
  }

  // ── Автоперевод ──────────────────────────────────────────────────
  var pending = {}, timer = null, working = false;

  function queue(src, to) {
    // До загрузки словаря ничего не запрашиваем — иначе первая же загрузка
    // устроит десятки лишних запросов и сложит в кэш перевод хуже словарного.
    if (!window.FL_TR) return;
    var k = norm(src);
    if (!k || k.length > 600 || !CYR.test(k)) return;
    pending[to + '|' + k] = { text: k, to: to };
    if (!timer) timer = setTimeout(flush, 500);
  }

  async function ask(text, from, to) {
    try {
      var r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' +
        from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(text));
      var j = await r.json();
      var out = (j[0] || []).map(function (x) { return x[0]; }).join('');
      if (out) return out;
    } catch (e) {}
    try {
      var r2 = await fetch('https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(text) + '&langpair=' + from + '|' + to);
      var j2 = await r2.json();
      var out2 = j2.responseData && j2.responseData.translatedText;
      if (out2 && out2.indexOf('MYMEMORY WARNING') < 0) return out2;
    } catch (e) {}
    return '';
  }

  async function flush() {
    timer = null;
    if (working) { timer = setTimeout(flush, 800); return; }
    working = true;
    var keys = Object.keys(pending).slice(0, 25);
    var got = 0;
    for (var i = 0; i < keys.length; i++) {
      var item = pending[keys[i]];
      delete pending[keys[i]];
      var res = await ask(item.text, 'ru', item.to);
      if (res) { cache[keys[i]] = res; got++; }
    }
    if (got) { saveCache(); apply(); }
    working = false;
    if (Object.keys(pending).length && !timer) timer = setTimeout(flush, 600);
  }

  // ── Перевод страницы ───────────────────────────────────────────────────
  function textNodes(root) {
    var out = [];
    var it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p || SKIP[p.nodeName] || p.isContentEditable) return NodeFilter.FILTER_REJECT;
        if (!n.__flSrc && !CYR.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = it.nextNode())) out.push(n);
    return out;
  }

  function put(node, src, value) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(src);
    node.nodeValue = m[1] + value + m[3];
  }

  var applying = false;

  // ── Русская версия: английские строки → русские (словарь ru-dict.js) ───
  function ruValue(key) {
    return window.FL_RU_VALUE ? window.FL_RU_VALUE(key) : '';
  }
  function fixRu(to) {
    if (!window.FL_RU || !document.body) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!p || SKIP[p.nodeName]) continue;
      if (to !== 'ru') {
        if (n.__flRuSrc && n.nodeValue === n.__flRuVal) { n.nodeValue = n.__flRuSrc; }
        n.__flRuSrc = null;
        continue;
      }
      if (n.__flRuSrc && n.nodeValue === n.__flRuVal) continue;
      var v = ruValue(norm(n.nodeValue));
      if (v) {
        var src = n.nodeValue;
        put(n, src, v);
        n.__flRuSrc = src; n.__flRuVal = n.nodeValue;
      }
    }
    if (to !== 'ru') return;
    var els = document.querySelectorAll('[title],[placeholder]');
    for (var i = 0; i < els.length; i++) {
      ['title', 'placeholder'].forEach(function (a) {
        var val = els[i].getAttribute(a);
        var r = val && ruValue(norm(val));
        if (r) els[i].setAttribute(a, r);
      });
    }
  }

  function apply() {
    var to = lang();
    applying = true;
    try {
      fixRu(to);
      var nodes = textNodes(document.body);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var src = n.__flSrc || n.nodeValue;
        if (to === 'ru') {
          if (n.__flSrc) { n.nodeValue = n.__flSrc; n.__flSrc = null; }
          continue;
        }
        var hit = lookup(src, to);
        if (!hit) hit = lookupParts(src, to);
        if (hit) {
          n.__flSrc = src;
          put(n, src, hit);
        } else {
          queue(src, to);
        }
      }
      // подсказки в полях ввода
      var ph = document.querySelectorAll('[placeholder]');
      for (var j = 0; j < ph.length; j++) {
        var el = ph[j];
        var s = el.__flPh || el.getAttribute('placeholder') || '';
        if (!CYR.test(s) && !el.__flPh) continue;
        if (to === 'ru') { if (el.__flPh) { el.setAttribute('placeholder', el.__flPh); el.__flPh = null; } continue; }
        var h = lookup(s, to);
        if (h) { el.__flPh = s; el.setAttribute('placeholder', h); }
        else queue(s, to);
      }
      fixNav(to);
    } finally {
      applying = false;
    }
  }

  // ── Навигация: «Каталог» ведёт в каталог, рядом всегда «Главная» ───────
  var HOME = { ru: '⌂ Главная', id: '⌂ Beranda', en: '⌂ Home' };
  var ACADEMY = 'Академия.dc.html';

  function fixNav(to) {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.__flNav) continue;
      var href = a.getAttribute('href') || '';
      var isAcademy = href.indexOf('D0%90%D0%BA%D0%B0%D0%B4') >= 0 || href.indexOf(ACADEMY) >= 0;
      if (!isAcademy) continue;
      var txt = norm(a.textContent);
      if (txt.charAt(0) !== '←') continue;
      a.__flNav = true;
      // Ссылка «Каталог» ведёт в каталог, а не в кабинет, и рядом с ней
      // появляется «Главная». Где кнопка назад и так ведёт в кабинет (SOP, тест),
      // вторая кнопка не нужна — это одно и то же место.
      var toCatalog = /каталог|katalog|catalogue/i.test(txt);
      if (href.indexOf('#') < 0) a.setAttribute('href', href + (toCatalog ? '#catalog' : '#hub'));
      if (!toCatalog) continue;
      if (!a.parentNode || document.querySelector('[data-fl-home]')) continue;
      var home = a.cloneNode(true);
      home.setAttribute('data-fl-home', '1');
      home.setAttribute('href', href.split('#')[0] + '#hub');
      home.__flNav = true;
      home.textContent = HOME[to] || HOME.ru;
      a.parentNode.insertBefore(home, a.nextSibling);
    }
    // язык могли переключить после того, как кнопка уже встала — подпись обновляем всегда
    var homes = document.querySelectorAll('[data-fl-home]');
    for (var k = 0; k < homes.length; k++) {
      var want = HOME[to] || HOME.ru;
      if (norm(homes[k].textContent) !== want) homes[k].textContent = want;
    }
  }

  // ── Запуск ─────────────────────────────────────────────────────────────
  // Из кэша убираются строки, которые теперь есть в словаре: словарные
  // формулировки главнее, машинные копии только занимают место.
  function pruneCache() {
    if (!window.FL_TR) return;
    var dropped = 0;
    Object.keys(cache).forEach(function (key) {
      var to = key.slice(0, key.indexOf('|'));
      var k = key.slice(key.indexOf('|') + 1);
      var byDict = window.FL_TR[k] && window.FL_TR[k][to];
      var byTpl = /\d/.test(k) && window.FL_TR['tpl:' + k.replace(/\d+/g, '#').replace(/\s*\/\s*/g, ' / ')];
      if (byDict || byTpl) { delete cache[key]; dropped++; }
    });
    if (dropped) saveCache();
  }

  var pulse = null;
  function schedule() {
    if (applying || pulse) return;
    pulse = setTimeout(function () { pulse = null; apply(); }, 80);
  }

  function boot() {
    apply();
    try {
      new MutationObserver(schedule).observe(document.body, {
        childList: true, subtree: true, characterData: true
      });
    } catch (e) {}
  }

  window.FL_LANG = {
    current: lang,
    set: function (l) {
      try { localStorage.setItem(KEY, l); } catch (e) {}
      apply();
    },
    t: function (ru) {
      var to = lang();
      if (to === 'ru') return ru;
      return lookup(ru, to) || ru;
    },
    // Для правок шефа: получить перевод текста на нужный язык (или '' пока нет)
    translate: function (text, from, to) { return ask(text, from || 'ru', to); },
    refresh: apply
  };

  // русский словарь для строк, написанных по-английски
  if (!window.FL_RU) {
    var r = document.createElement('script');
    r.src = './ru-dict.js';
    r.onload = function () { apply(); };
    (document.head || document.documentElement).appendChild(r);
  }

  // словарь подгружается рядом с этим файлом
  if (!window.FL_TR) {
    var s = document.createElement('script');
    s.src = './translations.js';
    s.onload = function () { pruneCache(); apply(); };
    (document.head || document.documentElement).appendChild(s);
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
