// Типы для приложения Movie Tracker

// Типы медиа из TMDB
export type MediaType = 'movie' | 'tv';

// Статусы просмотра
export type WatchStatus = 'completed' | 'watching' | 'dropped' | 'planned';

// Результат поиска TMDB
export interface TMDBSearchResult {
  id: number;
  media_type: MediaType;
  title?: string;        // для фильмов
  name?: string;         // для сериалов
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string; // для фильмов
  first_air_date?: string; // для сериалов
  vote_average: number;
  overview: string;
}

// Детали фильма из TMDB
export interface TMDBMovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  runtime: number;
  genres: { id: number; name: string }[];
}

// Детали сериала из TMDB
export interface TMDBTVDetails {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  seasons: TMDBSeason[];
}

// Сезон сериала
export interface TMDBSeason {
  id: number;
  season_number: number;
  episode_count: number;
  name: string;
  poster_path: string | null;
  air_date: string;
}

// Медиа в нашей базе данных
export interface Media {
  id: number;
  tmdb_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_year: number | null;
  vote_average: number | null;
  total_seasons: number | null;
  total_episodes: number | null;
  runtime: number | null;
  created_at: string;
}

// Профиль пользователя
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

// Связь пользователь-медиа
export interface UserMedia {
  id: number;
  user_id: string;
  media_id: number;
  status: WatchStatus;
  current_season: number;
  current_episode: number;
  user_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Полные данные UserMedia с профилем и медиа
export interface UserMediaWithDetails extends UserMedia {
  media: Media;
  profile?: Profile;
}

// Медиа с данными обоих пользователей для сравнения
export interface MediaComparison {
  media: Media;
  user1: UserMedia | null;
  user2: UserMedia | null;
}

// Статистика пользователя
export interface UserStats {
  totalItems: number;
  completed: number;
  watching: number;
  dropped: number;
  planned: number;
  totalEpisodesWatched: number;
  totalHoursWatched: number;
}

// Настройки отображения статусов
export const STATUS_CONFIG: Record<WatchStatus, { label: string; color: string; bgColor: string }> = {
  completed: {
    label: 'Просмотрено',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  watching: {
    label: 'Смотрю',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  dropped: {
    label: 'Брошено',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  planned: {
    label: 'В планах',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
};
