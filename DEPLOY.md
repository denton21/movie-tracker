# MovieTracker - Руководство по деплою на Vercel

## Требования

Перед деплоем убедитесь, что у вас есть:
1. **GitHub аккаунт** с репозиторием проекта
2. **Vercel аккаунт** (бесплатный на [vercel.com](https://vercel.com))
3. **Supabase проект** (если нет - создайте на [supabase.com](https://supabase.com))
4. **TMDB API ключ** (получите на [themoviedb.org](https://www.themoviedb.org/settings/api))

---

## Шаг 1: Подготовка репозитория

```bash
# В папке проекта выполните:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/movie-tracker.git
git push -u origin main
```

---

## Шаг 2: Деплой на Vercel

1. Перейдите на [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите **"Add New..."** → **"Project"**
3. Выберите репозиторий `movie-tracker`
4. В настройках добавьте **Environment Variables**:

| Переменная | Значение |
|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL вашего Supabase проекта |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key из Supabase |
| `TMDB_API_KEY` | Ваш API ключ от TMDB |

5. Нажмите **"Deploy"**

---

## Шаг 3: Настройка Supabase

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Выполните SQL из файла `supabase-setup.sql`
3. Добавьте колонку для друзей:
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS selected_friend_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
```

---

## Переменные окружения

Создайте файл `.env.local` для локальной разработки:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
TMDB_API_KEY=abc123...
```

---

## Готово!

После деплоя ваш сайт будет доступен по адресу:
`https://movie-tracker-xxx.vercel.app`

Вы можете настроить кастомный домен в настройках проекта на Vercel.
