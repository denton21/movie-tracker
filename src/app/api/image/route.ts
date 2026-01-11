import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const size = searchParams.get('size') || 'w500';

    if (!path) {
        return new NextResponse('Missing path parameter', { status: 400 });
    }

    try {
        const imageUrl = `https://image.tmdb.org/t/p/${size}${path}`;
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            return new NextResponse('Image not found', { status: 404 });
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        return new NextResponse('Failed to fetch image', { status: 500 });
    }
}
