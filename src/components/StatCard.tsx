
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    variant: "total" | "padel" | "tennis";
}

const StatCard = ({ title, value, icon: Icon, variant }: StatCardProps) => {
    const variantStyles = {
        total: "bg-stat-total/10 text-stat-total",
        padel: "bg-stat-padel/10 text-stat-padel",
        tennis: "bg-stat-tennis/10 text-stat-tennis",
    };

    const iconBgStyles = {
        total: "bg-stat-total",
        padel: "bg-stat-padel",
        tennis: "bg-stat-tennis",
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgStyles[variant] || 'bg-primary'}`}>
                    <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
