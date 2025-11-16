type ToolModuleLoader = () => Promise<unknown>;

const serverToolModules = {
  "@/lib/prototypes/server-tools/find-ride/get-user-location": () =>
    import("@/lib/prototypes/server-tools/find-ride/get-user-location"),
  "@/lib/prototypes/server-tools/find-ride/toggle-gps": () =>
    import("@/lib/prototypes/server-tools/find-ride/toggle-gps"),
  "@/lib/prototypes/server-tools/find-ride/get-user-destination": () =>
    import("@/lib/prototypes/server-tools/find-ride/get-user-destination"),
  "@/lib/prototypes/server-tools/find-ride/check-ride-prices": () =>
    import("@/lib/prototypes/server-tools/find-ride/check-ride-prices"),
  "@/lib/prototypes/server-tools/find-ride/request-payment-method": () =>
    import("@/lib/prototypes/server-tools/find-ride/request-payment-method"),
  "@/lib/prototypes/server-tools/find-ride/confirm-user-payment": () =>
    import("@/lib/prototypes/server-tools/find-ride/confirm-user-payment"),
  "@/lib/prototypes/server-tools/find-ride/show-ride-details": () =>
    import("@/lib/prototypes/server-tools/find-ride/show-ride-details"),
  "@/lib/prototypes/server-tools/find-ride/get-profile-context": () =>
    import("@/lib/prototypes/server-tools/find-ride/get-profile-context"),
  "@/lib/prototypes/server-tools/find-ride/search-places": () =>
    import("@/lib/prototypes/server-tools/find-ride/search-places"),
  "@/lib/prototypes/server-tools/find-ride/precheck-prices": () =>
    import("@/lib/prototypes/server-tools/find-ride/precheck-prices"),
  "@/lib/prototypes/server-tools/find-ride/schedule-ride": () =>
    import("@/lib/prototypes/server-tools/find-ride/schedule-ride"),
  "@/lib/prototypes/server-tools/find-ride/show-ride-options": () =>
    import("@/lib/prototypes/server-tools/find-ride/show-ride-options"),
  "@/lib/prototypes/server-tools/find-ride/confirm-ride-booking": () =>
    import("@/lib/prototypes/server-tools/find-ride/confirm-ride-booking"),
} satisfies Record<string, ToolModuleLoader>;

export const loadServerToolModule = async (modulePath: string) => {
  const loader = serverToolModules[modulePath as keyof typeof serverToolModules] ?? undefined;
  if (!loader) {
    throw new Error(
      `Unknown server tool module "${modulePath}". ` +
        "Add it to lib/prototypes/server-tools/registry.ts.",
    );
  }

  return loader();
};

