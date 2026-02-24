import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Custom Forest Green and Warm Cream palette
        forest: {
          50: "#F0F4F1",
          100: "#D7E3DC", 
          200: "#B8CFC4",
          300: "#8FB39F",
          400: "#6B9473",
          500: "#40916C", // Secondary
          600: "#2D6A4F",
          700: "#1B4332", // Primary
          800: "#152D1A",
          900: "#0F1F14",
        },
        cream: {
          50: "#FFFEFA",
          100: "#FDFCF7", // Background
          200: "#FBF8F0",
          300: "#F8F3E8",
          400: "#F4EADC",
          500: "#F0E0CE",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FDFCF7", // Warm Cream
        foreground: "#1B4332", // Forest Green
        primary: {
          DEFAULT: "#1B4332", // Deep Forest Green
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#40916C", // Sage Green
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8F3E8",
          foreground: "#6B9473",
        },
        accent: {
          DEFAULT: "#8FB39F",
          foreground: "#1B4332",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1B4332",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1B4332",
        },
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#1B4332",
          primary: "#1B4332",
          "primary-foreground": "#FFFFFF",
          accent: "#F8F3E8",
          "accent-foreground": "#1B4332",
          border: "#E5E7EB",
          ring: "#1B4332",
          muted: "#F8F3E8",
        },
        chart: {
          "1": "#1B4332",
          "2": "#40916C", 
          "3": "#8FB39F",
          "4": "#B8CFC4",
          "5": "#D7E3DC",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
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
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
