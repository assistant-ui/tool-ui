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

# Components that keep dedicated action props (action-centric exceptions).
ACTION_CENTRIC_COMPONENTS = {"option-list", "parameter-slider", "preferences-panel"}


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


def render_backend(component_id: str, tool_name: str, component_symbol: str, *, with_actions: bool) -> str:
    parser_name = parser_symbol(component_id, component_symbol)

    if not with_actions:
        return f'''import {{ type Toolkit }} from "@assistant-ui/react";
import {{ {component_symbol} }} from "@/components/tool-ui/{component_id}";
import {{ {parser_name} }} from "@/components/tool-ui/{component_id}/schema";
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

    return f'''import {{ type Toolkit }} from "@assistant-ui/react";
import {{ {component_symbol} }} from "@/components/tool-ui/{component_id}";
import {{ {parser_name} }} from "@/components/tool-ui/{component_id}/schema";
import {{ ToolUI, createResultToolRenderer, type Action }} from "@/components/tool-ui/shared";

const localActions: Action[] = [
  {{ id: "export", label: "Export", variant: "secondary" }},
];

export const toolkit: Toolkit = {{
  {tool_name}: {{
    type: "backend",
    render: createResultToolRenderer({{
      safeParse: {parser_name},
      render: (parsedResult) => (
        <ToolUI id={{parsedResult.id}}>
          <ToolUI.Surface>
            <{component_symbol} {{...parsedResult}} />
          </ToolUI.Surface>
          <ToolUI.Actions>
            <ToolUI.LocalActions
              actions={{localActions}}
              onAction={{(actionId) => console.log("Action:", actionId)}}
            />
          </ToolUI.Actions>
        </ToolUI>
      ),
    }}),
  }},
}};
'''


def render_frontend(component_id: str, tool_name: str, component_symbol: str) -> str:
    parser_name = parser_symbol(component_id, component_symbol)
    schema_name = schema_symbol(component_id, component_symbol)

    # Action-centric components wire actions directly, no ToolUI wrapper.
    if component_id in ACTION_CENTRIC_COMPONENTS:
        return f'''import {{ type Toolkit }} from "@assistant-ui/react";
import {{ {component_symbol} }} from "@/components/tool-ui/{component_id}";
import {{ {schema_name}, {parser_name} }} from "@/components/tool-ui/{component_id}/schema";
import {{ createArgsToolRenderer }} from "@/components/tool-ui/shared";

export const toolkit: Toolkit = {{
  {tool_name}: {{
    description: "Describe when the model should call this tool.",
    parameters: {schema_name},
    render: createArgsToolRenderer({{
      safeParse: {parser_name},
      idPrefix: "{component_id}",
      render: (parsedArgs, {{ result, addResult }}) => {{
        if (result) {{
          return <{component_symbol} {{...parsedArgs}} choice={{result}} />;
        }}

        return (
          <{component_symbol}
            {{...parsedArgs}}
            onAction={{(actionId, state) => {{
              if (actionId === "confirm") addResult?.(state);
            }}}}
          />
        );
      }},
    }}),
  }},
}};
'''

    # Standard components use ToolUI compound with DecisionActions.
    return f'''import {{ type Toolkit }} from "@assistant-ui/react";
import {{ {component_symbol} }} from "@/components/tool-ui/{component_id}";
import {{ {schema_name}, {parser_name} }} from "@/components/tool-ui/{component_id}/schema";
import {{
  ToolUI,
  createDecisionResult,
  createArgsToolRenderer,
}} from "@/components/tool-ui/shared";

export const toolkit: Toolkit = {{
  {tool_name}: {{
    description: "Describe when the model should call this tool.",
    parameters: {schema_name},
    render: createArgsToolRenderer({{
      safeParse: {parser_name},
      idPrefix: "{component_id}",
      render: (parsedArgs, {{ result, addResult }}) => {{
        if (result) {{
          return <{component_symbol} {{...parsedArgs}} choice={{result}} />;
        }}

        return (
          <ToolUI id={{parsedArgs.id}}>
            <ToolUI.Surface>
              <{component_symbol} {{...parsedArgs}} />
            </ToolUI.Surface>
            <ToolUI.Actions>
              <ToolUI.DecisionActions
                actions={{[
                  {{ id: "cancel", label: "Cancel", variant: "outline" }},
                  {{ id: "confirm", label: "Confirm" }},
                ]}}
                onAction={{(action) =>
                  createDecisionResult({{
                    decisionId: parsedArgs.id,
                    action,
                  }})
                }}
                onCommit={{(decision) => addResult?.(decision)}}
              />
            </ToolUI.Actions>
          </ToolUI>
        );
      }},
    }}),
  }},
}};
'''


def render_manual(component_id: str, tool_name: str, component_symbol: str) -> str:
    parser_name = parser_symbol(component_id, component_symbol)
    return f'''import {{ {component_symbol} }} from "@/components/tool-ui/{component_id}";
import {{ {parser_name} }} from "@/components/tool-ui/{component_id}/schema";

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
    parser.add_argument(
        "--with-actions",
        action="store_true",
        help="Include ToolUI compound wrapper with LocalActions (backend mode only)",
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
        print(render_backend(component_id, tool_name, component_symbol, with_actions=args.with_actions))
    elif args.mode == "assistant-frontend":
        print(render_frontend(component_id, tool_name, component_symbol))
    else:
        print(render_manual(component_id, tool_name, component_symbol))


if __name__ == "__main__":
    main()
