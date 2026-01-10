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
 * Выбор друга для отслеживания
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
    revalidatePath('/library'); // На всякий случай

    return { success: true };
}
