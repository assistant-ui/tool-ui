import { mapToolUiPresetsToCompositor } from "../../../sandbox/weather-tuning/lib/tool-ui-import";
import { readToolUiTunedPresetsFromDisk } from "../_lib/tuned-presets-io";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Disabled in production.", { status: 403 });
  }

  try {
    const presets = await readToolUiTunedPresetsFromDisk();
    const checkpointOverrides = mapToolUiPresetsToCompositor(presets);
    return Response.json({ ok: true, checkpointOverrides });
  } catch (error) {
    console.error("Failed to recover tuning from repo presets.", error);
    return new Response("Failed to recover tuning from repo presets.", {
      status: 500,
    });
  }
}
