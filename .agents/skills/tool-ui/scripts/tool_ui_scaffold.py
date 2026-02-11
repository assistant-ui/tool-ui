#!/usr/bin/env python3
"""Generate Tool UI runtime wiring snippets."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

SPECIAL_SYMBOLS = {
    "x-post": "XPost",
    "linkedin-post": "LinkedInPost",
}


def load_component_ids() -> set[str]:
    skill_root = Path(__file__).resolve().parents[1]
    data_path = skill_root / "references" / "components-data.json"
    if not data_path.exists():
        raise SystemExit(
            "Missing components-data.json. Run scripts/sync_components.py first."
        )

    data = json.loads(data_path.read_text())
    return {item["id"] for item in data}


def to_pascal(component_id: str) -> str:
    if component_id in SPECIAL_SYMBOLS:
        return SPECIAL_SYMBOLS[component_id]

    return "".join(part.capitalize() for part in component_id.split("-"))


def parser_symbol(component_id: str, component_symbol: str) -> str:
    if component_id == "weather-widget":
        return "safeParseWeatherWidgetPayload"
    return f"safeParseSerializable{component_symbol}"


def schema_symbol(component_id: str, component_symbol: str) -> str:
    if component_id == "weather-widget":
        return "WeatherWidgetPayloadSchema"
    return f"Serializable{component_symbol}Schema"


def render_backend(component_id: str, tool_name: str, component_symbol: str) -> str:
    parser_name = parser_symbol(component_id, component_symbol)
    return f'''import {{ type Toolkit }} from "@assistant-ui/react";
import {{ {component_symbol}, {parser_name} }} from "@/components/tool-ui/{component_id}";
import {{ createResultToolRenderer }} from "@/components/tool-ui/shared";

export const toolkit: Toolkit = {{
  {tool_name}: {{
    type: "backend",
    render: createResultToolRenderer({{
      safeParse: {parser_name},
      render: (parsedResult) => <{component_symbol} {{...parsedResult}} />,
    }}),
  }},
}};
'''


def render_frontend(component_id: str, tool_name: str, component_symbol: str) -> str:
    parser_name = parser_symbol(component_id, component_symbol)
    schema_name = schema_symbol(component_id, component_symbol)
    return f'''import {{ type Toolkit }} from "@assistant-ui/react";
import {{
  {component_symbol},
  {schema_name},
  {parser_name},
}} from "@/components/tool-ui/{component_id}";
import {{ createArgsToolRenderer }} from "@/components/tool-ui/shared";

export const toolkit: Toolkit = {{
  {tool_name}: {{
    description: "Describe when the model should call this tool.",
    parameters: {schema_name},
    render: createArgsToolRenderer({{
      safeParse: {parser_name},
      render: (parsedArgs, {{ result, addResult }}) => {{
        if (result) {{
          return <{component_symbol} {{...parsedArgs}} />;
        }}

        return (
          <{component_symbol}
            {{...parsedArgs}}
            // TODO: Wire a user-confirmation callback and call addResult(...)
          />
        );
      }},
    }}),
  }},
}};
'''


def render_manual(component_id: str, tool_name: str, component_symbol: str) -> str:
    parser_name = parser_symbol(component_id, component_symbol)
    return f'''import {{ {component_symbol}, {parser_name} }} from "@/components/tool-ui/{component_id}";

function ToolResultView({{ toolName, result }}: {{ toolName: string; result: unknown }}) {{
  if (toolName !== "{tool_name}") return null;

  const parsed = {parser_name}(result);
  if (!parsed) return null;

  return <{component_symbol} {{...parsed}} />;
}}
'''


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Tool UI wiring snippets")
    parser.add_argument(
        "--mode",
        required=True,
        choices=["assistant-backend", "assistant-frontend", "manual"],
        help="Snippet type to generate",
    )
    parser.add_argument("--component", required=True, help="Tool UI component id")
    parser.add_argument(
        "--tool-name",
        help="Tool name key used in your runtime (default: show<Component>)",
    )
    args = parser.parse_args()

    component_id = args.component.strip().lower()
    known_ids = load_component_ids()
    if component_id not in known_ids:
        print(f"Unknown component id: {component_id}")
        print("Use scripts/tool_ui_components.py list to see valid ids.")
        raise SystemExit(1)

    component_symbol = to_pascal(component_id)
    default_tool_name = f"show{component_symbol}"
    tool_name = args.tool_name or default_tool_name

    if args.mode == "assistant-backend":
        print(render_backend(component_id, tool_name, component_symbol))
    elif args.mode == "assistant-frontend":
        print(render_frontend(component_id, tool_name, component_symbol))
    else:
        print(render_manual(component_id, tool_name, component_symbol))


if __name__ == "__main__":
    main()
