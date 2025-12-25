"use client";

import { useCallback, useMemo } from "react";
import {
  AssistantRuntimeProvider,
  AssistantModalPrimitive,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useShallow } from "zustand/react/shallow";
import { useWorkbenchStore, useIsSDKGuideOpen } from "@/app/workbench/lib/store";
import { SDKGuideThread } from "./sdk-guide-thread";

function SDKGuideRuntimeProvider({ children }: { children: React.ReactNode }) {
  const {
    selectedComponent,
    displayMode,
    toolInput,
    toolOutput,
    widgetState,
    consoleLogs,
  } = useWorkbenchStore(
    useShallow((s) => ({
      selectedComponent: s.selectedComponent,
      displayMode: s.displayMode,
      toolInput: s.toolInput,
      toolOutput: s.toolOutput,
      widgetState: s.widgetState,
      consoleLogs: s.consoleLogs,
    }))
  );

  const workbenchContext = useMemo(
    () => ({
      selectedComponent,
      displayMode,
      toolInput,
      toolOutput,
      widgetState,
      recentConsoleLogs: consoleLogs.slice(-10),
    }),
    [selectedComponent, displayMode, toolInput, toolOutput, widgetState, consoleLogs]
  );

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/sdk-guide",
        body: () => ({
          workbenchContext,
        }),
      }),
    [workbenchContext]
  );

  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}

export function SDKGuideModal() {
  const isOpen = useIsSDKGuideOpen();
  const setSDKGuideOpen = useWorkbenchStore((s) => s.setSDKGuideOpen);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setSDKGuideOpen(open);
    },
    [setSDKGuideOpen]
  );

  return (
    <SDKGuideRuntimeProvider>
      <AssistantModalPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
        <AssistantModalPrimitive.Anchor className="fixed right-4 bottom-4 size-0" />
        <AssistantModalPrimitive.Content
          side="top"
          align="end"
          sideOffset={16}
          className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 z-50 flex h-[calc(100vh-6rem)] w-[420px] max-w-[calc(100vw-2rem)] flex-col overflow-clip rounded-xl border bg-popover text-popover-foreground shadow-lg outline-none data-[state=closed]:animate-out data-[state=open]:animate-in [&>.aui-thread-root]:bg-inherit"
        >
          <SDKGuideThread />
        </AssistantModalPrimitive.Content>
      </AssistantModalPrimitive.Root>
    </SDKGuideRuntimeProvider>
  );
}
