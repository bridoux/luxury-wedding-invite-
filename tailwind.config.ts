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
        // ── Warm earth-tone palette: cream · camel · chestnut · espresso ──
        // Surface / background (warm cream)
        ivory: {
          DEFAULT: "#F3EAD6",
          50: "#FBF6EA",
          100: "#F3EAD6",
          200: "#E9DBC1",
          300: "#DECBAB"
        },
        // Primary accent — warm camel/bronze (was champagne gold)
        champagne: {
          DEFAULT: "#B98A5E",
          light: "#D7AA7E",
          dark: "#8A5A36",
          deep: "#5C3922"
        },
        gold: {
          DEFAULT: "#B98A5E",
          soft: "#D0A878"
        },
        // Warm sand / clay (repurposed "blush")
        blush: {
          DEFAULT: "#C99A72",
          light: "#EEDFC6",
          dark: "#8A4B33"
        },
        // Mocha / taupe (repurposed "sage")
        sage: {
          DEFAULT: "#9A7B5C",
          light: "#E4D5BC",
          dark: "#6E4A30"
        },
        emerald: {
          deep: "#3A2620"
        },
        // Text — espresso brown
        ink: {
          DEFAULT: "#3A2620",
          soft: "#5A4636",
          light: "#8A7257"
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
          "radial-gradient(120% 90% at 15% 0%, #FBF6EA 0%, #F3EAD6 45%, #E9DBC1 100%)",
        "romantic-gradient":
          "radial-gradient(130% 100% at 50% -10%, #FBF6EA 0%, #EFDFC6 55%, #E4D2B0 100%)",
        "gold-rule":
          "linear-gradient(90deg, transparent, rgba(185,138,94,0.7) 18%, #B98A5E 50%, rgba(185,138,94,0.7) 82%, transparent)",
        "foil":
          "linear-gradient(115deg, #8A5A36 0%, #D7AA7E 28%, #B98A5E 50%, #E0C49A 70%, #8A5A36 100%)"
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
