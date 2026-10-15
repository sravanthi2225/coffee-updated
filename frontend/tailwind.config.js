/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: '#2B1B14',
        coffee: '#5A3B2E',
        cream: '#FBF4E9',
        'off-white': '#F7F1E6',
        beige: '#EFE2CF',
        charcoal: '#2A2723',
        botanical: '#5C6B4E',
        caramel: '#C08A4E',
        'caramel-light': '#D4A369',
        'caramel-dark': '#A36F35',
        'warm-border': '#E4D5C1',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        script: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(43, 27, 20, 0.05), 0 1px 4px -1px rgba(43, 27, 20, 0.03)',
        'soft': '0 8px 24px -4px rgba(43, 27, 20, 0.08), 0 2px 8px -2px rgba(43, 27, 20, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(43, 27, 20, 0.12), 0 4px 12px -2px rgba(43, 27, 20, 0.06)',
        'cup-glow': '0 20px 40px -10px rgba(192, 138, 78, 0.25)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
        'steam': 'steam 3s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(8px) rotate(-4deg)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        steam: {
          '0%': { transform: 'translateY(0) scaleX(1)', opacity: '0' },
          '15%': { opacity: '0.5' },
          '50%': { transform: 'translateY(-20px) scaleX(1.15)', opacity: '0.3' },
          '100%': { transform: 'translateY(-40px) scaleX(1.3)', opacity: '0' },
        },
      }
    },
  },
  plugins: [],
}
