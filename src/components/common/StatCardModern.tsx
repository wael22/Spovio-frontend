import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardModernProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    subtitle?: string;
    iconBgColor?: string;
    iconColor?: string;
}

/**
 * StatCardModern - Modern statistics card component optimized for mobile
 */
const StatCardModern: React.FC<StatCardModernProps> = ({
    icon: Icon,
    title,
    value,
    subtitle,
    iconBgColor = 'bg-blue-100',
    iconColor = 'text-blue-600'
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className={`p-3 rounded-lg ${iconBgColor}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
};

export default StatCardModern;
