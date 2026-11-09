// Фото тех.карт. Главный источник — сам сайт: card-photos-static.js + папка photos/cards/.
// Ничего скачивать и распаковывать не нужно: всё приходит вместе с сайтом на любой компьютер и телефон.
// Админ / су-шеф: новые фото из тех.карты дополнительно публикуются в Supabase и видны всем сразу.
(function () {
  if (window.FL_SYNC) return;
  var BUCKET = 'card-photos';
  var PREFIX = 'foodlab-card-';
  var LS = window.localStorage;

  function sess() { try { return JSON.parse(LS.getItem('foodlab-session') || 'null'); } catch (e) { return null; } }
  var s = sess();
  var EDITOR = !!(s && (s.role === 'admin' || s.role === 'sous'));

  // 1) Пакет сайта — синхронно, чтобы тех.карта сразу взяла верную раскладку
  var P = {}, S = {}, V = '';
  (function () {
    var txt = '';
    try { var x = new XMLHttpRequest(); x.open('GET', 'card-photos-static.js', false); x.send(null); if (x.status === 200 || x.status === 0) txt = x.responseText; } catch (e) {}
    if (!txt) return;
    var fake = {};
    try { new Function('window', txt)(fake); } catch (e) {}
    P = fake.FL_CARD_PHOTOS || {}; S = fake.FL_CARD_STATE || {}; V = fake.FL_PACK_V || '';
  })();
  window.FL_CARD_STATE = S;

  // 2) Новая версия сайта → раскладка из сайта заменяет старые копии в браузере
  var fresh = false;
  try { fresh = !!V && (!EDITOR || LS.getItem('fl-pack-v') !== V); } catch (e) {}
  if (fresh) {
    try {
      // Убираем старые копии раскладки — тех.карта возьмёт её из сайта (FL_CARD_STATE)
      Object.keys(LS).forEach(function (k) { if (k.indexOf(PREFIX) === 0 && (!EDITOR || S[k])) LS.removeItem(k); });
      LS.setItem('fl-pack-v', V);
      LS.removeItem('fl-uploaded');
    } catch (e) {}
  }

  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('foodlab-photos', 1);
      r.onupgradeneeded = function () { if (!r.result.objectStoreNames.contains('pool')) r.result.createObjectStore('pool'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbClear() {
    return idb().then(function (db) {
      return new Promise(function (res) {
        // Убираем только копии фото с сайта; фото, загруженные в этом браузере (data:), не трогаем
        var tx = db.transaction('pool', 'readwrite'), st = tx.objectStore('pool');
        var cq = st.openCursor();
        cq.onsuccess = function () {
          var cur = cq.result; if (!cur) return;
          var v = cur.value;
          var own = Array.isArray(v) && v.some(function (p) { return p && /^data:/.test(p.url); });
          if (!own) cur.delete();
          cur.continue();
        };
        tx.oncomplete = tx.onerror = tx.onabort = function () { res(); };
      });
    }).catch(function () {});
  }
  function idbAll() {
    return idb().then(function (db) {
      return new Promise(function (res) {
        var st = db.transaction('pool', 'readonly').objectStore('pool');
        var kq = st.getAllKeys(), vq = st.getAll(), keys = null, vals = null;
        function done() { if (!keys || !vals) return; var o = {}; keys.forEach(function (k, i) { o[k] = vals[i]; }); res(o); }
        kq.onsuccess = function () { keys = kq.result; done(); };
        vq.onsuccess = function () { vals = vq.result; done(); };
        kq.onerror = vq.onerror = function () { res({}); };
      });
    }).catch(function () { return {}; });
  }
  var writingOwn = false;
  function idbPut(key, val) {
    return idb().then(function (db) {
      return new Promise(function (res) {
        writingOwn = true;
        var tx = db.transaction('pool', 'readwrite');
        tx.objectStore('pool').put(val, key);
        tx.oncomplete = tx.onerror = function () { writingOwn = false; res(); };
      });
    }).catch(function () { writingOwn = false; });
  }

  function cfg() {
    try {
      var l = JSON.parse(LS.getItem('foodlab-db-config') || 'null');
      if (l && l.mode === 'supabase' && l.url && l.key) return l;
    } catch (e) {}
    var p = window.FL_DB_PRESET;
    return p && p.url && p.key ? p : null;
  }
  function base(c) { return String(c.url).trim().replace(/\/rest\/v1.*$/, '').replace(/\/+$/, ''); }
  function heads(c, extra) {
    var h = { apikey: c.key, Authorization: 'Bearer ' + c.key };
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }

  window.FL_SYNC = { editor: EDITOR, ready: false };

  // 3) Тех.карта ждёт FL_CARD_PHOTOS — отдаём после очистки старых копий фото
  var boot = (fresh ? idbClear() : Promise.resolve()).then(function () {
    window.FL_CARD_PHOTOS = P;
    window.FL_SYNC.ready = true;
    try { window.dispatchEvent(new Event('fl-card-photos')); } catch (e) {}
  });

  // Главное фото блюда — для вопросов теста
  window.FL_CARD_KEY = function (nameOrFile) {
    var n = String(nameOrFile || '').replace(/^Тех\.карта - /, '').replace(/\.dc\.html.*$/, '');
    return PREFIX + n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  window.FL_CARD_HERO = function (nameOrFile) {
    if (!nameOrFile) return '';
    var key = window.FL_CARD_KEY(nameOrFile);
    var pool = (window.FL_CARD_PHOTOS || P)[key] || [];
    var id = null;
    try { var st = JSON.parse((window.FL_CARD_STATE || {})[key] || 'null'); id = st && st.hero && st.hero.photo; } catch (e) {}
    var hit = id && pool.find(function (p) { return p.id === id; });
    return hit && hit.url ? hit.url : '';
  };

  if (!EDITOR) return;

  // ── Публикация новых фото (админ / су-шеф) ──
  var done = {};
  try { done = JSON.parse(LS.getItem('fl-uploaded') || '{}'); } catch (e) {}
  function dataToBlob(u) {
    var m = /^data:([^;]+);base64,(.*)$/.exec(u);
    var bin = atob(m[2]), a = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return new Blob([a], { type: m[1] });
  }
  function uploadOne(c, key, p) {
    var id = key + '/' + p.id;
    if (done[id]) return Promise.resolve(done[id]);
    var blob = dataToBlob(p.url);
    var ext = /png/.test(blob.type) ? 'png' : /webp/.test(blob.type) ? 'webp' : 'jpg';
    var path = key + '/' + p.id + '.' + ext;
    return fetch(base(c) + '/storage/v1/object/' + BUCKET + '/' + path, {
      method: 'POST', headers: heads(c, { 'Content-Type': blob.type, 'x-upsert': 'true' }), body: blob
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error('Хранилище: ' + r.status + ' ' + t.slice(0, 160)); });
      var url = base(c) + '/storage/v1/object/public/' + BUCKET + '/' + path;
      done[id] = url;
      try { LS.setItem('fl-uploaded', JSON.stringify(done)); } catch (e) {}
      return url;
    });
  }
  function publish(key, poolIn, stateIn) {
    var c = cfg();
    if (!c) return Promise.reject(new Error('База Supabase не подключена'));
    var poolP = poolIn ? Promise.resolve(poolIn) : idbAll().then(function (o) { return o[key] || (window.FL_CARD_PHOTOS || {})[key] || []; });
    return poolP.then(function (pool0) {
      var pool = (pool0 || []).slice(), changed = false, chain = Promise.resolve();
      var state = stateIn !== undefined ? stateIn : LS.getItem(key);
      pool.forEach(function (p, i) {
        if (!p || !p.url || !/^data:/.test(p.url)) return;
        chain = chain.then(function () { return uploadOne(c, key, p); }).then(function (url) {
          pool[i] = { id: p.id, name: p.name || '', url: url, hidden: !!p.hidden }; changed = true;
        });
      });
      return chain.then(function () {
        if (changed && !poolIn) idbPut(key, pool);
        return fetch(base(c) + '/rest/v1/card_media', {
          method: 'POST',
          headers: heads(c, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' }),
          body: JSON.stringify({ key: key, pool: pool, state: state, updated_at: new Date().toISOString() })
        }).then(function (res) {
          if (!res.ok) return res.text().then(function (t) { throw new Error('Таблица card_media: ' + res.status + ' ' + t.slice(0, 160)); });
          return pool;
        });
      });
    });
  }

  var timers = {};
  function later(key) {
    if (!window.FL_SYNC.ready) return;
    clearTimeout(timers[key]);
    timers[key] = setTimeout(function () {
      publish(key).then(function () { note('Фото сохранены в общую базу'); })
        .catch(function (e) { note('Не сохранено в общую базу: ' + e.message, true); });
    }, 1500);
  }
  var origSet = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    origSet.apply(this, arguments);
    if (this === LS && typeof k === 'string' && k.indexOf(PREFIX) === 0) later(k);
  };
  if (window.IDBObjectStore) {
    var origPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (val, key) {
      var r = origPut.apply(this, arguments);
      if (!writingOwn && this.name === 'pool' && typeof key === 'string' && key.indexOf(PREFIX) === 0 && Array.isArray(val) && val.some(function (p) { return p && /^data:/.test(p.url); })) later(key);
      return r;
    };
  }

  var tip;
  function note(text, bad) {
    if (!document.body) return;
    if (!tip) {
      tip = document.createElement('div');
      tip.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;padding:10px 16px;border-radius:12px;font:600 13px/1.4 sans-serif;box-shadow:0 6px 24px rgba(15,31,61,.18);max-width:90vw;';
      document.body.appendChild(tip);
    }
    tip.textContent = text;
    tip.style.background = bad ? '#FDECEA' : '#E8F5EE';
    tip.style.color = bad ? '#A12A1E' : '#1F7A4D';
    tip.style.display = 'block';
    clearTimeout(tip._t);
    tip._t = setTimeout(function () { tip.style.display = 'none'; }, bad ? 9000 : 3500);
  }

  window.FL_PUBLISH_ALL = function (onProgress) {
    return boot.then(idbAll).then(function (local) {
      var list = Object.keys(local).filter(function (k) { return k.indexOf(PREFIX) === 0; }), i = 0, photos = 0, errors = [];
      function next() {
        if (i >= list.length) return Promise.resolve({ cards: list.length, photos: photos, errors: errors });
        var k = list[i++];
        if (onProgress) onProgress(i, list.length, k);
        return publish(k, local[k] || [], LS.getItem(k)).then(function (np) { photos += np.length; })
          .catch(function (e) { errors.push(k.replace(PREFIX, '') + ': ' + e.message); }).then(next);
      }
      return next();
    });
  };
})();
