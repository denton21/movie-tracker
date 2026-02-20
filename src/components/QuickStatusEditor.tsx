'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToLibrary } from '@/actions/media';
import { STATUS_CONFIG } from '@/types';
import type { WatchStatus, Media, UserMedia } from '@/types';

interface QuickStatusEditorProps {
    media: Media;
    userMedia?: UserMedia | null;
    onClose: () => void;
}

export default function QuickStatusEditor({ media, userMedia, onClose }: QuickStatusEditorProps) {
    const router = useRouter();
    const [status, setStatus] = useState<WatchStatus>(userMedia?.status || 'planned');
    const [rating, setRating] = useState<number | null>(userMedia?.user_rating || null);
    const [isPrivate, setIsPrivate] = useState(userMedia?.is_private || false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Для сериалов используем текущий прогресс или значения по умолчанию
            const season = userMedia?.current_season || 1;
            const episode = userMedia?.current_episode || 1;

            // Если статус "completed" для сериала, устанавливаем max значения
            const finalSeason = status === 'completed' && media.media_type === 'tv'
                ? (media.total_seasons || 1)
                : season;
            const finalEpisode = status === 'completed' && media.media_type === 'tv'
                ? Math.ceil((media.total_episodes || 10) / (media.total_seasons || 1))
                : episode;

            await addToLibrary(
                media.tmdb_id,
                media.media_type,
                media.title,
                media.poster_path,
                media.backdrop_path,
                media.release_year,
                media.vote_average,
                media.total_seasons,
                media.total_episodes,
                media.runtime,
                status,
                finalSeason,
                finalEpisode,
                rating,
                isPrivate ? 1 : 0  // Передаём как number для надёжной сериализации
            );
            router.refresh();
            onClose();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="glass-panel border-white/10 rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                {/* Заголовок */}
                <div className="flex items-start justify-between mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-slate-100 line-clamp-2 leading-tight pr-4">
                        {media.title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors absolute -top-1 -right-1"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Быстрый выбор статуса */}
                <div className="grid grid-cols-2 gap-2 mb-5 relative z-10">
                    {(Object.entries(STATUS_CONFIG) as [WatchStatus, typeof STATUS_CONFIG[WatchStatus]][]).map(
                        ([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setStatus(key)}
                                className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold tracking-wide uppercase shadow-sm ${status === key
                                    ? `${config.bgColor} border-current ${config.color} shadow-[0_0_15px_rgba(currentcolor,0.2)] transform scale-[1.02]`
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200 hover:bg-white/10'
                                    }`}
                            >
                                {config.label}
                            </button>
                        )
                    )}
                </div>

                {/* Быстрый выбор оценки (необязательно, для всех кроме "В планах") */}
                {status !== 'planned' && (
                    <div className="mb-5 relative z-10 bg-black/20 p-4 rounded-2xl border border-white/5">
                        <p className="text-slate-300 font-medium text-sm mb-3 text-center">Оценка <span className="text-slate-500 font-normal text-xs">(необязательно)</span></p>
                        <div className="flex gap-1 justify-center flex-wrap">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                <button
                                    key={value}
                                    onClick={() => setRating(rating === value ? null : value)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center border ${rating !== null && value <= rating
                                        ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] transform scale-105'
                                        : 'bg-zinc-800/80 text-slate-400 border-white/5 hover:bg-zinc-700 hover:text-slate-200 hover:border-white/20'
                                        }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Приватность */}
                <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl mb-5 hover:bg-white-[0.03] transition-colors group cursor-pointer relative z-10" onClick={() => setIsPrivate(!isPrivate)}>
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg transition-colors ${isPrivate ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 group-hover:text-slate-300'}`}>
                            {isPrivate ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <span className="text-slate-200 font-medium text-sm block">Скрыть</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isPrivate ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                    >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${isPrivate ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                {/* Кнопки */}
                <div className="flex gap-3 relative z-10">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-zinc-800/80 border border-white/5 text-slate-300 rounded-xl hover:bg-zinc-700 hover:text-white hover:border-white/10 transition-all font-medium active:scale-[0.98]"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-xl font-bold tracking-wide hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
                    >
                        {isLoading ? '...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
}
