import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, TestTube, Settings, Cloud, Coins, Server } from 'lucide-react';
import GeneralSettingsTab from './GeneralSettingsTab';
import CreditPackagesManager from './CreditPackagesManager';

const SystemConfiguration: React.FC = () => {
    const [config, setConfig] = useState({
        library_id: '',
        api_key: '',
        hostname: '',
        cdn_hostname: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const response = await adminService.getBunnyCDNConfig();
            setConfig(response.data);
        } catch (error) {
            setError('Erreur lors du chargement de la configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await adminService.updateBunnyCDNConfig(config);
            setMessage('✅ Configuration sauvegardée avec succès');
        } catch (error) {
            setError('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setError('');
        setMessage('');
        try {
            const response = await adminService.testBunnyCDN(config);
            setMessage(`✅ Test réussi ! ${response.data.message || 'Connexion établie'}`);
        } catch (error) {
            setError('❌ Test échoué - Vérifiez vos identifiants');
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Configuration Système</h2>
                <p className="text-muted-foreground mt-1">Gérez les paramètres de configuration de la plateforme</p>
            </div>

            <Tabs defaultValue="bunny-cdn" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="bunny-cdn">
                        <Cloud className="h-4 w-4 mr-2" />
                        Bunny CDN
                    </TabsTrigger>
                    <TabsTrigger value="credit-packages">
                        <Coins className="h-4 w-4 mr-2" />
                        Prix des Crédits
                    </TabsTrigger>
                    <TabsTrigger value="general">
                        <Server className="h-4 w-4 mr-2" />
                        Général
                    </TabsTrigger>
                </TabsList>

                {/* Bunny CDN Configuration */}
                <TabsContent value="bunny-cdn">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <CardTitle>Configuration Bunny CDN</CardTitle>
                            </div>
                            <CardDescription>
                                Configurez les paramètres de connexion à Bunny CDN pour le stockage vidéo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {message && <Alert><AlertDescription>{message}</AlertDescription></Alert>}
                                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                                    <div className="space-y-2">
                                        <Label>Library ID</Label>
                                        <Input
                                            value={config.library_id}
                                            onChange={(e) => setConfig(prev => ({ ...prev, library_id: e.target.value }))}
                                            placeholder="12345"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>API Key</Label>
                                        <Input
                                            type="password"
                                            value={config.api_key}
                                            onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
                                            placeholder="your-api-key-here"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Hostname</Label>
                                        <Input
                                            value={config.hostname}
                                            onChange={(e) => setConfig(prev => ({ ...prev, hostname: e.target.value }))}
                                            placeholder="video.bunnycdn.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>CDN Hostname</Label>
                                        <Input
                                            value={config.cdn_hostname}
                                            onChange={(e) => setConfig(prev => ({ ...prev, cdn_hostname: e.target.value }))}
                                            placeholder="vz-xxxxx.b-cdn.net"
                                        />
                                    </div>

                                    <div className="flex space-x-2 pt-4">
                                        <Button onClick={handleTest} variant="outline" disabled={testing}>
                                            {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            <TestTube className="h-4 w-4 mr-2" />
                                            Tester la connexion
                                        </Button>
                                        <Button onClick={handleSave} disabled={saving}>
                                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            <Save className="h-4 w-4 mr-2" />
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Credit Packages Management */}
                <TabsContent value="credit-packages">
                    <CreditPackagesManager />
                </TabsContent>

                {/* General Configuration */}
                <TabsContent value="general">
                    <GeneralSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SystemConfiguration;
