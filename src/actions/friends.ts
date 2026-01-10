'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Поиск пользователей по имени (username)
 */
export async function searchUsers(query: string) {
    if (!query || query.length < 2) return [];

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Необходима авторизация');

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .neq('id', user.id) // Не искать самого себя
        .limit(10);

    if (error) {
        console.error('Search error:', error);
        return [];
    }

    return data || [];
}

/**
 * Выбор друга для отслеживания (старая версия, оставляем для совместимости)
 */
export async function updateSelectedFriend(friendId: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Необходима авторизация');

    const { error } = await supabase
        .from('profiles')
        .update({ selected_friend_id: friendId })
        .eq('id', user.id);

    if (error) {
        console.error('Update friend error:', error);
        throw new Error('Не удалось обновить выбранного друга');
    }

    revalidatePath('/friend');
    revalidatePath('/compare');
    revalidatePath('/library');

    return { success: true };
}

/**
 * Получить список друзей
 */
export async function getFriendsList() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Необходима авторизация');

    const { data, error } = await supabase
        .from('friends')
        .select(`
            id,
            friend_id,
            created_at,
            friend:profiles!friends_friend_id_fkey(id, username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Get friends error:', error);
        return [];
    }

    return data || [];
}

/**
 * Добавить друга в список
 */
export async function addFriend(friendId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Необходима авторизация');

    // Проверяем, не добавлен ли уже
    const { data: existing } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .single();

    if (existing) {
        throw new Error('Этот пользователь уже в друзьях');
    }

    const { error } = await supabase
        .from('friends')
        .insert({
            user_id: user.id,
            friend_id: friendId,
        });

    if (error) {
        console.error('Add friend error:', error);
        throw new Error('Не удалось добавить друга');
    }

    // Также устанавливаем как выбранного друга для сравнения
    await supabase
        .from('profiles')
        .update({ selected_friend_id: friendId })
        .eq('id', user.id);

    revalidatePath('/friend');
    revalidatePath('/compare');

    return { success: true };
}

/**
 * Удалить друга из списка
 */
export async function removeFriend(friendId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Необходима авторизация');

    const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', user.id)
        .eq('friend_id', friendId);

    if (error) {
        console.error('Remove friend error:', error);
        throw new Error('Не удалось удалить друга');
    }

    // Если удалённый друг был выбран, сбрасываем выбор
    const { data: profile } = await supabase
        .from('profiles')
        .select('selected_friend_id')
        .eq('id', user.id)
        .single();

    if (profile?.selected_friend_id === friendId) {
        await supabase
            .from('profiles')
            .update({ selected_friend_id: null })
            .eq('id', user.id);
    }

    revalidatePath('/friend');
    revalidatePath('/compare');

    return { success: true };
}

/**
 * Выбрать друга для сравнения (из списка)
 */
export async function selectFriendForCompare(friendId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Необходима авторизация');

    const { error } = await supabase
        .from('profiles')
        .update({ selected_friend_id: friendId })
        .eq('id', user.id);

    if (error) {
        console.error('Select friend error:', error);
        throw new Error('Не удалось выбрать друга');
    }

    revalidatePath('/friend');
    revalidatePath('/compare');

    return { success: true };
}
