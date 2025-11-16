import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    dir: "tests",
    include: ["**/*.test.ts"],
    globals: true,
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
});


