/**
 * FFmpeg.wasm Service
 * Handles client-side video processing using FFmpeg compiled to WebAssembly
 * Configuration identical to PadelVar for compatibility
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

class FFmpegService {
    private ffmpeg: FFmpeg | null = null;
    private loading: boolean = false;
    private loaded: boolean = false;

    /**
     * Load FFmpeg.wasm (one-time download ~25MB)
     */
    async load(onProgress?: (progress: number) => void): Promise<void> {
        if (this.loaded) {
            console.log('[FFmpeg] Already loaded');
            return;
        }

        if (this.loading) {
            // Wait for current loading to complete
            while (this.loading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }

        try {
            this.loading = true;
            this.ffmpeg = new FFmpeg();

            // Set up logging
            this.ffmpeg.on('log', ({ message }) => {
                console.log('[FFmpeg]', message);
            });

            // Load directly from CDN (esm version, no toBlobURL needed with correct CORS headers)
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

            console.log('[FFmpeg] Loading from:', baseURL);

            await this.ffmpeg.load({
                coreURL: `${baseURL}/ffmpeg-core.js`,
                wasmURL: `${baseURL}/ffmpeg-core.wasm`,
            });

            this.loaded = true;
            this.loading = false;
            console.log('[FFmpeg] Loaded successfully');

            if (onProgress) onProgress(1);
        } catch (error) {
            this.loading = false;
            console.error('[FFmpeg] Load failed:', error);
            throw new Error('Failed to load FFmpeg: ' + (error as Error).message);
        }
    }

    /**
     * Check if FFmpeg is loaded
     */
    isLoaded(): boolean {
        return this.loaded;
    }

    /**
     * Cut video from start to end time
     * @param videoBlob - Input video blob
     * @param start - Start time in seconds
     * @param end - End time in seconds
     * @param onProgress - Progress callback
     * @returns Output video blob
     */
    async cutVideo(
        videoBlob: Blob,
        start: number,
        end: number,
        onProgress?: (progress: number) => void
    ): Promise<Blob> {
        if (!this.ffmpeg || !this.loaded) {
            throw new Error('FFmpeg not loaded. Call load() first.');
        }

        try {
            const inputName = 'input.webm'; // WebM from MediaRecorder
            const outputName = 'output.mp4';
            const duration = end - start;

            console.log(`[FFmpeg] Cutting video: ${start}s to ${end}s (duration: ${duration}s)`);

            // Write input file to FFmpeg virtual filesystem
            await this.ffmpeg.writeFile(inputName, await fetchFile(videoBlob));

            // Progress tracking
            if (onProgress) {
                this.ffmpeg.on('progress', ({ progress }) => {
                    onProgress(progress);
                });
            }

            // Re-encode WebM to MP4 (VP8→H.264)
            await this.ffmpeg.exec([
                '-ss', start.toString(),
                '-i', inputName,
                '-t', duration.toString(),
                '-c:v', 'libx264',      // H.264 video
                '-preset', 'ultrafast', // Fast encoding
                '-crf', '23',           // Quality
                '-c:a', 'aac',          // AAC audio
                '-b:a', '128k',
                outputName
            ]);

            // Read output file
            const data = await this.ffmpeg.readFile(outputName);

            // Clean up files
            await this.ffmpeg.deleteFile(inputName);
            await this.ffmpeg.deleteFile(outputName);

            // Convert to blob
            const outputBlob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
            console.log(`[FFmpeg] Cut complete. Output size: ${(outputBlob.size / 1024 / 1024).toFixed(2)}MB`);

            return outputBlob;
        } catch (error) {
            console.error('[FFmpeg] Cut failed:', error);
            throw new Error('Video cutting failed: ' + (error as Error).message);
        }
    }

    /**
     * Terminate FFmpeg instance
     */
    terminate(): void {
        if (this.ffmpeg) {
            this.ffmpeg.terminate();
            this.ffmpeg = null;
            this.loaded = false;
            this.loading = false;
            console.log('[FFmpeg] Terminated');
        }
    }
}

// Export singleton instance
export const ffmpegService = new FFmpegService();
