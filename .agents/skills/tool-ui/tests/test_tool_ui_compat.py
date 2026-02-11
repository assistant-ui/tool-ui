import json
import subprocess
import tempfile
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = SKILL_ROOT / "scripts" / "tool_ui_compat.py"


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2) + "\n")


class ToolUiCompatScriptTests(unittest.TestCase):
    def run_script(self, project_dir: Path, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(SCRIPT), "--project", str(project_dir), *args],
            cwd=SKILL_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_basic_pass(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "app" / "styles").mkdir(parents=True)
            (root / "app" / "styles" / "globals.css").write_text("/* ok */\n")
            write_json(
                root / "components.json",
                {
                    "aliases": {"utils": "@/lib/utils", "components": "@/components"},
                    "registries": {"@tool-ui": "https://tool-ui.com/r/{name}.json"},
                    "tailwind": {"css": "app/styles/globals.css"},
                },
            )

            result = self.run_script(root)
            self.assertEqual(result.returncode, 0)
            self.assertIn("PASS: aliases.utils", result.stdout)

    def test_fix_adds_registry(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "app" / "styles").mkdir(parents=True)
            (root / "app" / "styles" / "globals.css").write_text("/* ok */\n")
            components_json = root / "components.json"
            write_json(
                components_json,
                {
                    "aliases": {"utils": "@/lib/utils", "components": "@/components"},
                    "registries": {},
                    "tailwind": {"css": "app/styles/globals.css"},
                },
            )

            result = self.run_script(root, "--fix")
            self.assertEqual(result.returncode, 0)

            updated = json.loads(components_json.read_text())
            self.assertEqual(
                updated["registries"].get("@tool-ui"),
                "https://tool-ui.com/r/{name}.json",
            )

    def test_doctor_detects_missing_tool_ui_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "app" / "styles").mkdir(parents=True)
            (root / "app" / "styles" / "globals.css").write_text("/* ok */\n")
            (root / "src").mkdir(parents=True)
            (root / "src" / "page.tsx").write_text(
                'import { Plan } from "@/components/tool-ui/plan";\n'
            )
            (root / "components" / "tool-ui").mkdir(parents=True)

            write_json(
                root / "components.json",
                {
                    "aliases": {"utils": "@/lib/utils", "components": "@/components"},
                    "registries": {"@tool-ui": "https://tool-ui.com/r/{name}.json"},
                    "tailwind": {"css": "app/styles/globals.css"},
                },
            )

            result = self.run_script(root, "--doctor")
            self.assertNotEqual(result.returncode, 0)
            self.assertTrue(
                "components/tool-ui/shared" in result.stdout
                or "missing module paths for Tool UI imports" in result.stdout
            )

    def test_doctor_handles_assistant_import_scan(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "app" / "styles").mkdir(parents=True)
            (root / "app" / "styles" / "globals.css").write_text("/* ok */\n")
            (root / "src").mkdir(parents=True)
            (root / "src" / "runtime.ts").write_text(
                'import { Toolkit } from "@assistant-ui/react";\n'
            )
            write_json(
                root / "components.json",
                {
                    "aliases": {"utils": "@/lib/utils", "components": "@/components"},
                    "registries": {"@tool-ui": "https://tool-ui.com/r/{name}.json"},
                    "tailwind": {"css": "app/styles/globals.css"},
                },
            )
            write_json(
                root / "package.json",
                {
                    "dependencies": {"@assistant-ui/react": "^0.0.0"},
                },
            )

            result = self.run_script(root, "--doctor")
            self.assertEqual(result.returncode, 0)
            self.assertIn("@assistant-ui/react package installed", result.stdout)


if __name__ == "__main__":
    unittest.main()
