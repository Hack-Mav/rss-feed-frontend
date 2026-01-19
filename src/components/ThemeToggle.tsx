import { useState, useEffect, memo } from 'react';

interface ThemeToggleProps {
    onThemeChange?: (theme: 'light' | 'dark') => void;
}

const ThemeToggle = memo(({ onThemeChange }: ThemeToggleProps) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) return savedTheme;
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        onThemeChange?.(theme);
    }, [theme, onThemeChange]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--text-white)',
                border: 'none',
                borderRadius: '50%',
                width: '3rem',
                height: '3rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: 'var(--shadow-md)',
                transition: 'var(--transition-base)',
                zIndex: 'var(--z-fixed)'
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
