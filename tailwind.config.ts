import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Restrained palette: near-black + off-white + one signature accent.
        ink: {
          DEFAULT: "#06070A",      // page background (near-black)
          50: "#0B0D12",
          100: "#11141B",
          200: "#191D27",
          300: "#262C3A",
          400: "#3A4051",
          500: "#5B6275",
          600: "#8A91A4",
          700: "#B0B6C5",
          800: "#D7DAE3",
          900: "#F5F5F7",          // off-white text
        },
        accent: {
          DEFAULT: "#7B6CF6",      // signature electric violet (the AI signal)
          soft: "#A496FB",
          muted: "#5B4FD6",
          glow: "#C9C0FE",
        },
        signal: {
          // For data-flow viz: cyan = data, green = success, amber = pending
          data: "#5BCFFF",
          ok: "#3DDC97",
          warn: "#F5C24A",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Editorial type scale
        "display-2xl": ["clamp(4rem, 9vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        "display-xl":  ["clamp(3rem, 7vw, 6rem)",   { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        "display-lg":  ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-md":  ["clamp(1.75rem, 3.5vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      letterSpacing: {
        ultra: "-0.04em",
        editorial: "-0.025em",
      },
      maxWidth: {
        layout: "1240px",
        prose: "68ch",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(123, 108, 246, 0.18), transparent 60%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shimmer: "shimmer 8s linear infinite",
        floatY: "floatY 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
