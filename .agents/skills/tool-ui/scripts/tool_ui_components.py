#!/usr/bin/env python3
"""Discover Tool UI components and generate install/docs commands."""

from __future__ import annotations

import argparse
import json
import re
import signal
from dataclasses import dataclass
from pathlib import Path

REGISTRY_BASE = "https://tool-ui.com/r"
DOCS_BASE = "https://tool-ui.com/docs"

BUNDLES: dict[str, list[str]] = {
    "planning-flow": ["plan", "progress-tracker", "approval-card"],
    "research-output": ["citation", "link-preview", "code-block"],
    "commerce-flow": ["item-carousel", "order-summary", "approval-card"],
}


@dataclass(frozen=True)
class Component:
    id: str
    label: str
    category: str
    description: str


def load_components() -> list[Component]:
    skill_root = Path(__file__).resolve().parents[1]
    data_path = skill_root / "references" / "components-data.json"
    if not data_path.exists():
        raise SystemExit(
            "Missing components-data.json. Run scripts/sync_components.py first."
        )

    raw = json.loads(data_path.read_text())
    components = [
        Component(
            id=item["id"],
            label=item["label"],
            category=item["category"],
            description=item["description"],
        )
        for item in raw
    ]

    return components


COMPONENTS = load_components()
BY_ID = {c.id: c for c in COMPONENTS}


def tokenize(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower()))


def search(query: str) -> list[Component]:
    tokens = tokenize(query)
    if not tokens:
        return COMPONENTS

    scored: list[tuple[int, Component]] = []
    for comp in COMPONENTS:
        haystack = " ".join([comp.id, comp.label, comp.category, comp.description]).lower()
        hay_tokens = tokenize(haystack)
        score = 0
        for token in tokens:
            if any(
                token == hay_token
                or hay_token.startswith(token)
                or token.startswith(hay_token)
                for hay_token in hay_tokens
            ):
                score += 1
        if score > 0:
            scored.append((score, comp))

    scored.sort(key=lambda item: (-item[0], item[1].id))
    return [comp for _, comp in scored]


def normalize_ids(component_ids: list[str]) -> list[str]:
    normalized: list[str] = []
    unknown: list[str] = []

    for cid in component_ids:
        key = cid.strip().lower()
        if key in BY_ID:
            normalized.append(key)
        else:
            unknown.append(cid)

    if unknown:
        print("Unknown component IDs:", ", ".join(unknown))
        print("Run `python scripts/tool_ui_components.py list` to see valid IDs.")
        raise SystemExit(1)

    return list(dict.fromkeys(normalized))


def print_install(component_ids: list[str]) -> None:
    ids = normalize_ids(component_ids)
    urls = [f"{REGISTRY_BASE}/{cid}.json" for cid in ids]
    print("npx shadcn@latest add " + " ".join(urls))


def list_components() -> None:
    for comp in sorted(COMPONENTS, key=lambda c: c.id):
        print(f"{comp.id:18} | {comp.category:12} | {comp.label}")


def find_components(query: str) -> None:
    matches = search(query)
    if not matches:
        print("No matching Tool UI components found.")
        return

    for comp in matches:
        print(f"{comp.id:18} | {comp.category:12} | {comp.label} | {comp.description}")


def docs_command(component_ids: list[str]) -> None:
    ids = normalize_ids(component_ids)
    for cid in ids:
        print(f"{DOCS_BASE}/{cid}")


def bundle_command(name: str | None) -> None:
    if name is None:
        for bundle_name in sorted(BUNDLES):
            members = ", ".join(BUNDLES[bundle_name])
            print(f"{bundle_name:16} | {members}")
        return

    bundle_key = name.strip().lower()
    if bundle_key not in BUNDLES:
        print(f"Unknown bundle: {name}")
        print("Run `python scripts/tool_ui_components.py bundle` to list bundles.")
        raise SystemExit(1)

    members = BUNDLES[bundle_key]
    print(f"Bundle: {bundle_key}")
    print("Components:", ", ".join(members))
    print_install(members)


def main() -> None:
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)

    parser = argparse.ArgumentParser(description="Tool UI component helper")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="List all Tool UI components")

    find_p = sub.add_parser("find", help="Find components by keywords")
    find_p.add_argument("query", help="Search query, e.g. 'progress steps' or 'media gallery'")

    install_p = sub.add_parser("install", help="Print shadcn install command for component IDs")
    install_p.add_argument("component_ids", nargs="+", help="One or more component IDs")

    docs_p = sub.add_parser("docs", help="Print docs URLs for component IDs")
    docs_p.add_argument("component_ids", nargs="+", help="One or more component IDs")

    bundle_p = sub.add_parser("bundle", help="List or print install command for bundle recipes")
    bundle_p.add_argument("name", nargs="?", help="Bundle name (omit to list available bundles)")

    args = parser.parse_args()

    if args.command == "list":
        list_components()
    elif args.command == "find":
        find_components(args.query)
    elif args.command == "install":
        print_install(args.component_ids)
    elif args.command == "docs":
        docs_command(args.component_ids)
    elif args.command == "bundle":
        bundle_command(args.name)


if __name__ == "__main__":
    main()
