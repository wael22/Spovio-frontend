import React, { useState, useEffect } from 'react';
import { adminService } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SystemLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [level, setLevel] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const params = level ? { level } : {};
            const response = await adminService.getLogs(params);
            setLogs(response.data.logs || []);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await adminService.downloadLogs();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `logs_${new Date().toISOString()}.txt`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Erreur lors du téléchargement des logs');
        }
    };

    const getLevelColor = (level: string) => {
        const colors: Record<string, string> = {
            'ERROR': 'text-red-600 bg-red-100',
            'WARNING': 'text-yellow-600 bg-yellow-100',
            'INFO': 'text-blue-600 bg-blue-100',
            'DEBUG': 'text-gray-600 bg-gray-100'
        };
        return colors[level] || 'text-gray-600 bg-gray-100';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Logs Système</CardTitle>
                        <CardDescription>Consultez et téléchargez les logs du système</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={loadLogs}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filtrer
                        </Button>
                        <Button onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Label>Niveau de log</Label>
                    <Input
                        placeholder="ERROR, WARNING, INFO, DEBUG..."
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="max-w-xs"
                    />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Aucun log disponible</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {logs.map((log: any, index: number) => (
                            <div key={index} className="p-3 border rounded text-sm">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                                        {log.level}
                                    </span>
                                    <span className="text-gray-500 text-xs">{log.timestamp}</span>
                                </div>
                                <p className="text-gray-700">{log.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SystemLogs;
