import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    variant: "total" | "padel" | "tennis";
}

const StatCard = ({ title, value, icon: Icon, variant }: StatCardProps) => {
    const variantStyles = {
        total: "bg-blue-500/10 text-blue-500",
        padel: "bg-green-500/10 text-green-500",
        tennis: "bg-orange-500/10 text-orange-500",
    };

    const iconBgStyles = {
        total: "bg-blue-500",
        padel: "bg-green-500",
        tennis: "bg-orange-500",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgStyles[variant]}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
