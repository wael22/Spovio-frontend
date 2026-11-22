import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in React tree:", error, errorInfo);

        // Check if it's a dynamic import failure (Vite chunk load error)
        const msg = error?.message?.toLowerCase() || '';
        if (
            msg.includes('failed to fetch dynamically imported module') ||
            msg.includes('importing a module script failed') ||
            msg.includes('error loading dynamically imported module') ||
            error.name === 'ChunkLoadError'
        ) {
            console.warn('Chunk load error detected! Clearing stale caches and reloading...');
            this.handleHardReload();
        }
    }

    private handleHardReload = async () => {
        try {
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map(k => caches.delete(k)));
            }
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) {
                    await reg.unregister();
                }
            }
        } catch (e) {
            console.error('Error clearing cache:', e);
        }
        window.location.href = window.location.pathname;
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background flex-col p-4 text-center">
                    <h2 className="text-2xl font-bold mb-3 tracking-tight text-foreground">Une erreur s'est produite</h2>
                    <p className="text-muted-foreground text-sm max-w-md mb-6">
                        La page a rencontré un problème inattendu lors du chargement des composants mis à jour.
                    </p>
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={this.handleHardReload}
                            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition shadow-sm"
                        >
                            Recharger l'application
                        </button>
                    </div>

                    {this.state.error && (
                        <details className="mt-8 text-left max-w-md w-full text-xs font-mono text-muted-foreground bg-muted/40 p-3.5 rounded-xl border border-border">
                            <summary className="cursor-pointer text-xs font-semibold text-foreground select-none">
                                Détails techniques de l'erreur
                            </summary>
                            <p className="mt-2 text-destructive font-medium break-all">
                                {this.state.error.name}: {this.state.error.message}
                            </p>
                            {this.state.error.stack && (
                                <pre className="mt-1 text-[11px] overflow-x-auto whitespace-pre-wrap opacity-75">
                                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                                </pre>
                            )}
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

