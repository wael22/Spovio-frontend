// MySmash API Service - Connection to padelvar-backend-main
// Backend URL: http://localhost:5001

import axios, { AxiosInstance } from 'axios';

const PADELVAR_BACKEND_URL = 'http://localhost:5000';

// Create axios instance for padelvar backend
export const padelvarApi: AxiosInstance = axios.create({
    baseURL: PADELVAR_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add JWT token
padelvarApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('mysmash_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
padelvarApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('mysmash_token');
            // Optionally redirect to login
        }
        return Promise.reject(error);
    }
);

// ============================================
// VIDEO SERVICE
// ============================================
export const videoService = {
    // Get user's videos
    getMyVideos: () => padelvarApi.get('/api/videos/my-videos'),

    // Get single video
    getVideoById: (id: number) => padelvarApi.get(`/api/videos/${id}`),

    // Delete video
    deleteVideo: (id: number) => padelvarApi.delete(`/api/videos/${id}`),

    // Update video title
    updateVideoTitle: (id: number, title: string) =>
        padelvarApi.put(`/api/videos/${id}/title`, { title }),

    // Share video
    shareVideo: (id: number, emails: string[], message?: string) =>
        padelvarApi.post(`/api/videos/${id}/share`, { emails, message }),

    // Remove shared access
    removeSharedAccess: (sharedVideoId: number) =>
        padelvarApi.delete(`/api/videos/shared/${sharedVideoId}`),
};

// ============================================
// RECORDING SERVICE
// ============================================
export const recordingService = {
    // Get user's active recording
    getMyActiveRecording: () => padelvarApi.get('/api/recordings/my-active-recording'),

    // Start new recording
    startRecording: (data: { court_id: number; title?: string }) =>
        padelvarApi.post('/api/recordings/start', data),

    // Stop recording
    stopRecording: (id: number) =>
        padelvarApi.post(`/api/recordings/${id}/stop`),
};

// ============================================
// CLIP SERVICE
// ============================================
export const clipService = {
    // Get user's clips
    getMyClips: () => padelvarApi.get('/api/clips/my-clips'),

    // Create clip
    createClip: (data: {
        video_id: number;
        start_time: number;
        end_time: number;
        title?: string;
        description?: string;
    }) => padelvarApi.post('/api/clips/create', data),

    // Delete clip
    deleteClip: (id: number) => padelvarApi.delete(`/api/clips/${id}`),
};

// ============================================
// CREDIT SERVICE
// ============================================
export const creditService = {
    // Get user's credits balance
    getBalance: () => padelvarApi.get('/api/credits/balance'),

    // Buy credits
    buyCredits: (packageId: number, paymentDetails: any) =>
        padelvarApi.post('/api/credits/buy', { package_id: packageId, ...paymentDetails }),

    // Get credit packages
    getPackages: () => padelvarApi.get('/api/credits/packages'),
};

// ============================================
// AUTH SERVICE (MySmash specific)
// ============================================
export const authService = {
    // Login
    login: (email: string, password: string) =>
        padelvarApi.post('/api/auth/login', { email, password }),

    // Register
    register: (data: {
        name: string;
        email: string;
        phone_number?: string;
        password: string;
    }) => padelvarApi.post('/api/auth/register', data),

    // Logout
    logout: () => {
        localStorage.removeItem('mysmash_token');
        return Promise.resolve();
    },

    // Verify email
    verifyEmail: (code: string) =>
        padelvarApi.post('/api/auth/verify-email', { code }),

    // Resend verification code
    resendVerificationCode: () =>
        padelvarApi.post('/api/auth/resend-verification'),
};

// ============================================
// NOTIFICATION SERVICE
// ============================================
export const notificationService = {
    // Get notifications
    getNotifications: () => padelvarApi.get('/api/notifications'),

    // Mark as read
    markAsRead: (id: number) =>
        padelvarApi.put(`/api/notifications/${id}/read`),

    // Mark all as read
    markAllAsRead: () =>
        padelvarApi.put('/api/notifications/mark-all-read'),
};

// ============================================
// CLUB SERVICE
// ============================================
export const clubService = {
    // Get followed clubs
    getFollowedClubs: () => padelvarApi.get('/api/clubs/followed'),

    // Follow club
    followClub: (clubId: number) =>
        padelvarApi.post(`/api/clubs/${clubId}/follow`),

    // Unfollow club
    unfollowClub: (clubId: number) =>
        padelvarApi.delete(`/api/clubs/${clubId}/follow`),
};
