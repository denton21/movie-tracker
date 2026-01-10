// API роут для получения деталей медиа
import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetails, getTVDetails } from '@/lib/tmdb';
import type { MediaType } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Формат id: "movie-123" или "tv-456"
    const [mediaType, tmdbId] = id.split('-');

    if (!mediaType || !tmdbId) {
        return NextResponse.json(
            { error: 'Неверный формат ID' },
            { status: 400 }
        );
    }

    try {
        let details;
        if (mediaType === 'movie') {
            details = await getMovieDetails(parseInt(tmdbId));
        } else if (mediaType === 'tv') {
            details = await getTVDetails(parseInt(tmdbId));
        } else {
            return NextResponse.json(
                { error: 'Неподдерживаемый тип медиа' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ...details,
            media_type: mediaType as MediaType
        });
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        return NextResponse.json(
            { error: 'Ошибка получения данных' },
            { status: 500 }
        );
    }
}
