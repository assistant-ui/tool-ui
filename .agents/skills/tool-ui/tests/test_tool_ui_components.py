import subprocess
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = SKILL_ROOT / "scripts" / "tool_ui_components.py"


class ToolUiComponentsScriptTests(unittest.TestCase):
    def run_script(self, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(SCRIPT), *args],
            cwd=SKILL_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_list_includes_plan(self):
        result = self.run_script("list")
        self.assertEqual(result.returncode, 0)
        self.assertIn("plan", result.stdout)

    def test_find_matches_weather(self):
        result = self.run_script("find", "weather forecast")
        self.assertEqual(result.returncode, 0)
        self.assertIn("weather-widget", result.stdout)

    def test_find_handles_prefix_and_stem_like_queries(self):
        result = self.run_script("find", "planning steps")
        self.assertEqual(result.returncode, 0)
        self.assertIn("plan", result.stdout)

    def test_install_command(self):
        result = self.run_script("install", "plan", "weather-widget")
        self.assertEqual(result.returncode, 0)
        self.assertIn("https://tool-ui.com/r/plan.json", result.stdout)
        self.assertIn("https://tool-ui.com/r/weather-widget.json", result.stdout)

    def test_bundle_command(self):
        result = self.run_script("bundle", "planning-flow")
        self.assertEqual(result.returncode, 0)
        self.assertIn("plan", result.stdout)
        self.assertIn("npx shadcn@latest add", result.stdout)

    def test_unknown_component_fails(self):
        result = self.run_script("install", "not-a-component")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unknown component IDs", result.stdout)


if __name__ == "__main__":
    unittest.main()
