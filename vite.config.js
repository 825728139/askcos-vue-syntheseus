// Plugins
import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";

// Utilities
import { defineConfig } from "vite";
import childProcess from "child_process";

let lastCommitHash = "";
try {
  lastCommitHash = childProcess
    .execSync("git rev-parse --short HEAD")
    .toString()
    .trim();
} catch (e) {
  console.error(e);
}

const fastapiGatewayPtr = {
  // Head Node target (only commented out for development and testing):
  target: "http://3.16.7.29/",
  // Testing/Development server target: 
  // target: "http://173.48.230.6:9918/",  
  changeOrigin: true,
  ws: true,
  secure: false,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 ** 2,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/sso-callback/, /^\/auth/]
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        theme_color: "#000000",
        background_color: "#2EC6FE",
        icons: [
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "android-chrome-512x512.png",
            type: "image/png",
          },
          {
            purpose: "any",
            sizes: "512x512",
            src: "android-chrome-512x512.png",
            type: "image/png",
          },
        ],
        orientation: "any",
        display: "standalone",
        dir: "auto",
        lang: "en-US",
        name: "ASKCOS",
        short_name: "askcos",
        description: "Computer-aided Design Tools for Organic Synthesis",
        screenshots: [
          {
            src: "askcos-home-640.png",
            sizes: "640x320",
            type: "image/png",
            form_factor: "wide",
            label: "ASKCOS Widget",
          },
          {
            src: "askcos-login-640.png",
            sizes: "640x320",
            type: "image/png",
            form_factor: "wide",
            label: "ASKCOS Widget",
          },
        ],
      },
    }),
  ],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(lastCommitHash),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      // Proxy configuration
      // FastAPI Docs Config
      "/openapi.json": fastapiGatewayPtr,
      "/docs": fastapiGatewayPtr,
      // FastAPI Gateway
      "/api/": fastapiGatewayPtr,
    },
  },
  optimizeDeps: {
    exclude: ["vuetify"],
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: "modern",
      },
    },
  },
});
