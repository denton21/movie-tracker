'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb';
import type { TMDBSearchResult } from '@/types';

interface SearchBarProps {
    onSelect: (item: TMDBSearchResult) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
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

    return (
        <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
            {/* Поле ввода */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск фильмов и сериалов..."
                    className="w-full px-6 py-4 text-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />

                {/* Иконка поиска / загрузка */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-purple-500 rounded-full animate-spin" />
                    ) : (
                        <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Выпадающий список результатов */}
            {isOpen && results.length > 0 && (
                <div className="absolute w-full mt-2 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {results.map((item) => (
                        <button
                            key={`${item.media_type}-${item.id}`}
                            onClick={() => handleSelect(item)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/10 transition-colors text-left"
                        >
                            {/* Постер */}
                            <div className="relative w-12 h-18 flex-shrink-0">
                                <Image
                                    src={getImageUrl(item.poster_path, 'w92')}
                                    alt={getMediaTitle(item)}
                                    width={48}
                                    height={72}
                                    className="rounded-lg object-cover"
                                />
                            </div>

                            {/* Информация */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">
                                    {getMediaTitle(item)}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <span className={`px-2 py-0.5 rounded text-xs ${item.media_type === 'movie'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                        {item.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                                    </span>
                                    {getMediaYear(item) && (
                                        <span>{getMediaYear(item)}</span>
                                    )}
                                    {item.vote_average > 0 && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {item.vote_average.toFixed(1)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Нет результатов */}
            {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
                <div className="absolute w-full mt-2 p-4 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-2xl text-center text-white/60">
                    Ничего не найдено
                </div>
            )}
        </div>
    );
}
