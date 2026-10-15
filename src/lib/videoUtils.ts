/**
 * Utility functions for video and match handling (multi-camera support).
 */

/**
 * Resolves a unified match identifier for grouping multi-camera angles of the same match.
 * Works reliably even if match_session_id is null, suffixed with _camX, or matching via title/URL.
 */
export function getMatchKey(video: any): string {
  if (!video) return '';

  // 1. Direct match_session_id (strip any accidental _camX suffix)
  if (video.match_session_id && typeof video.match_session_id === 'string' && video.match_session_id.trim()) {
    return video.match_session_id.trim().replace(/_cam\d+$/i, '');
  }

  // 2. Bunny title (e.g. lightsail_123_cam1 -> lightsail_123)
  if (video.bunny_title && typeof video.bunny_title === 'string' && video.bunny_title.includes('_cam')) {
    return video.bunny_title.trim().replace(/_cam\d+$/i, '');
  }

  // 3. File URL pattern (e.g. /videos/rec_lightsail_123_cam1.mp4 -> lightsail_123)
  if (video.file_url && typeof video.file_url === 'string') {
    const match = video.file_url.match(/rec_([a-zA-Z0-9_.-]+?)_cam\d+/);
    if (match) return match[1];
  }

  // 4. Fallback: Title pattern (e.g. "Mixte p25 - Caméra 1" and "Mixte p25 - Caméra 2") on same court & date
  if (video.title && /-\s*(Caméra|Camera)\s*\d+$/i.test(video.title)) {
    const baseTitle = video.title.replace(/\s*-\s*(Caméra|Camera)\s*\d+$/i, '').trim().toLowerCase();
    const courtKey = String(video.court_name || video.court_id || '').trim().toLowerCase();
    const rawDate = String(video.recorded_at || video.created_at || '');
    const dateKey = rawDate.length >= 10 ? rawDate.substring(0, 10) : '';
    return `grouped_${baseTitle}_${courtKey}_${dateKey}`;
  }

  return `single_${video.id}`;
}

/**
 * Cleans camera suffixes (e.g. "- Caméra 1" or "- Camera 1") from match title when multiple angles exist.
 */
export function getCleanVideoTitle(video: any, anglesCount: number = 1): string {
  if (!video || !video.title) return '';
  if (anglesCount > 1) {
    return video.title.replace(/\s*-\s*(Caméra|Camera)\s*\d+$/i, '').trim() || video.title;
  }
  return video.title;
}
