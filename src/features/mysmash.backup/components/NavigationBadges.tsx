// NavigationBadges Component - Spovio Design System
// Horizontal scrollable navigation with badges

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabValue } from '../types';

interface NavItem {
    value: TabValue;
    label: string;
    icon: LucideIcon;
    badge?: number;
}

interface NavigationBadgesProps {
    items: NavItem[];
    activeValue: TabValue;
    onChange: (value: TabValue) => void;
    className?: string;
}

export const NavigationBadges = ({
    items,
    activeValue,
    onChange,
    className
}: NavigationBadgesProps) => {
    return (
        <div className={cn(
            'flex gap-2 overflow-x-auto pb-2 scrollbar-hide',
            className
        )}>
            {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeValue === item.value;

                return (
                    <Button
                        key={item.value}
                        variant={isActive ? 'default' : 'outline'}
                        className={cn(
                            'flex-shrink-0 gap-2',
                            isActive && 'shadow-md'
                        )}
                        onClick={() => onChange(item.value)}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{item.label}</span>

                        {item.badge !== undefined && item.badge > 0 && (
                            <Badge
                                variant="destructive"
                                className="ml-1 px-1.5 py-0 text-xs min-w-[1.25rem] h-5"
                            >
                                {item.badge > 99 ? '99+' : item.badge}
                            </Badge>
                        )}
                    </Button>
                );
            })}
        </div>
    );
};
