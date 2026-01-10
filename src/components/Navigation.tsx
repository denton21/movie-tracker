'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

export default function Navigation() {
    const pathname = usePathname();
    const [user, setUser] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Получаем текущего пользователя
        const getUser = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();
                    setUser(profile);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        getUser();

        // Подписка на изменения авторизации
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            if (session?.user) {
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => setUser(data));
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const navLinks = [
        { href: '/', label: 'Поиск', icon: SearchIcon },
        { href: '/library', label: 'Библиотека', icon: LibraryIcon },
        { href: '/friend', label: 'Друг', icon: FriendIcon },
        { href: '/compare', label: 'Сравнение', icon: CompareIcon },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Логотип */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center">
                            <span className="text-xl">🎬</span>
                        </div>
                        <span className="text-white font-bold text-xl hidden sm:inline">
                            MovieTracker
                        </span>
                    </Link>

                    {/* Навигация (десктоп) */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${pathname === link.href
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Пользователь */}
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <div className="w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-white/80 hidden sm:inline">{user.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 bg-white/10 text-white/80 rounded-lg text-sm hover:bg-white/20 transition-colors"
                                >
                                    Выйти
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                            >
                                Войти
                            </Link>
                        )}

                        {/* Мобильное меню */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-white/60 hover:text-white"
                        >
                            {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Мобильное меню */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-white/10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${pathname === link.href
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'text-white/60'
                                    }`}
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}

// Иконки
function SearchIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

function LibraryIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    );
}

function FriendIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function CompareIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

function MenuIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function CloseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}
