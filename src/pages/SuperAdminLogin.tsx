import React, { useState } from 'react';
import { authService } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Key, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const SuperAdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const { fetchUser, setUser } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '', code: '' });
    const [step, setStep] = useState<'login' | '2fa' | 'setup_2fa'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [tempUserId, setTempUserId] = useState<number | string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.superAdminLogin({ email: formData.email, password: formData.password });

            console.log('Login response:', response.data);

            if (response.data.user_id) {
                setTempUserId(response.data.user_id);
            }

            if (response.data.requires_2fa_setup) {
                setStep('setup_2fa');
                setQrCode(response.data.totp_uri);
                setSecret(response.data.secret);
            } else if (response.data.requires_2fa) {
                setStep('2fa');
            } else {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                if (response.data.user) {
                    setUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                navigate('/admin');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.response?.data?.error || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload: any = { code: formData.code };
            if (tempUserId) {
                payload.user_id = tempUserId;
            }
            if (secret && step === 'setup_2fa') {
                payload.secret = secret;
            }

            const response = step === 'setup_2fa'
                ? await authService.superAdminSetup2FA(payload)
                : await authService.superAdminVerify2FA(payload);

            // Store JWT token for subsequent requests
            if (response.data?.token) {
                localStorage.setItem('token', response.data.token);
            }
            if (response.data?.user) {
                setUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Sync auth context with backend
            await fetchUser();
            navigate('/admin');
        } catch (error: any) {
            console.error('2FA error:', error);
            setError(error.response?.data?.error || 'Code invalide');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Super Admin Login</CardTitle>
                    <CardDescription>
                        {step === 'login' ? 'Accès réservé aux super administrateurs' :
                            step === 'setup_2fa' ? 'Configuration 2FA requise' :
                                'Authentification à deux facteurs'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {step === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Mot de passe</Label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Se connecter
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify2FA} className="space-y-4">
                            <div className="text-center mb-4">
                                {step === 'setup_2fa' ? (
                                    <div className="mb-4 p-4 bg-gray-50 rounded border text-left">
                                        <p className="text-sm font-medium mb-2">Scannez ce QR Code avec Google Authenticator :</p>
                                        <div className="bg-white p-2 flex justify-center mb-2">
                                            {qrCode ? (
                                                <QRCodeCanvas value={qrCode} size={180} level="H" />
                                            ) : (
                                                <p className="font-mono text-xs break-all">{secret}</p>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Ou entrez cette clé manuellement : <span className="font-mono font-bold">{secret}</span></p>
                                    </div>
                                ) : (
                                    <Key className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Entrez le code à 6 chiffres
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest uppercase"
                                    required
                                />
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setStep('login')}
                                >
                                    Retour
                                </Button>
                                <Button type="submit" className="w-full" disabled={loading || formData.code.length !== 6}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {step === 'setup_2fa' ? 'Activer' : 'Vérifier'}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SuperAdminLogin;
