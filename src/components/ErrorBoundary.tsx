import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorName?: string;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorName: error.name || 'Error' };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        const isChunkError =
            error.message?.includes('Failed to fetch dynamically imported module') ||
            error.message?.includes('Importing a module script failed') ||
            error.name === 'ChunkLoadError';

        if (isChunkError) {
            const reloadKey = 'spovio_chunk_reload_ts';
            const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
            const now = Date.now();

            // Auto reload ONLY once every 30 seconds to prevent infinite reload loops
            if (now - lastReload > 30000) {
                sessionStorage.setItem(reloadKey, String(now));
                if ('caches' in window) {
                    caches.keys().then((names) => {
                        names.forEach((name) => caches.delete(name));
                    }).catch(() => {});
                }
                setTimeout(() => {
                    window.location.reload();
                }, 300);
            } else {
                console.warn('Reload loop prevented in ErrorBoundary.');
            }
        }
    }

    private handleHardReset = async () => {
        try {
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            }
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const r of registrations) {
                    await r.unregister();
                }
            }
            sessionStorage.clear();
        } catch (e) {
            console.error("Reset error:", e);
        }
        window.location.href = window.location.origin + '?t=' + Date.now();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background flex-col p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        ⚡
                    </div>
                    <h2 className="text-xl font-bold tracking-wide font-orbitron text-foreground">Mise à jour de l'application</h2>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Une nouvelle version de Spovio a été déployée. Cliquez ci-dessous pour actualiser et nettoyer le cache.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={this.handleHardReset}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-md transition-all cursor-pointer text-sm"
                        >
                            Actualiser & Vider le cache
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
