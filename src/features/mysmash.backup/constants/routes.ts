// MySmash Routes Constants

export const MYSMASH_ROUTES = {
    // Base
    HOME: '/mysmash',

    // Dashboard
    DASHBOARD: '/mysmash/dashboard',

    // Videos
    VIDEOS: '/mysmash/videos',
    VIDEO_DETAIL: (id: number) => `/mysmash/videos/${id}`,

    // Clips
    CLIPS: '/mysmash/clips',
    CLIP_DETAIL: (id: number) => `/mysmash/clips/${id}`,

    // Clubs
    CLUBS: '/mysmash/clubs',
    CLUB_DETAIL: (id: number) => `/mysmash/clubs/${id}`,

    // Support
    SUPPORT: '/mysmash/support',

    // Notifications
    NOTIFICATIONS: '/mysmash/notifications',

    // Credits
    CREDITS: '/mysmash/credits',

    // Auth (if needed, otherwise use Spovio auth)
    LOGIN: '/mysmash/login',
    REGISTER: '/mysmash/register',
} as const;

// API Endpoints (padelvar-backend)
export const API_ENDPOINTS = {
    // Videos
    MY_VIDEOS: '/api/videos/my-videos',
    VIDEO: (id: number) => `/api/videos/${id}`,
    VIDEO_TITLE: (id: number) => `/api/videos/${id}/title`,
    VIDEO_SHARE: (id: number) => `/api/videos/${id}/share`,

    // Recordings
    MY_ACTIVE_RECORDING: '/api/recordings/my-active-recording',
    START_RECORDING: '/api/recordings/start',
    STOP_RECORDING: (id: number) => `/api/recordings/${id}/stop`,

    // Clips
    MY_CLIPS: '/api/clips/my-clips',
    CREATE_CLIP: '/api/clips/create',
    DELETE_CLIP: (id: number) => `/api/clips/${id}`,

    // Credits
    CREDIT_BALANCE: '/api/credits/balance',
    CREDIT_PACKAGES: '/api/credits/packages',
    BUY_CREDITS: '/api/credits/buy',

    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_EMAIL: '/api/auth/verify-email',

    // Notifications
    NOTIFICATIONS: '/api/notifications',
    MARK_READ: (id: number) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/mark-all-read',

    // Clubs
    FOLLOWED_CLUBS: '/api/clubs/followed',
    FOLLOW_CLUB: (id: number) => `/api/clubs/${id}/follow`,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'mysmash_token',
    USER: 'mysmash_user',
    THEME: 'mysmash_theme',
    TUTORIAL_COMPLETED: 'mysmash_tutorial_completed',
} as const;
