'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb';
import type { TMDBSearchResult } from '@/types';

interface SearchBarProps {
    onSelect: (item: TMDBSearchResult) => void;
    onQueryChange?: (query: string) => void;
}

export default function SearchBar({ onSelect, onQueryChange }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TMDBSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Дебаунс поиска
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                    const data = await response.json();
                    setResults(data.results || []);
                    setIsOpen(true);
                } catch (error) {
                    console.error('Ошибка поиска:', error);
                    setResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (item: TMDBSearchResult) => {
        onSelect(item);
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim().length >= 2) {
            // Переход на страницу поиска по Enter
            window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
            {/* Поле ввода */}
            <form onSubmit={handleSubmit} className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onQueryChange?.(e.target.value);
                    }}
                    placeholder="Поиск фильмов и сериалов... (Enter для расширенного поиска)"
                    className="w-full px-6 py-4 text-lg glass border-white/10 rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 focus:bg-zinc-900/60 transition-all duration-300 shadow-lg shadow-black/20"
                />

                {/* Иконка поиска / загрузка */}
                <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-300/30 border-t-rose-500 rounded-full animate-spin shadow-[0_0_10px_rgba(225,29,72,0.5)]" />
                    ) : (
                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-rose-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </form>

            {/* Выпадающий список результатов */}
            <div className={`absolute w-full mt-3 glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-300 ease-in-out transform origin-top ${isOpen && results.length > 0 ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
                }`}>
                <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                    {results.map((item) => (
                        <button
                            key={`${item.media_type}-${item.id}`}
                            onClick={() => handleSelect(item)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-none"
                        >
                            {/* Постер */}
                            <div className="relative w-12 h-18 flex-shrink-0 bg-zinc-800/50 rounded-lg overflow-hidden shadow-md">
                                {item.poster_path ? (
                                    <Image
                                        src={getImageUrl(item.poster_path, 'w92')}
                                        alt={getMediaTitle(item) || 'Постер'}
                                        width={48}
                                        height={72}
                                        unoptimized
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                                        Нет фото
                                    </div>
                                )}
                            </div>

                            {/* Информация */}
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-slate-100 font-semibold truncate mb-1">
                                    {getMediaTitle(item)}
                                </p>
                                <div className="flex items-center gap-2.5 text-sm text-slate-400 font-medium">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold ${item.media_type === 'movie'
                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        }`}>
                                        {item.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                                    </span>
                                    {getMediaYear(item) && (
                                        <span>{getMediaYear(item)}</span>
                                    )}
                                    {item.vote_average > 0 && (
                                        <span className="flex items-center gap-1 text-amber-400">
                                            <span className="text-xs">★</span>
                                            {item.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Нет результатов */}
            <div className={`absolute w-full mt-3 p-6 glass-panel rounded-2xl text-center z-40 transition-all duration-300 ${isOpen && results.length === 0 && query.trim().length >= 2 && !isLoading
                    ? 'opacity-100 transform translate-y-0'
                    : 'opacity-0 pointer-events-none transform -translate-y-2'
                }`}>
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-300 font-medium">Ничего не найдено</p>
                <p className="text-slate-500 text-sm mt-1">Попробуйте изменить поисковой запрос</p>
            </div>
        </div>
    );
}
