'use server';

import { getMediaDetails } from '@/lib/tmdb';
import type { MediaType } from '@/types';

export async function getMediaDetailsAction(id: number, mediaType: MediaType) {
    try {
        return await getMediaDetails(id, mediaType);
    } catch (error) {
        console.error('Error fetching media details:', error);
        throw new Error('Failed to fetch media details');
    }
}
