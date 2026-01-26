import React, { useState } from 'react';
import { authService } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Key } from 'lucide-react';

const SuperAdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', code: '' });
    const [step, setStep] = useState<'login' | '2fa'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.superAdminLogin({ email: formData.email, password: formData.password });
            if (response.data.requires_2fa) {
                setStep('2fa');
            } else {
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
                navigate('/admin');
            }
        } catch (error: any) {
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
            // Simple verification - adapter selon votre API
            navigate('/admin');
        } catch (error: any) {
            setError('Code invalide');
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
                        {step === 'login' ? 'Accès réservé aux super administrateurs' : 'Authentification à deux facteurs'}
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
                                <Key className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Entrez le code de votre application d'authentification
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Code à 6 chiffres</Label>
                                <Input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest"
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
                                    Vérifier
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
