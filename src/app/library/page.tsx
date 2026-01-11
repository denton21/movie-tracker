import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserLibrary } from '@/actions/media';
import MediaCard from '@/components/MediaCard';
import type { UserMediaWithDetails, WatchStatus } from '@/types';
import LibraryFilters from './LibraryFilters';

interface PageProps {
    searchParams: Promise<{ status?: WatchStatus; rating?: string }>;
}

export default async function LibraryPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const allItems = await getUserLibrary() as UserMediaWithDetails[];

    // Статистика (по всем элементам)
    const stats = {
        total: allItems.length,
        completed: allItems.filter(i => i.status === 'completed').length,
        watching: allItems.filter(i => i.status === 'watching').length,
        dropped: allItems.filter(i => i.status === 'dropped').length,
        planned: allItems.filter(i => i.status === 'planned').length,
    };

    // Фильтрация по статусу
    let items = params.status
        ? allItems.filter(i => i.status === params.status)
        : allItems;

    // Фильтрация по пользовательской оценке
    if (params.rating) {
        const rating = parseInt(params.rating);
        items = items.filter(i => i.user_rating === rating);
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Моя библиотека
                    </h1>
                    <p className="text-white/60">
                        Привет, {profile?.username || 'пользователь'}!
                        У тебя {stats.total} {stats.total === 1 ? 'элемент' : 'элементов'} в библиотеке.
                    </p>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Всего" value={stats.total} color="purple" />
                    <StatCard label="Просмотрено" value={stats.completed} color="green" />
                    <StatCard label="Смотрю" value={stats.watching} color="blue" />
                    <StatCard label="Брошено" value={stats.dropped} color="red" />
                    <StatCard label="В планах" value={stats.planned} color="yellow" />
                </div>

                {/* Фильтры */}
                <LibraryFilters />

                {/* Сетка карточек */}
                {items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {items.map((item) => (
                            <MediaCard
                                key={item.id}
                                media={item.media}
                                userMedia={item}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Библиотека пуста
                        </h2>
                        <p className="text-white/60 mb-6">
                            Найдите фильм или сериал и добавьте его!
                        </p>
                        <a
                            href="/"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                            Найти что посмотреть
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    label,
    value,
    color
}: {
    label: string;
    value: number;
    color: 'purple' | 'green' | 'blue' | 'red' | 'yellow';
}) {
    const colors = {
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        green: 'from-green-500/20 to-green-600/20 border-green-500/30',
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        red: 'from-red-500/20 to-red-600/20 border-red-500/30',
        yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4 text-center`}>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-white/60">{label}</div>
        </div>
    );
}
