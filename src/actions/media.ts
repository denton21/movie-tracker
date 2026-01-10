'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { WatchStatus, MediaType } from '@/types';

/**
 * Добавить или обновить медиа в библиотеке пользователя
 */
export async function addToLibrary(
    tmdbId: number,
    mediaType: MediaType,
    title: string,
    posterPath: string | null,
    backdropPath: string | null,
    releaseYear: number | null,
    voteAverage: number | null,
    totalSeasons: number | null,
    totalEpisodes: number | null,
    runtime: number | null,
    status: WatchStatus,
    currentSeason: number = 1,
    currentEpisode: number = 1,
    userRating: number | null = null
) {
    const supabase = await createClient();

    // Проверяем авторизацию
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Необходима авторизация');
    }

    // Проверяем, есть ли профиль пользователя, если нет - создаём
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    if (!existingProfile) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: user.email?.split('@')[0] || 'user',
            });

        if (profileError) {
            console.error('Error creating profile:', profileError);
            throw new Error('Не удалось создать профиль пользователя');
        }
    }

    // Проверяем, есть ли уже это медиа в базе
    let { data: existingMedia } = await supabase
        .from('media')
        .select('id')
        .eq('tmdb_id', tmdbId)
        .eq('media_type', mediaType)
        .single();

    let mediaId: number;

    if (!existingMedia) {
        // Создаём новую запись медиа
        const { data: newMedia, error: mediaError } = await supabase
            .from('media')
            .insert({
                tmdb_id: tmdbId,
                media_type: mediaType,
                title,
                poster_path: posterPath,
                backdrop_path: backdropPath,
                release_year: releaseYear,
                vote_average: voteAverage,
                total_seasons: totalSeasons,
                total_episodes: totalEpisodes,
                runtime,
            })
            .select('id')
            .single();

        if (mediaError) throw mediaError;
        mediaId = newMedia.id;
    } else {
        mediaId = existingMedia.id;
    }

    // Добавляем или обновляем запись user_media
    const { error: userMediaError } = await supabase
        .from('user_media')
        .upsert({
            user_id: user.id,
            media_id: mediaId,
            status,
            current_season: currentSeason,
            current_episode: currentEpisode,
            user_rating: userRating,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,media_id',
        });

    if (userMediaError) throw userMediaError;

    revalidatePath('/library');
    revalidatePath('/compare');

    return { success: true };
}

/**
 * Обновить статус просмотра
 */
export async function updateWatchStatus(
    userMediaId: number,
    status: WatchStatus,
    currentSeason?: number,
    currentEpisode?: number
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Необходима авторизация');
    }

    const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (currentSeason !== undefined) {
        updateData.current_season = currentSeason;
    }
    if (currentEpisode !== undefined) {
        updateData.current_episode = currentEpisode;
    }

    const { error } = await supabase
        .from('user_media')
        .update(updateData)
        .eq('id', userMediaId)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/library');
    revalidatePath('/compare');

    return { success: true };
}

/**
 * Удалить медиа из библиотеки
 */
export async function removeFromLibrary(userMediaId: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Необходима авторизация');
    }

    const { error } = await supabase
        .from('user_media')
        .delete()
        .eq('id', userMediaId)
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/library');
    revalidatePath('/compare');

    return { success: true };
}

/**
 * Получить библиотеку пользователя
 */
export async function getUserLibrary(userId?: string) {
    const supabase = await createClient();

    let targetUserId = userId;

    if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Необходима авторизация');
        }
        targetUserId = user.id;
    }

    const { data, error } = await supabase
        .from('user_media')
        .select(`
      *,
      media (*)
    `)
        .eq('user_id', targetUserId)
        .order('updated_at', { ascending: false });

    if (error) throw error;

    return data || [];
}

/**
 * Получить данные для страницы сравнения
 */
export async function getComparisonData() {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user1: null, user2: null, items: [] };

    const { data: user1Profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!user1Profile?.selected_friend_id) {
        return { user1: user1Profile, user2: null, items: [] };
    }

    // Получаем профиль друга
    const { data: user2Profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user1Profile.selected_friend_id)
        .single();

    if (!user2Profile) {
        return { user1: user1Profile, user2: null, items: [] };
    }

    const profiles = [user1Profile, user2Profile];

    // Получаем все медиа с данными обоих пользователей
    const { data: allMedia } = await supabase
        .from('media')
        .select(`
      *,
      user_media (
        *,
        profiles:user_id (username)
      )
    `)
        .order('created_at', { ascending: false });

    const items = (allMedia || []).map(media => {
        const user1Data = media.user_media.find((um: { user_id: string }) => um.user_id === profiles[0].id);
        const user2Data = media.user_media.find((um: { user_id: string }) => um.user_id === profiles[1].id);

        return {
            media,
            user1: user1Data || null,
            user2: user2Data || null,
        };
    }).filter(item => item.user1 || item.user2);

    return {
        user1: profiles[0],
        user2: profiles[1],
        items,
    };
}
