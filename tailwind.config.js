/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: '#fe4c24',
        primaryLight: '#ff6b4a',
        primaryDark: '#d63d1a',

        // Secondary colors
        secondary: '#F59E0B',
        secondaryLight: '#fbbf24',
        secondaryDark: '#d97706',

        // Accent colors
        accent: '#10B981',
        accentLight: '#34d399',
        accentDark: '#059669',

        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#ef4444',
        info: '#3b82f6',

        // Light theme colors
        light: {
          background: '#ffffff',
          surface: '#ffffff',
          text: '#1f2937',
          textSecondary: '#6b7280',
          border: '#e5e7eb',
        },

        // Dark theme colors
        dark: {
          background: '#0f0f0f',
          surface: '#1e1e1e',
          text: '#f9fafb',
          textSecondary: '#d1d5db',
          border: '#374151',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        round: '50px',
      },
      boxShadow: {
        light: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        medium: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        heavy: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};
