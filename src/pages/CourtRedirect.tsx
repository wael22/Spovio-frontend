import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CourtRedirect: React.FC = () => {
    const { qrCode } = useParams<{ qrCode: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (qrCode) {
            // Immediate canonical domain redirect if on non-www
            if (window.location.hostname === 'spovio.net') {
                window.location.replace(`https://www.spovio.net/c/${encodeURIComponent(qrCode)}`);
                return;
            }

            localStorage.setItem('pending_court_qr', qrCode);
            // Check auth status (both token and user object, since auth is mixed session/JWT)
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (token && user) {
                navigate(`/dashboard?court_qr=${encodeURIComponent(qrCode)}`, { replace: true });
            } else {
                navigate(`/auth?court_qr=${encodeURIComponent(qrCode)}`, { replace: true });
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
