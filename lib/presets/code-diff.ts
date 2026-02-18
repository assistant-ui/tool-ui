import type { SerializableCodeDiff } from "@/components/tool-ui/code-diff";
import type { PresetWithCodeGen } from "./types";

export type CodeDiffPresetName =
  | "refactor"
  | "bug-fix"
  | "patch"
  | "split"
  | "collapsed"
  | "minimal";

function escape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function generateCodeDiffCode(data: SerializableCodeDiff): string {
  const props: string[] = [];

  props.push(`  id="${data.id}"`);

  if (data.language && data.language !== "text") {
    props.push(`  language="${data.language}"`);
  }

  if (data.filename) {
    props.push(`  filename="${data.filename}"`);
  }

  if (data.maxCollapsedLines) {
    props.push(`  maxCollapsedLines={${data.maxCollapsedLines}}`);
  }

  if (data.lineNumbers && data.lineNumbers !== "visible") {
    props.push(`  lineNumbers="${data.lineNumbers}"`);
  }

  if (data.diffStyle && data.diffStyle !== "unified") {
    props.push(`  diffStyle="${data.diffStyle}"`);
  }

  if (data.patch) {
    props.push(`  patch={\`${escape(data.patch)}\`}`);
  } else {
    if (data.oldCode) {
      props.push(`  oldCode={\`${escape(data.oldCode)}\`}`);
    }
    if (data.newCode) {
      props.push(`  newCode={\`${escape(data.newCode)}\`}`);
    }
  }

  return `<CodeDiff\n${props.join("\n")}\n/>`;
}

export const codeDiffPresets: Record<
  CodeDiffPresetName,
  PresetWithCodeGen<SerializableCodeDiff>
> = {
  refactor: {
    description: "Safer error handling in fetch helper",
    data: {
      id: "code-diff-preview-refactor",
      language: "typescript",
      filename: "lib/auth.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      oldCode: `export async function fetchUser(id: string) {
  const res = await db.users.findUnique({ where: { id } });
  if (!res) throw new Error("User not found");
  return res;
}
`,
      newCode: `export async function fetchUser(id: string) {
  const res = await db.users.findUnique({ where: { id } });
  if (!res) return null;
  return res;
}
`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  "bug-fix": {
    description: "Off-by-one fix in pagination",
    data: {
      id: "code-diff-preview-bug-fix",
      language: "typescript",
      filename: "hooks/use-pagination.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      oldCode: `const totalPages = Math.floor(items.length / pageSize);
const end = page * pageSize - 1;`,
      newCode: `const totalPages = Math.ceil(items.length / pageSize);
const end = page * pageSize;`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  collapsed: {
    description: "Large refactor with collapsible diff",
    data: {
      id: "code-diff-preview-collapsed",
      language: "typescript",
      filename: "lib/permissions.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      maxCollapsedLines: 12,
      oldCode: `export function resolvePermissions(
  user: User,
  resource: Resource,
  context: RequestContext,
): Permission[] {
  const base = getBasePermissions(user.role);
  const overrides = getResourceOverrides(resource.id);
  const result: Permission[] = [];

  for (const perm of base) {
    if (overrides.denied.includes(perm)) continue;
    if (perm === "write" && resource.locked) continue;
    if (perm === "admin" && !context.elevated) continue;
    result.push(perm);
  }

  for (const perm of overrides.granted) {
    if (!result.includes(perm)) {
      result.push(perm);
    }
  }

  if (user.isSuperAdmin) {
    return ALL_PERMISSIONS;
  }

  return result;
}`,
      newCode: `export function resolvePermissions(
  user: User,
  resource: Resource,
  context: RequestContext,
): Permission[] {
  if (user.isSuperAdmin) return ALL_PERMISSIONS;

  const base = getBasePermissions(user.role);
  const overrides = getResourceOverrides(resource.id);

  const filtered = base.filter((perm) => {
    if (overrides.denied.includes(perm)) return false;
    if (perm === "write" && resource.locked) return false;
    if (perm === "admin" && !context.elevated) return false;
    return true;
  });

  const granted = overrides.granted.filter(
    (perm) => !filtered.includes(perm),
  );

  return [...filtered, ...granted];
}`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  minimal: {
    description: "Clean diff without line numbers",
    data: {
      id: "code-diff-preview-minimal",
      language: "python",
      filename: "app/config.py",
      lineNumbers: "hidden",
      diffStyle: "unified",
      oldCode: `ALLOWED_ORIGINS = ["https://app.example.com"]
RATE_LIMIT = 100
SESSION_TTL = 3600`,
      newCode: `ALLOWED_ORIGINS = ["https://app.example.com", "https://staging.example.com"]
RATE_LIMIT = 250
SESSION_TTL = 7200`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  patch: {
    description: "Unified diff from a pull request",
    data: {
      id: "code-diff-preview-patch",
      language: "typescript",
      filename: "api/routes.ts",
      lineNumbers: "visible",
      diffStyle: "unified",
      patch: `--- a/api/routes.ts
+++ b/api/routes.ts
@@ -14,8 +14,12 @@ export function registerRoutes(app: Express) {
   app.get("/api/users", listUsers);
   app.get("/api/users/:id", getUser);
   app.post("/api/users", createUser);
-  app.put("/api/users/:id", updateUser);
+  app.patch("/api/users/:id", updateUser);
   app.delete("/api/users/:id", deleteUser);
+
+  // Health check
+  app.get("/healthz", (_req, res) => {
+    res.json({ status: "ok", uptime: process.uptime() });
+  });
 }`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
  split: {
    description: "Side-by-side view of a function extraction",
    data: {
      id: "code-diff-preview-split",
      language: "typescript",
      filename: "utils/format.ts",
      lineNumbers: "visible",
      diffStyle: "split",
      oldCode: `export function formatUser(user: User): string {
  const name = user.firstName + " " + user.lastName;
  const role = user.isAdmin ? "Admin" : "Member";
  const since = new Date(user.createdAt)
    .toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  return \`\${name} (\${role}) — joined \${since}\`;
}`,
      newCode: `function formatName(user: User): string {
  return \`\${user.firstName} \${user.lastName}\`;
}

function formatRole(user: User): string {
  return user.isAdmin ? "Admin" : "Member";
}

function formatJoinDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatUser(user: User): string {
  const name = formatName(user);
  const role = formatRole(user);
  const since = formatJoinDate(user.createdAt);
  return \`\${name} (\${role}) — joined \${since}\`;
}`,
    } satisfies SerializableCodeDiff,
    generateExampleCode: generateCodeDiffCode,
  },
};
