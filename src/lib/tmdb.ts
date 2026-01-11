// TMDB API клиент

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

import type {
    TMDBSearchResult,
    TMDBMovieDetails,
    TMDBTVDetails,
    MediaType
} from '@/types';

/**
 * Поиск фильмов и сериалов в TMDB
 */
export async function searchMedia(query: string): Promise<TMDBSearchResult[]> {
    if (!query.trim()) return [];

    const response = await fetch(
        `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=ru-RU&include_adult=false`,
        { next: { revalidate: 60 } }
    );

    if (!response.ok) {
        throw new Error('Ошибка поиска TMDB');
    }

    const data = await response.json();

    // Фильтруем только фильмы и сериалы
    return data.results.filter(
        (item: TMDBSearchResult) => item.media_type === 'movie' || item.media_type === 'tv'
    );
}

/**
 * Получить детали фильма по ID
 */
export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
    const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=ru-RU`,
        { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
        throw new Error('Ошибка получения данных фильма');
    }

    return response.json();
}

/**
 * Получить детали сериала по ID
 */
export async function getTVDetails(id: number): Promise<TMDBTVDetails> {
    const response = await fetch(
        `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=ru-RU`,
        { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
        throw new Error('Ошибка получения данных сериала');
    }

    return response.json();
}

/**
 * Получить детали медиа по типу
 */
export async function getMediaDetails(id: number, mediaType: MediaType) {
    if (mediaType === 'movie') {
        return getMovieDetails(id);
    }
    return getTVDetails(id);
}

/**
 * Размеры изображений TMDB
 */
export type ImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';

/**
 * Получить полный URL изображения
 */
export function getImageUrl(path: string | null | undefined, size: ImageSize = 'w500'): string {
    if (!path || path.trim() === '') {
        return '/placeholder-poster.svg';
    }
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Получить URL фона
 */
export function getBackdropUrl(path: string | null, size: BackdropSize = 'w1280'): string {
    if (!path) {
        return '/placeholder-backdrop.svg';
    }
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Получить название медиа (для фильмов - title, для сериалов - name)
 */
export function getMediaTitle(item: TMDBSearchResult): string {
    return item.title || item.name || 'Без названия';
}

/**
 * Получить год выхода
 */
export function getMediaYear(item: TMDBSearchResult): number | null {
    const date = item.release_date || item.first_air_date;
    if (!date) return null;
    return new Date(date).getFullYear();
}
