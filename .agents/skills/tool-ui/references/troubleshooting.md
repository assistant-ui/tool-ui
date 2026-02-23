# Troubleshooting Matrix

Use this matrix when Tool UI installation or rendering fails.

| Symptom                                                                  | Likely Cause                                          | Fix                                                                                                                     |
| ------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npx shadcn add https://tool-ui.com/r/<component>.json` fails            | Missing or invalid `components.json`                  | Run `python scripts/tool_ui_compat.py --project <repo-root> --fix`                                                      |
| Installed component imports fail (`@/components/tool-ui/shared` missing) | Partial copy, stale install, or manual move           | Re-run install command for the component and confirm `components/tool-ui/shared` exists                                 |
| Tool UI component renders nothing                                        | Safe parser returned `null` due to payload mismatch   | Validate backend payload against component schema, log raw payload, and compare field names/types                       |
| TypeScript error: cannot find module `@/components/tool-ui/<x>`          | Alias config mismatch or missing files                | Ensure `components.json.aliases.components` points to `@/components`; run doctor checks                                 |
| Tool call appears but no UI renders                                      | Tool not registered in runtime toolkit                | Register tool key in runtime and ensure tool name matches backend tool call                                             |
| assistant-ui imports present but package missing                         | Dependency drift                                      | Install missing packages (`@assistant-ui/react` and/or `@assistant-ui/react-ai-sdk`)                                    |
| Frontend interactive tool does not continue conversation                 | `addResult(...)` never called                         | Wire `DecisionActions` with `onCommit` that calls `addResult(...)`, or wire action-centric component's confirm callback |
| Styling looks broken after install                                       | Tailwind CSS path missing or not loaded               | Verify `components.json.tailwind.css` exists and is imported by app entry                                               |
| Lint error: `responseActions` / `onResponseAction` is deprecated         | Legacy embedded action props still in code            | Replace with sibling `ToolUI.LocalActions` or `ToolUI.DecisionActions` surfaces                                         |
| Lint error: `addResult()` in LocalActions handler                        | Side-effect handler calling commit                    | Move to `DecisionActions` with `createDecisionResult(...)` envelope, or remove `addResult()`                            |
| Lint error: DecisionActions missing `createDecisionResult`               | `onAction` handler does not return envelope           | Wrap return value in `createDecisionResult({ decisionId, action })`                                                     |
| LocalActions or DecisionActions render nothing                           | Missing `ToolUI` provider or `ToolUI.Surface` sibling | Wrap in `<ToolUI id={...}><ToolUI.Surface>...</ToolUI.Surface><ToolUI.Actions>...</ToolUI.Actions></ToolUI>`            |
| Error: requires a ToolUI provider or an explicit id prop                 | Action surface used outside `<ToolUI>` without `id`   | Either wrap in a `<ToolUI id={...}>` compound, or pass `id` prop directly                                               |

## Fast Triage Commands

```bash
python scripts/tool_ui_compat.py --project <repo-root> --doctor
python scripts/tool_ui_components.py install <component-id>
python scripts/tool_ui_scaffold.py --mode assistant-backend --component <component-id>
```
