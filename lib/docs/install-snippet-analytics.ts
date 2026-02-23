export type InstallSnippetType = "skills" | "registry" | "package_manager";

const SKILLS_INSTALL_PATTERN = /(?:^|\n)\s*npx\s+skills\s+add\b/i;
const REGISTRY_INSTALL_PATTERN = /(?:^|\n)\s*npx\s+shadcn@latest\s+add\b/i;
const PACKAGE_INSTALL_PATTERN =
  /(?:^|\n)\s*(?:npm|pnpm|yarn|bun)\s+(?:install|add)\b/i;

export function detectInstallSnippetType(
  code: string,
): InstallSnippetType | null {
  if (SKILLS_INSTALL_PATTERN.test(code)) {
    return "skills";
  }

  if (REGISTRY_INSTALL_PATTERN.test(code)) {
    return "registry";
  }

  if (PACKAGE_INSTALL_PATTERN.test(code)) {
    return "package_manager";
  }

  return null;
}

export function getDocsCodeCopySource(
  installSnippetType: InstallSnippetType | null,
): "docs_installation" | "docs_code_block" {
  return installSnippetType ? "docs_installation" : "docs_code_block";
}
