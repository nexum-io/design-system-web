import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    // Stylesheets stay stubbed, but `*.css?raw` must reach Vite's raw loader
    // (source-level guards such as layouts/cabinet/__tests__/cabinetBottomInset.test.ts).
    css: { include: [/\.css\?raw$/] },
  },
});
