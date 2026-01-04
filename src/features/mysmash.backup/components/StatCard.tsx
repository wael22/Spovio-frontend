// StatCard Component - Spovio Design System
// Displays key statistics with icon

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    subtitle: string;
    iconBgColor?: string;
    iconColor?: string;
}

export const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    iconBgColor = 'bg-primary/10',
    iconColor = 'text-primary',
}: StatCardProps) => {
    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
            <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-foreground truncate">
                            {value}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {subtitle}
                        </p>
                    </div>

                    {/* Icon Circle */}
                    <div className={`p-3 rounded-xl flex-shrink-0 ${iconBgColor}`}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
