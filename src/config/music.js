// src/config/music.js
export const YOUTUBE_PLAYLIST_URL = "https://youtube.com/playlist?list=PLaORmyR8RuRs&si=F6ewZwLr35KLU23d";

/**
 * Extracts the playlist ID from standard and watch URLs
 * @param {string} url 
 * @returns {string|null}
 */
export function extractPlaylistId(url = YOUTUBE_PLAYLIST_URL) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const listParam = urlObj.searchParams.get("list");
    if (listParam) return listParam;
  } catch {
    // Fallback regex matching
    const match = url.match(/[?&]list=([^&#]+)/);
    if (match && match[1]) return match[1];
  }
  return null;
}
