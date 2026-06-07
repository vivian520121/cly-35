/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"PingFang SC"', '"Helvetica Neue"', 'Arial', 'sans-serif']
      },
      colors: {
        'note-yellow': '#FFF8C9',
        'note-pink': '#FFD3E0',
        'note-blue': '#CDE8FF',
        'note-green': '#D4F5D4',
        'note-purple': '#E8D8FF'
      },
      boxShadow: {
        'note': '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'note-active': '0 8px 30px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08)',
        'note-dragging': '0 12px 40px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)'
      },
      animation: {
        'note-appear': 'noteAppear 0.3s ease-out',
        'note-disappear': 'noteDisappear 0.2s ease-in'
      },
      keyframes: {
        noteAppear: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        noteDisappear: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' }
        }
      }
    },
  },
  plugins: [],
}
