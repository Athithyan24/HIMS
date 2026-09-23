/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        mute: "#64748B",
        paper: "#F8FAFC",
        line: "#E8EEF4",
        brand: { DEFAULT: "#2563EB", soft: "#EFF4FF", mist: "#0EA5E9" },
      },
      fontFamily: {
        sans: ["Outfit", "ui-sans-serif", "system-ui"],
        serif: ["Fraunces", "ui-serif", "Georgia"],
      },
      borderRadius: {
        16: "16px",
        20: "20px",
        24: "24px",
      },
      boxShadow: {
        apple: "0px 8px 32px rgba(0,0,0,0.08)",
        lift: "0px 16px 40px rgba(15,23,42,0.10)",
      },
    },
  },
  plugins: [],
};
