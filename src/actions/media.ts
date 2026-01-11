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
    userRating: number | null = null,
    isPrivate: number = 0  // 0 = false, 1 = true (для надёжной сериализации)
) {
    const isPrivateBool = isPrivate === 1;
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
    const { data: existingMedia } = await supabase
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

        if (mediaError) {
            console.error('Error creating media:', mediaError, { tmdbId, mediaType, title });
            throw new Error(`Не удалось добавить "${title}" в базу: ${mediaError.message}`);
        }
        if (!newMedia) {
            throw new Error(`Не удалось добавить "${title}" в базу: данные не получены`);
        }
        mediaId = newMedia.id;
    } else {
        mediaId = existingMedia.id;
    }

    // Проверяем, есть ли уже запись user_media для этого пользователя и медиа
    const { data: existingUserMedia } = await supabase
        .from('user_media')
        .select('id')
        .eq('user_id', user.id)
        .eq('media_id', mediaId)
        .single();

    if (existingUserMedia) {
        // Обновляем существующую запись
        const { error: updateError } = await supabase
            .from('user_media')
            .update({
                status,
                current_season: currentSeason,
                current_episode: currentEpisode,
                user_rating: userRating,
                is_private: isPrivateBool,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingUserMedia.id);

        if (updateError) {
            console.error('Error updating user_media:', updateError);
            throw new Error(`Не удалось обновить статус: ${updateError.message}`);
        }
    } else {
        // Создаём новую запись
        const { error: insertError } = await supabase
            .from('user_media')
            .insert({
                user_id: user.id,
                media_id: mediaId,
                status,
                current_season: currentSeason,
                current_episode: currentEpisode,
                user_rating: userRating,
                is_private: isPrivateBool,
                updated_at: new Date().toISOString(),
            });

        if (insertError) {
            console.error('Error inserting user_media:', insertError);
            throw new Error(`Не удалось сохранить в библиотеку: ${insertError.message}`);
        }
    }

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

    // Получаем текущего пользователя
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    let targetUserId = userId;
    const isViewingOwnLibrary = !userId || userId === currentUser?.id;

    if (!targetUserId) {
        if (!currentUser) {
            throw new Error('Необходима авторизация');
        }
        targetUserId = currentUser.id;
    }

    let query = supabase
        .from('user_media')
        .select(`
      *,
      media (*)
    `)
        .eq('user_id', targetUserId);

    // Если смотрим чужую библиотеку — скрываем приватные записи
    if (!isViewingOwnLibrary) {
        query = query.eq('is_private', false);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

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
        const user1DataRaw = media.user_media.find((um: { user_id: string }) => um.user_id === profiles[0].id);
        const user2DataRaw = media.user_media.find((um: { user_id: string }) => um.user_id === profiles[1].id);

        // Свои данные всегда видны, приватные записи друга скрыты
        const user1Data = user1DataRaw || null;
        const user2Data = user2DataRaw?.is_private ? null : (user2DataRaw || null);

        return {
            media,
            user1: user1Data,
            user2: user2Data,
        };
    }).filter(item => item.user1 || item.user2);

    return {
        user1: profiles[0],
        user2: profiles[1],
        items,
    };
}
