import { type ClassValue, clsx } from 'clsx';

/**
 * Объединяет классы CSS
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Форматирует продолжительность в часы и минуты
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
}

/**
 * Вычисляет общее время просмотра сериала
 */
export function calculateWatchTime(
    currentSeason: number,
    currentEpisode: number,
    episodeRuntime: number = 45
): number {
    // Примерная оценка: предполагаем 10 эпизодов в сезоне
    const episodesWatched = (currentSeason - 1) * 10 + currentEpisode;
    return episodesWatched * episodeRuntime;
}

/**
 * Вычисляет процент прогресса просмотра
 */
export function calculateProgress(
    currentSeason: number,
    currentEpisode: number,
    totalSeasons: number,
    totalEpisodes: number
): number {
    if (totalEpisodes === 0) return 0;

    // Примерная оценка текущего эпизода
    const episodesPerSeason = Math.ceil(totalEpisodes / totalSeasons);
    const currentTotal = (currentSeason - 1) * episodesPerSeason + currentEpisode;

    return Math.min(100, Math.round((currentTotal / totalEpisodes) * 100));
}

/**
 * Форматирует дату в читаемый вид
 */
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Дебаунс функция
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Склонение слов в зависимости от числа
 */
export function pluralize(
    count: number,
    one: string,
    few: string,
    many: string
): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod100 >= 11 && mod100 <= 14) {
        return many;
    }
    if (mod10 === 1) {
        return one;
    }
    if (mod10 >= 2 && mod10 <= 4) {
        return few;
    }
    return many;
}
