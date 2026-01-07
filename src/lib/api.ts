// API Service Layer for MySmash Frontend
// Based on padelvar-frontend-main/src/lib/api.js

import axios, { AxiosInstance } from 'axios';
import { tokenManager } from './tokenManager';

// Railway URL - Better CORS support than Render
const API_BASE_URL = 'https://spovio-backend-main-production.up.railway.app/api';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAssetUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');

    return `${baseUrl}/${cleanPath}`;
};

let isRedirecting = false;

// Re-export tokenManager for convenience
export { tokenManager };

// Request interceptor - Attach JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = tokenManager.getToken();

        // Ensure headers object exists
        if (!config.headers) {
            config.headers = {} as any;
        }

        if (token) {
            // Use custom header X-Auth-Token instead of Authorization to bypass CORS issues
            config.headers['X-Auth-Token'] = token;

            console.log('[API DEBUG] Token attached to request:', {
                tokenLength: token.length,
                authHeader: `Token ${token.substring(0, 20)}...`
            });
        } else {
            console.log('[API DEBUG] No token available to attach');
        }

        console.log('[API DEBUG] Request:', {
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            hasToken: !!token,
            hasAuthHeader: !!config.headers['X-Auth-Token'],
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('[API DEBUG] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token management
api.interceptors.response.use(
    (response) => {
        // Store JWT token if present in response
        if (response.data?.token) {
            tokenManager.setToken(response.data.token);
            console.log('[API] JWT token stored from response');
        }
        return response;
    },
    (error) => {
        console.error('[API DEBUG] Response error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message
        });

        // Redirect to login only for real 401 errors (not authenticated)
        // NOT for 500 errors (server errors)
        // AND NOT for public routes
        if (error.response?.status === 401) {
            const publicRoutes = ['/login', '/register', '/auth', '/super-secret-login', '/forgot-password', '/reset-password', '/verify-email'];
            const isPublicRoute = publicRoutes.some(route => window.location.pathname.startsWith(route));

            if (!isRedirecting && !isPublicRoute) {
                isRedirecting = true;
                console.warn('[API] 401 Error - Clearing token and redirecting to auth');
                tokenManager.clearToken(); // Clear invalid token
                window.location.href = '/auth';
                setTimeout(() => {
                    isRedirecting = false;
                }, 1000);
            }
        }
        return Promise.reject(error);
    }
);

// Authentication Service
export const authService = {
    register: (userData: any) => api.post('/auth/register', userData),
    login: (credentials: any) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
    updateProfile: (profileData: any) => api.put('/auth/update-profile', profileData),
    changePassword: (passwordData: any) => api.post('/auth/change-password', passwordData),
    verifyEmail: (email: string, code: string) => api.post('/auth/verify-email', { email, code }),
    resendVerificationCode: (email: string) => api.post('/auth/resend-verification', { email }),
};

// Video Service
export const videoService = {
    getMyVideos: () => api.get(`/videos/my-videos?_t=${Date.now()}`),
    startRecording: (data: any) => api.post('/videos/record', data),
    stopRecording: (data: any) => api.post('/videos/stop-recording', data),
    unlockVideo: (videoId: string) => api.post(`/videos/${videoId}/unlock`),
    getVideo: (videoId: string) => api.get(`/videos/${videoId}`),
    shareVideo: (videoId: string, platform: string) => api.post(`/videos/${videoId}/share`, { platform }),
    buyCredits: (purchaseData: any) => api.post('/players/credits/buy', purchaseData),
    getCreditPackages: () => api.get('/players/credits/packages'),
    getPaymentMethods: () => api.get('/players/credits/payment-methods'),
    getCreditsHistory: () => api.get('/players/credits/history'),
    scanQrCode: (qrCode: string) => api.post('/videos/qr-scan', { qr_code: qrCode }),
    getCameraStream: (courtId: string) => api.get(`/videos/courts/${courtId}/camera-stream`),
    getCourtsForClub: (clubId: string) => api.get(`/videos/clubs/${clubId}/courts`),
    updateVideo: (videoId: string, data: any) => api.put(`/videos/${videoId}`, data),
    deleteVideo: (videoId: string) => api.delete(`/videos/${videoId}`),
    getRecordingStatus: (recordingId: string) => api.get(`/videos/recording/${recordingId}/status`),
    stopRecordingById: (recordingId: string, data: any) => api.post(`/videos/recording/${recordingId}/stop`, data),
    getAvailableCourts: () => api.get('/videos/courts/available'),
    downloadVideo: (videoId: string) => api.get(`/videos/download/${videoId}`, { responseType: 'blob' }),
    getClubCourtsForPlayers: (clubId: string) => api.get(`/recording/v3/clubs/${clubId}/courts?_t=${Date.now()}`),
    shareVideoWithUser: (videoId: string, recipientEmail: string, message: string) =>
        api.post(`/videos/${videoId}/share-with-user`, { recipient_email: recipientEmail, message }),
    getSharedWithMe: () => api.get('/videos/shared-with-me'),
    removeSharedAccess: (sharedVideoId: string) => api.delete(`/videos/shared/${sharedVideoId}`),
    getMySharedVideos: () => api.get('/videos/my-shared-videos'),
    getVideoOverlays: (videoId: string) => api.get(`/videos/${videoId}/overlays`),
};

// Recording Service
export const recordingService = {
    startAdvancedRecording: (data: any) => api.post('/recording/v3/start', data),
    stopRecording: (recordingId: string) => api.post(`/recording/v3/stop/${recordingId}`),
    forceStopRecording: (recordingId: string) => api.post(`/recording/v3/force-stop/${recordingId}`),
    getMyActiveRecording: () => api.get('/recording/v3/my-active'),
    getClubActiveRecordings: () => api.get('/recording/v3/club/active'),
    getAvailableCourts: (clubId: string) => api.get(`/recording/v3/available-courts/${clubId}`),
    cleanupExpiredRecordings: () => api.post('/recording/v3/cleanup-expired'),
    getClubCourtsForPlayers: (clubId: string) => api.get(`/recording/v3/clubs/${clubId}/courts?_t=${Date.now()}`),
    getAllAvailableCourts: () => api.get('/recording/v3/available-courts'),
    startSimpleRecording: (data: any) => api.post('/recording/v3/start-simple', data),
};

// Player Service
export const playerService = {
    getAvailableClubs: () => api.get('/players/clubs/available'),
    followClub: (clubId: string) => api.post(`/players/clubs/${clubId}/follow`),
    unfollowClub: (clubId: string) => api.post(`/players/clubs/${clubId}/unfollow`),
    getFollowedClubs: () => api.get('/players/clubs/followed'),
};

// Support Service
export const supportService = {
    createMessage: (data: any) => api.post('/support/messages', data),
    getMyMessages: () => api.get('/support/messages'),
    getAllMessages: (params: any) => api.get('/support/admin/messages', { params }),
    updateMessage: (messageId: string, data: any) => api.patch(`/support/admin/messages/${messageId}`, data),
};

// Notification Service
export const notificationService = {
    getMyNotifications: () => api.get('/notifications'),
    markAsRead: (id: string) => api.post(`/notifications/${id}/mark-read`),
    markAllAsRead: () => api.post('/notifications/mark-all-read'),
};

// Club Service
export const clubService = {
    getDashboard: () => api.get('/clubs/dashboard'),
    getClubInfo: () => api.get('/clubs/info'),
    getCourts: () => api.get('/clubs/courts'),
    getClubVideos: () => api.get('/clubs/videos'),
    getAllClubs: () => api.get('/clubs/all'),
    getClubHistory: () => api.get('/clubs/history'),
    getFollowers: () => api.get('/clubs/followers'),
    updateProfile: (clubData: any) => api.put('/clubs/profile', clubData),
    stopRecording: (courtId: string) => api.post(`/clubs/courts/${courtId}/stop-recording`),
    cleanupExpiredSessions: () => api.post('/clubs/cleanup-expired-sessions'),
    buyCredits: (purchaseData: any) => api.post('/clubs/credits/buy', purchaseData),
    getCreditsHistory: () => api.get('/clubs/credits/history'),
    getCreditPackages: () => api.get('/clubs/credits/packages'),
};

// Tutorial Service
export const tutorialService = {
    getStatus: () => api.get('/tutorial/status'),
    updateStep: (step: number) => api.post('/tutorial/step', { step }),
    complete: () => api.post('/tutorial/complete'),
    reset: () => api.post('/tutorial/reset'),
    skip: () => api.post('/tutorial/skip'),
};

// Analytics Service (for admin)
export const analyticsService = {
    getSystemHealth: () => api.get('/analytics/system-health'),
    getPlatformOverview: () => api.get('/analytics/platform-overview'),
    getUserGrowth: (timeframe: string = 'week') => api.get(`/analytics/user-growth?timeframe=${timeframe}`),
    getClubAdoption: (timeframe: string = 'month') => api.get(`/analytics/club-adoption?timeframe=${timeframe}`),
    getRevenueGrowth: (timeframe: string = 'month') => api.get(`/analytics/revenue-growth?timeframe=${timeframe}`),
    getUserEngagement: () => api.get('/analytics/user-engagement'),
    getTopClubs: (limit: number = 10) => api.get(`/analytics/top-clubs?limit=${limit}`),
    getFinancialOverview: () => api.get('/analytics/financial-overview'),
};

// Clip Service
export const clipService = {
    uploadDirectClip: (formData: FormData) => api.post('/clips/upload-direct', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyClips: () => api.get('/clips/my-clips'),
    createClip: (data: { video_id: string; start_time: number; end_time: number; title: string; description?: string }) =>
        api.post('/clips/create', data),
    getClip: (clipId: string) => api.get(`/clips/${clipId}`),
    getVideoClips: (videoId: string) => api.get(`/clips/video/${videoId}`),
    deleteClip: (clipId: string) => api.delete(`/clips/${clipId}`),
    shareClip: (clipId: string, platform?: string) =>
        api.post(`/clips/${clipId}/share`, platform ? { platform } : {}),
    trackDownload: (clipId: string) => api.post(`/clips/${clipId}/download`),
    getClipMeta: (clipId: string) => api.get(`/clips/${clipId}/meta`),
};

export default api;
