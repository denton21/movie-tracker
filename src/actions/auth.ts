'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Генерация "фейкового" email на основе username
 * Supabase требует email, но мы его скрываем от пользователя
 */
function generateEmail(username: string): string {
    return `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@movietracker.local`;
}

/**
 * Вход по имени и паролю
 */
export async function signIn(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    // Сначала ищем пользователя по username чтобы получить его email (без учёта регистра)
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', username)
        .single();

    if (!profile) {
        return { error: 'Пользователь не найден.' };
    }

    // Пробуем войти с сгенерированным email (используем username из БД для правильного регистра)
    const email = generateEmail(profile.username);

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('Invalid login credentials')) {
            return { error: 'Неверный пароль.' };
        }
        return { error: error.message };
    }

    redirect('/library');
}

/**
 * Регистрация нового пользователя
 */
export async function signUp(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    // Проверяем, не занято ли имя пользователя
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

    if (existingUser) {
        return { error: 'Это имя пользователя уже занято.' };
    }

    // Генерируем email на основе username
    const email = generateEmail(username);

    // Регистрируем пользователя
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        if (error.message.includes('already registered')) {
            return { error: 'Это имя пользователя уже занято.' };
        }
        if (error.message.includes('Password')) {
            return { error: 'Пароль должен быть не менее 6 символов.' };
        }
        return { error: error.message };
    }

    // Создаём профиль
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                username,
            });

        if (profileError) {
            if (profileError.message.includes('profiles_username_key')) {
                return { error: 'Это имя пользователя уже занято.' };
            }
            return { error: 'Не удалось создать профиль.' };
        }
    }

    redirect('/library');
}

/**
 * Выход из аккаунта
 */
export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}

/**
 * Получить текущего пользователя
 */
export async function getCurrentUser() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile;
}

/**
 * Получить профиль друга (выбранного пользователя)
 */
export async function getFriendProfile() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Сначала получаем ID выбранного друга из профиля текущего пользователя
    const { data: profile } = await supabase
        .from('profiles')
        .select('selected_friend_id')
        .eq('id', user.id)
        .single();

    if (!profile?.selected_friend_id) return null;

    // Получаем данные выбранного друга
    const { data: friend } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.selected_friend_id)
        .single();

    return friend;
}
