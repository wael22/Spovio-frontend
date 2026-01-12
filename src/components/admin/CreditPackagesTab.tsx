import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

/**
 * CreditPackagesTab - Gestion des packages de crédits
 * TODO: Implémenter la gestion complète des packages joueurs et clubs
 * Pour l'instant, c'est un placeholder pour la structure
 */
const CreditPackagesTab: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <CardTitle>Gestion des Packages de Crédits</CardTitle>
                </div>
                <CardDescription>
                    Configurez les packages de crédits pour les joueurs et les clubs
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12">
                    <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Fonctionnalité en développement</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        La gestion des packages de crédits (joueurs et clubs) sera disponible prochainement.
                        Vous pourrez créer, modifier et supprimer des packages avec différents prix et remises.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default CreditPackagesTab;
