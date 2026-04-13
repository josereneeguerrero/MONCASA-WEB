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
        moncasa: {
          orange: '#FE9A01', // El naranja de tu logo
          dark: '#0A1116',   // El negro de tu logo
          light: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
};
export default config;