// Тема «Пудровый голубой» (вариант 2a) для всех страниц академии.
// Страницы написаны инлайн-стилями старой тёмно-синей палитры; этот файл
// переводит их цвета в выбранную палитру на лету — поэтому оформление
// меняется в одном месте, а не в 141 файле по отдельности.
(function () {
  if (window.FL_THEME) return;
  window.FL_THEME = true;

  var FONTS = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';

  // Старый цвет → цвет темы. Порядок важен: длинные строки идут первыми.
  var MAP = [
    ['Plus Jakarta Sans', 'Work Sans'],
    ['rgba(15,31,61,', 'rgba(27,45,71,'],
    ['rgba(15, 31, 61,', 'rgba(27,45,71,'],
    ['rgba(20,45,90,', 'rgba(27,45,71,'],
    ['rgba(44,107,230,', 'rgba(91,135,188,'],
    ['rgba(44, 107, 230,', 'rgba(91,135,188,'],
    ['rgba(224, 91, 79,', 'rgba(178,60,44,'],
    ['rgb(44, 107, 230)', '#5B87BC'],
    ['rgb(15, 31, 61)', '#1B2D47'],
    ['rgb(27, 79, 184)', '#2A4E7C'],
    ['rgb(231, 237, 247)', '#EEF4FB'],
    ['rgb(233, 240, 254)', '#E4EDF7'],
    ['rgb(237, 243, 254)', '#E9F1FA'],
    ['rgb(220, 232, 253)', '#DCE8F7'],
    ['rgb(228, 235, 246)', '#D9E6F4'],
    ['rgb(233, 238, 247)', '#E4EDF7'],
    ['rgb(245, 248, 254)', '#F7FAFE'],
    ['rgb(247, 249, 253)', '#F5F9FD'],
    ['rgb(251, 252, 254)', '#FAFCFE'],
    ['rgb(255, 244, 232)', '#FBF1E6'],
    ['rgb(253, 240, 226)', '#FBF1E6'],
    ['rgb(255, 246, 244)', '#FCF3F1'],
    ['rgb(62, 139, 78)', '#2F6B48'],
    ['rgb(47, 107, 58)', '#2F6B48'],
    ['rgb(180, 103, 31)', '#8A5A1B'],
    ['rgb(192, 67, 47)', '#9E3322'],
    ['rgb(124, 139, 166)', '#55688A'],
    ['rgb(90, 107, 135)', '#55688A'],
    ['rgb(147, 160, 181)', '#55688A'],
    ['rgb(132, 148, 173)', '#41556F'],
    ['rgb(224, 112, 63)', '#5B87BC'],
    ['rgb(224, 91, 79)', '#9E3322'],
    ['rgba(224,91,79,', 'rgba(178,60,44,'],
    ['rgba(224,144,79,', 'rgba(178,60,44,'],
    ['#0F1F3D', '#1B2D47'],
    ['#0f1f3d', '#1B2D47'],
    ['#1B4FB8', '#2A4E7C'],
    ['#2C6BE6', '#5B87BC'],
    ['#E7EDF7', '#EEF4FB'],
    ['#E9F0FE', '#E4EDF7'],
    ['#EDF3FE', '#E9F1FA'],
    ['#DCE8FD', '#DCE8F7'],
    ['#F5F8FE', '#F7FAFE'],
    ['#F4F7FD', '#F2F7FC'],
    ['#F7F9FD', '#F5F9FD'],
    ['#FBFCFE', '#FAFCFE'],
    ['#E4EBF6', '#D9E6F4'],
    ['#E9EEF7', '#E4EDF7'],
    ['#C7D4E8', '#C2D6EB'],
    ['#7C8BA6', '#55688A'],
    ['#5A6B87', '#55688A'],
    ['#93A0B5', '#55688A'],
    ['#8494AD', '#41556F'],
    ['#E0703F', '#5B87BC'],
    ['#E05B4F', '#9E3322'],
    ['#C0432F', '#9E3322'],
    ['#FFF6F4', '#FCF3F1'],
    ['#FFF4E8', '#FBF1E6'],
    ['#FDF0E2', '#FBF1E6'],
    ['#7A3428', '#6E4318'],
    ['#B4671F', '#8A5A1B'],
    ['#3E8B4E', '#2F6B48'],
    ['#2F6B3A', '#2F6B48']
  ];

  function swap(str) {
    var out = str;
    for (var i = 0; i < MAP.length; i++) {
      if (out.indexOf(MAP[i][0]) >= 0) out = out.split(MAP[i][0]).join(MAP[i][1]);
    }
    return out;
  }

  function paint(root) {
    var els = root.querySelectorAll ? root.querySelectorAll('[style]') : [];
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var raw = el.getAttribute('style') || '';
      if (el.__flStyle === raw) continue;
      var next = swap(raw);
      // Название блюда в карточке — антиквой, как в выбранном варианте
      if (/font-size:\s*23px/.test(next) && /font-weight:\s*800/.test(next)) {
        next = next
          .replace(/font-size:\s*23px/, 'font-size: 29px')
          .replace(/font-weight:\s*800/, 'font-weight: 400')
          .replace(/font-family:[^;]+;?/, '') + ";font-family: 'Instrument Serif', Georgia, serif;";
      }
      if (next !== raw) el.setAttribute('style', next);
      el.__flStyle = el.getAttribute('style');
    }
  }

  // Состояния hover/focus рантайм компилирует в отдельные CSS-правила —
  // их правим той же картой цветов, иначе при наведении вылезает старый синий.
  function paintRules() {
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var rules = null;
      try { rules = sheets[i].cssRules; } catch (e) { continue; }
      if (rules) walkRules(rules);
    }
  }

  function walkRules(rules) {
    for (var i = 0; i < rules.length; i++) {
      try {
        var r = rules[i];
        if (r.cssRules && r.cssRules.length) { walkRules(r.cssRules); continue; }
        var st = r.style;
        if (!st || r.__flSeen === r.cssText) continue;
        for (var j = 0; j < st.length; j++) {
          var prop = st[j];
          var val = st.getPropertyValue(prop);
          var next = swap(val);
          if (next !== val) st.setProperty(prop, next, st.getPropertyPriority(prop));
        }
        r.__flSeen = r.cssText;
        window.FL_THEME_RULES = (window.FL_THEME_RULES || 0) + 1;
      } catch (e) {}
    }
  }

  // Правила псевдосостояний рантайм пересоздаёт при каждом ре-рендере,
  // поэтому перекрашиваем их в момент вставки, а не догоняем по таймеру.
  function hookInsert() {
    var proto = window.CSSStyleSheet && CSSStyleSheet.prototype;
    if (!proto || proto.__flHooked) return;
    proto.__flHooked = true;
    var fix = function (sheet, index) {
      try {
        var r = sheet.cssRules[index];
        if (r) walkRules([r]);
      } catch (e) {}
    };
    var orig = proto.insertRule;
    proto.insertRule = function (rule, index) {
      var at = orig.call(this, rule, index);
      fix(this, at);
      return at;
    };
    if (proto.addRule) {
      var origAdd = proto.addRule;
      proto.addRule = function (sel, style, index) {
        var at = origAdd.call(this, sel, style, index);
        fix(this, at < 0 ? this.cssRules.length - 1 : at);
        return at;
      };
    }
  }

  function boot() {
    hookInsert();
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS;
    document.head.appendChild(link);

    var st = document.createElement('style');
    st.textContent = 'body{background:#EEF4FB !important;font-family:"Work Sans",Helvetica,sans-serif}' +
      'a{color:#35527A !important}a:hover{color:#5B87BC !important}' +
      '::-webkit-scrollbar-thumb{background:#C2D6EB}';
    document.head.appendChild(st);

    try { paint(document.body); } catch (e) {}
    try { paintRules(); } catch (e) {}
    // Приложение перерисовывает кнопки своими цветами уже после загрузки,
    // поэтому проходим по странице ещё несколько раз в первую минуту.
    var ticks = 0;
    var t = setInterval(function () {
      try { paint(document.body); } catch (e) {}
      try { paintRules(); } catch (e) {}
      if (++ticks > 120) clearInterval(t);
    }, 500);
    try {
      new MutationObserver(function () { paint(document.body); paintRules(); })
        .observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    } catch (e) {}
  }

  // Языковой слой нужен на каждой странице: карточки его раньше не грузили
  if (!window.FL_LANG) {
    var s = document.createElement('script');
    s.src = './fl-lang.js';
    (document.head || document.documentElement).appendChild(s);
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
