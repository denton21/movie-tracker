-- =====================================================
-- Movie Tracker - Добавление таблицы друзей
-- Выполните в Supabase SQL Editor
-- =====================================================

-- 4. Таблица друзей (односторонняя связь, без подтверждения)
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS friends_user_id_idx ON friends(user_id);
CREATE INDEX IF NOT EXISTS friends_friend_id_idx ON friends(friend_id);

-- RLS для friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Каждый видит только своих друзей
CREATE POLICY "Users can view their own friends"
  ON friends FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Каждый может добавлять своих друзей
CREATE POLICY "Users can insert their own friends"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Каждый может удалять своих друзей
CREATE POLICY "Users can delete their own friends"
  ON friends FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Добавляем is_private в user_media если нет
ALTER TABLE user_media ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE;
