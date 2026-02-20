'use client';

import { useEffect, useRef } from 'react';

const STATUS_EMOJI: Record<string, string> = {
    watching: '▶️',
    completed: '✅',
    dropped: '❌',
    planned: '📋',
};

const STATUS_LABEL: Record<string, string> = {
    watching: 'смотрит',
    completed: 'посмотрел',
    dropped: 'бросил',
    planned: 'планирует',
};

const STATUS_COLOR: Record<string, string> = {
    watching: 'text-blue-400',
    completed: 'text-green-400',
    dropped: 'text-red-400',
    planned: 'text-yellow-400',
};

export interface FriendActivity {
    id: number;
    username: string;
    status: string;
    title: string;
    media_type: string;
    updated_at: string;
}

interface FriendsStatusTickerProps {
    activities: FriendActivity[];
}

export default function FriendsStatusTicker({ activities }: FriendsStatusTickerProps) {
    const trackRef = useRef<HTMLDivElement>(null);

    // Дублируем элементы для бесшовной бегущей строки
    const items = activities.length > 0 ? [...activities, ...activities] : [];

    useEffect(() => {
        const track = trackRef.current;
        if (!track || items.length === 0) return;

        // Чтобы анимация не зависела от кол-ва элементов, задаём длительность динамически
        const itemCount = activities.length;
        const duration = Math.max(20, itemCount * 6); // ~6 сек на элемент, мин 20 сек
        track.style.animationDuration = `${duration}s`;
    }, [activities, items.length]);

    if (activities.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-black/70 backdrop-blur-md">
            <div className="relative flex items-center overflow-hidden h-10">
                {/* Метка слева */}
                <div className="flex-shrink-0 px-3 flex items-center gap-2 border-r border-white/10 h-full bg-black/50 z-10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white/50 text-xs font-medium uppercase tracking-wider whitespace-nowrap">
                        Друзья
                    </span>
                </div>

                {/* Бегущая строка */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Градиент-маска слева */}
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/70 to-transparent z-10" />
                    {/* Градиент-маска справа */}
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/70 to-transparent z-10" />

                    <div
                        ref={trackRef}
                        className="flex items-center gap-0 animate-ticker whitespace-nowrap"
                        style={{ animationDuration: '30s' }}
                    >
                        {items.map((activity, index) => (
                            <span
                                key={`${activity.id}-${index}`}
                                className="inline-flex items-center gap-1.5 px-5 text-sm"
                            >
                                {/* Разделитель */}
                                <span className="text-white/20 mr-1">•</span>
                                {/* Аватар */}
                                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-[10px] flex-shrink-0">
                                    👤
                                </span>
                                {/* Ник */}
                                <span className="text-white/80 font-medium">{activity.username}</span>
                                {/* Статус */}
                                <span className={`${STATUS_COLOR[activity.status] || 'text-white/60'}`}>
                                    {STATUS_LABEL[activity.status] || activity.status}
                                </span>
                                {/* Эмодзи */}
                                <span className="text-base leading-none">{STATUS_EMOJI[activity.status] || '📺'}</span>
                                {/* Название */}
                                <span className="text-white/60 italic max-w-[200px] truncate">
                                    &laquo;{activity.title}&raquo;
                                </span>
                                {/* Тип */}
                                <span className="text-white/30 text-xs">
                                    {activity.media_type === 'movie' ? 'фильм' : 'сериал'}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
