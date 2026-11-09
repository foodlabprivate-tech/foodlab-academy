-- Схема для Supabase. Выполните целиком в SQL Editor вашего проекта.
-- После этого в админке (Настройки → База данных) введите Project URL и anon public key.

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  login text unique not null,
  name text not null,
  role text not null default 'employee',   -- employee | sous | admin
  position text,
  pass text default '',                    -- SHA-256 хэш, не открытый пароль
  invite text default '',                  -- одноразовый код приглашения
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Для баз, созданных раньше: недостающие колонки
alter table app_users add column if not exists avatar text default '';
alter table app_users add column if not exists position text;
alter table app_users add column if not exists location text default '';
alter table app_users add column if not exists invite text default '';
alter table app_users add column if not exists active boolean not null default true;

create table if not exists test_results (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  name text,
  position text,
  variant int,
  total int,
  correct int,
  percent int,
  passed boolean,
  topics jsonb,        -- {тема: {asked, correct}}
  wrong jsonb,         -- [{q, topic, your, right}]
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  id int primary key,
  data jsonb not null default '{}'
);

create table if not exists app_questions (
  id int primary key,
  data jsonb not null default '{}'
);

-- Фото тех.карт: общая таблица + публичное хранилище файлов
create table if not exists card_media (
  key text primary key,
  pool jsonb not null default '[]',
  state text,
  updated_at timestamptz not null default now()
);
alter table card_media enable row level security;
drop policy if exists "anon all card_media" on card_media;
create policy "anon all card_media" on card_media for all using (true) with check (true);

insert into storage.buckets (id, name, public) values ('card-photos', 'card-photos', true)
on conflict (id) do update set public = true;
drop policy if exists "card-photos read" on storage.objects;
create policy "card-photos read" on storage.objects for select using (bucket_id = 'card-photos');
drop policy if exists "card-photos insert" on storage.objects;
create policy "card-photos insert" on storage.objects for insert with check (bucket_id = 'card-photos');
drop policy if exists "card-photos update" on storage.objects;
create policy "card-photos update" on storage.objects for update using (bucket_id = 'card-photos');

-- Доступ с сайта идёт под anon-ключом, поэтому политики открыты на чтение и запись.
-- Сайт внутренний; если нужно строже — включите Supabase Auth и ограничьте политики по ролям.
alter table app_users enable row level security;
alter table test_results enable row level security;
alter table app_settings enable row level security;
alter table app_questions enable row level security;

drop policy if exists "anon all app_users" on app_users;
drop policy if exists "anon all test_results" on test_results;
drop policy if exists "anon all app_settings" on app_settings;
drop policy if exists "anon all app_questions" on app_questions;
create policy "anon all app_users" on app_users for all using (true) with check (true);
create policy "anon all test_results" on test_results for all using (true) with check (true);
create policy "anon all app_settings" on app_settings for all using (true) with check (true);
create policy "anon all app_questions" on app_questions for all using (true) with check (true);
