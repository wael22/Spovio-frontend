// MySmash TypeScript Types & Interfaces

// ============================================
// VIDEO TYPES
// ============================================
export interface Video {
    id: number;
    title: string;
    bunny_video_id: string;
    file_url: string;
    bunny_video_url?: string;
    thumbnail_url: string;
    duration: number; // in seconds
    recorded_at: string;
    created_at: string;
    is_shared?: boolean;
    shared_video_id?: number;
    player_id?: number;
    player_name?: string;
    court_id?: number;
    club_id?: number;
}

// ============================================
// DASHBOARD TYPES
// ============================================
export interface DashboardStats {
    total_videos: number;
    total_duration: number;
}

export interface DashboardData {
    stats: DashboardStats;
    videos: Video[];
}

// ============================================
// RECORDING TYPES
// ============================================
export interface ActiveRecording {
    id: number;
    court_id: number;
    player_id: number;
    title: string;
    started_at: string;
    club_name?: string;
    terrain_name?: string;
    duration?: number;
}

export interface StartRecordingData {
    court_id: number;
    title?: string;
}

// ============================================
// CLIP TYPES
// ============================================
export interface Clip {
    id: number;
    video_id: number;
    title: string;
    description?: string;
    start_time: number;
    end_time: number;
    duration: number;
    file_url: string;
    thumbnail_url?: string;
    created_at: string;
}

export interface CreateClipData {
    video_id: number;
    start_time: number;
    end_time: number;
    title?: string;
    description?: string;
}

// ============================================
// CREDIT TYPES
// ============================================
export interface CreditPackage {
    id: number;
    name: string;
    credits: number;
    price_dt: number;
    original_price_dt?: number;
    description: string;
    discount_percentage?: number;
    is_popular?: boolean;
}

export interface CreditBalance {
    credits_balance: number;
}

// ============================================
// AUTH TYPES
// ============================================
export interface User {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    role: 'player' | 'club' | 'super_admin';
    credits_balance?: number;
    email_verified: boolean;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone_number?: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// ============================================
// NOTIFICATION TYPES
// ============================================
export interface Notification {
    id: number;
    type: 'video_ready' | 'video_shared' | 'credits_added' | 'system';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    video_id?: number;
}

// ============================================
// CLUB TYPES
// ============================================
export interface Club {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    logo_url?: string;
    is_followed?: boolean;
}

// ============================================
// NAVIGATION TYPES
// ============================================
export type TabValue =
    | 'videos'
    | 'clips'
    | 'clubs'
    | 'support'
    | 'notifications'
    | 'credits';

export interface NavigationItem {
    value: TabValue;
    label: string;
    icon: any; // LucideIcon type
    badge?: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// ============================================
// ERROR TYPES
// ============================================
export interface ApiError {
    message: string;
    code?: string;
    field?: string;
}
