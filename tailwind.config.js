/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fabcity-blue': '#1E40AF',      // Vibrant blue from logo
        'fabcity-red': '#DC2626',       // Bright red from logo  
        'fabcity-green': '#16A34A',     // Bright green from logo
        'fabcity-primary': '#1E40AF',   // Primary brand color (blue)
        'fabcity-secondary': '#DC2626', // Secondary brand color (red)
        'fabcity-accent': '#16A34A',    // Accent brand color (green)
      },
      animation: {
        'bounce-slow': 'bounce 1.4s infinite',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
