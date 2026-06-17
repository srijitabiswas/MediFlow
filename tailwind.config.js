/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#E1F5EE',
          100: '#9FE1CB',
          500: '#1D9E75',
          600: '#0F6E56',
          700: '#085041',
        },
        coral: { 50: '#FAECE7', 500: '#D85A30' },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: 0, transform: 'scale(0.95)'      }, to: { opacity: 1, transform: 'scale(1)'    } },
        slideIn:  { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        bounceDot:{ '0%,60%,100%': { transform:'translateY(0)' }, '30%': { transform:'translateY(-5px)' } },
      },
      animation: {
        fadeUp:    'fadeUp 0.4s ease forwards',
        scaleIn:   'scaleIn 0.35s ease forwards',
        slideIn:   'slideIn 0.3s ease forwards',
        bounceDot: 'bounceDot 1s infinite',
      },
    },
  },
  plugins: [],
};
