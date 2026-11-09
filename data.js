(function () {
// Слой данных академии.
// Работает в двух режимах:
//   local    — всё в localStorage этого браузера (по умолчанию, без настройки);
//   supabase — REST-запросы к вашему проекту Supabase, данные видны со всех устройств.
// Режим переключается вводом URL и anon-ключа в админке (Настройки → База данных).
// Схема таблиц лежит в supabase-schema.sql.

const CFG_KEY = 'foodlab-db-config';
const LS = {
  users: 'foodlab-users',
  results: 'foodlab-results',
  settings: 'foodlab-settings',
  questions: 'foodlab-questions',
  session: 'foodlab-session'
};

const DEFAULT_SETTINGS = {
  threshold: 80,
  instantFeedback: true,
  retakeDays: 90,
  quota: { bf: 3, bfv: 2, hyg: 3, pizza: 3, pasta: 2, coffee: 2, agg: 3, sop: 3, oos: 3, wo: 3 }
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

// Настройка базы сначала берётся из db-config.js рядом с сайтом — так общая
// база работает у всех сотрудников сразу, без ручного ввода на каждом устройстве.
// Значения, введённые в админке на этом устройстве, имеют приоритет.
function getConfig() {
  const local = read(CFG_KEY, null);
  if (local && local.mode === 'supabase' && local.url && local.key) return local;
  // Локальный режим перебивает preset только если админ выбрал его осознанно
  // (кнопка «Отключить базу» ставит pinned). Иначе сотрудник, у которого в
  // браузере когда-то осел локальный режим, не нашёл бы ни кодов, ни результатов.
  if (local && local.mode === 'local' && local.pinned) return local;
  const preset = window.FL_DB_PRESET;
  if (preset && preset.url && preset.key) {
    return { mode: 'supabase', url: preset.url, key: preset.key };
  }
  return local || { mode: 'local', url: '', key: '' };
}

function setConfig(cfg) {
  write(CFG_KEY, cfg);
}

function isRemote() {
  const c = getConfig();
  return c.mode === 'supabase' && !!c.url && !!c.key;
}

async function rest(path, options) {
  const c = getConfig();
  const base = c.url.trim().replace(/\/rest\/v1.*$/, '').replace(/\/+$/, '');
  let res;
  try {
  res = await fetch(base + '/rest/v1/' + path, Object.assign({
    headers: {
      apikey: c.key,
      Authorization: 'Bearer ' + c.key,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }
  }, options || {}));
  } catch (e) {
    throw new Error('Нет связи с базой Supabase (' + base + '). Проверьте: 1) проект в Supabase не на паузе (Dashboard → Restore project); 2) адрес в Настройках вида https://xxxx.supabase.co; 3) сеть/VPN — провайдер может блокировать supabase.co.');
  }
  if (!res.ok) {
    const raw = await res.text();
    let msg = raw;
    try { const j = JSON.parse(raw); msg = j.message || j.hint || raw; } catch (e) {}
    if (res.status === 409 || /duplicate key|23505/.test(raw)) throw new Error('Такой логин уже есть — придумайте другой');
    if (/column .* does not exist|Could not find the '(\w+)' column/i.test(raw)) throw new Error('В базе не хватает колонки. Выполните заново supabase-schema.sql в Supabase (SQL Editor). ' + msg);
    if (res.status === 401 || res.status === 403) throw new Error('База не пустила запрос: проверьте anon-ключ и политики в Supabase');
    throw new Error('База ответила ' + res.status + ': ' + String(msg).slice(0, 200));
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function testConnection() {
  await rest('app_users?select=id&limit=1');
  return true;
}

// ── Пароли ────────────────────────────────────────────────────────────────
// Хэш вместо открытого пароля: в базе пароли не лежат в читаемом виде.
async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('foodlab:' + text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Сотрудники ────────────────────────────────────────────────────────────
async function listUsers() {
  if (isRemote()) return await rest('app_users?select=*&order=name');
  return read(LS.users, []);
}

async function saveUser(user) {
  if (!user.id && user.login) {
    const same = await findUser(user.login);
    if (same) throw new Error('Логин «' + user.login + '» уже занят (' + same.name + ')');
  }
  if (isRemote()) {
    if (user.id) return (await rest('app_users?id=eq.' + user.id, { method: 'PATCH', body: JSON.stringify(user) }))[0];
    return (await rest('app_users', { method: 'POST', body: JSON.stringify(user) }))[0];
  }
  const users = read(LS.users, []);
  if (user.id) {
    const i = users.findIndex(u => u.id === user.id);
    if (i >= 0) users[i] = Object.assign({}, users[i], user);
  } else {
    user.id = 'u' + Date.now() + Math.floor(Math.random() * 1000);
    users.push(user);
  }
  write(LS.users, users);
  return user;
}

async function deleteUser(id) {
  if (isRemote()) return await rest('app_users?id=eq.' + id, { method: 'DELETE' });
  write(LS.users, read(LS.users, []).filter(u => u.id !== id));
}

async function findUser(login) {
  const users = await listUsers();
  const l = String(login).trim().toLowerCase();
  return users.find(u => String(u.login || '').toLowerCase() === l) || null;
}

// Первый запуск: заводим админа и тестового повара, чтобы было чем войти
// и чем проверить сотрудничий режим. Оба пароля меняются в админке.
async function ensureAdmin() {
  // Проверяем каждый демо-аккаунт отдельно: база могла быть заведена раньше,
  // чем в список добавили второго пользователя
  if (!(await findUser('admin'))) {
    await saveUser({
      login: 'admin', name: 'Администратор', role: 'admin',
      position: 'Администратор', pass: await hash('admin'), active: true, invite: ''
    });
  }
  if (!(await findUser('povar'))) {
    await saveUser({
      login: 'povar', name: 'Повар Тестовый', role: 'employee',
      position: '', pass: await hash('povar'), active: true, invite: ''
    });
  }
}

// ── Коды приглашения ───────────────────────────────────────────────────────
// Сотрудник заводится без пароля: администратор отдаёт ему одноразовый код,
// по коду человек сам задаёт себе пароль при первом входе.
const INVITE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без похожих символов

function genInvite() {
  let s = '';
  for (let i = 0; i < 6; i++) s += INVITE_ABC[Math.floor(Math.random() * INVITE_ABC.length)];
  return s;
}

async function findByInvite(code) {
  const c = String(code).trim().toUpperCase();
  if (!c) return null;
  const users = await listUsers();
  return users.find(u => String(u.invite || '').toUpperCase() === c) || null;
}

// Активация: код обменивается на пароль и сгорает
async function activate(code, password) {
  const user = await findByInvite(code);
  if (!user) {
    const users = await listUsers();
    const anyCode = users.some(u => String(u.invite || '').trim());
    if (!anyCode) return { error: 'Активных кодов в базе нет — попросите администратора выдать код' };
    return { error: 'Код не найден' };
  }
  if (user.active === false) return { error: 'Доступ отключён' };
  if (!password || password.length < 4) return { error: 'Пароль короче 4 символов' };
  const pass = await hash(password);
  await saveUser({ id: user.id, name: user.name, login: user.login, role: user.role, position: user.position, pass: pass, invite: '' });
  const s = { id: user.id, login: user.login, name: user.name, role: user.role, position: user.position, avatar: user.avatar || '' };
  setSession(s);
  return { user: s };
}

// ── Сессия ────────────────────────────────────────────────────────────────
function session() { return read(LS.session, null); }
function setSession(s) { write(LS.session, s); }
function clearSession() { try { localStorage.removeItem(LS.session); } catch (e) {} }

async function login(loginName, password) {
  await ensureAdmin();
  const user = await findUser(loginName);
  if (!user) return { error: 'Пользователь не найден' };
  if (user.active === false) return { error: 'Доступ отключён' };
  if (user.pass !== await hash(password)) return { error: 'Неверный пароль' };
  const s = { id: user.id, login: user.login, name: user.name, role: user.role, position: user.position, avatar: user.avatar || '' };
  setSession(s);
  return { user: s };
}

// ── Результаты ────────────────────────────────────────────────────────────
async function listResults() {
  if (isRemote()) return await rest('test_results?select=*&order=created_at.desc');
  return read(LS.results, []).slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

async function saveResult(result) {
  const row = Object.assign({ created_at: new Date().toISOString() }, result);
  if (isRemote()) return (await rest('test_results', { method: 'POST', body: JSON.stringify(row) }))[0];
  const list = read(LS.results, []);
  row.id = 'r' + Date.now() + Math.floor(Math.random() * 1000);
  list.push(row);
  write(LS.results, list);
  return row;
}

async function deleteResult(id) {
  if (isRemote()) return await rest('test_results?id=eq.' + id, { method: 'DELETE' });
  write(LS.results, read(LS.results, []).filter(r => r.id !== id));
}

// ── Настройки теста ───────────────────────────────────────────────────────
async function getSettings() {
  if (isRemote()) {
    const rows = await rest('app_settings?select=*&id=eq.1');
    if (rows && rows[0] && rows[0].data) return Object.assign({}, DEFAULT_SETTINGS, rows[0].data);
    return Object.assign({}, DEFAULT_SETTINGS);
  }
  return Object.assign({}, DEFAULT_SETTINGS, read(LS.settings, {}));
}

async function saveSettings(settings) {
  if (isRemote()) {
    return await rest('app_settings?on_conflict=id', {
      method: 'POST',
      headers: {
        apikey: getConfig().key,
        Authorization: 'Bearer ' + getConfig().key,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({ id: 1, data: settings })
    });
  }
  write(LS.settings, settings);
  return settings;
}

// ── Правки вопросов из админки ────────────────────────────────────────────
// Базовый банк живёт в коде теста; здесь только изменения:
// { edited: {id: {...}}, added: [...], removed: [id] }
async function getQuestionPatch() {
  if (isRemote()) {
    const rows = await rest('app_questions?select=*&id=eq.1');
    if (rows && rows[0] && rows[0].data) return rows[0].data;
    return { edited: {}, added: [], removed: [] };
  }
  return read(LS.questions, { edited: {}, added: [], removed: [] });
}

async function saveQuestionPatch(patch) {
  if (isRemote()) {
    return await rest('app_questions?on_conflict=id', {
      method: 'POST',
      headers: {
        apikey: getConfig().key,
        Authorization: 'Bearer ' + getConfig().key,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify({ id: 1, data: patch })
    });
  }
  write(LS.questions, patch);
  return patch;
}

const ROLES = { employee: 'Сотрудник', sous: 'Су-шеф', admin: 'Администратор' };
const LOCATIONS = ['Убуд', 'Чангу', 'Улувату'];
const POSITIONS = ['Шеф-повар', 'Повар-стажёр', 'Повар', 'Line Cook', 'Су-шеф', 'Кассир', 'Официант', 'Менеджер', 'HR-менеджер'];
// Кто видит папку HR-менеджера: админы, су-шефы, шеф-повар и HR
function canSeeHr(u) {
  return !!u && (u.role === 'admin' || u.role === 'sous' || ['Шеф-повар', 'Су-шеф', 'HR-менеджер'].indexOf(u.position) >= 0);
}

window.FL_DB = {
  getConfig: getConfig, setConfig: setConfig, isRemote: isRemote, testConnection: testConnection,
  hash: hash, listUsers: listUsers, saveUser: saveUser, deleteUser: deleteUser, findUser: findUser,
  ensureAdmin: ensureAdmin, session: session, setSession: setSession, clearSession: clearSession,
  login: login, genInvite: genInvite, findByInvite: findByInvite, activate: activate,
  listResults: listResults, saveResult: saveResult, deleteResult: deleteResult,
  getSettings: getSettings, saveSettings: saveSettings,
  getQuestionPatch: getQuestionPatch, saveQuestionPatch: saveQuestionPatch,
  ROLES: ROLES, POSITIONS: POSITIONS, LOCATIONS: LOCATIONS, canSeeHr: canSeeHr, DEFAULT_SETTINGS: DEFAULT_SETTINGS
};
})();
