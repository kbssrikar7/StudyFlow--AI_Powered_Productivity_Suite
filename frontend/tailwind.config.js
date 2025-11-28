/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Batman (2022) Palette
        arkham: {
          darkest: '#000000',
          darker: '#050505',
          dark: '#0a0a0a',
          base: '#121212',
          light: '#1a1a1a',
          lighter: '#262626',
          border: '#333333',
        },
        bat: {
          red: '#CF0A0A',      // Vengeance Red
          crimson: '#8a0404',  // Darker Blood Red
          muted: '#4a0404',    // Very dark red for backgrounds
          silver: '#525252',   // Gunmetal
          gray: '#737373',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'bat-signal': 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        'gotham-sky': 'linear-gradient(to bottom, #0a0a0a 0%, #1a1a1a 100%)',
      },
      boxShadow: {
        'arkham': '0 4px 24px rgba(0, 0, 0, 0.8)',
        'bat-glow': '0 0 30px rgba(212, 175, 55, 0.15)',
        'inner-arkham': 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'bat-signal': 'batSignal 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)' },
        },
        batSignal: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
