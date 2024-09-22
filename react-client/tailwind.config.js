const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        'background': '#202124',
        'x': '#268eba',
        'o': '#77d624',
      }
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}