import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getImageUrl, getBackdropUrl, getMovieDetails, getTVDetails } from '@/lib/tmdb';
import { formatDuration } from '@/lib/utils';
import { STATUS_CONFIG } from '@/types';
import type { MediaType, WatchStatus, TMDBMovieDetails, TMDBTVDetails } from '@/types';
import MediaActions from './MediaActions';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function MediaDetailPage({ params }: Props) {
    const { id } = await params;

    // Формат: "movie-123" или "tv-456"
    const [mediaType, tmdbIdStr] = id.split('-');
    const tmdbId = parseInt(tmdbIdStr);

    if (!mediaType || !tmdbId || isNaN(tmdbId)) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Получаем детали из TMDB
    let movieDetails: TMDBMovieDetails | null = null;
    let tvDetails: TMDBTVDetails | null = null;

    try {
        if (mediaType === 'movie') {
            movieDetails = await getMovieDetails(tmdbId);
        } else if (mediaType === 'tv') {
            tvDetails = await getTVDetails(tmdbId);
        } else {
            notFound();
        }
    } catch {
        notFound();
    }

    // Получаем данные из нашей БД (если есть)
    const { data: mediaRecord } = await supabase
        .from('media')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .eq('media_type', mediaType)
        .single();

    // Получаем данные user_media для обоих пользователей
    let userMediaList: Array<{
        status: WatchStatus;
        current_season: number;
        current_episode: number;
        user_id: string;
        profiles: { username: string };
    }> = [];

    if (mediaRecord) {
        const { data } = await supabase
            .from('user_media')
            .select('*, profiles:user_id(*)')
            .eq('media_id', mediaRecord.id);
        userMediaList = data || [];
    }

    const currentUserMedia = userMediaList.find(um => um.user_id === user.id);
    const friendMedia = userMediaList.find(um => um.user_id !== user.id);

    // Общие данные
    const details = movieDetails || tvDetails!;
    const title = movieDetails ? movieDetails.title : tvDetails!.name;
    const year = movieDetails
        ? new Date(movieDetails.release_date).getFullYear()
        : new Date(tvDetails!.first_air_date).getFullYear();
    const runtime = movieDetails
        ? movieDetails.runtime
        : tvDetails!.episode_run_time?.[0] || 45;

    return (
        <div className="min-h-screen">
            {/* Backdrop */}
            <div className="relative h-[50vh] overflow-hidden">
                <Image
                    src={getBackdropUrl(details.backdrop_path, 'w1280')}
                    alt={title}
                    fill
                    unoptimized
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/30" />
            </div>

            {/* Контент */}
            <div className="relative max-w-6xl mx-auto px-4 -mt-48">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Постер */}
                    <div className="flex-shrink-0">
                        <div className="relative w-48 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={getImageUrl(details.poster_path, 'w500')}
                                alt={title}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Информация */}
                    <div className="flex-1">
                        {/* Тип и год */}
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${mediaType === 'movie'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                {mediaType === 'movie' ? 'Фильм' : 'Сериал'}
                            </span>
                            <span className="text-white/60">{year}</span>
                            {details.vote_average > 0 && (
                                <span className="flex items-center gap-1 text-yellow-400">
                                    ⭐ {details.vote_average.toFixed(1)}
                                </span>
                            )}
                        </div>

                        {/* Название */}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {title}
                        </h1>

                        {/* Жанры */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {details.genres.map((genre: { id: number; name: string }) => (
                                <span
                                    key={genre.id}
                                    className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        {/* Доп. информация */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/60 mb-6">
                            {mediaType === 'movie' ? (
                                <span>⏱️ {formatDuration(runtime)}</span>
                            ) : (
                                <>
                                    <span>📺 {tvDetails!.number_of_seasons} сезонов</span>
                                    <span>🎬 {tvDetails!.number_of_episodes} эпизодов</span>
                                    <span>⏱️ ~{runtime} мин/эпизод</span>
                                </>
                            )}
                        </div>

                        {/* Описание */}
                        <p className="text-white/70 leading-relaxed mb-8 max-w-2xl">
                            {details.overview || 'Описание недоступно'}
                        </p>

                        {/* Действия */}
                        <MediaActions
                            tmdbId={tmdbId}
                            mediaType={mediaType as MediaType}
                            title={title}
                            posterPath={details.poster_path}
                            backdropPath={details.backdrop_path}
                            releaseYear={year}
                            voteAverage={details.vote_average}
                            totalSeasons={tvDetails?.number_of_seasons ?? null}
                            totalEpisodes={tvDetails?.number_of_episodes ?? null}
                            runtime={runtime}
                            currentUserMedia={currentUserMedia}
                        />
                    </div>
                </div>

                {/* Статусы пользователей */}
                {userMediaList.length > 0 && (
                    <div className="mt-12 glass rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">
                            Статусы просмотра
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {userMediaList.map((um) => {
                                const config = STATUS_CONFIG[um.status];
                                const isCurrentUser = um.user_id === user.id;

                                return (
                                    <div
                                        key={um.user_id}
                                        className={`p-4 rounded-xl ${config.bgColor} border border-white/10`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-white font-medium">
                                                {isCurrentUser ? 'Вы' : um.profiles?.username || 'Друг'}
                                            </span>
                                            <span className={`${config.color} text-sm font-medium`}>
                                                {config.label}
                                            </span>
                                        </div>
                                        {mediaType === 'tv' && um.status !== 'planned' && um.status !== 'completed' && (
                                            <p className="text-white/60 text-sm">
                                                Сезон {um.current_season}, Серия {um.current_episode}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Сезоны (для сериалов) */}
                {tvDetails?.seasons && (
                    <div className="mt-12">
                        <h2 className="text-xl font-semibold text-white mb-6">
                            Сезоны
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {tvDetails.seasons
                                .filter((s: { season_number: number }) => s.season_number > 0)
                                .map((season: { id: number; season_number: number; name: string; episode_count: number; poster_path: string | null }) => (
                                    <div
                                        key={season.id}
                                        className="glass rounded-xl overflow-hidden"
                                    >
                                        <div className="relative aspect-[2/3]">
                                            <Image
                                                src={getImageUrl(season.poster_path, 'w185')}
                                                alt={season.name}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-white font-medium text-sm truncate">
                                                {season.name}
                                            </p>
                                            <p className="text-white/60 text-xs">
                                                {season.episode_count} эпизодов
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Отступ снизу */}
            <div className="h-20" />
        </div>
    );
}
