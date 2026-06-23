import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // ── Themeable palette ──────────────────────────────────────────
        // Backed by CSS variables (channel form) injected per-request from the
        // admin-saved theme. See lib/theme.ts + components/ThemeStyle.tsx.
        // Token names are kept stable so existing classes don't change.
        ivory: {
          DEFAULT: "rgb(var(--c-bg) / <alpha-value>)",
          50: "rgb(var(--c-surface) / <alpha-value>)",
          100: "rgb(var(--c-bg) / <alpha-value>)",
          200: "rgb(var(--c-bg-200) / <alpha-value>)",
          300: "rgb(var(--c-bg-300) / <alpha-value>)"
        },
        champagne: {
          DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
          light: "rgb(var(--c-primary-light) / <alpha-value>)",
          dark: "rgb(var(--c-primary-dark) / <alpha-value>)",
          deep: "rgb(var(--c-primary-deep) / <alpha-value>)"
        },
        gold: {
          DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
          soft: "rgb(var(--c-gold-soft) / <alpha-value>)"
        },
        blush: {
          DEFAULT: "rgb(var(--c-blush) / <alpha-value>)",
          light: "rgb(var(--c-blush-light) / <alpha-value>)",
          dark: "rgb(var(--c-blush-dark) / <alpha-value>)"
        },
        sage: {
          DEFAULT: "rgb(var(--c-sage) / <alpha-value>)",
          light: "rgb(var(--c-sage-light) / <alpha-value>)",
          dark: "rgb(var(--c-sage-dark) / <alpha-value>)"
        },
        emerald: {
          deep: "rgb(var(--c-text) / <alpha-value>)"
        },
        script: "rgb(var(--c-script) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--c-text) / <alpha-value>)",
          soft: "rgb(var(--c-text-soft) / <alpha-value>)",
          light: "rgb(var(--c-text-light) / <alpha-value>)"
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Marcellus", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Jost", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "Pinyon Script", "cursive"]
      },
      letterSpacing: {
        luxe: "0.42em",
        wide2: "0.28em"
      },
      boxShadow: {
        // Long, soft, warm-tinted elevation (paper lifting off a table)
        paper: "0 2px 4px rgba(58,38,32,0.05), 0 24px 50px -28px rgba(58,38,32,0.32)",
        "paper-lg": "0 4px 8px rgba(58,38,32,0.06), 0 40px 80px -32px rgba(58,38,32,0.40)",
        gold: "0 10px 30px -10px rgba(138,90,54,0.50)",
        seal: "0 6px 18px -4px rgba(92,57,34,0.55), inset 0 2px 4px rgba(255,255,255,0.30)"
      },
      backgroundImage: {
        "ivory-wash":
          "radial-gradient(120% 90% at 15% 0%, rgb(var(--c-surface)) 0%, rgb(var(--c-bg)) 45%, rgb(var(--c-bg-200)) 100%)",
        "romantic-gradient":
          "radial-gradient(130% 100% at 50% -10%, rgb(var(--c-surface)) 0%, rgb(var(--c-bg)) 55%, rgb(var(--c-bg-300)) 100%)",
        "gold-rule":
          "linear-gradient(90deg, transparent, rgb(var(--c-primary) / 0.7) 18%, rgb(var(--c-primary)) 50%, rgb(var(--c-primary) / 0.7) 82%, transparent)",
        "foil":
          "linear-gradient(115deg, rgb(var(--c-primary-dark)) 0%, rgb(var(--c-primary-light)) 28%, rgb(var(--c-primary)) 50%, rgb(var(--c-gold-soft)) 70%, rgb(var(--c-primary-dark)) 100%)"
      },
      keyframes: {
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        sheen: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        },
        drawIn: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" }
        }
      },
      animation: {
        floatY: "floatY 7s ease-in-out infinite",
        sheen: "sheen 6s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
