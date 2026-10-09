/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chatgpt: {
          sidebar: {
            light: '#f9f9f9',
            dark: '#171717',
          },
          main: {
            light: '#ffffff',
            dark: '#212121',
          },
          bubble: {
            userLight: '#f4f4f4',
            userDark: '#303030',
            aiLight: '#ffffff',
            aiDark: '#212121',
          },
          hover: {
            light: '#ececec',
            dark: '#2f2f2f',
          },
          border: {
            light: '#e5e5e5',
            dark: '#303030',
          }
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
