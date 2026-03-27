import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Fira Code",
          "Menlo",
          "Monaco",
          "monospace",
        ],
      },
      colors: {
        ragnar: {
          bg: {
            primary: "var(--ragnar-bg-primary)",
            secondary: "var(--ragnar-bg-secondary)",
            tertiary: "var(--ragnar-bg-tertiary)",
            hover: "var(--ragnar-bg-hover)",
            active: "var(--ragnar-bg-active)",
          },
          text: {
            primary: "var(--ragnar-text-primary)",
            secondary: "var(--ragnar-text-secondary)",
            muted: "var(--ragnar-text-muted)",
          },
          border: {
            DEFAULT: "var(--ragnar-border)",
            subtle: "var(--ragnar-border-subtle)",
          },
          accent: {
            DEFAULT: "var(--ragnar-accent)",
            hover: "var(--ragnar-accent-hover)",
            muted: "var(--ragnar-accent-muted)",
          },
          sidebar: {
            bg: "var(--ragnar-sidebar-bg)",
            hover: "var(--ragnar-sidebar-hover)",
            active: "var(--ragnar-sidebar-active)",
          },
        },
      },
      spacing: {
        sidebar: "260px",
        "sidebar-collapsed": "60px",
        "note-list": "300px",
        titlebar: "38px",
      },
      borderRadius: {
        macos: "10px",
      },
      backdropBlur: {
        macos: "40px",
      },
      boxShadow: {
        macos: "0 0 0 0.5px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        "macos-lg":
          "0 0 0 0.5px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in-left": "slideInLeft 0.25s ease-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
