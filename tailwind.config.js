/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          xl: "1240px",
        },
      },
      colors: {
        white: "#FFFFFF",
      },
    },
  },
};
