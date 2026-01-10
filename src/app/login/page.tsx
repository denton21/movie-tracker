'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/actions/auth';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = isLogin
                ? await signIn(formData)
                : await signUp(formData);

            if (result?.error) {
                setError(result.error);
            }
        } catch (err) {
            setError('Произошла ошибка. Попробуйте ещё раз.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Фоновые элементы */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="glass rounded-3xl p-8">
                    {/* Заголовок */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🎬</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {isLogin ? 'Добро пожаловать!' : 'Регистрация'}
                        </h1>
                        <p className="text-white/60">
                            {isLogin
                                ? 'Войдите, чтобы продолжить'
                                : 'Создайте аккаунт для отслеживания'}
                        </p>
                    </div>

                    {/* Форма */}
                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white/80 text-sm mb-2">
                                Имя пользователя
                            </label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ваше имя"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm mb-2">
                                Пароль
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isLoading
                                ? 'Загрузка...'
                                : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                        </button>
                    </form>

                    {/* Переключатель */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            {isLogin
                                ? 'Нет аккаунта? Зарегистрируйтесь'
                                : 'Уже есть аккаунт? Войдите'}
                        </button>
                    </div>
                </div>

                {/* Демо-доступ */}
                <div className="mt-6 p-4 glass rounded-2xl text-center">
                    <p className="text-white/60 text-sm mb-2">
                        Для тестирования создайте двух пользователей
                    </p>
                    <p className="text-white/40 text-xs">
                        Каждый пользователь видит библиотеку другого
                    </p>
                </div>
            </div>
        </div>
    );
}
