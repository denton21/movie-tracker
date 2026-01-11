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
                isPrivate
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                {/* Заголовок */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {media.title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Быстрый выбор статуса */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {(Object.entries(STATUS_CONFIG) as [WatchStatus, typeof STATUS_CONFIG[WatchStatus]][]).map(
                        ([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setStatus(key)}
                                className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${status === key
                                    ? `${config.bgColor} border-current ${config.color}`
                                    : 'border-white/10 text-white/60 hover:border-white/30'
                                    }`}
                            >
                                {config.label}
                            </button>
                        )
                    )}
                </div>

                {/* Быстрый выбор оценки (необязательно, для всех кроме "В планах") */}
                {status !== 'planned' && (
                    <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Оценка (необязательно)</p>
                        <div className="flex gap-1 justify-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                <button
                                    key={value}
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
                            <p className="text-center text-yellow-400 text-sm mt-2">
                                ⭐ {rating}/10
                            </p>
                        )}
                    </div>
                )}

                {/* Приватность */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl mb-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-white/80 text-sm">Скрыть</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${isPrivate ? 'bg-purple-500' : 'bg-white/20'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? '...' : 'Сохранить'}
                    </button>
                </div>
            </div>
        </div>
    );
}
