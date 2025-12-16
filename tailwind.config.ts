import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",  // Dark mode için class kullanımını etkinleştiriyoruz
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",  // Ana renk
        secondary: "var(--secondary)",  // İkinci renk
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        scroll: 'scroll 60s linear infinite',
      },
      animationPlayState: {
        'paused': 'paused',
        'running': 'running',
      },
    },
  },
  plugins: [],
} satisfies Config;
