'use client';

import { useTheme } from './theme-provider';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-[#8a877e] hover:text-[#1f1e1d] hover:bg-[#efece3] transition
                 dark:text-[#8a877e] dark:hover:text-[#e8e6dc] dark:hover:bg-[#2a2824]"
        >
            {theme === 'dark' ? (
                // Sun icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" strokeWidth={1.75} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
                </svg>
            ) : (
                // Moon icon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            )}
        </button>
    );
}