/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core palette
        "primary": "#002517",
        "primary-container": "#123C2A",
        "on-primary": "#ffffff",
        "on-primary-container": "#7CA78F",

        "secondary": "#5A605A",
        "secondary-container": "#DFE4DD",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#606660",

        "tertiary": "#2D1D00",
        "tertiary-container": "#483100",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#CB9427",

        "error": "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error": "#ffffff",
        "on-error-container": "#93000A",

        "background": "#F8FAF5",
        "on-background": "#191C1A",

        "surface": "#F8FAF5",
        "surface-dim": "#D8DBD6",
        "surface-bright": "#F8FAF5",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F2F4EF",
        "surface-container": "#ECEFEA",
        "surface-container-high": "#E7E9E4",
        "surface-container-highest": "#E1E3DE",
        "surface-variant": "#E1E3DE",
        "on-surface": "#191C1A",
        "on-surface-variant": "#414943",

        "outline": "#717973",
        "outline-variant": "#C1C8C2",

        // Semantic status colors
        "safe": "#4D8B64",
        "safe-bg": "#F4FFEC",
        "warning": "#E2A93B",
        "warning-bg": "#FFF8E1",
        "trigger-alert": "#C9574F",
        "trigger-alert-bg": "#FFDAD6",
        "text-secondary": "#66716B",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      spacing: {
        "gutter": "20px",
        "margin-desktop": "40px",
        "margin-mobile": "16px",
        "base": "8px",
        "xs": "4px",
        "sm": "12px",
        "md": "24px",
        "lg": "48px",
        "xl": "80px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        grotesk: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        // Display (48px)
        "display-xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700", fontFamily: "Space Grotesk" }],
        "display-lg": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700", fontFamily: "Space Grotesk" }],
        "display-md": ["36px", { lineHeight: "44px", letterSpacing: "-0.01em", fontWeight: "600", fontFamily: "Space Grotesk" }],
        // Headline (32px)
        "headline-xl": ["32px", { lineHeight: "40px", fontWeight: "600", fontFamily: "Space Grotesk" }],
        "headline-lg": ["28px", { lineHeight: "36px", fontWeight: "600", fontFamily: "Space Grotesk" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "500", fontFamily: "Space Grotesk" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "500", fontFamily: "Space Grotesk" }],
        // Title (18px)
        "title-lg": ["18px", { lineHeight: "28px", fontWeight: "600" }],
        "title-md": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "title-sm": ["14px", { lineHeight: "20px", fontWeight: "600", letterSpacing: "0.01em" }],
        // Body (16px)
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        // Label (14px)
        "label-lg": ["14px", { lineHeight: "20px", fontWeight: "600", letterSpacing: "0.01em" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600", letterSpacing: "0.05em" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.05em" }],
        // Caption (12px)
        "caption-lg": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "caption-md": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "caption-sm": ["10px", { lineHeight: "14px", fontWeight: "400" }],
        // Overline
        "overline": ["10px", { lineHeight: "14px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase" }],
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
        "elevated": "0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
