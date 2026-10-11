/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // core pink ramp drawn from the moodboard
        pink: {
          50: "#FFF3F8",
          100: "#FFE4F0",
          200: "#FFC9E1",
          300: "#FFA3C9",
          400: "#FF6BAC",
          500: "#FF2E88",
          600: "#F5006F",
          700: "#CC0059",
          800: "#9E0047",
          900: "#7A0036",
        },
        fuschia: "#FF0080",
        bubblegum: "#FF6FB5",
        paper: "#FFF7FB",
        ink: "#0B0B0B",
      },
      fontFamily: {
        display: ["Archivo Black", "Arial Black", "Impact", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        // hard offset sticker shadows, no blur — matches the cut-out look
        sticker: "4px 4px 0 0 #0B0B0B",
        "sticker-sm": "3px 3px 0 0 #0B0B0B",
        "sticker-lg": "8px 8px 0 0 #0B0B0B",
        "sticker-pink": "5px 5px 0 0 #FF2E88",
        "sticker-pink-sm": "3px 3px 0 0 #FF2E88",
        pop: "0 0 0 #FF2E88, 0 10px 30px rgba(255,46,136,0.35)",
      },
      borderRadius: {
        sticker: "14px",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2.5deg)" },
          "50%": { transform: "rotate(2.5deg)" },
        },
        bob: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-9px)" },
        },
        pop: {
          "0%": { transform: "scale(0.86)", opacity: "0" },
          "60%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulsePink: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(255,46,136,0.5)" },
          "50%": { boxShadow: "0 0 0 14px rgba(255,46,136,0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marqueeY: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 26s linear infinite",
        "marquee-y": "marqueeY 14s linear infinite",
        wiggle: "wiggle 0.7s ease-in-out infinite",
        bob: "bob 3.2s ease-in-out infinite",
        pop: "pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "spin-slow": "spinSlow 9s linear infinite",
        "pulse-pink": "pulsePink 2s ease-out infinite",
        "slide-up": "slideUp 0.55s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
}