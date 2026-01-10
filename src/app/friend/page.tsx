import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFriendProfile } from '@/actions/auth';
import { getFriendsList } from '@/actions/friends';
import { getUserLibrary } from '@/actions/media';
import MediaCard from '@/components/MediaCard';
import FriendSearch from '@/components/FriendSearch';
import FriendsList from '@/components/FriendsList';
import { updateSelectedFriend } from '@/actions/friends';
import type { UserMediaWithDetails } from '@/types';

export default async function FriendLibraryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Получаем список друзей и выбранного друга
    const friendsList = await getFriendsList();
    const friend = await getFriendProfile();

    // Получаем профиль текущего пользователя для selected_friend_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('selected_friend_id')
        .eq('id', user.id)
        .single();

    const existingFriendIds = friendsList.map(f => f.friend_id);

    // Если нет друзей — показываем поиск
    if (friendsList.length === 0 && !friend) {
        return (
            <div className="min-h-screen py-20 px-4">
                <div className="max-w-7xl mx-auto text-center mb-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Библиотека друга
                    </h1>
                    <p className="text-white/60 max-w-md mx-auto">
                        Найдите друга по нику, чтобы добавить его в список и сравнивать прогресс.
                    </p>
                </div>
                <FriendSearch existingFriendIds={existingFriendIds} />
            </div>
        );
    }

    // Если есть выбранный друг — показываем его библиотеку
    let items: UserMediaWithDetails[] = [];
    if (friend) {
        items = await getUserLibrary(friend.id) as UserMediaWithDetails[];
    }

    const stats = {
        total: items.length,
        completed: items.filter(i => i.status === 'completed').length,
        watching: items.filter(i => i.status === 'watching').length,
    };

    const handleClearFriend = async () => {
        'use server';
        await updateSelectedFriend(null);
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Список друзей */}
                <FriendsList
                    friends={friendsList}
                    selectedFriendId={profile?.selected_friend_id || null}
                />

                {/* Поиск новых друзей */}
                <div className="mb-8">
                    <FriendSearch existingFriendIds={existingFriendIds} />
                </div>

                {/* Библиотека выбранного друга */}
                {friend && (
                    <>
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-2xl">
                                    👤
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        Библиотека {friend.username}
                                    </h1>
                                    <p className="text-white/60">
                                        {stats.total} {stats.total === 1 ? 'элемент' : 'элементов'} •
                                        {stats.completed} просмотрено •
                                        {stats.watching} смотрит сейчас
                                    </p>
                                </div>
                            </div>

                            <form action={handleClearFriend}>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all text-sm"
                                >
                                    Сбросить выбор
                                </button>
                            </form>
                        </div>

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
                                <p className="text-white/60">
                                    {friend.username} ещё ничего не добавил
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Если друзья есть, но никто не выбран */}
                {friendsList.length > 0 && !friend && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">👆</div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Выберите друга
                        </h2>
                        <p className="text-white/60">
                            Нажмите "Выбрать" рядом с другом, чтобы увидеть его библиотеку
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
