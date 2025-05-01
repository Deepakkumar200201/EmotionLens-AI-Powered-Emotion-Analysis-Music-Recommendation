import fetch from 'node-fetch';

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.warn('Spotify API credentials are missing. Some features will be unavailable.');
}

let spotifyToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get access token for Spotify API
 */
async function getSpotifyToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if it's still valid
  if (spotifyToken && tokenExpiry > now) {
    return spotifyToken;
  }
  
  try {
    // Request new token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Spotify token: ${response.statusText}`);
    }
    
    const data = await response.json() as { access_token: string, expires_in: number };
    
    // Cache token and set expiry (subtract 60 seconds to be safe)
    spotifyToken = data.access_token;
    tokenExpiry = now + (data.expires_in - 60) * 1000;
    
    return spotifyToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
}

/**
 * Search for tracks on Spotify
 */
export async function searchSpotifyTracks(query: string, limit: number = 10): Promise<any[]> {
  try {
    const token = await getSpotifyToken();
    
    // Request more tracks than needed so we can filter for ones with preview URLs
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit * 2}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }
    
    const data = await response.json() as { tracks: { items: any[] } };
    
    // Filter to prioritize tracks that have preview URLs
    const tracksWithPreviews = data.tracks.items.filter(track => track.preview_url);
    const tracksWithoutPreviews = data.tracks.items.filter(track => !track.preview_url);
    
    // If we have enough tracks with previews, return those
    if (tracksWithPreviews.length >= limit) {
      return tracksWithPreviews.slice(0, limit);
    }
    
    // Otherwise, combine tracks with previews and add some without
    const tracksToReturn = [
      ...tracksWithPreviews,
      ...tracksWithoutPreviews.slice(0, limit - tracksWithPreviews.length)
    ];
    
    return tracksToReturn.slice(0, limit);
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return [];
  }
}

/**
 * Get Bengali music recommendations based on emotion
 */
export async function getBengaliMusicByEmotion(emotion: string): Promise<any[]> {
  // Normalize emotion to lowercase for consistent matching
  const normalizedEmotion = emotion.toLowerCase();
  console.log(`Getting Bengali music recommendations for normalized emotion: ${normalizedEmotion}`);
  
  // Map emotions to Bengali music search terms - organized by our 5 basic emotion categories
  const emotionToSearchTerm: Record<string, string[]> = {
    // Happy/Positive category
    'happy': ['happy bengali songs', 'bengali happy music', 'bengali dance songs', 'bengali festival songs'],
    'joy': ['happy bengali songs', 'bengali happy music', 'bengali dance songs', 'bengali celebration songs'],
    'content': ['melodious bengali songs', 'bengali romantic', 'sweet bengali music', 'peaceful bengali songs'],
    'excited': ['energetic bengali songs', 'bengali party songs', 'fast bengali music', 'bengali celebration songs'],
    
    // Sad/Melancholic category
    'sad': ['sad bengali songs', 'rabindra sangeet', 'bengali melancholic songs', 'emotional bengali songs'],
    'melancholy': ['sad bengali songs', 'rabindra sangeet', 'bengali melancholic songs', 'emotional bengali songs'],
    'depressed': ['sad bengali songs', 'emotional bengali music', 'bengali heartbreak songs'],
    
    // Angry/Intense category
    'angry': ['powerful bengali songs', 'bengali rock', 'energetic bengali music', 'intense bengali songs'],
    'frustrated': ['powerful bengali songs', 'bengali rock', 'energetic bengali music'],
    'contempt': ['rebellious bengali songs', 'bengali protest songs', 'bengali folk'],
    'disgusted': ['intense bengali songs', 'bengali experimental', 'alternative bengali'],
    
    // Calm/Peaceful category
    'calm': ['soft bengali songs', 'rabindra sangeet', 'bengali classical', 'meditative bengali music'],
    'peaceful': ['soft bengali songs', 'rabindra sangeet', 'bengali classical', 'meditative bengali music'],
    'relaxed': ['soft bengali songs', 'bengali ambient', 'bengali classical instrumental'],
    'thoughtful': ['bengali philosophical songs', 'rabindra sangeet', 'reflective bengali music'],
    
    // Neutral category
    'neutral': ['popular bengali songs', 'best bengali songs', 'top bengali hits', 'modern bengali songs'],
    
    // Other emotional states
    'surprised': ['upbeat bengali songs', 'bengali pop', 'fusion bengali music', 'bengali movie hits'],
    'fearful': ['calming bengali songs', 'peaceful bengali music', 'soothing bengali', 'spiritual bengali songs'],
    'anxious': ['calming bengali songs', 'meditative bengali music', 'peaceful instrumental bengali'],
    'confused': ['meditative bengali songs', 'instrumental bengali', 'ambient bengali', 'bengali classical'],
    'bored': ['upbeat bengali songs', 'lively bengali music', 'catchy bengali hits'],
  };
  
  // Get more specific search terms for the emotion, or fallback to a general category
  let searchTerms = emotionToSearchTerm[normalizedEmotion] || [];
  
  // If no specific terms found, try to map to basic emotion categories for backup
  if (searchTerms.length === 0) {
    if (normalizedEmotion.includes('joy') || normalizedEmotion.includes('happy') || 
        normalizedEmotion.includes('content') || normalizedEmotion.includes('excite')) {
      searchTerms = emotionToSearchTerm['happy'];
    } else if (normalizedEmotion.includes('sad') || normalizedEmotion.includes('depress') || 
              normalizedEmotion.includes('melancho') || normalizedEmotion.includes('disappoint')) {
      searchTerms = emotionToSearchTerm['sad'];
    } else if (normalizedEmotion.includes('angry') || normalizedEmotion.includes('rage') || 
              normalizedEmotion.includes('upset') || normalizedEmotion.includes('irritat')) {
      searchTerms = emotionToSearchTerm['angry'];
    } else if (normalizedEmotion.includes('calm') || normalizedEmotion.includes('peace') || 
              normalizedEmotion.includes('relax') || normalizedEmotion.includes('tranquil')) {
      searchTerms = emotionToSearchTerm['calm'];
    } else {
      // Default to popular songs if no match
      searchTerms = emotionToSearchTerm['neutral'];
    }
  }
  
  console.log(`Using search terms for ${normalizedEmotion}:`, searchTerms);
  
  // Try each search term until we find tracks with preview URLs
  for (const term of searchTerms) {
    try {
      const results = await searchSpotifyTracks(term, 5);
      
      // If we got results with preview URLs, return them
      const tracksWithPreviews = results.filter(track => track.preview_url);
      if (tracksWithPreviews.length > 0) {
        console.log(`Found ${tracksWithPreviews.length} Bengali tracks with previews for term: "${term}"`);
        return results;
      }
    } catch (error) {
      console.error(`Error searching for term "${term}":`, error);
      continue; // Try next search term
    }
  }
  
  // If bengali music search fails, try general music based on emotion
  console.log("Couldn't find Bengali tracks with previews, trying general music search");
  
  // Map to general music search terms based on emotion
  const generalSearchTerms: Record<string, string[]> = {
    'happy': ['happy songs', 'feel good music', 'upbeat hits'],
    'sad': ['sad songs', 'emotional ballads', 'melancholic music'],
    'angry': ['angry songs', 'intense music', 'rock anthems'],
    'calm': ['calming songs', 'relaxing music', 'ambient tunes'],
    'excited': ['energetic songs', 'party music', 'dance hits']
  };
  
  // Try general music search based on emotion category
  const generalTerms = generalSearchTerms[normalizedEmotion] || 
                      generalSearchTerms[mapToBasicCategory(normalizedEmotion)] || 
                      ['popular songs'];
                      
  for (const term of generalTerms) {
    try {
      const results = await searchSpotifyTracks(term, 5);
      if (results.length > 0) {
        console.log(`Found ${results.length} general tracks for term: "${term}"`);
        return results;
      }
    } catch (error) {
      console.error(`Error searching for general term "${term}":`, error);
      continue;
    }
  }
  
  // Final fallback to popular songs
  return await searchSpotifyTracks('popular songs', 5);
}

// Helper function to map any emotion to one of the 5 basic categories
function mapToBasicCategory(emotion: string): string {
  if (emotion.includes('joy') || 
      emotion.includes('happy') || 
      emotion.includes('content') || 
      emotion.includes('excite')) {
    return 'happy';
  } else if (emotion.includes('sad') || 
             emotion.includes('depress') || 
             emotion.includes('melancho')) {
    return 'sad';
  } else if (emotion.includes('angry') || 
             emotion.includes('rage') || 
             emotion.includes('frustrat')) {
    return 'angry';
  } else if (emotion.includes('calm') || 
             emotion.includes('peaceful') || 
             emotion.includes('relax')) {
    return 'calm';
  } else if (emotion.includes('excite') || 
             emotion.includes('thrill') || 
             emotion.includes('energetic')) {
    return 'excited';
  } else {
    return 'happy'; // Default fallback
  }
}

/**
 * Format Spotify track data to our application format
 */
export function formatSpotifyTracks(tracks: any[]): { 
  id: string; 
  title: string; 
  artist: string; 
  coverUrl: string;
  previewUrl: string | null;
  spotifyUrl: string;
}[] {
  return tracks.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    coverUrl: track.album.images[0]?.url || '',
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls.spotify
  }));
}