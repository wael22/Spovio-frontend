// Custom Hook: useDashboardData
// Handles loading dashboard data from padelvar-backend

import { useState, useEffect, useCallback } from 'react';
import { videoService, recordingService } from '../services/api';
import type { DashboardData, ActiveRecording } from '../types';
import { toast } from 'sonner';

export const useDashboardData = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [activeRecording, setActiveRecording] = useState<ActiveRecording | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Load dashboard data (videos + stats)
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await videoService.getMyVideos();
            const videos = response.data.videos || [];

            // Calculate stats client-side
            const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

            setData({
                stats: {
                    total_videos: videos.length,
                    total_duration: totalDuration,
                },
                videos,
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des données';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check for active recording
    const checkActiveRecording = useCallback(async () => {
        try {
            const response = await recordingService.getMyActiveRecording();
            setActiveRecording(response.data.active_recording || null);
        } catch (err) {
            // Silent fail - no active recording is not an error
            console.debug('No active recording');
            setActiveRecording(null);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadData();
        checkActiveRecording();

        // Poll for active recording every 30 seconds
        const interval = setInterval(checkActiveRecording, 30000);

        return () => clearInterval(interval);
    }, [loadData, checkActiveRecording]);

    return {
        data,
        activeRecording,
        loading,
        error,
        reload: loadData,
        checkRecording: checkActiveRecording,
    };
};
