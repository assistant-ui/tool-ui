"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ComponentPreviewShell } from "../component-preview-shell";
import { ChatContextPreview } from "../chat-context-preview";
import { XPost } from "@/components/tool-ui/x-post";
import { InstagramPost } from "@/components/tool-ui/instagram-post";
import { LinkedInPost } from "@/components/tool-ui/linkedin-post";
import { ToolUI, type Action } from "@/components/tool-ui/shared";
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

function resolveActions(actions: unknown): Action[] | null {
  if (Array.isArray(actions)) return actions as Action[];

  if (typeof actions === "object" && actions !== null) {
    const items = (actions as { items?: unknown }).items;
    if (Array.isArray(items)) return items as Action[];
  }

  return null;
}

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

function getPresetNames(platform: Platform): PresetName[] {
  return [...platformConfig[platform].presetNames] as PresetName[];
}

function getValidPreset(platform: Platform, preset: string | null): PresetName {
  const presetNames = getPresetNames(platform);
  if (preset && (presetNames as readonly string[]).includes(preset)) {
    return preset as PresetName;
  }
  return presetNames[0];
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
        <TabsList className="w-full bg-primary/5">
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
  const presetNames = getPresetNames(platform);

  return (
    <ItemGroup className="gap-1">
      {presetNames.map((preset) => (
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
              className="bg-foreground absolute top-2.5 -left-4.5 h-5 w-1 origin-center -translate-y-1/2 scale-y-0 transform-gpu rounded-full opacity-0 transition-[opacity,transform] delay-100 duration-200 ease-out data-[selected=true]:scale-y-100 data-[selected=true]:opacity-100"
            />
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}

export function SocialPostPreview({
  platformLock,
}: {
  platformLock?: Platform;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lockedPlatform = platformLock;
  const isPlatformLocked = Boolean(lockedPlatform);

  const platformParam = searchParams.get("platform");
  const presetParam = searchParams.get("preset");

  const initialPlatform = useMemo((): Platform => {
    if (lockedPlatform) return lockedPlatform;
    if (platformParam && VALID_PLATFORMS.includes(platformParam as Platform)) {
      return platformParam as Platform;
    }
    return "x";
  }, [lockedPlatform, platformParam]);

  const initialPreset = useMemo(
    () => getValidPreset(initialPlatform, presetParam),
    [initialPlatform, presetParam],
  );

  const [currentPlatform, setCurrentPlatform] =
    useState<Platform>(initialPlatform);
  const [currentPreset, setCurrentPreset] = useState<PresetName>(initialPreset);

  const [prevPlatformParam, setPrevPlatformParam] = useState(platformParam);
  const [prevPresetParam, setPrevPresetParam] = useState(presetParam);
  const [prevLockedPlatform, setPrevLockedPlatform] = useState(lockedPlatform);

  if (
    platformParam !== prevPlatformParam ||
    presetParam !== prevPresetParam ||
    lockedPlatform !== prevLockedPlatform
  ) {
    setPrevPlatformParam(platformParam);
    setPrevPresetParam(presetParam);
    setPrevLockedPlatform(lockedPlatform);

    const nextPlatform = lockedPlatform
      ? lockedPlatform
      : platformParam && VALID_PLATFORMS.includes(platformParam as Platform)
        ? (platformParam as Platform)
        : currentPlatform;

    setCurrentPlatform(nextPlatform);
    setCurrentPreset(getValidPreset(nextPlatform, presetParam));
  }

  const updateUrl = useCallback(
    (platform: Platform, preset: PresetName) => {
      const params = new URLSearchParams(searchParams.toString());

      if (isPlatformLocked) {
        params.delete("platform");
      } else {
        params.set("platform", platform);
      }
      params.set("preset", preset);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [isPlatformLocked, pathname, router, searchParams],
  );

  const handleSelectPlatform = useCallback(
    (platform: Platform) => {
      if (isPlatformLocked) return;
      const defaultPreset = platformConfig[platform].presetNames[0];
      setCurrentPlatform(platform);
      setCurrentPreset(defaultPreset);
      updateUrl(platform, defaultPreset);
    },
    [isPlatformLocked, updateUrl],
  );

  const handleSelectPreset = useCallback(
    (preset: PresetName) => {
      setCurrentPreset(preset);
      updateUrl(currentPlatform, preset);
    },
    [currentPlatform, updateUrl],
  );

  const effectivePreset = currentPreset as
    | XPostPresetName
    | InstagramPostPresetName
    | LinkedInPostPresetName;

  const renderWithLocalActions = (
    id: string,
    surface: ReactNode,
    actions: Action[] | null,
  ) => {
    if (!actions || actions.length === 0) {
      return <div className="flex flex-col gap-3">{surface}</div>;
    }

    return (
      <ToolUI id={id}>
        <div className="flex flex-col gap-3">
          <ToolUI.Surface>{surface}</ToolUI.Surface>
          <ToolUI.Actions>
            <ToolUI.LocalActions
              actions={actions}
              onAction={(actionId) => alert(`Local action: ${actionId}`)}
            />
          </ToolUI.Actions>
        </div>
      </ToolUI>
    );
  };

  const renderedPost =
    currentPlatform === "x"
      ? renderWithLocalActions(
          xPostPresets[effectivePreset as XPostPresetName].data.post.id,
          <XPost
            post={xPostPresets[effectivePreset as XPostPresetName].data.post}
            onAction={(action, post) =>
              console.log("X action:", action, post.id)
            }
          />,
          resolveActions(
            xPostPresets[effectivePreset as XPostPresetName].data.localActions,
          ),
        )
      : currentPlatform === "instagram"
        ? renderWithLocalActions(
            instagramPostPresets[effectivePreset as InstagramPostPresetName]
              .data.post.id,
            <InstagramPost
              post={
                instagramPostPresets[effectivePreset as InstagramPostPresetName]
                  .data.post
              }
              onAction={(action, post) =>
                console.log("Instagram action:", action, post.id)
              }
            />,
            resolveActions(
              instagramPostPresets[effectivePreset as InstagramPostPresetName]
                .data.localActions,
            ),
          )
        : renderWithLocalActions(
            linkedInPostPresets[effectivePreset as LinkedInPostPresetName].data
              .post.id,
            <LinkedInPost
              post={
                linkedInPostPresets[effectivePreset as LinkedInPostPresetName]
                  .data.post
              }
              onAction={(action, post) =>
                console.log("LinkedIn action:", action, post.id)
              }
            />,
            resolveActions(
              linkedInPostPresets[effectivePreset as LinkedInPostPresetName]
                .data.localActions,
            ),
          );

  const previewContent = (
    <div className="mx-auto w-full max-w-[500px]">{renderedPost}</div>
  );

  const chatPanel = (
    <ChatContextPreview
      userMessage="What are the trending posts about AI on social media right now?"
      preamble="Here's a popular post I found:"
    >
      {previewContent}
    </ChatContextPreview>
  );

  return (
    <ComponentPreviewShell
      componentId={`${currentPlatform}-post`}
      sidebar={
        <>
          {!isPlatformLocked && (
            <PlatformSelector
              currentPlatform={currentPlatform}
              onSelectPlatform={handleSelectPlatform}
            />
          )}
          <PresetSelector
            platform={currentPlatform}
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
          />
        </>
      }
      preview={previewContent}
      chatPanel={chatPanel}
      codePanel={
        <div className="text-muted-foreground flex h-full items-center justify-center">
          Code panel coming soon
        </div>
      }
      code=""
    />
  );
}
