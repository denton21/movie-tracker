-- =====================================================
-- Movie Tracker - Скрипт создания таблиц Supabase
-- =====================================================
-- Выполните этот скрипт в Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query
-- =====================================================

-- 1. Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  selected_friend_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица медиа контента (кэш данных из TMDB)
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  release_year INTEGER,
  vote_average DECIMAL(3,1),
  total_seasons INTEGER,
  total_episodes INTEGER,
  runtime INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tmdb_id, media_type)
);

-- 3. Таблица связи пользователь-медиа
CREATE TABLE IF NOT EXISTS user_media (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_id INTEGER REFERENCES media(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'watching', 'dropped', 'planned')),
  current_season INTEGER DEFAULT 1,
  current_episode INTEGER DEFAULT 1,
  user_rating DECIMAL(2,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, media_id)
);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Включаем RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Политики для media (все могут читать и добавлять)
CREATE POLICY "Media is viewable by authenticated users"
  ON media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert media"
  ON media FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Политики для user_media
CREATE POLICY "User media is viewable by authenticated users"
  ON user_media FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own user_media"
  ON user_media FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_media"
  ON user_media FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_media"
  ON user_media FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- Триггер для автоматического создания профиля
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаём триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Готово! Теперь можно использовать приложение
-- =====================================================
