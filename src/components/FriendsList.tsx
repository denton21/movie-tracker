'use client';

import { useState, useTransition } from 'react';
import { addFriend, removeFriend, selectFriendForCompare } from '@/actions/friends';

interface FriendProfile {
    id: string;
    username: string;
    avatar_url: string | null;
}

interface Friend {
    id: number;
    friend_id: string;
    created_at: string;
    friend: FriendProfile | FriendProfile[];
}

interface FriendsListProps {
    friends: Friend[];
    selectedFriendId: string | null;
}

// Хелпер для получения данных друга (Supabase может вернуть массив или объект)
function getFriendData(friend: FriendProfile | FriendProfile[]): FriendProfile | null {
    if (Array.isArray(friend)) {
        return friend[0] || null;
    }
    return friend;
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
            <h2 className="text-2xl font-bold text-slate-100 mb-6 drop-shadow-sm">
                Мои друзья ({friends.length})
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm shadow-inner flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {friends.map((item) => {
                    const friendData = getFriendData(item.friend);
                    if (!friendData) return null;

                    return (
                        <div
                            key={item.id}
                            className={`relative p-5 rounded-3xl border transition-all duration-300 group overflow-hidden ${selectedFriendId === item.friend_id
                                ? 'glass-panel border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30 transform scale-[1.02]'
                                : 'glass border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                                }`}
                        >
                            {selectedFriendId === item.friend_id && (
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            )}

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br from-rose-500 to-indigo-500 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300 ${selectedFriendId === item.friend_id ? 'opacity-100' : ''}`}></div>
                                    <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center text-2xl relative z-10 shadow-xl overflow-hidden">
                                        {friendData.avatar_url ? (
                                            <img src={friendData.avatar_url} alt={friendData.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="opacity-80 drop-shadow-md">👤</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-slate-100 font-bold truncate text-lg tracking-tight group-hover:text-white transition-colors">
                                        {friendData.username}
                                    </h3>
                                    {selectedFriendId === item.friend_id ? (
                                        <div className="flex items-center gap-1.5 text-indigo-400 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                            <span className="text-xs font-semibold uppercase tracking-wider">
                                                Выбран
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-xs mt-1 truncate">Пользователь</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-5 relative z-10">
                                {selectedFriendId !== item.friend_id && (
                                    <button
                                        onClick={() => handleSelect(item.friend_id)}
                                        disabled={isPending}
                                        className="flex-1 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-sm font-semibold hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-200 transition-all disabled:opacity-50 active:scale-95"
                                    >
                                        Сравнить
                                    </button>
                                )}
                                <button
                                    onClick={() => handleRemove(item.friend_id)}
                                    disabled={isPending}
                                    className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    );
                })}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Добавлен
            </span>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleAdd}
                disabled={isPending}
                className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-indigo-600 border border-white/10 shadow-[0_0_10px_rgba(225,29,72,0.2)] text-white rounded-xl text-sm font-bold tracking-wide hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Загрузка...' : '+ В друзья'}
            </button>
            {error && <span className="text-red-400 text-xs font-medium">{error}</span>}
        </div>
    );
}
