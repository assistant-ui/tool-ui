import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/playground/**/*.test.ts"],
    passWithNoTests: true,
    globals: true,
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
});


