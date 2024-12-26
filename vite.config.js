import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/feeds": {
                target: "https://rss-feed-service-dot-argon-magnet-442917-k1.el.r.appspot.com/",
                changeOrigin: true,
            },
            "/fetch-store": {
                target: "https://rss-feed-service-dot-argon-magnet-442917-k1.el.r.appspot.com/",
                changeOrigin: true,
            },
        },
    },
});
