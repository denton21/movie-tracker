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
        <div className="space-y-4 mb-8">
            {/* Фильтр по статусу */}
            <div className="flex flex-wrap gap-2 p-1.5 glass-panel rounded-2xl border border-white/5 inline-flex w-full sm:w-auto">
                <button
                    onClick={() => setFilter(null)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 ${!currentStatus
                        ? 'bg-zinc-800 text-white shadow-md border border-white/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                        }`}
                >
                    Все
                </button>

                {(Object.entries(STATUS_CONFIG) as [WatchStatus, typeof STATUS_CONFIG[WatchStatus]][]).map(
                    ([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 ${currentStatus === key
                                ? `${config.bgColor} ${config.color} shadow-[0_0_15px_rgba(currentcolor,0.3)] border border-current transform scale-[1.02]`
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            {config.label}
                        </button>
                    )
                )}
            </div>

            {/* Фильтр по оценке */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/5 inline-flex w-full sm:w-auto">
                <span className="text-slate-400 text-sm font-semibold tracking-wide uppercase px-3">Оценка:</span>
                <button
                    onClick={() => setRatingFilter(null)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${!currentRating
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                        }`}
                >
                    Все
                </button>
                <div className="flex flex-wrap gap-1 border-l border-white/5 pl-2 ml-1">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(rating => (
                        <button
                            key={rating}
                            onClick={() => setRatingFilter(rating)}
                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center ${currentRating === rating.toString()
                                ? 'bg-amber-500 text-amber-950 border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)] transform scale-110'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            {rating}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
