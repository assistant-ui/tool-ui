import { notFound } from "next/navigation";
import { getComponentById } from "@/lib/docs/component-registry";
import { DataTablePreview } from "./previews/data-table-preview";
import { SocialPostPreview } from "./previews/social-post-preview";
import { MediaCardPreview } from "./previews/media-card-preview";
import { OptionListPreview } from "./previews/option-list-preview";
import { WeatherWidgetPreview } from "./previews/weather-widget-preview";

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const resolved = getComponentById(component);

  if (!resolved) {
    notFound();
  }

  switch (component) {
    case "data-table":
      return <DataTablePreview />;
    case "social-post":
      return <SocialPostPreview />;
    case "media-card":
      return <MediaCardPreview />;
    case "option-list":
      return <OptionListPreview />;
    case "weather-widget":
      return <WeatherWidgetPreview />;
    default:
      notFound();
  }
}
