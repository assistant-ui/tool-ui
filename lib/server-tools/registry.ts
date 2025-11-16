type ToolModuleLoader = () => Promise<unknown>;

const serverToolModules = {
  "@/lib/server-tools/find-ride/get-user-location": () =>
    import("@/lib/server-tools/find-ride/get-user-location"),
  "@/lib/server-tools/find-ride/toggle-gps": () =>
    import("@/lib/server-tools/find-ride/toggle-gps"),
  "@/lib/server-tools/find-ride/get-user-destination": () =>
    import("@/lib/server-tools/find-ride/get-user-destination"),
  "@/lib/server-tools/find-ride/check-ride-prices": () =>
    import("@/lib/server-tools/find-ride/check-ride-prices"),
  "@/lib/server-tools/find-ride/request-payment-method": () =>
    import("@/lib/server-tools/find-ride/request-payment-method"),
  "@/lib/server-tools/find-ride/confirm-user-payment": () =>
    import("@/lib/server-tools/find-ride/confirm-user-payment"),
  "@/lib/server-tools/find-ride/show-ride-details": () =>
    import("@/lib/server-tools/find-ride/show-ride-details"),
  "@/lib/server-tools/find-ride/get-profile-context": () =>
    import("@/lib/server-tools/find-ride/get-profile-context"),
  "@/lib/server-tools/find-ride/search-places": () =>
    import("@/lib/server-tools/find-ride/search-places"),
  "@/lib/server-tools/find-ride/precheck-prices": () =>
    import("@/lib/server-tools/find-ride/precheck-prices"),
  "@/lib/server-tools/find-ride/schedule-ride": () =>
    import("@/lib/server-tools/find-ride/schedule-ride"),
  "@/lib/server-tools/find-ride/show-ride-options": () =>
    import("@/lib/server-tools/find-ride/show-ride-options"),
  "@/lib/server-tools/find-ride/confirm-ride-booking": () =>
    import("@/lib/server-tools/find-ride/confirm-ride-booking"),
} satisfies Record<string, ToolModuleLoader>;

export const loadServerToolModule = async (modulePath: string) => {
  const loader = serverToolModules[modulePath as keyof typeof serverToolModules] ?? undefined;
  if (!loader) {
    throw new Error(
      `Unknown server tool module "${modulePath}". ` +
        "Add it to lib/server-tools/registry.ts.",
    );
  }

  return loader();
};

