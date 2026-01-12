import React, { useState, useEffect } from 'react';
import { settingsService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save } from 'lucide-react';

const GeneralSettingsTab: React.FC = () => {
    const [settings, setSettings] = useState({
        welcome_credits: 1
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsService.getSettings();
            setSettings({
                welcome_credits: response.data.welcome_credits || 1
            });
        } catch (error) {
            setError('Erreur lors du chargement des paramètres');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await settingsService.updateSettings(settings);
            setMessage('✅ Paramètres enregistrés avec succès');
        } catch (error) {
            setError('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuration Générale</CardTitle>
                <CardDescription>
                    Paramètres généraux de l'application
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <div>
                    <h3 className="text-lg font-semibold mb-4">Crédits Gratuits à l'Inscription</h3>
                    <div className="space-y-2">
                        <Label htmlFor="welcome_credits">Nombre de crédits</Label>
                        <Input
                            id="welcome_credits"
                            type="number"
                            min="0"
                            max="100"
                            value={settings.welcome_credits}
                            onChange={(e) => setSettings({
                                ...settings,
                                welcome_credits: parseInt(e.target.value) || 0
                            })}
                            className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                            Nombre de crédits offerts automatiquement aux nouveaux utilisateurs lors de leur inscription
                        </p>
                    </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les paramètres
                </Button>
            </CardContent>
        </Card>
    );
};

export default GeneralSettingsTab;
