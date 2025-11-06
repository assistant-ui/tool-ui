"use client";

import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { ArrowUpIcon, Square, Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, type FC } from "react";

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mx-auto grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 [&:where(>*)]:col-start-2">
      <div className="relative col-start-2 min-w-0">
        <div className="rounded-3xl bg-muted px-5 py-2.5 break-words text-foreground">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative mx-auto w-full max-w-2xl py-4">
      <div className="mx-2 leading-7 break-words text-foreground">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => <div className="mb-3 text-base">{text}</div>,
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
};

interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

const MCPModal: FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const [mcpUrl, setMcpUrl] = useState("");
  const [transportType, setTransportType] = useState<"http" | "sse">("http");
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect transport type based on URL
  useEffect(() => {
    if (mcpUrl.toLowerCase().endsWith("/sse")) {
      setTransportType("sse");
    } else {
      setTransportType("http");
    }
  }, [mcpUrl]);

  const loadTools = async () => {
    if (!mcpUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mcp-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverUrl: mcpUrl,
          transportType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tools");
      }

      setTools(data.tools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateUI = (tool: MCPTool) => {
    // TODO: Implement UI generation
    console.log("Generate UI for tool:", tool);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import MCP Tool</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <InputGroup className="flex-1">
            <InputGroupInput
              placeholder="Enter MCP server URL..."
              value={mcpUrl}
              onChange={(e) => setMcpUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadTools();
                }
              }}
            />
            <InputGroupAddon align="inline-end" className="pr-1">
              <Select value={transportType} onValueChange={(value: "http" | "sse") => setTransportType(value)}>
                <SelectTrigger className="h-6 w-[55px] border-0 text-[11px] px-2 gap-1 shadow-none focus:ring-0 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="sse">SSE</SelectItem>
                </SelectContent>
              </Select>
            </InputGroupAddon>
          </InputGroup>
          <Button onClick={loadTools} disabled={loading || !mcpUrl.trim()}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Loading
              </>
            ) : (
              "Load"
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto border rounded-md">
          {tools.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              {loading ? "Loading tools..." : "No tools loaded"}
            </div>
          ) : (
            <div className="divide-y">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="font-medium text-sm">{tool.name}</div>
                    {tool.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {tool.description}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateUI(tool)}
                    className="shrink-0"
                  >
                    Generate UI
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Composer: FC = () => {
  const [mcpModalOpen, setMcpModalOpen] = useState(false);

  return (
    <>
      <MCPModal open={mcpModalOpen} onOpenChange={setMcpModalOpen} />
      <div className="sticky bottom-0 mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4 md:pb-6">
        <ComposerPrimitive.Root className="group/input-group relative flex w-full flex-col rounded-3xl border border-input bg-background px-1 pt-2 shadow-xs transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-[3px] has-[textarea:focus-visible]:ring-ring/50">
          <ComposerPrimitive.Input
            placeholder="Describe the component you want to build..."
            className="mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0"
            rows={1}
            autoFocus
          />
          <div className="relative mx-1 mt-2 mb-2 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-[34px] rounded-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setMcpModalOpen(true)}
            >
              <Wrench className="size-3.5" />
              <span>MCP</span>
            </Button>
            <div className="flex items-center justify-end">
              <ThreadPrimitive.If running={false}>
                <ComposerPrimitive.Send asChild>
                  <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    className="size-[34px] rounded-full p-1"
                  >
                    <ArrowUpIcon className="size-5" />
                  </Button>
                </ComposerPrimitive.Send>
              </ThreadPrimitive.If>

              <ThreadPrimitive.If running>
                <ComposerPrimitive.Cancel asChild>
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    className="size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
                  >
                    <Square className="size-3.5 fill-white dark:fill-black" />
                  </Button>
                </ComposerPrimitive.Cancel>
              </ThreadPrimitive.If>
            </div>
          </div>
        </ComposerPrimitive.Root>
      </div>
    </>
  );
};

const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full w-full flex-col bg-background">
      <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-y-auto px-4">
        <ThreadPrimitive.If empty>
          <div className="flex flex-1 items-center justify-center">
            <Composer />
          </div>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If empty={false}>
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage,
            }}
          />
          <div className="min-h-8 grow" />
          <Composer />
        </ThreadPrimitive.If>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

export default function BuilderPage() {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
