// JWT Token Manager
// Separated from api.ts to avoid circular dependencies during build

const TOKEN_KEY = 'auth_token';

export const tokenManager = {
    getToken: (): string | null => {
        const token = localStorage.getItem(TOKEN_KEY);
        console.log('[tokenManager] getToken called:', { hasToken: !!token, tokenLength: token?.length || 0 });
        return token;
    },
    setToken: (token: string): void => {
        console.log('[tokenManager] setToken called:', { tokenLength: token?.length || 0 });
        localStorage.setItem(TOKEN_KEY, token);
        // Verify it was stored
        const stored = localStorage.getItem(TOKEN_KEY);
        console.log('[tokenManager] Token stored verification:', { success: stored === token, storedLength: stored?.length || 0 });
    },
    clearToken: (): void => {
        console.log('[tokenManager] clearToken called');
        localStorage.removeItem(TOKEN_KEY);
    },
    hasToken: (): boolean => {
        const has = !!localStorage.getItem(TOKEN_KEY);
        console.log('[tokenManager] hasToken called:', has);
        return has;
    },
};
