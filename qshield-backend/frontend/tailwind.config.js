/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#B50A2E",
        "primary-variant": "#8A0520",
        "primary-container": "#FCEAEA",
        "on-primary": "#ffffff",

        "secondary": "#FABC0A",
        "secondary-variant": "#D49D00",
        "secondary-container": "#FEF5D9",
        "on-secondary": "#4A3500",

        "surface": "#ffffff",
        "surface-dim": "#f8fafc", /* slate-50 */
        "surface-container": "#f1f5f9", /* slate-100 */
        "surface-container-high": "#e2e8f0", /* slate-200 */
        "on-surface": "#0f172a", /* slate-900 */
        "on-surface-variant": "#475569", /* slate-600 */

        "outline": "#cbd5e1",
        "outline-variant": "#e2e8f0",

        "error": "#dc2626",
        "error-container": "#fef2f2",
        "on-error": "#ffffff",

        "success": "#16a34a",
        "success-container": "#dcfce7",
      },
      fontFamily: {
        "headline": ["Inter"],
        "body": ["Inter"],
        "label": ["Inter"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px" },
    },
  },
  plugins: [],
}
