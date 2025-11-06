"use client";

import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  useAssistantApi,
  useAssistantState,
  makeAssistantToolUI,
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ErrorPrimitive,
  makeAssistantTool,
} from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import WebView from "@/components/webview";
import {
  ArrowUpIcon,
  Square,
  Loader2,
  Eye,
  Code,
  Copy,
  Check,
  PencilIcon,
  RefreshCw,
  FileEdit,
  FileText,
  CopyIcon,
  CheckIcon,
  RefreshCwIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { MCPIcon } from "@/components/mcp-icon";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import { getComponentCode } from "@/lib/get-code";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useState, useEffect, type FC, createContext, useContext } from "react";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import React from "react";
import { cn } from "@/lib/utils";

// Context for refreshing the preview pane
const PreviewRefreshContext = createContext<(() => void) | null>(null);

const usePreviewRefresh = () => {
  const refresh = useContext(PreviewRefreshContext);
  return refresh;
};

// Module-level holder for the refresh function (accessible from streamCall)
let globalRefreshPreview: (() => void) | null = null;

const PreviewRefreshSetter: FC = () => {
  const refresh = usePreviewRefresh();
  useEffect(() => {
    globalRefreshPreview = refresh;
    return () => {
      globalRefreshPreview = null;
    };
  }, [refresh]);
  return null;
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="mx-auto grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 [&:where(>*)]:col-start-2">
      <div className="relative col-start-2 min-w-0">
        <div className="bg-muted text-foreground rounded-3xl px-5 py-2.5 break-words">
          <MessagePrimitive.Content components={{ Text: MarkdownText }} />
        </div>
        <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
          <UserActionBar />
        </div>
      </div>
      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative mx-auto w-full max-w-2xl py-4">
      <div className="text-foreground mx-2 leading-7 break-words">
        <MessagePrimitive.Content
          components={{ Text: MarkdownText, tools: { Fallback: ToolFallback } }}
        />
        <MessageError />
      </div>
      <div className="mt-2 ml-2 flex">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="border-destructive bg-destructive/10 text-destructive dark:bg-destructive/5 mt-2 rounded-md border p-3 text-sm dark:text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground data-floating:bg-background col-start-3 row-start-2 -ml-1 flex gap-1 data-floating:absolute data-floating:rounded-md data-floating:border data-floating:p-1 data-floating:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "text-muted-foreground mr-2 -ml-2 inline-flex items-center text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-2 first:mt-4">
      <ComposerPrimitive.Root className="bg-muted ml-auto flex w-full max-w-7/8 flex-col rounded-xl">
        <ComposerPrimitive.Input
          className="text-foreground flex min-h-[60px] w-full resize-none bg-transparent p-4 outline-none"
          autoFocus
        />

        <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm" aria-label="Cancel edit">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm" aria-label="Update message">
              Update
            </Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </div>
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

const MCPModal: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const api = useAssistantApi();
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
    // Create a formatted prompt with tool information
    const prompt = `Please create a Tool UI component for the following MCP tool:

**Tool Name:** ${tool.name}

**Description:** ${tool.description || "No description provided"}

**Full Schema:**
\`\`\`json
${JSON.stringify(tool.inputSchema, null, 2)}
\`\`\``;

    // Send the message to the current thread
    api.thread().append({
      role: "user",
      content: [{ type: "text", text: prompt }],
    });

    // Close the modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Import MCP Tool</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex gap-2">
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
              <Select
                value={transportType}
                onValueChange={(value: "http" | "sse") =>
                  setTransportType(value)
                }
              >
                <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-transparent px-2 text-xs shadow-none hover:bg-transparent focus:ring-0 data-[state=open]:bg-transparent dark:bg-transparent dark:hover:bg-transparent">
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
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading
              </>
            ) : (
              "Load"
            )}
          </Button>
        </div>

        {error && (
          <div className="text-destructive bg-destructive/10 mb-4 rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto rounded-md border">
          {tools.length === 0 ? (
            <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
              {loading ? "Loading tools..." : "No tools loaded"}
            </div>
          ) : (
            <div className="divide-y">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="hover:bg-muted/50 flex items-center justify-between p-4 transition-colors"
                >
                  <div className="mr-4 min-w-0 flex-1">
                    <div className="text-sm font-medium">{tool.name}</div>
                    {tool.description && (
                      <div className="text-muted-foreground mt-1 truncate text-xs">
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
  const isNewThread = useAssistantState(
    ({ threadListItem }) => threadListItem.status === "new",
  );

  return (
    <>
      <MCPModal open={mcpModalOpen} onOpenChange={setMcpModalOpen} />
      <div className="bg-background sticky bottom-0 mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-visible rounded-t-3xl pb-4 md:pb-6">
        <ComposerPrimitive.Root className="group/input-group border-input bg-background has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-ring/50 relative flex w-full flex-col rounded-3xl border px-1 pt-2 shadow-xs transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:ring-[3px]">
          <ComposerPrimitive.Input
            placeholder="Describe the tool UI you want to build..."
            className="placeholder:text-muted-foreground mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none focus-visible:ring-0"
            rows={1}
            autoFocus
          />
          <div className="relative mx-1 mt-2 mb-2 flex items-center justify-between">
            <div>
              {isNewThread && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-[34px] gap-1.5 rounded-full text-xs"
                  onClick={() => setMcpModalOpen(true)}
                >
                  <MCPIcon className="size-3.5" />
                  <span>MCP</span>
                </Button>
              )}
            </div>
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
                    className="border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90 size-[34px] rounded-full border"
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
    <ThreadPrimitive.Root className="bg-background flex h-full w-full flex-col">
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
              EditComposer,
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

type ViewMode = "rendered" | "code";

export default function BuilderPage() {
  const [repoId, setRepoId] = useState<string | null>(null);
  const repoIdRef = useState({ current: repoId })[0];
  const [_appId, setAppId] = useState<string | null>(null);
  const [webviewWidth, setWebviewWidth] = useState(50); // percentage
  const [viewMode, setViewMode] = useState<ViewMode>("rendered");
  const [codeContent, setCodeContent] = useState<string | null>(null);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const timestampRef = useState(() => Date.now())[0];

  // Keep ref in sync with state
  repoIdRef.current = repoId;

  // Load code when switching to code view
  useEffect(() => {
    if (viewMode === "code" && repoId && !codeContent) {
      setIsCodeLoading(true);
      getComponentCode(repoId, "components/demo-tool-ui.tsx")
        .then((content) => {
          setCodeContent(content);
          setIsCodeLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load code:", err);
          setIsCodeLoading(false);
        });
    }
  }, [viewMode, repoId, codeContent]);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/builder/chat",
      headers: async () => {
        // Auto-create Freestyle project on first message if not already created
        if (
          !repoIdRef.current &&
          process.env.NEXT_PUBLIC_FREESTYLE_ENABLED !== "false"
        ) {
          try {
            const response = await fetch("/api/builder/create-freestyle", {
              method: "POST",
            });

            if (response.ok) {
              const data = await response.json();
              setRepoId(data.repoId);
              repoIdRef.current = data.repoId;
              // Use a unique ID for this app instance
              setAppId(data.repoId + "-" + timestampRef);
            }
          } catch (error) {
            console.error("Failed to create Freestyle project:", error);
          }
        }

        return {
          "Repo-Id": repoIdRef.current || "",
        };
      },
    }),
  });

  const handleCopy = async () => {
    if (!codeContent) return;

    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = webviewWidth;
    const containerWidth = window.innerWidth - 240; // Subtract sidebar width

    const handleMouseMove = (e: MouseEvent) => {
      const diff = startX - e.clientX;
      const percentageChange = (diff / containerWidth) * 100;
      const newWidth = Math.min(
        Math.max(startWidth + percentageChange, 20),
        80,
      );
      setWebviewWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleRefreshPreview = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <PreviewRefreshContext.Provider value={handleRefreshPreview}>
      <AssistantRuntimeProvider runtime={runtime}>
        <PreviewRefreshSetter />
        <div className="flex h-full">
          <div className="bg-background w-[240px] shrink-0 overflow-y-auto p-4">
            <ThreadList />
          </div>
          <div
            className="overflow-hidden rounded-tl-lg border-t border-l"
            style={{ width: repoId ? `${100 - webviewWidth}%` : "100%" }}
          >
            <Thread />
          </div>
          {repoId && (
            <>
              <div
                className="bg-border hover:bg-primary w-1 cursor-col-resize transition-colors"
                onMouseDown={handleMouseDown}
              />
              <div
                className="flex flex-col"
                style={{ width: `${webviewWidth}%` }}
              >
                {/* Header with view toggle and copy/refresh button */}
                <div className="bg-background flex h-12 shrink-0 items-center justify-between border-t border-b px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "rendered" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("rendered")}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      variant={viewMode === "code" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("code")}
                      className="gap-2"
                    >
                      <Code className="h-4 w-4" />
                      Code
                    </Button>
                  </div>
                  {viewMode === "rendered" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRefreshKey((prev) => prev + 1)}
                      title="Refresh preview"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      disabled={!codeContent || isCodeLoading}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-hidden">
                  {viewMode === "rendered" ? (
                    <WebView key={refreshKey} repo={repoId} />
                  ) : (
                    <div className="h-full overflow-auto p-4">
                      {isCodeLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p className="text-muted-foreground mt-4 text-sm">
                              Loading code...
                            </p>
                          </div>
                        </div>
                      ) : codeContent ? (
                        <CodeBlock>
                          <CodeBlockCode code={codeContent} language="tsx" />
                        </CodeBlock>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-muted-foreground text-sm">
                            Failed to load code
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <EditFileToolUI />
        <WriteFileToolUI />
        <ReadFileToolUI />
      </AssistantRuntimeProvider>
    </PreviewRefreshContext.Provider>
  );
}

const EditFileToolUI = makeAssistantTool<
  {
    path?: string;
    edits?: Array<{
      oldText?: string;
      newText?: string;
    }>;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
>({
  type: "backend",
  toolName: "edit_file",
  streamCall: async (reader) => {
    await reader.response.get();

    // Refresh the preview pane after edit completes
    if (globalRefreshPreview) {
      globalRefreshPreview();
    }
  },
  render: ({ args }) => {
    console.log("EditFileToolUI", args);
    const path = args?.path;
    const edits = args?.edits;

    if (!path && (!edits || edits.length === 0)) {
      return null;
    }

    return (
      <Card className="mb-4 w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PencilIcon className="text-primary h-4 w-4" />
            <CardTitle className="text-base">Editing File</CardTitle>
          </div>
          {path && (
            <CardDescription className="mt-1 font-mono text-xs">
              {path}
            </CardDescription>
          )}
        </CardHeader>
        {edits && edits.length > 0 && (
          <CardContent>
            <div className="grid gap-2">
              {edits.map(
                (edit, index) =>
                  (edit.oldText || edit.newText) && (
                    <CodeBlock
                      key={index}
                      className="grid overflow-scroll py-2"
                    >
                      {edit.oldText && (
                        <>
                          <CodeBlockCode
                            code={edit.oldText
                              .split("\n")
                              .slice(0, 5)
                              .join("\n")}
                            language="tsx"
                            className="col-start-1 col-end-1 row-start-1 row-end-1 overflow-visible bg-red-200 [&_code]:bg-red-200 [&>pre]:py-0"
                          />
                          {edit.oldText.split("\n").length > 5 && (
                            <div className="px-4 font-mono text-xs text-red-700">
                              +{edit.oldText.split("\n").length - 5} more
                            </div>
                          )}
                        </>
                      )}
                      {edit.newText && (
                        <>
                          <CodeBlockCode
                            code={edit.newText
                              .trimEnd()
                              .split("\n")
                              .slice(0, 5)
                              .join("\n")}
                            language="tsx"
                            className="col-start-1 col-end-1 row-start-1 row-end-1 overflow-visible bg-green-200 [&_code]:bg-green-200 [&>pre]:py-0"
                          />
                          {edit.newText.split("\n").length > 5 && (
                            <div className="px-4 font-mono text-xs text-green-700">
                              +{edit.newText.split("\n").length - 5} more
                            </div>
                          )}
                        </>
                      )}
                    </CodeBlock>
                  ),
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  },
});

const WriteFileToolUI = makeAssistantTool<
  {
    path?: string;
    content?: string;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
>({
  type: "backend",
  toolName: "write_file",
  streamCall: async (reader) => {
    await reader.response.get();

    // Refresh the preview pane after write completes
    if (globalRefreshPreview) {
      globalRefreshPreview();
    }
  },
  render: ({ args }) => {
    const path = args?.path;

    if (!path) {
      return null;
    }

    return (
      <Card className="mb-4 w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileEdit className="text-primary h-4 w-4" />
            <CardTitle className="text-base">Writing File</CardTitle>
          </div>
          <CardDescription className="mt-1 font-mono text-xs">
            {path}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  },
});

const ReadFileToolUI = makeAssistantToolUI<
  {
    path?: string;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  {}
>({
  toolName: "read_file",
  render: ({ args }) => {
    const path = args?.path;

    if (!path) {
      return null;
    }

    return (
      <Card className="mb-4 w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="text-primary h-4 w-4" />
            <CardTitle className="text-base">Reading File</CardTitle>
          </div>
          <CardDescription className="mt-1 font-mono text-xs">
            {path}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  },
});
