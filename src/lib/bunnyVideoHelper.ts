/**
 * Bunny Video Helper
 * Gère les URLs de vidéos Bunny avec fallback automatique de résolution
 */

const CDN_HOSTNAME = 'vz-9b857324-07d.b-cdn.net';

// Résolutions disponibles sur Bunny, par ordre de préférence
const RESOLUTIONS = ['1080p', '720p', '480p', '360p', '240p'] as const;
type Resolution = typeof RESOLUTIONS[number];

/**
 * Tente de télécharger une vidéo en essayant plusieurs résolutions
 * @param bunnyVideoId - ID de la vidéo Bunny
 * @param preferredResolution - Résolution préférée (par défaut: 720p)
 * @returns Promise avec l'URL qui fonctionne
 */
export async function getWorkingVideoUrl(
    bunnyVideoId: string,
    preferredResolution: Resolution = '720p'
): Promise<string> {
    // Commencer par la résolution préférée, puis descendre
    const startIndex = RESOLUTIONS.indexOf(preferredResolution);
    const resolutionsToTry = [
        ...RESOLUTIONS.slice(startIndex), // De la préférée vers le bas
        ...RESOLUTIONS.slice(0, startIndex).reverse() // Puis essayer vers le haut si besoin
    ];

    for (const resolution of resolutionsToTry) {
        const url = `https://${CDN_HOSTNAME}/${bunnyVideoId}/play_${resolution}.mp4`;

        try {
            // Faire une requête HEAD pour vérifier si le fichier existe
            const response = await fetch(url, { method: 'HEAD' });

            if (response.ok) {
                console.log(`✅ Résolution ${resolution} disponible pour ${bunnyVideoId}`);
                return url;
            }
        } catch (error) {
            // Continue vers la prochaine résolution
            console.log(`❌ Résolution ${resolution} non disponible, essai suivant...`);
        }
    }

    // Si aucune résolution ne fonctionne, retourner la 720p par défaut
    console.warn(`⚠️ Aucune résolution trouvée pour ${bunnyVideoId}, retour à 720p`);
    return `https://${CDN_HOSTNAME}/${bunnyVideoId}/play_720p.mp4`;
}

/**
 * Génère l'URL MP4 directe pour une vidéo Bunny
 * @param bunnyVideoId - ID de la vidéo
 * @param resolution - Résolution spécifique (optionnel)
 */
export function getBunnyVideoUrl(
    bunnyVideoId: string,
    resolution: Resolution = '720p'
): string {
    return `https://${CDN_HOSTNAME}/${bunnyVideoId}/play_${resolution}.mp4`;
}

/**
 * Génère l'URL de la playlist HLS
 */
export function getBunnyPlaylistUrl(bunnyVideoId: string): string {
    return `https://${CDN_HOSTNAME}/${bunnyVideoId}/playlist.m3u8`;
}
