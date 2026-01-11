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
                            className={`p-4 rounded-xl border-2 transition-all ${status === key
                                ? `${config.bgColor} border-current ${config.color}`
                                : 'border-white/10 text-white/60 hover:border-white/30'
                                }`}
                        >
                            <span className="font-medium">{config.label}</span>
                        </button>
                    )
                )}
            </div>

            {/* Прогресс для сериалов */}
            {showProgress && (
                <div className="space-y-4 p-4 bg-white/5 rounded-xl">
                    <p className="text-white/80 font-medium">Текущий прогресс</p>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Сезон */}
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Сезон</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSeason(Math.max(1, season - 1))}
                                    className="w-10 h-10 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
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
                                    className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSeason(Math.min(media.total_seasons || 99, season + 1))}
                                    className="w-10 h-10 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Эпизод */}
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Серия</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEpisode(Math.max(1, episode - 1))}
                                    className="w-10 h-10 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
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
                                    className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setEpisode(episode + 1)}
                                    className="w-10 h-10 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
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
                <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    <p className="text-white/80 font-medium">Ваша оценка <span className="text-white/40 font-normal">(необязательно)</span></p>
                    <div className="flex gap-1 justify-center">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setRating(rating === value ? null : value)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${rating !== null && value <= rating
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                    {rating && (
                        <p className="text-center text-yellow-400 text-sm">
                            ⭐ {rating}/10
                        </p>
                    )}
                </div>
            )}

            {/* Ошибка */}
            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Приватность */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-white/80">Скрыть от друзей</span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        console.log('Toggle clicked, current isPrivate:', isPrivate, '-> setting to:', !isPrivate);
                        setIsPrivate(!isPrivate);
                    }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isPrivate ? 'bg-purple-500' : 'bg-white/20'}`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : ''}`} />
                </button>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                        Отмена
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}
