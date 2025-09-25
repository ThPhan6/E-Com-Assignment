import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, "certs/key.pem")),
    //   cert: fs.readFileSync(path.resolve(__dirname, "certs/cert.pem")),
    // },
    port: 10000, // or whatever port you want
    open: true,
    host: "0.0.0.0",
  },
});
