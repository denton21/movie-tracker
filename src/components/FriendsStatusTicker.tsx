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
        <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
            <div className="relative flex items-center overflow-hidden h-12">
                {/* Метка слева */}
                <div className="flex-shrink-0 px-4 flex items-center gap-2.5 border-r border-white/10 h-full bg-zinc-900/50 backdrop-blur-xl z-20 shadow-[4px_0_15px_rgba(0,0,0,0.2)]">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                    <span className="text-slate-300 text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap pt-0.5">
                        Лента
                    </span>
                </div>

                {/* Бегущая строка */}
                <div className="flex-1 overflow-hidden relative h-full flex items-center">
                    {/* Градиент-маска слева */}
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
                    {/* Градиент-маска справа */}
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent z-10" />

                    <div
                        ref={trackRef}
                        className="flex items-center gap-0 animate-ticker whitespace-nowrap"
                        style={{ animationDuration: '30s' }}
                    >
                        {items.map((activity, index) => (
                            <span
                                key={`${activity.id}-${index}`}
                                className="inline-flex items-center gap-2 px-6 text-sm group cursor-default"
                            >
                                {/* Разделитель */}
                                <span className="text-white/10 mr-2 text-lg leading-none">•</span>
                                {/* Аватар */}
                                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-[11px] flex-shrink-0 shadow-sm border border-white/10 group-hover:scale-110 transition-transform">
                                    <span className="drop-shadow-md">👤</span>
                                </span>
                                {/* Ник */}
                                <span className="text-slate-200 font-bold group-hover:text-white transition-colors tracking-tight">{activity.username}</span>
                                {/* Статус */}
                                <span className={`font-medium ${STATUS_COLOR[activity.status] || 'text-slate-400'}`}>
                                    {STATUS_LABEL[activity.status] || activity.status}
                                </span>
                                {/* Эмодзи */}
                                <span className="text-base leading-none drop-shadow-sm group-hover:-translate-y-0.5 transition-transform">{STATUS_EMOJI[activity.status] || '📺'}</span>
                                {/* Название */}
                                <span className="text-slate-300 font-medium max-w-[200px] truncate group-hover:text-white transition-colors">
                                    &laquo;{activity.title}&raquo;
                                </span>
                                {/* Тип */}
                                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                                    {activity.media_type === 'movie' ? 'ФИЛЬМ' : 'СЕРИАЛ'}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
