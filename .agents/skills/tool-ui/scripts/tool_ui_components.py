#!/usr/bin/env python3
"""Discover Tool UI components and generate install/docs commands."""

from __future__ import annotations

import argparse
import re
import signal
from dataclasses import dataclass

REGISTRY_BASE = "https://tool-ui.com/r"
DOCS_BASE = "https://tool-ui.com/docs"


@dataclass(frozen=True)
class Component:
    id: str
    label: str
    category: str
    description: str


COMPONENTS = [
    Component("approval-card", "Approval Card", "confirmation", "Binary confirmation for agent actions"),
    Component("chart", "Chart", "artifacts", "Visualize data with interactive charts"),
    Component("citation", "Citation", "display", "Display source references with attribution"),
    Component("code-block", "Code Block", "artifacts", "Display syntax-highlighted code snippets"),
    Component("data-table", "Data Table", "artifacts", "Present structured data in sortable tables"),
    Component("image", "Image", "media", "Display images with metadata and attribution"),
    Component("image-gallery", "Image Gallery", "media", "Masonry grid with fullscreen lightbox viewer"),
    Component("video", "Video", "media", "Video playback with controls and poster"),
    Component("audio", "Audio", "media", "Audio playback with artwork and metadata"),
    Component("link-preview", "Link Preview", "display", "Rich link previews with OG data"),
    Component("message-draft", "Message Draft", "artifacts", "Review and approve messages before sending"),
    Component("option-list", "Option List", "input", "Let users select from multiple choices"),
    Component("order-summary", "Order Summary", "confirmation", "Display purchases with itemized pricing"),
    Component("parameter-slider", "Parameter Slider", "input", "Numeric parameter adjustment controls"),
    Component("plan", "Plan", "progress", "Display step-by-step task workflows"),
    Component("preferences-panel", "Preferences Panel", "input", "Compact settings panel for user preferences"),
    Component("progress-tracker", "Progress Tracker", "progress", "Real-time status feedback for multi-step operations"),
    Component("item-carousel", "Item Carousel", "display", "Horizontal carousel for browsing collections"),
    Component("instagram-post", "Instagram Post", "artifacts", "Render Instagram post previews"),
    Component("linkedin-post", "LinkedIn Post", "artifacts", "Render LinkedIn post previews"),
    Component("x-post", "X Post", "artifacts", "Render X post previews"),
    Component("stats-display", "Stats Display", "display", "Display key metrics in a grid"),
    Component("terminal", "Terminal", "display", "Show command-line output and logs"),
    Component("question-flow", "Question Flow", "input", "Multi-step guided questions with branching"),
    Component("weather-widget", "Weather Widget", "display", "Display weather conditions and forecasts"),
]

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
        score = sum(1 for t in tokens if t in hay_tokens)
        if score > 0:
            scored.append((score, comp))

    scored.sort(key=lambda item: (-item[0], item[1].id))
    return [comp for _, comp in scored]


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


def install_command(component_ids: list[str]) -> None:
    normalized = []
    unknown = []

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

    unique_ids = list(dict.fromkeys(normalized))
    urls = [f"{REGISTRY_BASE}/{cid}.json" for cid in unique_ids]
    print("npx shadcn@latest add " + " ".join(urls))


def docs_command(component_ids: list[str]) -> None:
    for cid in component_ids:
        key = cid.strip().lower()
        if key not in BY_ID:
            print(f"Unknown component ID: {cid}")
            raise SystemExit(1)
        print(f"{DOCS_BASE}/{key}")


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

    args = parser.parse_args()

    if args.command == "list":
        list_components()
    elif args.command == "find":
        find_components(args.query)
    elif args.command == "install":
        install_command(args.component_ids)
    elif args.command == "docs":
        docs_command(args.component_ids)


if __name__ == "__main__":
    main()
