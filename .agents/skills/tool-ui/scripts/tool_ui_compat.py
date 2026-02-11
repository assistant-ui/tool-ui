#!/usr/bin/env python3
"""Check and optionally fix shadcn compatibility for Tool UI installs."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

TOOL_UI_REGISTRY_URL = "https://tool-ui.com/r/{name}.json"
IGNORE_DIRS = {".git", ".next", "node_modules", "dist", "build", "coverage", "out"}
SCAN_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mdx"}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def module_exists(base: Path) -> bool:
    if base.exists():
        return True

    candidates = [
        base.with_suffix(".ts"),
        base.with_suffix(".tsx"),
        base.with_suffix(".js"),
        base.with_suffix(".jsx"),
        base.with_suffix(".mjs"),
        base.with_suffix(".cjs"),
        base / "index.ts",
        base / "index.tsx",
        base / "index.js",
        base / "index.jsx",
        base / "index.mjs",
        base / "index.cjs",
    ]
    return any(candidate.exists() for candidate in candidates)


def iter_code_files(project_root: Path):
    for path in project_root.rglob("*"):
        if not path.is_file():
            continue

        if path.suffix not in SCAN_EXTENSIONS:
            continue

        if any(part in IGNORE_DIRS for part in path.parts):
            continue

        yield path


def scan_imports(project_root: Path, pattern: re.Pattern[str]) -> set[str]:
    imports: set[str] = set()
    for file_path in iter_code_files(project_root):
        text = file_path.read_text(errors="ignore")
        for match in pattern.finditer(text):
            if match.lastindex:
                for index in range(1, match.lastindex + 1):
                    value = match.group(index)
                    if value:
                        imports.add(value)
            else:
                imports.add(match.group(0))

    return imports


def read_package_names(project_root: Path) -> set[str]:
    package_json_path = project_root / "package.json"
    if not package_json_path.exists():
        return set()

    data = load_json(package_json_path)
    deps = data.get("dependencies", {})
    dev_deps = data.get("devDependencies", {})

    names = set()
    if isinstance(deps, dict):
        names.update(deps.keys())
    if isinstance(dev_deps, dict):
        names.update(dev_deps.keys())

    return names


def run_checks(project_root: Path, apply_fix: bool, doctor: bool) -> int:
    fail_count = 0

    def fail(message: str) -> None:
        nonlocal fail_count
        fail_count += 1
        print(f"FAIL: {message}")

    def warn(message: str) -> None:
        print(f"WARN: {message}")

    def info(message: str) -> None:
        print(f"INFO: {message}")

    def ok(message: str) -> None:
        print(f"PASS: {message}")

    components_json_path = project_root / "components.json"
    if not components_json_path.exists():
        fail("components.json not found at project root")
        print("Hint: initialize shadcn first, then retry.")
        return 1

    try:
        components_data = load_json(components_json_path)
    except json.JSONDecodeError as exc:
        fail(f"components.json is invalid JSON: {exc}")
        return 1

    changed = False

    aliases = components_data.get("aliases")
    if not isinstance(aliases, dict):
        fail("components.json.aliases is missing or invalid")
        aliases = {}

    utils_alias = aliases.get("utils") if isinstance(aliases, dict) else None
    if not isinstance(utils_alias, str) or not utils_alias:
        fail("components.json.aliases.utils is missing")
    else:
        ok(f"aliases.utils = {utils_alias}")

    components_alias = aliases.get("components") if isinstance(aliases, dict) else None
    if not isinstance(components_alias, str) or not components_alias:
        fail("components.json.aliases.components is missing")
    else:
        ok(f"aliases.components = {components_alias}")

    registries = components_data.get("registries")
    if not isinstance(registries, dict):
        warn("components.json.registries missing; creating it")
        if apply_fix:
            components_data["registries"] = {"@tool-ui": TOOL_UI_REGISTRY_URL}
            changed = True
            ok("created registries with @tool-ui entry")
    else:
        current_registry = registries.get("@tool-ui")
        if current_registry == TOOL_UI_REGISTRY_URL:
            ok(f"@tool-ui registry = {TOOL_UI_REGISTRY_URL}")
        else:
            warn("@tool-ui registry missing or different")
            print(f"      expected: {TOOL_UI_REGISTRY_URL}")
            print(f"      current:  {current_registry}")
            if apply_fix:
                registries["@tool-ui"] = TOOL_UI_REGISTRY_URL
                changed = True
                ok("updated @tool-ui registry")

    tailwind_css_path = None
    tailwind = components_data.get("tailwind")
    if isinstance(tailwind, dict):
        tailwind_css = tailwind.get("css")
        if isinstance(tailwind_css, str) and tailwind_css:
            tailwind_css_path = project_root / tailwind_css
            if tailwind_css_path.exists():
                ok(f"tailwind.css path exists: {tailwind_css}")
            else:
                fail(f"tailwind.css path not found: {tailwind_css}")
        else:
            warn("components.json.tailwind.css missing")
    else:
        warn("components.json.tailwind missing")

    if apply_fix and changed:
        components_json_path.write_text(json.dumps(components_data, indent=2) + "\n")
        info(f"updated {components_json_path}")

    if doctor:
        info("running doctor checks")

        components_dir = None
        if isinstance(components_alias, str) and components_alias.startswith("@/"):
            components_dir = project_root / components_alias[2:]
        else:
            warn("cannot resolve aliases.components to a filesystem path (requires '@/...')")

        if components_dir is not None:
            tool_ui_dir = components_dir / "tool-ui"
            shared_dir = tool_ui_dir / "shared"

            if tool_ui_dir.exists() and not shared_dir.exists():
                fail("components/tool-ui exists but components/tool-ui/shared is missing")
            elif shared_dir.exists():
                ok("components/tool-ui/shared exists")
            else:
                warn("components/tool-ui not found yet (no Tool UI components installed)")

            import_pattern = re.compile(
                r'from\s+["\'](@/components/tool-ui/[^"\']+)["\']|import\(\s*["\'](@/components/tool-ui/[^"\']+)["\']\s*\)',
            )
            tool_ui_imports = scan_imports(project_root, import_pattern)
            missing_modules: list[str] = []
            for module_path in sorted(tool_ui_imports):
                if not module_path.startswith("@/components/tool-ui/"):
                    continue
                relative_module = module_path[len("@/") :]
                base = project_root / relative_module
                if not module_exists(base):
                    missing_modules.append(module_path)

            if missing_modules:
                fail("missing module paths for Tool UI imports:")
                for module in missing_modules:
                    print(f"  - {module}")
            elif tool_ui_imports:
                ok(f"resolved {len(tool_ui_imports)} Tool UI import paths")

        packages = read_package_names(project_root)
        assistant_import_pattern = re.compile(r'[@]assistant-ui/react(?:-ai-sdk)?')
        assistant_imports = scan_imports(project_root, assistant_import_pattern)

        requires_react_pkg = any("@assistant-ui/react" in value for value in assistant_imports)
        requires_ai_sdk_pkg = any("@assistant-ui/react-ai-sdk" in value for value in assistant_imports)

        if requires_react_pkg and "@assistant-ui/react" not in packages:
            fail("code imports @assistant-ui/react but package is missing")
        elif requires_react_pkg:
            ok("@assistant-ui/react package installed")

        if requires_ai_sdk_pkg and "@assistant-ui/react-ai-sdk" not in packages:
            fail("code imports @assistant-ui/react-ai-sdk but package is missing")
        elif requires_ai_sdk_pkg:
            ok("@assistant-ui/react-ai-sdk package installed")

    if not apply_fix:
        print("\nRun with --fix to auto-add/update @tool-ui registry entry.")

    return 1 if fail_count > 0 else 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Tool UI compatibility checker")
    parser.add_argument("--project", default=".", help="Project root path (default: current directory)")
    parser.add_argument("--fix", action="store_true", help="Apply safe fixes to components.json")
    parser.add_argument(
        "--doctor",
        action="store_true",
        help="Run deeper checks: shared folder, imports, and package consistency",
    )
    args = parser.parse_args()

    project_root = Path(args.project).resolve()
    exit_code = run_checks(project_root, args.fix, args.doctor)
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
