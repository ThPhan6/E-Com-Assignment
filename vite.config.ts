import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
    //   cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem")),
    // },
    port: 5173, // or whatever port you want
    open: true,
    // host: true,
  },
});
