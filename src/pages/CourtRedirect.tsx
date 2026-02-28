import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CourtRedirect: React.FC = () => {
    const { qrCode } = useParams<{ qrCode: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (qrCode) {
            localStorage.setItem('pending_court_qr', qrCode);
            // Check auth status
            const token = localStorage.getItem('token');
            if (token) {
                navigate('/dashboard');
            } else {
                navigate('/auth');
            }
        } else {
            navigate('/');
        }
    }, [qrCode, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4 border-blue-600"></div>
                <p className="mt-4 text-gray-600 font-medium">Redirection vers le terrain...</p>
            </div>
        </div>
    );
};

export default CourtRedirect;
