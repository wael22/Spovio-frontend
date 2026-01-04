// Spovio Design System - Colors with Light/Dark Mode Support

// Dark Mode (Default)
export const spovioColorsDark = {
    // Backgrounds
    bgDark: '#0A0E1A',
    bgCard: '#151B2B',
    bgCardHover: '#1A2332',

    // Primary Colors
    cyan: '#00E5FF',
    cyanDark: '#00B8D4',
    green: '#00FFB3',
    greenDark: '#00D99F',
    red: '#E53935',
    purple: '#9C27B0',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',

    // Borders
    borderCyan: 'rgba(0, 229, 255, 0.3)',
    borderDefault: 'rgba(148, 163, 184, 0.1)',
} as const;

// Light Mode
export const spovioColorsLight = {
    // Backgrounds
    bgDark: '#FFFFFF',
    bgCard: '#F8F9FA',
    bgCardHover: '#F1F3F5',

    // Primary Colors (mêmes couleurs vibrantes)
    cyan: '#00B8D4',
    cyanDark: '#0097A7',
    green: '#00D99F',
    greenDark: '#00C389',
    red: '#E53935',
    purple: '#9C27B0',

    // Text
    textPrimary: '#1A202C',
    textSecondary: '#4A5568',
    textTertiary: '#718096',

    // Borders
    borderCyan: 'rgba(0, 184, 212, 0.3)',
    borderDefault: 'rgba(0, 0, 0, 0.1)',
} as const;

// Active colors (will be switched based on theme)
export let spovioColors = spovioColorsDark;

// Function to update colors based on theme
export const setThemeColors = (theme: 'light' | 'dark') => {
    spovioColors = theme === 'dark' ? spovioColorsDark : spovioColorsLight;
};

// Shadows (same for both themes but adjusted opacity)
export const spovioShadows = {
    glowCyan: '0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.2)',
    glowCyanSm: '0 0 10px rgba(0, 229, 255, 0.3)',
    glowGreen: '0 0 20px rgba(0, 255, 179, 0.4)',
    glowRed: '0 0 15px rgba(229, 57, 53, 0.5)',
    card: '0 4px 12px rgba(0, 0, 0, 0.4)',
    cardHover: '0 8px 24px rgba(0, 0, 0, 0.6)',
} as const;

export const spovioGradients = {
    cyanButton: 'linear-gradient(135deg, #00E5FF 0%, #00B8D4 100%)',
    greenButton: 'linear-gradient(135deg, #00FFB3 0%, #00D99F 100%)',
    cardBg: 'linear-gradient(145deg, #151B2B 0%, #0F1523 100%)',
} as const;

// Helper to get current theme colors
export const getThemeColors = (theme: 'light' | 'dark') => {
    return theme === 'dark' ? spovioColorsDark : spovioColorsLight;
};
