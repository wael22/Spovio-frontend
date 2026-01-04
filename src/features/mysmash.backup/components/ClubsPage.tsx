// ClubsPage Component - Page "Clubs" 
// Clubs suivis par l'utilisateur

import { Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { spovioColors } from '../constants/colors';

export const ClubsPage = () => {
    return (
        <div className="px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Building className="h-8 w-8" style={{ color: spovioColors.cyan }} />
                    <h1 className="text-3xl font-bold text-white">Clubs</h1>
                </div>
                <p style={{ color: spovioColors.textSecondary }}>
                    Tes clubs favoris
                </p>
            </div>

            {/* Empty State */}
            <div
                className="text-center py-16 rounded-2xl"
                style={{
                    background: spovioColors.bgCard,
                    border: `1px solid ${spovioColors.borderDefault}`
                }}
            >
                <Building className="h-16 w-16 mx-auto mb-4" style={{ color: spovioColors.textSecondary }} />
                <h3 className="text-xl font-semibold text-white mb-2">
                    Aucun club suivi
                </h3>
                <p style={{ color: spovioColors.textSecondary }} className="mb-4">
                    Suis tes clubs préférés pour recevoir leurs actualités
                </p>
                <Button
                    variant="outline"
                    className="rounded-xl"
                    style={{
                        borderColor: spovioColors.cyan,
                        color: spovioColors.cyan,
                    }}
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Trouver un club
                </Button>
            </div>
        </div>
    );
};
