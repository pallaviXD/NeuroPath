/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#08060B",
          surface: "#0F0B14",
          card: "#15101D",
          card2: "#1C1525",
        },
        accent: {
          pink: "#FF1D7E",
          pinkLight: "#FF5C9A",
          violet: "#7B2FF7",
          violetLight: "#A472FF",
          mint: "#15CFA0",
          amber: "#FFB347",
          amberLight: "#FFC96B",
          blue: "#3B82F6",
          blueLight: "#60A5FA",
          purple: "#8B5CF6",
          purpleLight: "#A78BFA",
        },
        text: {
          primary: "#F5F2FA",
          dim: "#B8B3C4",
          faint: "#766F85",
        },
        surface: {
          glass: "rgba(21, 16, 29, 0.7)",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glowPink: "0 0 24px rgba(255, 29, 126, 0.4)",
        glowPinkStrong: "0 0 32px rgba(255, 29, 126, 0.6)",
        glowViolet: "0 0 24px rgba(123, 47, 247, 0.4)",
        glowMint: "0 0 24px rgba(21, 207, 160, 0.4)",
      },
      animation: {
        'pulse-dot': 'pulse-dot 2.2s ease-in-out infinite',
        'pulse-rec': 'pulse-rec 1.6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.7' },
        },
        'pulse-rec': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.3)', opacity: '0.7' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}
