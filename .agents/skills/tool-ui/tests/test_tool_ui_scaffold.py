import subprocess
import unittest
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT = SKILL_ROOT / "scripts" / "tool_ui_scaffold.py"


class ToolUiScaffoldScriptTests(unittest.TestCase):
    def run_script(self, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", str(SCRIPT), *args],
            cwd=SKILL_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_backend_plan_scaffold(self):
        result = self.run_script("--mode", "assistant-backend", "--component", "plan")
        self.assertEqual(result.returncode, 0)
        self.assertIn("createResultToolRenderer", result.stdout)
        self.assertIn("safeParseSerializablePlan", result.stdout)

    def test_backend_weather_scaffold_uses_weather_parser(self):
        result = self.run_script(
            "--mode",
            "assistant-backend",
            "--component",
            "weather-widget",
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("safeParseWeatherWidgetPayload", result.stdout)

    def test_invalid_component_fails(self):
        result = self.run_script(
            "--mode",
            "assistant-backend",
            "--component",
            "nope",
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unknown component id", result.stdout)


if __name__ == "__main__":
    unittest.main()
