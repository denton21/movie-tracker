'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchUsers, updateSelectedFriend } from '@/actions/friends';
import type { Profile } from '@/types';

interface FriendSearchProps {
    onFriendSelected?: () => void;
}

export default function FriendSearch({ onFriendSelected }: FriendSearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Partial<Profile>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length < 2) return;

        setLoading(true);
        setError(null);
        try {
            const data = await searchUsers(query);
            setResults(data);
            if (data.length === 0) {
                setError('Пользователи не найдены');
            }
        } catch (err) {
            setError('Ошибка при поиске');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (friendId: string) => {
        setLoading(true);
        try {
            await updateSelectedFriend(friendId);
            router.refresh();
            if (onFriendSelected) onFriendSelected();
        } catch (err) {
            setError('не удалось выбрать друга');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto glass rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Найти друга</h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Введите ник (минимум 2 символа)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading || query.length < 2}
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-medium transition-all"
                >
                    {loading ? '...' : 'Поиск'}
                </button>
            </form>

            {error && (
                <div className="text-red-400 text-sm mb-4 text-center">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {results.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xl">
                                👤
                            </div>
                            <span className="text-white font-medium">{user.username}</span>
                        </div>
                        <button
                            onClick={() => handleSelect(user.id!)}
                            disabled={loading}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                        >
                            Выбрать
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
