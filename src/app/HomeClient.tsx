'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import StatusSelector from '@/components/StatusSelector';
import { addToLibrary } from '@/actions/media';
import { getImageUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb';
import type { TMDBSearchResult, WatchStatus, TMDBMovieDetails, TMDBTVDetails } from '@/types';
import Image from 'next/image';

export default function HomeClient() {
    const router = useRouter();
    const [selectedMedia, setSelectedMedia] = useState<TMDBSearchResult | null>(null);
    const [mediaDetails, setMediaDetails] = useState<TMDBMovieDetails | TMDBTVDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelect = async (item: TMDBSearchResult) => {
        setSelectedMedia(item);
        setIsLoading(true);

        try {
            const response = await fetch(`/api/media/${item.media_type}-${item.id}`);
            const details = await response.json();
            setMediaDetails(details);
            setShowModal(true);
        } catch (error) {
            console.error('Ошибка загрузки деталей:', error);
        } finally {
            setIsLoading(false);
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

        setShowModal(false);
        setSelectedMedia(null);
        setMediaDetails(null);
    };

    return (
        <div className="min-h-screen flex flex-col pt-16 pb-10">
            {/* Hero секция с динамичным фоном */}
            <section className="relative flex-1 flex flex-col justify-center items-center px-4 py-20 overflow-hidden">
                {/* Декоративные круги */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative max-w-4xl mx-auto text-center z-10 w-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        Отслеживайте фильмы и сериалы
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight animate-fade-in-up">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400">Movie</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-500">Tracker</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-[100ms] leading-relaxed">
                        Делитесь впечатлениями с друзьями. <br className="hidden md:block" />
                        Соревнуйтесь, кто посмотрит больше!
                    </p>

                    {/* Поиск */}
                    <div className="animate-fade-in-up delay-[200ms] max-w-2xl mx-auto w-full relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative">
                            <SearchBar onSelect={handleSelect} onQueryChange={setSearchQuery} />
                        </div>
                    </div>

                    {/* Подсказка */}
                    {!searchQuery && (
                        <p className="mt-8 text-slate-500 text-sm animate-fade-in-up delay-[300ms] select-none pointer-events-none tracking-wide">
                            Поиск по базе данных TMDB
                        </p>
                    )}
                </div>
            </section>

            {/* Модальное окно добавления */}
            {showModal && selectedMedia && (
                <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="glass-panel border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 shadow-2xl custom-scrollbar relative">
                        {/* Шапка с постером */}
                        <div className="relative h-56 overflow-hidden sm:rounded-t-3xl">
                            <Image
                                src={getImageUrl(selectedMedia.backdrop_path || selectedMedia.poster_path, 'w780')}
                                alt={getMediaTitle(selectedMedia)}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />

                            {/* Кнопка закрытия */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all border border-white/10"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Информация внизу */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-zinc-900 to-transparent">
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                                    {getMediaTitle(selectedMedia)}
                                </h2>
                                <div className="flex flex-wrap items-center gap-2 text-slate-300 text-sm font-medium">
                                    <span className={`px-2.5 py-1 rounded-md text-xs uppercase tracking-wider ${selectedMedia.media_type === 'movie'
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/20'
                                        }`}>
                                        {selectedMedia.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                                    </span>
                                    {getMediaYear(selectedMedia) && (
                                        <span className="flex items-center gap-1.5 before:content-['•'] before:text-slate-600 before:mr-1.5 opacity-80">
                                            {getMediaYear(selectedMedia)}
                                        </span>
                                    )}
                                    {selectedMedia.vote_average > 0 && (
                                        <span className="flex items-center gap-1.5 before:content-['•'] before:text-slate-600 before:mr-1.5 text-amber-400">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {selectedMedia.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Контент */}
                        <div className="p-6">
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                                </div>
                            ) : mediaDetails ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <StatusSelector
                                        media={{
                                            id: 0,
                                            tmdb_id: selectedMedia.id,
                                            media_type: selectedMedia.media_type,
                                            title: getMediaTitle(selectedMedia),
                                            poster_path: selectedMedia.poster_path,
                                            backdrop_path: selectedMedia.backdrop_path,
                                            release_year: getMediaYear(selectedMedia),
                                            vote_average: selectedMedia.vote_average,
                                            total_seasons: selectedMedia.media_type === 'tv'
                                                ? (mediaDetails as TMDBTVDetails).number_of_seasons
                                                : null,
                                            total_episodes: selectedMedia.media_type === 'tv'
                                                ? (mediaDetails as TMDBTVDetails).number_of_episodes
                                                : null,
                                            runtime: selectedMedia.media_type === 'movie'
                                                ? (mediaDetails as TMDBMovieDetails).runtime
                                                : (mediaDetails as TMDBTVDetails).episode_run_time?.[0] || 45,
                                            created_at: new Date().toISOString(),
                                        }}
                                        onSave={handleSave}
                                        onCancel={() => setShowModal(false)}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
