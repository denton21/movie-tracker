'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToLibrary, updateWatchStatus, removeFromLibrary } from '@/actions/media';
import StatusSelector from '@/components/StatusSelector';
import { STATUS_CONFIG } from '@/types';
import type { MediaType, WatchStatus } from '@/types';

interface MediaActionsProps {
    tmdbId: number;
    mediaType: MediaType;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseYear: number;
    voteAverage: number;
    totalSeasons: number | null;
    totalEpisodes: number | null;
    runtime: number;
    currentUserMedia?: {
        id?: number;
        status: WatchStatus;
        current_season: number;
        current_episode: number;
        user_rating?: number | null;
    } | null;
}

export default function MediaActions({
    tmdbId,
    mediaType,
    title,
    posterPath,
    backdropPath,
    releaseYear,
    voteAverage,
    totalSeasons,
    totalEpisodes,
    runtime,
    currentUserMedia,
}: MediaActionsProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (status: WatchStatus, season: number, episode: number, rating: number | null) => {
        setIsLoading(true);
        try {
            await addToLibrary(
                tmdbId,
                mediaType,
                title,
                posterPath,
                backdropPath,
                releaseYear,
                voteAverage,
                totalSeasons,
                totalEpisodes,
                runtime,
                status,
                season,
                episode,
                rating
            );
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!currentUserMedia?.id) return;

        if (!confirm('Удалить из библиотеки?')) return;

        setIsLoading(true);
        try {
            await removeFromLibrary(currentUserMedia.id);
            router.refresh();
        } catch (error) {
            console.error('Ошибка удаления:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Если уже добавлено и не редактируем
    if (currentUserMedia && !isEditing) {
        const config = STATUS_CONFIG[currentUserMedia.status];

        return (
            <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.bgColor}`}>
                    <span className={`${config.color} font-medium`}>
                        {config.label}
                    </span>
                    {mediaType === 'tv' && currentUserMedia.status !== 'planned' && currentUserMedia.status !== 'completed' && (
                        <span className="text-white/60 text-sm">
                            • S{currentUserMedia.current_season}:E{currentUserMedia.current_episode}
                        </span>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                    >
                        Изменить статус
                    </button>
                    <button
                        onClick={handleRemove}
                        disabled={isLoading}
                        className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Удаление...' : 'Удалить'}
                    </button>
                </div>
            </div>
        );
    }

    // Форма добавления/редактирования
    return (
        <div className="glass rounded-2xl p-6 max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
                {currentUserMedia ? 'Изменить статус' : 'Добавить в библиотеку'}
            </h3>
            <StatusSelector
                media={{
                    id: 0,
                    tmdb_id: tmdbId,
                    media_type: mediaType,
                    title,
                    poster_path: posterPath,
                    backdrop_path: backdropPath,
                    release_year: releaseYear,
                    vote_average: voteAverage,
                    total_seasons: totalSeasons,
                    total_episodes: totalEpisodes,
                    runtime,
                    created_at: new Date().toISOString(),
                }}
                initialStatus={currentUserMedia?.status}
                initialSeason={currentUserMedia?.current_season}
                initialEpisode={currentUserMedia?.current_episode}
                initialRating={currentUserMedia?.user_rating}
                onSave={handleSave}
                onCancel={currentUserMedia ? () => setIsEditing(false) : undefined}
            />
        </div>
    );
}
