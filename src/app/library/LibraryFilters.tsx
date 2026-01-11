'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { STATUS_CONFIG } from '@/types';
import type { WatchStatus } from '@/types';

export default function LibraryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get('status') as WatchStatus | null;
    const currentRating = searchParams.get('rating');

    const setFilter = (status: WatchStatus | null) => {
        const params = new URLSearchParams(searchParams);
        if (status) {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        router.push(`/library?${params.toString()}`);
    };

    const setRatingFilter = (rating: number | null) => {
        const params = new URLSearchParams(searchParams);
        if (rating) {
            params.set('rating', rating.toString());
        } else {
            params.delete('rating');
        }
        router.push(`/library?${params.toString()}`);
    };

    return (
        <div className="space-y-4 mb-6">
            {/* Фильтр по статусу */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter(null)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!currentStatus
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                >
                    Все
                </button>

                {(Object.entries(STATUS_CONFIG) as [WatchStatus, typeof STATUS_CONFIG[WatchStatus]][]).map(
                    ([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${currentStatus === key
                                ? `${config.bgColor} ${config.color}`
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            {config.label}
                        </button>
                    )
                )}
            </div>

            {/* Фильтр по оценке */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-white/60 text-sm">Оценка:</span>
                <button
                    onClick={() => setRatingFilter(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${!currentRating
                        ? 'bg-yellow-500/30 text-yellow-300'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                >
                    Все
                </button>
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(rating => (
                    <button
                        key={rating}
                        onClick={() => setRatingFilter(rating)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${currentRating === rating.toString()
                            ? 'bg-yellow-500/30 text-yellow-300'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                    >
                        ⭐ {rating}
                    </button>
                ))}
            </div>
        </div>
    );
}
