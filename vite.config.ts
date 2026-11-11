import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load environment variables for the current mode
  const env =
    loadEnv(
      mode,
      process.cwd(),
      "",
    );

 if (mode !== "test") {
  const requiredVariables = [
    "VITE_API_BASE_URL",
    "VITE_RIDE_HUB_URL",
    "VITE_LOCATION_HUB_URL",
    "VITE_TAXICARD_HUB_URL",
    "VITE_PLATFORM_MESSAGES_HUB_URL",
    "VITE_AZURE_MAPS_KEY",
  ];

  for (const name of requiredVariables) {
    if (!env[name]?.trim()) {
      throw new Error(
        `Missing ${name} in environment variables`,
      );
    }
  }
}

  return {
    plugins: [
      react(),

      VitePWA({
  registerType: "autoUpdate",

  strategies: "generateSW",

  workbox: {
    /*
     * Do not build a service-worker
     * source map.
     */
    sourcemap: false,

    /*
     * Precache only the application shell.
     *
     * Do NOT precache the hero MP4,
     * source maps, or other large media.
     */
    globPatterns: [
      "**/*.{js,css,html}",
    ],

    globIgnores: [
      "**/*.map",
      "**/*.mp4",
      "**/*.webm",
      
       /**
     * Azure Maps is dynamically loaded
     * only when a map visual is needed.
     *
     * Do not include the 1.6+ MB Atlas
     * bundle in the service-worker
     * precache.
     */
      "**/atlas.min-*.js",
    ],

    cleanupOutdatedCaches: true,
  },


        manifest: {
          name: "rideusa.rundelta.ai",
          short_name: "rideusa.rundelta.ai",

          description:
            "Rideshare, Livery, Taxi Decentralized Transportation Application",

          display: "standalone",

          start_url: "/",

          background_color:
            "#ffffff",

          theme_color:
            "#357fa0",

          icons: [
            {
              src: "/src/assets/images/rundeltaCar.webp",
              sizes: "192x192",
              type: "image/webp",
              purpose: "any maskable",
            },
            {
              src: "/src/assets/images/rundeltaCar.webp",
              sizes: "512x512",
              type: "image/webp",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        "@":
          path.resolve(
            import.meta.dirname,
            "src",
          ),
      },
    },

    server: {
      port: 5173,

      open: true,

      proxy: {
        "/api": {
          target:
            env.VITE_API_BASE_URL,

          changeOrigin:
            true,

          secure:
            false,
        },

        "/hubs": {
          target:
            env.VITE_API_BASE_URL,

          changeOrigin:
            true,

          secure:
            false,

          ws:
            true,
        },
      },
    },

    define: {
      __API_BASE_URL__:
        JSON.stringify(
          env.VITE_API_BASE_URL,
        ),

      __AZURE_MAPS_KEY__:
        JSON.stringify(
          env.VITE_AZURE_MAPS_KEY,
        ),
    },

   build: {
  sourcemap: false,
  chunkSizeWarningLimit: 2000,
  rolldownOptions: {
    output: {
      sourcemap: false,

      codeSplitting: {
        groups: [
          {
            name: "atlas.min",
            test:
              /node_modules[\\/]azure-maps-control[\\/]/,
            priority: 50,
          },
          {
            name: "react",
            test:
              /node_modules[\\/](react|react-dom)[\\/]/,
            priority: 40,
          },
          {
            name: "mui",
            test:
              /node_modules[\\/](@mui[\\/]material|@emotion[\\/](react|styled))[\\/]/,
            priority: 30,
          },
          {
            name: "redux",
            test:
              /node_modules[\\/](@reduxjs[\\/]toolkit|react-redux)[\\/]/,
            priority: 20,
          },
          {
            name: "router",
            test:
              /node_modules[\\/]react-router-dom[\\/]/,
            priority: 10,
          },
        ],
      },
    },
    checks: {
      bundlerTimings: false,
    },
    },
  },
}
});