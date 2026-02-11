#!/usr/bin/env python3
"""Check and optionally fix shadcn compatibility for Tool UI registry installs."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

TOOL_UI_REGISTRY_URL = "https://tool-ui.com/r/{name}.json"


def check_components_json(project_root: Path, apply_fix: bool) -> int:
    components_json_path = project_root / "components.json"
    if not components_json_path.exists():
        print("FAIL: components.json not found at project root")
        print("Hint: initialize shadcn first, then retry.")
        return 1

    try:
        data = json.loads(components_json_path.read_text())
    except json.JSONDecodeError as exc:
        print(f"FAIL: components.json is invalid JSON: {exc}")
        return 1

    changed = False

    aliases = data.get("aliases")
    if not isinstance(aliases, dict):
        print("WARN: components.json.aliases is missing or invalid")
    else:
        utils_alias = aliases.get("utils")
        if not isinstance(utils_alias, str) or not utils_alias:
            print("WARN: components.json.aliases.utils is missing")
            print("      Tool UI registry entries expect an existing utils alias (usually '@/lib/utils').")
        else:
            print(f"PASS: aliases.utils = {utils_alias}")

    registries = data.get("registries")
    if not isinstance(registries, dict):
        print("WARN: components.json.registries missing; creating it")
        if apply_fix:
            data["registries"] = {"@tool-ui": TOOL_UI_REGISTRY_URL}
            changed = True
    else:
        current = registries.get("@tool-ui")
        if current == TOOL_UI_REGISTRY_URL:
            print(f"PASS: @tool-ui registry = {TOOL_UI_REGISTRY_URL}")
        else:
            print("WARN: @tool-ui registry missing or different")
            print(f"      expected: {TOOL_UI_REGISTRY_URL}")
            print(f"      current:  {current}")
            if apply_fix:
                registries["@tool-ui"] = TOOL_UI_REGISTRY_URL
                changed = True

    if apply_fix and changed:
        components_json_path.write_text(json.dumps(data, indent=2) + "\n")
        print(f"FIXED: updated {components_json_path}")

    if not apply_fix:
        print("\nRun with --fix to auto-add/update @tool-ui registry entry.")

    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Tool UI compatibility checker")
    parser.add_argument("--project", default=".", help="Project root path (default: current directory)")
    parser.add_argument("--fix", action="store_true", help="Apply safe fixes to components.json")
    args = parser.parse_args()

    project_root = Path(args.project).resolve()
    exit_code = check_components_json(project_root, args.fix)
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
