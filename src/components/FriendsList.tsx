'use client';

import { useState, useTransition } from 'react';
import { addFriend, removeFriend, selectFriendForCompare } from '@/actions/friends';

interface Friend {
    id: number;
    friend_id: string;
    created_at: string;
    friend: {
        id: string;
        username: string;
        avatar_url: string | null;
    };
}

interface FriendsListProps {
    friends: Friend[];
    selectedFriendId: string | null;
}

export default function FriendsList({ friends, selectedFriendId }: FriendsListProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleRemove = (friendId: string) => {
        setError(null);
        startTransition(async () => {
            try {
                await removeFriend(friendId);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка');
            }
        });
    };

    const handleSelect = (friendId: string) => {
        setError(null);
        startTransition(async () => {
            try {
                await selectFriendForCompare(friendId);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка');
            }
        });
    };

    if (friends.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
                Мои друзья ({friends.length})
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {friends.map((item) => (
                    <div
                        key={item.id}
                        className={`relative p-4 rounded-2xl border transition-all ${selectedFriendId === item.friend_id
                                ? 'bg-purple-500/20 border-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center text-xl">
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">
                                    {item.friend.username}
                                </h3>
                                {selectedFriendId === item.friend_id && (
                                    <span className="text-purple-400 text-xs">
                                        Выбран для сравнения
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            {selectedFriendId !== item.friend_id && (
                                <button
                                    onClick={() => handleSelect(item.friend_id)}
                                    disabled={isPending}
                                    className="flex-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                                >
                                    Выбрать
                                </button>
                            )}
                            <button
                                onClick={() => handleRemove(item.friend_id)}
                                disabled={isPending}
                                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Компонент для добавления друга из результатов поиска
export function AddFriendButton({ friendId, isAlreadyFriend }: { friendId: string; isAlreadyFriend: boolean }) {
    const [isPending, startTransition] = useTransition();
    const [added, setAdded] = useState(isAlreadyFriend);
    const [error, setError] = useState<string | null>(null);

    const handleAdd = () => {
        setError(null);
        startTransition(async () => {
            try {
                await addFriend(friendId);
                setAdded(true);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка');
            }
        });
    };

    if (added) {
        return (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                ✓ Добавлен
            </span>
        );
    }

    return (
        <div>
            <button
                onClick={handleAdd}
                disabled={isPending}
                className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
                {isPending ? '...' : '+ Добавить'}
            </button>
            {error && <span className="text-red-400 text-xs ml-2">{error}</span>}
        </div>
    );
}
