import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'neutral';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		const saved = localStorage.getItem('growpal_theme') as'light' | 'dark' | 'neutral';
		return saved || 'light';
	});

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem('growpal_theme', newTheme);
		document.documentElement.setAttribute('data-theme', newTheme);
	};

	useEffect(() => {
		// 初始化主题
		document.documentElement.setAttribute('data-theme', theme);
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return context;
};
