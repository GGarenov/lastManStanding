import path from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import AssetOverridePlugin from "./plugins/asset-override.plugin";
import ConfigInjectPlugin from "./plugins/config-inject.plugin";
import CssOverridePlugin from "./plugins/css-override.plugin";
import { getViteScopedName } from "./plugins/node.utils";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3001,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    // Asset override must run first (has enforce: 'pre')
    AssetOverridePlugin(),
    react(),
    CssOverridePlugin(),
    ConfigInjectPlugin(),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    devSourcemap: true,
    modules: { generateScopedName: getViteScopedName },
    preprocessorOptions: {
      less: {},
    },
  },
}));
