/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#111", // Page background
        "page-contrast": "#FFF", // Page text
        "bg-in": "#111", // Page gradient start
        "bg-out": "#111", // Page gradient end
        primary: "#8D3FEC", // Brand background (buttons, ect.)
        "primary-contrast": "#FFF", // Brand text
        paper: "#111", // Card background
        "paper-contrast": "#FFF", // Card text
      },
      fontSize: {
        base: "14px", // Base font size
      },
      fontFamily: {
        sans: ["aktiv-grotesk", "Inter", "sans-serif"], // Default font family for the page
        headers: ["aktiv-grotesk-extended", "Inter", "sans-serif"], // Font family for the headers
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("@tailwindcss/forms")],
}
