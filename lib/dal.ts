import { cache } from "react";

export const getShows = cache(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    
    if (!apiUrl || !apiKey) {
        // Return empty array if API is not configured
        return [];
    }
    
    try {
        const shows = await fetch(`${apiUrl}${apiKey}`);
        return shows.json();
    } catch (error) {
        console.error('Failed to fetch shows:', error);
        return [];
    }
});

// export const getShowById = async (id: string) => {
//     const show = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shows/${id}`);
//     return show.json();
// };

