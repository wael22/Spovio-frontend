// useThemeColors - Hook pour obtenir les couleurs selon le thème Spovio
// Utilise next-themes au lieu d'un provider custom

import { useTheme } from 'next-themes';
import { spovioColorsDark, spovioColorsLight } from '../constants/colors';

export const useThemeColors = () => {
    const { resolvedTheme } = useTheme();

    // resolvedTheme peut être 'dark', 'light', ou undefined pendant le montage
    const isDark = resolvedTheme === 'dark' || resolvedTheme === undefined;

    return isDark ? spovioColorsDark : spovioColorsLight;
};
