import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Check if it's a dynamic import failure (Vite chunk load error)
        if (
            error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('Importing a module script failed') ||
            error.name === 'ChunkLoadError'
        ) {
            console.warn('Chunk load error detected! Reloading page window...');
            // Small timeout to avoid infinite reload loops just in case
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }

    public render() {
        if (this.state.hasError) {
            // If the error was a chunk load error, the page will reload soon.
            // Otherwise, we show a generic fallback UI.
            return (
                <div className="min-h-screen flex items-center justify-center bg-background flex-col p-4 text-center">
                    <h2 className="text-2xl font-bold mb-4 font-orbitron">Une erreur s'est produite</h2>
                    <p className="text-muted-foreground mb-6">La page a rencontré un problème inattendu. Nous tentons de recharger l'application...</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium"
                    >
                        Recharger la page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
