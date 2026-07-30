import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 token system (from the "ultra premium" mockups)
        primary: "#006591",
        "primary-container": "#0ea5e9",
        "primary-fixed": "#c9e6ff",
        "primary-fixed-dim": "#89ceff",
        "on-primary": "#ffffff",
        "on-primary-container": "#003751",
        "on-primary-fixed": "#001e2f",
        "on-primary-fixed-variant": "#004c6e",
        "surface-tint": "#006591",
        "inverse-primary": "#89ceff",

        secondary: "#795900",
        "secondary-container": "#ffc329",
        "secondary-fixed": "#ffdf9f",
        "secondary-fixed-dim": "#f9bd22",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#6f5100",
        "on-secondary-fixed": "#261a00",
        "on-secondary-fixed-variant": "#5c4300",

        tertiary: "#505f76",
        "tertiary-container": "#8d9db5",
        "tertiary-fixed": "#d3e4fe",
        "tertiary-fixed-dim": "#b7c8e1",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#243449",
        "on-tertiary-fixed": "#0b1c30",
        "on-tertiary-fixed-variant": "#38485d",

        background: "#f9f9f9",
        "on-background": "#1a1c1c",
        surface: "#f9f9f9",
        "surface-bright": "#f9f9f9",
        "surface-dim": "#dadada",
        "surface-variant": "#e2e2e2",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#3e4850",
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f0f1f1",

        outline: "#6e7881",
        "outline-variant": "#bec8d2",

        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        "haredi-primary": "#003751",

        // Convenience aliases used across the app
        "primary-dark": "#004c6e",
        "primary-light": "#0ea5e9",
        accent: "#ffc329",
        "accent-dark": "#795900",
        ink: "#243449",
        "text-main": "#1a1c1c",
        muted: "#3e4850",
        border: "#bec8d2",
      },
      fontFamily: {
        sans: ["Assistant", "system-ui", "sans-serif"],
        display: ["Heebo", "system-ui", "sans-serif"],
        "headline-lg": ["Heebo", "system-ui", "sans-serif"],
        "headline-md": ["Heebo", "system-ui", "sans-serif"],
        "display-hero": ["Heebo", "system-ui", "sans-serif"],
        "display-hero-mobile": ["Heebo", "system-ui", "sans-serif"],
        "body-lg": ["Assistant", "system-ui", "sans-serif"],
        "body-md": ["Assistant", "system-ui", "sans-serif"],
        "label-sm": ["Assistant", "system-ui", "sans-serif"],
        "label-lg": ["Assistant", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-hero": [
          "48px",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "display-hero-mobile": [
          "32px",
          { lineHeight: "1.2", fontWeight: "700" },
        ],
        "headline-lg": ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-lg": ["16px", { lineHeight: "1.2", fontWeight: "600" }],
        "label-sm": [
          "14px",
          { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "600" },
        ],
      },
      maxWidth: {
        "container-max": "1280px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 101, 145, 0.08)",
        premium: "0 20px 45px -25px rgba(0, 101, 145, 0.45)",
        card: "0 4px 6px -1px rgba(0, 101, 145, 0.05), 0 10px 15px -3px rgba(0, 101, 145, 0.1)",
        "amber-glow": "0 0 20px rgba(249, 189, 34, 0.4)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "subtle-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 8s ease-in-out infinite",
        "subtle-float": "subtle-float 8s ease-in-out infinite",
        "pulse-slow": "pulse-slow 15s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
