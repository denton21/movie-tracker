'use client';

import { useState } from 'react';
import { STATUS_CONFIG } from '@/types';
import type { WatchStatus, Media } from '@/types';

interface StatusSelectorProps {
    media: Media;
    initialStatus?: WatchStatus;
    initialSeason?: number;
    initialEpisode?: number;
    initialRating?: number | null;
    initialIsPrivate?: boolean;
    onSave: (status: WatchStatus, season: number, episode: number, rating: number | null, isPrivate: boolean) => Promise<void>;
    onCancel?: () => void;
}

export default function StatusSelector({
    media,
    initialStatus,
    initialSeason = 1,
    initialEpisode = 1,
    initialRating = null,
    initialIsPrivate = false,
    onSave,
    onCancel,
}: StatusSelectorProps) {
    const [status, setStatus] = useState<WatchStatus>(initialStatus || 'planned');
    const [season, setSeason] = useState(initialSeason);
    const [episode, setEpisode] = useState(initialEpisode);
    const [rating, setRating] = useState<number | null>(initialRating);
    const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isTVShow = media.media_type === 'tv';
    const showProgress = isTVShow && (status === 'watching' || status === 'dropped');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await onSave(status, season, episode, rating, isPrivate);
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            setError(err instanceof Error ? err.message : 'Не удалось сохранить. Попробуйте ещё раз.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Выбор статуса */}
            <div className="grid grid-cols-2 gap-3">
                {(Object.entries(STATUS_CONFIG) as [WatchStatus, typeof STATUS_CONFIG[WatchStatus]][]).map(
                    ([key, config]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => {
                                setStatus(key);
                                if (key === 'completed' && isTVShow) {
                                    setSeason(media.total_seasons || 1);
                                    setEpisode(Math.ceil((media.total_episodes || 10) / (media.total_seasons || 1)));
                                }
                            }}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 shadow-sm ${status === key
                                ? `${config.bgColor} border-current ${config.color} shadow-[0_0_15px_rgba(currentcolor,0.2)] transform scale-[1.02]`
                                : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200 hover:bg-white/10'
                                }`}
                        >
                            <span className="font-semibold tracking-wide uppercase text-sm">{config.label}</span>
                        </button>
                    )
                )}
            </div>

            {/* Прогресс для сериалов */}
            {showProgress && (
                <div className="space-y-4 p-5 glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <p className="text-slate-200 font-semibold text-lg relative z-10">Текущий прогресс</p>

                    <div className="grid grid-cols-2 gap-5 relative z-10">
                        {/* Сезон */}
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Сезон</label>
                            <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setSeason(Math.max(1, season - 1))}
                                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-slate-200 hover:bg-white/10 transition-colors font-medium text-lg active:scale-95"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={media.total_seasons || 99}
                                    value={season}
                                    onChange={(e) => setSeason(parseInt(e.target.value) || 0)}
                                    onBlur={() => setSeason(Math.max(1, season))}
                                    className="flex-1 px-2 py-2 bg-transparent text-slate-100 font-bold text-center text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSeason(Math.min(media.total_seasons || 99, season + 1))}
                                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-slate-200 hover:bg-white/10 transition-colors font-medium text-lg active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Эпизод */}
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Серия</label>
                            <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setEpisode(Math.max(1, episode - 1))}
                                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-slate-200 hover:bg-white/10 transition-colors font-medium text-lg active:scale-95"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={9999}
                                    value={episode}
                                    onChange={(e) => setEpisode(parseInt(e.target.value) || 0)}
                                    onBlur={() => setEpisode(Math.max(1, episode))}
                                    className="flex-1 px-2 py-2 bg-transparent text-slate-100 font-bold text-center text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setEpisode(episode + 1)}
                                    className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-slate-200 hover:bg-white/10 transition-colors font-medium text-lg active:scale-95"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Оценка (необязательно, для всех кроме "В планах") */}
            {status !== 'planned' && (
                <div className="space-y-4 p-5 glass-panel rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
                    <p className="text-slate-200 font-semibold text-lg relative z-10">
                        Ваша оценка <span className="text-slate-500 font-normal text-sm ml-2">(необязательно)</span>
                    </p>
                    <div className="flex gap-1.5 justify-center relative z-10 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(rating === value ? null : value)}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center border ${rating !== null && value <= rating
                                    ? 'bg-amber-500 text-amber-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transform scale-105'
                                    : 'bg-zinc-800/80 text-slate-400 border-white/5 hover:bg-zinc-700 hover:text-slate-200 hover:border-white/20'
                                    }`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Ошибка */}
            {error && (
                <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm shadow-inner flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            {/* Приватность */}
            <div className="flex items-center justify-between p-5 glass-panel rounded-2xl border border-white/10 hover:bg-white-[0.03] transition-colors group cursor-pointer" onClick={() => setIsPrivate(!isPrivate)}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isPrivate ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-400 group-hover:text-slate-300'}`}>
                        {isPrivate ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <span className="text-slate-200 font-medium block">Скрыть из профиля</span>
                        <span className="text-slate-500 text-xs mt-0.5 block">Только вы будете видеть этот медиафайл</span>
                    </div>
                </div>
                <button
                    type="button"
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 ${isPrivate ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                >
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${isPrivate ? 'translate-x-7' : ''}`} />
                </button>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3.5 px-4 bg-zinc-800/80 border border-white/5 text-slate-300 rounded-xl hover:bg-zinc-700 hover:text-white hover:border-white/10 transition-all font-medium active:scale-[0.98]"
                    >
                        Отмена
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-xl font-bold tracking-wide hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 ease-in-out hidden md:block"></div>
                    <span className="relative z-10">{isLoading ? 'Сохранение...' : 'Сохранить изменения'}</span>
                </button>
            </div>
        </form>
    );
}
