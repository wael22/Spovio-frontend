// JWT Token Manager
// Separated from api.ts to avoid circular dependencies during build

const TOKEN_KEY = 'auth_token';

export const tokenManager = {
    getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
    setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
    clearToken: (): void => localStorage.removeItem(TOKEN_KEY),
    hasToken: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};
