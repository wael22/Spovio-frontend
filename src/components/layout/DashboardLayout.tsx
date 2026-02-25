import { Outlet } from "react-router-dom";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { useAuth } from "@/hooks/useAuth";

const DashboardLayout = () => {
    const { user } = useAuth();

    if (user?.role === 'club' || user?.role === 'super_admin') {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardNavbar credits={user?.credits_balance || user?.credits || 0} />
            <main className="pt-20 pb-12 flex-1">
                {/* L'Outlet rendra les composants enfants (Dashboard, MyClips...) à l'intérieur de cette balise main */}
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
