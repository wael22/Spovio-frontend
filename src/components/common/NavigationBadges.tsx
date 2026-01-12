import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavigationBadgeItem {
    value: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
}

interface NavigationBadgesProps {
    items: NavigationBadgeItem[];
    activeValue: string;
    onChange: (value: string) => void;
}

/**
 * NavigationBadges - Modern scrollable badge navigation component
 * Mobile-friendly alternative to traditional tabs
 */
const NavigationBadges: React.FC<NavigationBadgesProps> = ({ items, activeValue, onChange }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {items.map((item) => {
                const isActive = item.value === activeValue;
                const Icon = item.icon;

                return (
                    <button
                        key={item.value}
                        onClick={() => onChange(item.value)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium 
                            whitespace-nowrap transition-all relative
                            ${isActive
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }
                        `}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>

                        {/* Badge counter */}
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                {item.badge > 99 ? '99+' : item.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default NavigationBadges;
