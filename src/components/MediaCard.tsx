import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/tmdb';
import { STATUS_CONFIG } from '@/types';
import type { Media, UserMedia, WatchStatus } from '@/types';
import ProgressBar from './ProgressBar';

interface MediaCardProps {
    media: Media;
    userMedia?: UserMedia | null;
    friendMedia?: UserMedia | null;
    showComparison?: boolean;
}

export default function MediaCard({
    media,
    userMedia,
    friendMedia,
    showComparison = false
}: MediaCardProps) {
    const status = userMedia?.status as WatchStatus | undefined;
    const statusConfig = status ? STATUS_CONFIG[status] : null;

    return (
        <Link
            href={`/media/${media.media_type}-${media.tmdb_id}`}
            className="group relative glass rounded-2xl overflow-hidden card-hover block h-full"
        >
            {/* Постер */}
            <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900/50">
                {media.poster_path ? (
                    <Image
                        src={getImageUrl(media.poster_path, 'w500')}
                        alt={media.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                        <span className="text-4xl">🎬</span>
                    </div>
                )}

                {/* Градиент снизу */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Тип контента */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold tracking-wide backdrop-blur-md border ${media.media_type === 'movie'
                        ? 'bg-rose-500/20 text-rose-200 border-rose-500/30 shadow-[0_0_10px_rgba(225,29,72,0.2)]'
                        : 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                        }`}>
                        {media.media_type === 'movie' ? 'ФИЛЬМ' : 'СЕРИАЛ'}
                    </div>
                </div>

                {/* Рейтинг */}
                {media.vote_average && media.vote_average > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-amber-400 font-bold text-sm shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        <span>★</span>
                        <span>{media.vote_average.toFixed(1)}</span>
                    </div>
                )}

                {/* Информация внизу - статус + название */}
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5 flex flex-col gap-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    {/* Статус пользователя */}
                    {statusConfig && (
                        <div className={`px-3 py-2 rounded-xl backdrop-blur-md border shadow-lg ${status === 'watching' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' :
                            status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                                status === 'planned' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                                    'bg-red-500/10 border-red-500/20 text-red-300'
                            }`}>
                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-xs font-semibold uppercase tracking-wider truncate flex-1`}>
                                    {statusConfig.label}
                                    {userMedia && media.media_type === 'tv' && userMedia.status === 'watching' && (
                                        <span className="opacity-70 ml-2">
                                            S{userMedia.current_season}:E{userMedia.current_episode}
                                        </span>
                                    )}
                                </span>
                                {userMedia?.user_rating && (
                                    <span className="text-amber-400 text-xs font-bold whitespace-nowrap bg-black/30 px-1.5 py-0.5 rounded">
                                        ★ {userMedia.user_rating}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Название и год */}
                    <div>
                        <h3 className="text-slate-50 font-bold text-lg lg:text-xl line-clamp-2 leading-tight mb-1.5 drop-shadow-md">
                            {media.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-300/80 text-sm font-medium">
                            {media.release_year && <span>{media.release_year}</span>}
                            {media.media_type === 'tv' && media.total_seasons && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-500/50" />
                                    <span>{media.total_seasons} сезон{media.total_seasons > 1 ? (media.total_seasons < 5 ? 'а' : 'ов') : ''}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Прогресс-бар для сериалов */}
            {media.media_type === 'tv' && userMedia && userMedia.status !== 'planned' && media.total_episodes && (
                <div className="p-4 pt-1 bg-gradient-to-b from-transparent to-black/20">
                    <ProgressBar
                        current={userMedia.current_episode + (userMedia.current_season - 1) * Math.ceil(media.total_episodes / (media.total_seasons || 1))}
                        total={media.total_episodes}
                        label={`Просмотрено: ${userMedia.current_season} сезон, ${userMedia.current_episode} серия`}
                    />
                </div>
            )}

            {/* Сравнение статусов (для страницы сравнения) */}
            {showComparison && (
                <div className="p-4 bg-zinc-900/50 border-t border-white/5 grid grid-cols-2 gap-3 relative z-10 backdrop-blur-xl">
                    <UserStatusBadge label="Вы" userMedia={userMedia} />
                    <UserStatusBadge label="Друг" userMedia={friendMedia} />
                </div>
            )}
        </Link>
    );
}

// Бейдж статуса пользователя
function UserStatusBadge({ label, userMedia }: { label: string; userMedia?: UserMedia | null }) {
    const status = userMedia?.status as WatchStatus | undefined;
    const config = status ? STATUS_CONFIG[status] : null;

    return (
        <div className="text-center">
            <p className="text-white/40 text-xs mb-1">{label}</p>
            {config ? (
                <div className="space-y-1">
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs ${config.bgColor} ${config.color}`}>
                        {config.label}
                        {userMedia && userMedia.status === 'watching' && (
                            <span className="ml-1 opacity-75">
                                S{userMedia.current_season}
                            </span>
                        )}
                    </span>
                    {userMedia?.user_rating && (
                        <p className="text-yellow-400 text-xs">⭐ {userMedia.user_rating}/10</p>
                    )}
                </div>
            ) : (
                <span className="inline-block px-2 py-1 rounded-lg text-xs bg-white/5 text-white/30">
                    Не добавлено
                </span>
            )}
        </div>
    );
}
