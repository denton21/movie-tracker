// API роут для поиска медиа через TMDB
import { NextRequest, NextResponse } from 'next/server';
import { searchMedia } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await searchMedia(query);
        return NextResponse.json({ results });
    } catch (error) {
        console.error('Ошибка поиска:', error);
        return NextResponse.json(
            { error: 'Ошибка поиска' },
            { status: 500 }
        );
    }
}
