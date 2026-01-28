/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crt: {
          green: "#00ff41",
          dark: "#0a0a0a",
          glow: "#00ff4133",
        },
        error: "#ff0040",
        warning: "#ffaa00",
        success: "#00ffff",
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "'Courier New'", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "flicker": "flicker 0.1s infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.97" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
}
