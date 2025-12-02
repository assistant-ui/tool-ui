import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
    include: ["lib/playground/**/*.test.ts", "lib/workbench/**/*.test.ts"],
    passWithNoTests: true,
    globals: true,
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
});
