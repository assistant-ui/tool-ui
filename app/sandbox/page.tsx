import Link from "next/link";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Layers,
  SlidersHorizontal,
  ThermometerSun,
  Palette,
} from "lucide-react";

const sandboxes = [
  {
    href: "/sandbox/weather-tuning",
    title: "Weather Tuning Studio",
    description: "Systematic condition tuning with checkpoints and sign-off workflow",
    icon: Palette,
    featured: true,
  },
  {
    href: "/sandbox/weather-compositor",
    title: "Weather Compositor",
    description: "Full tuning tool with condition presets and export/import",
    icon: SlidersHorizontal,
    featured: true,
  },
  {
    href: "/sandbox/weather-effects",
    title: "Weather Effects Canvas",
    description: "Unified WebGL canvas with all effect layers",
    icon: Layers,
    featured: true,
  },
  {
    href: "/sandbox/weather-widget",
    title: "Weather Widget",
    description: "Complete widget component preview",
    icon: ThermometerSun,
  },
  {
    href: "/sandbox/celestial-effect",
    title: "Celestial Effect",
    description: "Sun, moon, stars, and sky gradients",
    icon: Sun,
  },
  {
    href: "/sandbox/cloud-effect",
    title: "Cloud Effect",
    description: "Volumetric clouds with lighting and wind",
    icon: Cloud,
  },
  {
    href: "/sandbox/rain-effect",
    title: "Rain Effect",
    description: "Glass drops and falling rain with refraction",
    icon: CloudRain,
  },
  {
    href: "/sandbox/lightning-effect",
    title: "Lightning Effect",
    description: "Procedural lightning bolts with branching",
    icon: CloudLightning,
  },
  {
    href: "/sandbox/snow-effect",
    title: "Snow Effect",
    description: "Layered snowflakes with wind and sparkle",
    icon: Snowflake,
  },
];

export default function SandboxIndex() {
  const featured = sandboxes.filter((s) => s.featured);
  const effects = sandboxes.filter((s) => !s.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-white">
          Weather Effects Sandbox
        </h1>
        <p className="mb-8 text-zinc-400">
          Development tools for tuning and testing weather effects
        </p>

        <section className="mb-8">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Compositors
          </h2>
          <div className="grid gap-3">
            {featured.map((sandbox) => (
              <Link
                key={sandbox.href}
                href={sandbox.href}
                className="group flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/20">
                  <sandbox.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium text-white">{sandbox.title}</h3>
                  <p className="text-sm text-zinc-400">{sandbox.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Individual Effects
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {effects.map((sandbox) => (
              <Link
                key={sandbox.href}
                href={sandbox.href}
                className="group flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
              >
                <div className="flex size-9 items-center justify-center rounded-md bg-zinc-800 text-zinc-400 transition-colors group-hover:bg-zinc-700 group-hover:text-zinc-300">
                  <sandbox.icon className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {sandbox.title}
                  </h3>
                  <p className="text-xs text-zinc-500">{sandbox.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
