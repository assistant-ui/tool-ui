"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { XPost } from "@/components/tool-ui/x-post";
import { InstagramPost } from "@/components/tool-ui/instagram-post";
import { LinkedInPost } from "@/components/tool-ui/linkedin-post";
import { xPostPresets, type XPostPresetName } from "@/lib/presets/x-post";
import {
  instagramPostPresets,
  type InstagramPostPresetName,
} from "@/lib/presets/instagram-post";
import {
  linkedInPostPresets,
  type LinkedInPostPresetName,
} from "@/lib/presets/linkedin-post";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/ui/cn";

type Platform = "x" | "instagram" | "linkedin";
type PresetName =
  | XPostPresetName
  | InstagramPostPresetName
  | LinkedInPostPresetName;

const VALID_PLATFORMS: readonly Platform[] = ["x", "instagram", "linkedin"];

const platformConfig = {
  x: {
    label: "X (Twitter)",
    presets: xPostPresets,
    presetNames: Object.keys(xPostPresets) as XPostPresetName[],
  },
  instagram: {
    label: "Instagram",
    presets: instagramPostPresets,
    presetNames: Object.keys(instagramPostPresets) as InstagramPostPresetName[],
  },
  linkedin: {
    label: "LinkedIn",
    presets: linkedInPostPresets,
    presetNames: Object.keys(linkedInPostPresets) as LinkedInPostPresetName[],
  },
} as const;

function getValidPreset(platform: Platform, preset: string | null): PresetName {
  const config = platformConfig[platform];
  const presetNames = config.presetNames as readonly string[];
  if (preset && presetNames.includes(preset)) {
    return preset as PresetName;
  }
  return config.presetNames[0];
}

function PlatformSelector({
  currentPlatform,
  onSelectPlatform,
}: {
  currentPlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
}) {
  return (
    <div className="mb-4">
      <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
        Platform
      </div>
      <Tabs
        value={currentPlatform}
        onValueChange={(value) => onSelectPlatform(value as Platform)}
      >
        <TabsList className="w-full bg-transparent">
          <TabsTrigger value="x" className="flex-1">
            X
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex-1">
            Instagram
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex-1">
            LinkedIn
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

function PresetSelector({
  platform,
  currentPreset,
  onSelectPreset,
}: {
  platform: Platform;
  currentPreset: PresetName;
  onSelectPreset: (preset: PresetName) => void;
}) {
  const config = platformConfig[platform];
  const presets = config.presets as Record<
    string,
    { description: string; data: unknown }
  >;

  return (
    <ItemGroup className="gap-1">
      {config.presetNames.map((preset) => (
        <Item
          key={preset}
          variant="default"
          size="sm"
          data-selected={currentPreset === preset}
          className={cn(
            "group/item relative py-[2px] lg:py-3!",
            currentPreset === preset
              ? "bg-muted cursor-pointer border-transparent shadow-xs"
              : "hover:bg-primary/5 active:bg-primary/10 cursor-pointer transition-[colors,shadow,border,background] duration-150 ease-out",
          )}
          onClick={() => onSelectPreset(preset as PresetName)}
        >
          <ItemContent className="transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.3,-0.55,0.27,1.55)] will-change-transform group-active/item:scale-[0.98] group-active/item:duration-100 group-active/item:ease-out">
            <div className="relative flex items-start justify-between">
              <div className="flex flex-1 flex-col gap-0 lg:gap-1">
                <ItemTitle className="flex w-full items-center justify-between capitalize">
                  <span className="text-foreground">
                    {preset.replace("-", " ").replace("_", " ")}
                  </span>
                </ItemTitle>
                <ItemDescription className="text-sm font-light">
                  {presets[preset].description}
                </ItemDescription>
              </div>
            </div>
            <span
              aria-hidden="true"
              data-selected={currentPreset === preset}
              className="bg-foreground absolute top-2.5 -left-4.5 h-0 w-1 -translate-y-1/2 transform-gpu rounded-full opacity-0 transition-[height,opacity,transform] delay-100 duration-200 ease-in-out data-[selected=true]:h-5 data-[selected=true]:opacity-100"
            />
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}

export function SocialPostPreview({
  withContainer = true,
}: {
  withContainer?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const platformParam = searchParams.get("platform");
  const presetParam = searchParams.get("preset");

  const initialPlatform = useMemo((): Platform => {
    if (platformParam && VALID_PLATFORMS.includes(platformParam as Platform)) {
      return platformParam as Platform;
    }
    return "x";
  }, [platformParam]);

  const initialPreset = useMemo(
    () => getValidPreset(initialPlatform, presetParam),
    [initialPlatform, presetParam],
  );

  const [currentPlatform, setCurrentPlatform] = useState<Platform>(initialPlatform);
  const [currentPreset, setCurrentPreset] = useState<PresetName>(initialPreset);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      platformParam &&
      VALID_PLATFORMS.includes(platformParam as Platform) &&
      platformParam !== currentPlatform
    ) {
      setCurrentPlatform(platformParam as Platform);
      setCurrentPreset(getValidPreset(platformParam as Platform, presetParam));
    } else if (presetParam && presetParam !== currentPreset) {
      const validPreset = getValidPreset(currentPlatform, presetParam);
      if (validPreset !== currentPreset) {
        setCurrentPreset(validPreset);
      }
    }
  }, [platformParam, presetParam, currentPlatform, currentPreset]);

  const updateUrl = useCallback(
    (platform: Platform, preset: PresetName) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("platform", platform);
      params.set("preset", preset);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleSelectPlatform = useCallback(
    (platform: Platform) => {
      const defaultPreset = platformConfig[platform].presetNames[0];
      setCurrentPlatform(platform);
      setCurrentPreset(defaultPreset);
      updateUrl(platform, defaultPreset);
    },
    [updateUrl],
  );

  const handleSelectPreset = useCallback(
    (preset: PresetName) => {
      setCurrentPreset(preset);
      updateUrl(currentPlatform, preset);
    },
    [currentPlatform, updateUrl],
  );

  return (
    <ComponentPreviewShell
      withContainer={withContainer}
      isLoading={isLoading}
      presetSelector={
        <>
          <PlatformSelector
            currentPlatform={currentPlatform}
            onSelectPlatform={handleSelectPlatform}
          />
          <PresetSelector
            platform={currentPlatform}
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
          />
        </>
      }
      renderPreview={() => (
        <div className="mx-auto w-full max-w-[500px]">
          {currentPlatform === "x" && (
            <XPost
              post={xPostPresets[currentPreset as XPostPresetName].data.post}
              responseActions={
                xPostPresets[currentPreset as XPostPresetName].data
                  .responseActions
              }
              onAction={(action, post) =>
                console.log("X action:", action, post.id)
              }
              onResponseAction={(id) => alert(`Response action: ${id}`)}
            />
          )}
          {currentPlatform === "instagram" && (
            <InstagramPost
              post={
                instagramPostPresets[currentPreset as InstagramPostPresetName]
                  .data.post
              }
              responseActions={
                instagramPostPresets[currentPreset as InstagramPostPresetName]
                  .data.responseActions
              }
              onAction={(action, post) =>
                console.log("Instagram action:", action, post.id)
              }
              onResponseAction={(id) => alert(`Response action: ${id}`)}
            />
          )}
          {currentPlatform === "linkedin" && (
            <LinkedInPost
              post={
                linkedInPostPresets[currentPreset as LinkedInPostPresetName]
                  .data.post
              }
              responseActions={
                linkedInPostPresets[currentPreset as LinkedInPostPresetName]
                  .data.responseActions
              }
              onAction={(action, post) =>
                console.log("LinkedIn action:", action, post.id)
              }
              onResponseAction={(id) => alert(`Response action: ${id}`)}
            />
          )}
        </div>
      )}
      renderCodePanel={() => (
        <div className="text-muted-foreground flex h-full items-center justify-center">
          Code panel coming soon
        </div>
      )}
    />
  );
}
