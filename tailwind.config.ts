import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary-green": "var(--primary-green)",
        "primary-green-dark": "#154632",
        "page-bg": "#f5f5f3",
        "card-bg": "#ffffff",
        "sage-light": "#e8ede9",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0)",
      },
    },
  },
  plugins: [],
};

export default config;
