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
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
        >
            {/* Постер */}
            <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                    src={getImageUrl(media.poster_path, 'w500')}
                    alt={media.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Градиент снизу */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Тип контента */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium ${media.media_type === 'movie'
                    ? 'bg-blue-500/80 text-white'
                    : 'bg-purple-500/80 text-white'
                    }`}>
                    {media.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                </div>

                {/* Рейтинг */}
                {media.vote_average && media.vote_average > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 rounded-lg">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white text-sm font-medium">
                            {media.vote_average.toFixed(1)}
                        </span>
                    </div>
                )}

                {/* Информация внизу - статус + название */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
                    {/* Статус пользователя */}
                    {statusConfig && (
                        <div className={`px-3 py-2 rounded-xl ${statusConfig.bgColor} backdrop-blur-sm`}>
                            <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm font-medium ${statusConfig.color} truncate`}>
                                    {statusConfig.label}
                                    {userMedia && media.media_type === 'tv' && userMedia.status === 'watching' && (
                                        <span className="text-white/60 text-sm ml-2">
                                            S{userMedia.current_season}:E{userMedia.current_episode}
                                        </span>
                                    )}
                                </span>
                                {userMedia?.user_rating && (
                                    <span className="text-yellow-400 text-sm font-medium whitespace-nowrap">
                                        ⭐ {userMedia.user_rating}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Название и год */}
                    <div>
                        <h3 className="text-white font-semibold text-lg line-clamp-2 mb-1">
                            {media.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                            {media.release_year && <span>{media.release_year}</span>}
                            {media.media_type === 'tv' && media.total_seasons && (
                                <span>• {media.total_seasons} сезон{media.total_seasons > 1 ? (media.total_seasons < 5 ? 'а' : 'ов') : ''}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Прогресс-бар для сериалов */}
            {media.media_type === 'tv' && userMedia && userMedia.status !== 'planned' && media.total_episodes && (
                <div className="p-3 pt-0">
                    <ProgressBar
                        current={userMedia.current_episode + (userMedia.current_season - 1) * Math.ceil(media.total_episodes / (media.total_seasons || 1))}
                        total={media.total_episodes}
                        label={`${userMedia.current_season} сезон, ${userMedia.current_episode} серия`}
                    />
                </div>
            )}

            {/* Сравнение статусов (для страницы сравнения) */}
            {showComparison && (
                <div className="p-3 border-t border-white/10 grid grid-cols-2 gap-2">
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
