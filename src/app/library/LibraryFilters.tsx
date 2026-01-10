'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { STATUS_CONFIG } from '@/types';
import type { WatchStatus } from '@/types';

export default function LibraryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get('status') as WatchStatus | null;

    const setFilter = (status: WatchStatus | null) => {
        const params = new URLSearchParams(searchParams);
        if (status) {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        router.push(`/library?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2 mb-6">
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
    );
}
