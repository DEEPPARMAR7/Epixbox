import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules into vendor chunks
          if (id.includes("node_modules")) {
            if (id.includes("react") && !id.includes("react-")) {
              return "vendor-react";
            }
            if (id.includes("stripe")) {
              return "vendor-payments";
            }
            if (id.includes("recharts")) {
              return "vendor-charts";
            }
            if (id.includes("@tanstack/react-query") || id.includes("axios")) {
              return "vendor-query";
            }
            if (id.includes("react-hook-form") || id.includes("react-select") || id.includes("zod")) {
              return "vendor-forms";
            }
            if (id.includes("lucide-react") || id.includes("sonner") || id.includes("react-hot-toast")) {
              return "vendor-ui";
            }
            if (id.includes("zustand")) {
              return "vendor-state";
            }
            return "vendor-common";
          }

          // Split app code by feature
          if (id.includes("src/pages/dashboard")) {
            return "feature-dashboard";
          }
          if (id.includes("src/pages/portfolio") || id.includes("src/pages/proofing")) {
            return "feature-portfolio";
          }
          if (id.includes("src/pages/subscriptions")) {
            return "feature-subscriptions";
          }
          if (id.includes("src/components")) {
            return "components";
          }
        }
      }
    }
  }
}));
