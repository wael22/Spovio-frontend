// API Service Layer for MySmash Frontend
// Session-based authentication (cookies) - No JWT token management needed

import axios, { AxiosInstance } from 'axios';

// LOCAL DEVELOPMENT - Backend on localhost:5000
const API_BASE_URL = 'http://localhost:5000/api';

// Production Railway URL (commented out)
// const API_BASE_URL = 'https://spovio-backend-main-production.up.railway.app/api';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,  // 🔑 CRITICAL: Enable session cookies for authentication
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

// Request interceptor - Simple logging (sessions handle authentication via cookies)
api.interceptors.request.use(
    (config) => {
        console.log('[API DEBUG] Request:', {
            url: config.url,
            baseURL: config.baseURL,
            method: config.method
        });
        return config;
    },
    (error) => {
        console.error('[API DEBUG] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and redirect on 401
api.interceptors.response.use(
    (response) => {
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

        // Redirect to /auth on 401 (session expired or not authenticated)
        if (error.response?.status === 401) {
            const publicRoutes = ['/login', '/register', '/auth', '/super-secret-login', '/forgot-password', '/reset-password', '/verify-email'];
            const isPublicRoute = publicRoutes.some(route => window.location.pathname.startsWith(route));

            if (!isRedirecting && !isPublicRoute) {
                isRedirecting = true;
                console.warn('[API] Redirecting to /auth - 401 Unauthorized (session expired)');
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
    superAdminLogin: (credentials: any) => api.post('/auth/super-admin-login', credentials),
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
    getPaymentMethods: () => api.get('/players/credits/payment-methods'),

    // Player Management
    updatePlayer: (playerId: string, playerData: any) => api.put(`/clubs/${playerId}`, playerData),
    addCreditsToPlayer: (playerId: string, credits: number) =>
        api.post(`/clubs/${playerId}/add-credits`, { credits }),

    // Follower Management (aliases for player management)
    updateFollower: (playerId: string, playerData: any) =>
        clubService.updatePlayer(playerId, playerData),
    addCreditsToFollower: (playerId: string, credits: number) =>
        clubService.addCreditsToPlayer(playerId, credits),
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

// Admin Service (Super Admin only)
export const adminService = {
    // User Management
    getAllUsers: () => api.get('/admin/users'),
    createUser: (userData: any) => api.post('/admin/users', userData),
    updateUser: (userId: string, userData: any) => api.put(`/admin/users/${userId}`, userData),
    deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

    // Club Management
    getAllClubs: () => api.get('/admin/clubs'),
    createClub: (clubData: any) => api.post('/admin/clubs', clubData),
    updateClub: (clubId: string, clubData: any) => api.put(`/admin/clubs/${clubId}`, clubData),
    deleteClub: (clubId: string) => api.delete(`/admin/clubs/${clubId}`),

    // Court Management
    createCourt: (clubId: string, courtData: any) => api.post(`/admin/clubs/${clubId}/courts`, courtData),
    getClubCourts: (clubId: string) => api.get(`/admin/clubs/${clubId}/courts`),
    updateCourt: (courtId: string, courtData: any) => api.put(`/admin/courts/${courtId}`, courtData),
    deleteCourt: (courtId: string) => api.delete(`/admin/courts/${courtId}`),
    getAllCourts: () => api.get('/admin/courts'),

    // Video Management
    getAllVideos: () => api.get('/admin/videos'),
    deleteVideo: (videoId: string, mode: 'local_only' | 'cloud_only' | 'local_and_cloud' = 'local_and_cloud') =>
        api.delete(`/admin/videos/${videoId}`, { data: { mode } }),

    // Credits Management
    addCredits: (userId: string, credits: number) => api.post(`/admin/users/${userId}/credits`, { credits }),
    addCreditsToClub: (clubId: string, credits: number) => api.post(`/admin/clubs/${clubId}/credits`, { credits }),

    // Club History
    getAllClubsHistory: () => api.get('/admin/clubs/history/all'),

    // System Configuration
    getSystemConfig: () => api.get('/admin/config'),
    getBunnyCDNConfig: () => api.get('/admin/config/bunny-cdn'),
    updateBunnyCDNConfig: (config: any) => api.put('/admin/config/bunny-cdn', config),
    testBunnyCDN: (config: any) => api.post('/admin/config/test-bunny', config),

    // Logs Management
    getLogs: (params?: any) => api.get('/admin/logs', { params }),
    downloadLogs: () => api.get('/admin/logs/download', { responseType: 'blob' }),

    // Notifications Management
    getNotifications: () => api.get('/notifications'),
    markNotificationAsRead: (notificationId: string) => api.post(`/notifications/${notificationId}/mark-read`),
    markAllNotificationsAsRead: () => api.post('/notifications/mark-all-read'),

    // Credit Packages Management
    getCreditPackages: (type?: 'player' | 'club') => api.get(`/admin/credit-packages${type ? `?type=${type}` : ''}`),
    createCreditPackage: (packageData: any) => api.post('/admin/credit-packages', packageData),
    updateCreditPackage: (packageId: string, packageData: any) => api.put(`/admin/credit-packages/${packageId}`, packageData),
    deleteCreditPackage: (packageId: string) => api.delete(`/admin/credit-packages/${packageId}`),

    // Overlays Management
    uploadImage: (formData: FormData) => api.post('/admin/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getClubOverlays: (clubId: string) => api.get(`/admin/clubs/${clubId}/overlays`),
    createClubOverlay: (clubId: string, data: any) => api.post(`/admin/clubs/${clubId}/overlays`, data),
    updateClubOverlay: (clubId: string, overlayId: string, data: any) =>
        api.put(`/admin/clubs/${clubId}/overlays/${overlayId}`, data),
    deleteClubOverlay: (clubId: string, overlayId: string) =>
        api.delete(`/admin/clubs/${clubId}/overlays/${overlayId}`),
};

// Settings Service
export const settingsService = {
    getSettings: () => api.get('/settings'),
    updateSettings: (settings: any) => api.put('/settings', settings),
};

export default api;
