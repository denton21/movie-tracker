'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import StatusSelector from '@/components/StatusSelector';
import { addToLibrary } from '@/actions/media';
import { getImageUrl, getMediaTitle, getMediaYear } from '@/lib/tmdb';
import type { TMDBSearchResult, WatchStatus, TMDBMovieDetails, TMDBTVDetails } from '@/types';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [selectedMedia, setSelectedMedia] = useState<TMDBSearchResult | null>(null);
  const [mediaDetails, setMediaDetails] = useState<TMDBMovieDetails | TMDBTVDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSelect = async (item: TMDBSearchResult) => {
    setSelectedMedia(item);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/media/${item.media_type}-${item.id}`);
      const details = await response.json();
      setMediaDetails(details);
      setShowModal(true);
    } catch (error) {
      console.error('Ошибка загрузки деталей:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (status: WatchStatus, season: number, episode: number, rating: number | null) => {
    if (!selectedMedia || !mediaDetails) return;

    const title = getMediaTitle(selectedMedia);
    const year = getMediaYear(selectedMedia);

    // Определяем данные в зависимости от типа
    const isTV = selectedMedia.media_type === 'tv';
    const tvDetails = mediaDetails as TMDBTVDetails;

    await addToLibrary(
      selectedMedia.id,
      selectedMedia.media_type,
      title,
      selectedMedia.poster_path,
      selectedMedia.backdrop_path,
      year,
      selectedMedia.vote_average,
      isTV ? tvDetails.number_of_seasons : null,
      isTV ? tvDetails.number_of_episodes : null,
      isTV ? (tvDetails.episode_run_time?.[0] || 45) : (mediaDetails as TMDBMovieDetails).runtime,
      status,
      season,
      episode,
      rating
    );

    setShowModal(false);
    setSelectedMedia(null);
    setMediaDetails(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Hero секция */}
      <section className="relative py-20 px-4">
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            <span className="gradient-text">MovieTracker</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-100">
            Отслеживайте фильмы и сериалы вместе с другом.
            Соревнуйтесь, кто больше посмотрит!
          </p>

          {/* Поиск */}
          <div className="animate-fade-in-up delay-200">
            <SearchBar onSelect={handleSelect} />
          </div>

          {/* Подсказка */}
          <p className="mt-6 text-white/40 text-sm animate-fade-in-up delay-300">
            Введите название фильма или сериала для поиска
          </p>
        </div>
      </section>

      {/* Модальное окно добавления */}
      {showModal && selectedMedia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Шапка с постером */}
            <div className="relative h-48 overflow-hidden rounded-t-3xl">
              <Image
                src={getImageUrl(selectedMedia.backdrop_path || selectedMedia.poster_path, 'w780')}
                alt={getMediaTitle(selectedMedia)}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

              {/* Кнопка закрытия */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                ✕
              </button>

              {/* Информация внизу */}
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {getMediaTitle(selectedMedia)}
                </h2>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <span className={`px-2 py-0.5 rounded ${selectedMedia.media_type === 'movie'
                    ? 'bg-blue-500/30 text-blue-300'
                    : 'bg-purple-500/30 text-purple-300'
                    }`}>
                    {selectedMedia.media_type === 'movie' ? 'Фильм' : 'Сериал'}
                  </span>
                  {getMediaYear(selectedMedia) && (
                    <span>{getMediaYear(selectedMedia)}</span>
                  )}
                  {selectedMedia.vote_average > 0 && (
                    <span className="flex items-center gap-1">
                      ⭐ {selectedMedia.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Контент */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : mediaDetails ? (
                <StatusSelector
                  media={{
                    id: 0,
                    tmdb_id: selectedMedia.id,
                    media_type: selectedMedia.media_type,
                    title: getMediaTitle(selectedMedia),
                    poster_path: selectedMedia.poster_path,
                    backdrop_path: selectedMedia.backdrop_path,
                    release_year: getMediaYear(selectedMedia),
                    vote_average: selectedMedia.vote_average,
                    total_seasons: selectedMedia.media_type === 'tv'
                      ? (mediaDetails as TMDBTVDetails).number_of_seasons
                      : null,
                    total_episodes: selectedMedia.media_type === 'tv'
                      ? (mediaDetails as TMDBTVDetails).number_of_episodes
                      : null,
                    runtime: selectedMedia.media_type === 'movie'
                      ? (mediaDetails as TMDBMovieDetails).runtime
                      : (mediaDetails as TMDBTVDetails).episode_run_time?.[0] || 45,
                    created_at: new Date().toISOString(),
                  }}
                  onSave={handleSave}
                  onCancel={() => setShowModal(false)}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
