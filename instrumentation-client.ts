import posthog from "posthog-js";

const apiKey = process.env["NEXT_PUBLIC_POSTHOG_API_KEY"];
const isDev = process.env.NODE_ENV === "development";

if (apiKey) {
  posthog.init(apiKey, {
    api_host: "/ph",
    ui_host: "https://us.posthog.com",
    defaults: "2025-11-30",
    capture_exceptions: true,
    loaded: (posthog) => {
      // Tag all events with environment for filtering
      posthog.register({
        environment: isDev ? "development" : "production",
        app: "tool-ui",
      });
    },
  });
}
