// MySmashLayout Component
// Layout wrapper for all MySmash pages

import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';

export const MySmashLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Use Spovio's Navbar */}
            <Navbar />

            {/* MySmash Content */}
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};
