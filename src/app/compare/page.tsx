import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getComparisonData } from '@/actions/media';
import CompareMediaCard from '@/components/CompareMediaCard';
import ProgressBar from '@/components/ProgressBar';

export default async function ComparePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { user1, user2, items } = await getComparisonData();

    if (!user1 || !user2) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Друг не выбран
                    </h2>
                    <p className="text-white/60 max-w-md mx-auto mb-6">
                        Чтобы сравнить прогресс, сначала выберите друга в разделе «Библиотека друга».
                    </p>
                    <a
                        href="/friend"
                        className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all"
                    >
                        Выбрать друга
                    </a>
                </div>
            </div>
        );
    }

    // Статистика пользователей
    const user1Stats = {
        total: items.filter(i => i.user1).length,
        completed: items.filter(i => i.user1?.status === 'completed').length,
        watching: items.filter(i => i.user1?.status === 'watching').length,
    };

    const user2Stats = {
        total: items.filter(i => i.user2).length,
        completed: items.filter(i => i.user2?.status === 'completed').length,
        watching: items.filter(i => i.user2?.status === 'watching').length,
    };

    // Определяем кто впереди (счёт = количество просмотренных)
    const user1Score = user1Stats.completed;
    const user2Score = user2Stats.completed;
    const leader = user1Score > user2Score ? 'user1' : user2Score > user1Score ? 'user2' : 'tie';

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Сравнение прогресса
                    </h1>
                    <p className="text-white/60">
                        Кто больше посмотрел? 🏆
                    </p>
                </div>

                {/* Сравнение пользователей */}
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <UserStatsCard
                        username={user1.username}
                        stats={user1Stats}
                        isLeader={leader === 'user1'}
                        color="purple"
                    />
                    <UserStatsCard
                        username={user2.username}
                        stats={user2Stats}
                        isLeader={leader === 'user2'}
                        color="pink"
                    />
                </div>

                {/* Общий прогресс */}
                <div className="glass rounded-2xl p-6 mb-10">
                    <h2 className="text-lg font-semibold text-white mb-4">Общий счёт</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-3xl font-bold text-purple-400">{user1Score}</div>
                            <div className="text-sm text-white/60">{user1.username}</div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="text-2xl">VS</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-pink-400">{user2Score}</div>
                            <div className="text-sm text-white/60">{user2.username}</div>
                        </div>
                    </div>
                </div>

                {/* Общая библиотека */}
                <h2 className="text-xl font-semibold text-white mb-6">
                    Общая библиотека ({items.length})
                </h2>

                {items.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {items.map((item) => (
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
                            Пока никто ничего не добавил
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserStatsCard({
    username,
    stats,
    isLeader,
    color,
}: {
    username: string;
    stats: { total: number; completed: number; watching: number };
    isLeader: boolean;
    color: 'purple' | 'pink';
}) {
    const bgColor = color === 'purple'
        ? 'from-purple-500/20 to-purple-600/20'
        : 'from-pink-500/20 to-pink-600/20';

    const borderColor = color === 'purple'
        ? 'border-purple-500/30'
        : 'border-pink-500/30';

    return (
        <div className={`relative bg-gradient-to-br ${bgColor} border ${borderColor} rounded-2xl p-6`}>
            {isLeader && (
                <div className="absolute -top-3 -right-3 text-3xl">🏆</div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${color === 'purple' ? 'from-purple-500 to-purple-600' : 'from-pink-500 to-pink-600'
                    } rounded-xl flex items-center justify-center text-2xl`}>
                    👤
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white">{username}</h3>
                    <p className="text-white/60 text-sm">{stats.total} в библиотеке</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Просмотрено</span>
                        <span className="text-green-400 font-medium">{stats.completed}</span>
                    </div>
                    <ProgressBar
                        current={stats.completed}
                        total={stats.total || 1}
                        color="green"
                        showPercentage={false}
                    />
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Смотрит сейчас</span>
                        <span className="text-blue-400 font-medium">{stats.watching}</span>
                    </div>
                    <ProgressBar
                        current={stats.watching}
                        total={stats.total || 1}
                        color="blue"
                        showPercentage={false}
                    />
                </div>
            </div>
        </div>
    );
}
