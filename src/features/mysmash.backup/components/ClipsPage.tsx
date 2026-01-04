// ClipsPage Component - Page "Mes Clips"
// Liste des clips courts créés par l'utilisateur

import { Scissors, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoCard } from './VideoCard';
import { spovioColors } from '../constants/colors';

interface ClipsPageProps {
    clips?: any[];
    onCreateClip: () => void;
}

export const ClipsPage = ({ clips = [], onCreateClip }: ClipsPageProps) => {
    return (
        <div className="px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Scissors className="h-8 w-8" style={{ color: spovioColors.green }} />
                    <h1 className="text-3xl font-bold">
                        Mes <span style={{ color: spovioColors.green }}>Clips</span>
                    </h1>
                </div>
                <p style={{ color: spovioColors.textSecondary }}>
                    Tes meilleurs moments en un clic
                </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: spovioColors.textSecondary }} />
                    <Input
                        placeholder="Rechercher un clip..."
                        className="pl-10 rounded-xl border-0 text-white"
                        style={{ background: spovioColors.bgCard }}
                    />
                </div>
            </div>

            {/* Create Clip Button */}
            <Button
                className="w-full text-white font-semibold py-6 rounded-xl border-0 mb-6"
                style={{
                    background: `linear-gradient(135deg, ${spovioColors.green} 0%, #00D99F 100%)`,
                    boxShadow: '0 0 20px rgba(0, 255, 179, 0.4)',
                }}
                onClick={onCreateClip}
            >
                <Plus className="h-5 w-5 mr-2" />
                Créer un clip
            </Button>

            {/* Clips List */}
            {clips.length > 0 ? (
                <div className="space-y-4">
                    {clips.map((clip) => (
                        <VideoCard
                            key={clip.id}
                            video={clip}
                            onPlay={() => console.log('Play clip:', clip.id)}
                        />
                    ))}
                </div>
            ) : (
                <div
                    className="text-center py-16 rounded-2xl"
                    style={{
                        background: spovioColors.bgCard,
                        border: `1px solid ${spovioColors.borderDefault}`
                    }}
                >
                    <Scissors className="h-16 w-16 mx-auto mb-4" style={{ color: spovioColors.textSecondary }} />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Aucun clip pour le moment
                    </h3>
                    <p style={{ color: spovioColors.textSecondary }} className="mb-4">
                        Crée ton premier clip à partir d'une vidéo
                    </p>
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        style={{
                            borderColor: spovioColors.green,
                            color: spovioColors.green,
                        }}
                        onClick={onCreateClip}
                    >
                        + Créer un clip
                    </Button>
                </div>
            )}
        </div>
    );
};
