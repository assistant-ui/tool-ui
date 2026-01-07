import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

interface ChatBubbleProps {
  role: "user" | "assistant";
  children: ReactNode;
}

function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] text-base leading-relaxed",
          isUser &&
            "rounded-2xl bg-blue-600 px-4 py-2.5 text-white dark:bg-blue-700",
          !isUser && "text-foreground",
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ChatContextPreviewProps {
  userMessage: string;
  preamble?: string;
  children: ReactNode;
}

export function ChatContextPreview({
  userMessage,
  preamble,
  children,
}: ChatContextPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ChatBubble role="user">{userMessage}</ChatBubble>
      <div className="flex flex-col gap-3">
        {preamble && (
          <ChatBubble role="assistant">
            <span>{preamble}</span>
          </ChatBubble>
        )}
        <div className="flex w-full justify-start">{children}</div>
      </div>
    </div>
  );
}
