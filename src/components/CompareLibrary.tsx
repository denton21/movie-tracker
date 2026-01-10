'use client';

import { useState } from 'react';
import CompareMediaCard from './CompareMediaCard';
import type { Media, UserMedia } from '@/types';

type MediaFilter = 'all' | 'movie' | 'tv';

interface CompareItem {
    media: Media;
    user1: UserMedia | null;
    user2: UserMedia | null;
}

interface CompareLibraryProps {
    items: CompareItem[];
}

export default function CompareLibrary({ items }: CompareLibraryProps) {
    const [filter, setFilter] = useState<MediaFilter>('all');

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        return item.media.media_type === filter;
    });

    const moviesCount = items.filter(i => i.media.media_type === 'movie').length;
    const tvCount = items.filter(i => i.media.media_type === 'tv').length;

    return (
        <div>
            {/* Фильтры */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <h2 className="text-xl font-semibold text-white">
                    Общая библиотека ({filteredItems.length})
                </h2>

                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                    >
                        Все ({items.length})
                    </button>
                    <button
                        onClick={() => setFilter('movie')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'movie'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                    >
                        🎬 Фильмы ({moviesCount})
                    </button>
                    <button
                        onClick={() => setFilter('tv')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'tv'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                            }`}
                    >
                        📺 Сериалы ({tvCount})
                    </button>
                </div>
            </div>

            {/* Список */}
            {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {filteredItems.map((item) => (
                        <CompareMediaCard
                            key={item.media.id}
                            media={item.media}
                            userMedia={item.user1}
                            friendMedia={item.user2}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-white/60">
                        {filter === 'all'
                            ? 'Пока никто ничего не добавил'
                            : filter === 'movie'
                                ? 'Фильмов нет'
                                : 'Сериалов нет'}
                    </p>
                </div>
            )}
        </div>
    );
}
