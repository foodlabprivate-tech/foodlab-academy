// Фото профиля сотрудника.
// Пока человек не загрузил своё — показывается одна из картинок набора
// (еда и напитки), закреплённая за ним по id, чтобы не менялась при каждом входе.
// Загруженное фото уходит в бакет avatars общей базы и видно с любого устройства.
(function () {
  var SET = ['avocado', 'coffee', 'croissant', 'mango', 'chili', 'coconut'];

  var BG = {
    avocado: '#E8F3E6', coffee: '#F1E7DD', croissant: '#FBEFD8',
    mango: '#FDECDC', chili: '#FBE4E2', coconut: '#EDE8E2'
  };

  var SHAPE = {
    avocado:
      '<ellipse cx="32" cy="34" rx="15" ry="19" fill="#4E8C42"/>' +
      '<ellipse cx="32" cy="34" rx="10" ry="14" fill="#DCE9B8"/>' +
      '<circle cx="32" cy="37" r="6" fill="#8A5A2B"/>' +
      '<path d="M32 15c0-4 3-6 6-6-1 4-3 6-6 6z" fill="#3F7336"/>',
    coffee:
      '<path d="M18 22h24v14a12 12 0 0 1-24 0V22z" fill="#5B3A24"/>' +
      '<path d="M18 22h24v5H18z" fill="#F7F2EC"/>' +
      '<path d="M42 25h5a5 5 0 0 1 0 10h-5" fill="none" stroke="#5B3A24" stroke-width="3"/>' +
      '<path d="M26 14c2 2 0 4 2 6M34 13c2 2 0 4 2 6" fill="none" stroke="#B79B86" stroke-width="2.5" stroke-linecap="round"/>',
    croissant:
      '<path d="M14 40c0-14 9-23 22-23 4 0 8 1 11 4-6 0-11 3-11 8 0 4 3 6 7 7-5 2-8 5-8 9 0 3 2 5 5 6-10 2-26-1-26-11z" fill="#D89A3E"/>' +
      '<path d="M22 34c4-6 10-9 16-9M24 42c5-4 10-5 15-5" fill="none" stroke="#B57A26" stroke-width="2" stroke-linecap="round"/>',
    mango:
      '<path d="M40 18c7 4 9 14 5 22-4 8-13 12-19 8-6-4-6-14-2-22 4-8 9-12 16-8z" fill="#E8913A"/>' +
      '<path d="M40 18c-2-4 0-7 3-8 0 4-1 7-3 8z" fill="#4E8C42"/>' +
      '<path d="M30 28c4 2 7 7 7 13" fill="none" stroke="#F3BE7A" stroke-width="2.5" stroke-linecap="round"/>',
    chili:
      '<path d="M38 20c6 3 10 12 6 20-4 8-14 12-20 8 6-2 9-7 9-13 0-7-3-12-8-14 5-3 9-3 13-1z" fill="#C8352F"/>' +
      '<path d="M38 20c-1-4 1-6 4-7 1 3 0 6-2 7z" fill="#4E8C42"/>' +
      '<path d="M36 16h6" stroke="#4E8C42" stroke-width="3" stroke-linecap="round"/>',
    coconut:
      '<circle cx="32" cy="34" r="17" fill="#7A5335"/>' +
      '<circle cx="32" cy="34" r="11" fill="#F7F2EC"/>' +
      '<path d="M40 18l-6 12" stroke="#E05B4F" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="27" cy="31" r="2" fill="#D8CEC1"/><circle cx="36" cy="36" r="2" fill="#D8CEC1"/>'
  };

  function hash(text) {
    var h = 0, s = String(text || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100000;
    return h;
  }

  function pick(seed) { return SET[hash(seed) % SET.length]; }

  function svg(id, size) {
    var k = SHAPE[id] ? id : SET[0];
    var px = size || 64;
    return '<svg viewBox="0 0 64 64" width="' + px + '" height="' + px + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="64" height="64" rx="16" fill="' + BG[k] + '"/>' + SHAPE[k] + '</svg>';
  }

  function dataUrl(id, size) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg(id, size));
  }

  // Что показывать конкретному человеку: своё фото или закреплённую картинку
  function forUser(user) {
    if (!user) return dataUrl(SET[0]);
    var a = String(user.avatar || '');
    if (a.indexOf('http') === 0) return a;
    if (SHAPE[a]) return dataUrl(a);
    return dataUrl(pick(user.id || user.login || user.name));
  }

  function cfg() {
    var c = window.FL_DB && window.FL_DB.getConfig();
    if (c && c.mode === 'supabase' && c.url && c.key) return c;
    return null;
  }

  // Фото уменьшается до 320 px в браузере: в бакет уходит десяток килобайт,
  // а не снимок с телефона на 4 мегабайта.
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var side = Math.min(img.width, img.height);
        var c = document.createElement('canvas');
        c.width = c.height = 320;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 320, 320);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? resolve(b) : reject(new Error('Не получилось обработать фото')); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Это не картинка')); };
      img.src = url;
    });
  }

  async function upload(userId, file) {
    var c = cfg();
    if (!c) throw new Error('Общая база не подключена — фото сохранить некуда');
    var blob = await shrink(file);
    var base = c.url.replace(/\/+$/, '');
    var name = 'u-' + String(userId).replace(/[^a-zA-Z0-9-]/g, '') + '-' + Date.now() + '.jpg';
    var res = await fetch(base + '/storage/v1/object/avatars/' + name, {
      method: 'POST',
      headers: {
        apikey: c.key, Authorization: 'Bearer ' + c.key,
        'Content-Type': 'image/jpeg', 'x-upsert': 'true'
      },
      body: blob
    });
    if (!res.ok) {
      var t = await res.text();
      if (t.indexOf('row-level security') >= 0 || t.indexOf('Unauthorized') >= 0) {
        throw new Error('Хранилище не разрешает загрузку — выполните supabase-avatars.sql');
      }
      if (t.indexOf('Bucket not found') >= 0) {
        throw new Error('Бакет avatars не найден — создайте его в разделе Storage');
      }
      throw new Error('Загрузка не прошла: ' + res.status);
    }
    return base + '/storage/v1/object/public/avatars/' + name;
  }

  // Диалог выбора файла — общий для кабинета и админки
  function chooseFile() {
    return new Promise(function (resolve) {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = function () { resolve(input.files && input.files[0]); };
      input.click();
    });
  }

  window.FL_AVATARS = {
    SET: SET, svg: svg, dataUrl: dataUrl, pick: pick,
    forUser: forUser, upload: upload, chooseFile: chooseFile
  };
})();
