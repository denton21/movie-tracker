'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getImageUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb';
import { getMediaDetailsAction } from '@/actions/tmdb';
import { addToLibrary } from '@/actions/media';
import type { TMDBSearchResult, TMDBMovieDetails, TMDBTVDetails, WatchStatus } from '@/types';
import StatusSelector from '@/components/StatusSelector';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<TMDBSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<TMDBSearchResult | null>(null);
    const [mediaDetails, setMediaDetails] = useState<TMDBMovieDetails | TMDBTVDetails | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Поиск при изменении query
    useEffect(() => {
        if (query.trim().length >= 2) {
            setIsLoading(true);
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    setResults(data.results || []);
                })
                .catch(err => {
                    console.error('Ошибка поиска:', err);
                    setResults([]);
                })
                .finally(() => setIsLoading(false));
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSelect = async (item: TMDBSearchResult) => {
        setSelectedMedia(item);
        setIsModalLoading(true);
        try {
            const details = await getMediaDetailsAction(item.id, item.media_type);
            setMediaDetails(details);
            setShowModal(true);
        } catch (error) {
            console.error('Ошибка загрузки деталей:', error);
            // Можно добавить toast уведомление здесь
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleSave = async (status: WatchStatus, season: number, episode: number, rating: number | null, isPrivate: boolean) => {
        if (!selectedMedia || !mediaDetails) return;

        const title = getMediaTitle(selectedMedia);
        const year = getMediaYear(selectedMedia);

        const isTV = selectedMedia.media_type === 'tv';
        const tvDetails = mediaDetails as TMDBTVDetails;

        await addToLibrary(
            selectedMedia.id,
            selectedMedia.media_type,
            title,
            selectedMedia.poster_path,
            selectedMedia.backdrop_path,
            year,
            selectedMedia.vote_average,
            isTV ? tvDetails.number_of_seasons : null,
            isTV ? tvDetails.number_of_episodes : null,
            isTV ? (tvDetails.episode_run_time?.[0] || 45) : (mediaDetails as TMDBMovieDetails).runtime,
            status,
            season,
            episode,
            rating,
            isPrivate ? 1 : 0
        );

        // НЕ редиректим — просто закрываем модалку
        setShowModal(false);
        setSelectedMedia(null);
        setMediaDetails(null);
    };

    return (
        <div className="min-h-screen py-8 px-4">
            {/* Индикатор загрузки модального окна */}
            {isModalLoading && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Результаты поиска
                    </h1>
                    {query && (
                        <p className="text-white/60">
                            По запросу &quot;{query}&quot; найдено {results.length} результатов
                        </p>
                    )}
                </div>

                {/* Поле поиска */}
                <SearchInput initialQuery={query} />

                {/* Контент */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {results.map((item) => (
                            <div
                                key={`${item.media_type}-${item.id}`}
                                onClick={() => handleSelect(item)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                                    <Image
                                        src={getImageUrl(item.poster_path, 'w342')}
                                        alt={getMediaTitle(item)}
                                        fill
                                        unoptimized
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Тип контента */}
                                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-medium ${item.media_type === 'movie'
                                            ? 'bg-blue-500/80 text-white'
                                            : 'bg-purple-500/80 text-white'
                                        }`}>
                                        {item.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                                    </div>

                                    {/* Рейтинг */}
                                    {item.vote_average > 0 && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-sm">
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-white">{item.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}

                                    {/* Кнопка добавления */}
                                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors">
                                            Добавить
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <h3 className="text-white font-medium text-sm line-clamp-2">
                                        {getMediaTitle(item)}
                                    </h3>
                                    <p className="text-white/50 text-xs mt-1">
                                        {getMediaYear(item)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Ничего не найдено
                        </h2>
                        <p className="text-white/60">
                            Попробуйте изменить запрос
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🎬</div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Введите название
                        </h2>
                        <p className="text-white/60">
                            Начните вводить название фильма или сериала
                        </p>
                    </div>
                )}
            </div>

            {/* Модальное окно */}
            {showModal && selectedMedia && mediaDetails && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-md w-full overflow-hidden">
                        <div className="relative h-32">
                            <Image
                                src={getImageUrl(selectedMedia.backdrop_path || selectedMedia.poster_path, 'w780')}
                                alt=""
                                fill
                                unoptimized
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 -mt-8 relative">
                            <h2 className="text-xl font-bold text-white mb-1">
                                {getMediaTitle(selectedMedia)}
                            </h2>
                            <p className="text-white/60 text-sm mb-4">
                                {getMediaYear(selectedMedia)} • {selectedMedia.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                            </p>

                            <StatusSelector
                                media={{
                                    id: selectedMedia.id, // Временный ID для типа
                                    tmdb_id: selectedMedia.id,
                                    media_type: selectedMedia.media_type,
                                    title: getMediaTitle(selectedMedia),
                                    poster_path: selectedMedia.poster_path,
                                    backdrop_path: selectedMedia.backdrop_path,
                                    release_year: getMediaYear(selectedMedia),
                                    vote_average: selectedMedia.vote_average,
                                    total_seasons: selectedMedia.media_type === 'tv' ? (mediaDetails as TMDBTVDetails).number_of_seasons : null,
                                    total_episodes: selectedMedia.media_type === 'tv' ? (mediaDetails as TMDBTVDetails).number_of_episodes : null,
                                    runtime: selectedMedia.media_type === 'movie' ? (mediaDetails as TMDBMovieDetails).runtime : (mediaDetails as TMDBTVDetails).episode_run_time?.[0] || null,
                                    created_at: new Date().toISOString()
                                }}
                                onSave={handleSave}
                                onCancel={() => setShowModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen py-8 px-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

// Компонент поиска на странице
function SearchInput({ initialQuery }: { initialQuery: string }) {
    const [value, setValue] = useState(initialQuery);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(value.trim())}`;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative max-w-2xl mx-auto">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Поиск фильмов и сериалов..."
                    className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                >
                    Искать
                </button>
            </div>
        </form>
    );
}
