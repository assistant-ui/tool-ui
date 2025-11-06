"use client";

import { useState } from "react";
import { DecisionPrompt } from "./decision-prompt";
import { Send, X, Download, FileJson, FileSpreadsheet, FileText, Trash2 } from "lucide-react";

export function DecisionPromptExample() {
  const [binaryResult, setBinaryResult] = useState<string | undefined>();
  const [multiChoiceResult, setMultiChoiceResult] = useState<string | undefined>();
  const [destructiveResult, setDestructiveResult] = useState<string | undefined>();
  const [asyncResult, setAsyncResult] = useState<string | undefined>();

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">Decision Prompt Examples</h1>

      {/* Binary Decision */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Binary Decision</h2>
        <DecisionPrompt
          prompt="Do you want to send the email?"
          description="This will notify all 15 participants"
          selectedAction={binaryResult}
          actions={[
            { id: "cancel", label: "Nevermind", variant: "ghost", icon: <X className="h-4 w-4" /> },
            { id: "send", label: "Yes, send", variant: "default", icon: <Send className="h-4 w-4" /> },
          ]}
          onAction={(actionId) => {
            setBinaryResult(actionId);
            console.log("Binary decision:", actionId);
          }}
        />
      </section>

      {/* Multi-Choice */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Multi-Choice Selection</h2>
        <DecisionPrompt
          prompt="Choose export format:"
          selectedAction={multiChoiceResult}
          actions={[
            { id: "csv", label: "CSV", variant: "secondary", icon: <FileText className="h-4 w-4" /> },
            { id: "json", label: "JSON", variant: "secondary", icon: <FileJson className="h-4 w-4" /> },
            { id: "excel", label: "Excel", variant: "secondary", icon: <FileSpreadsheet className="h-4 w-4" /> },
          ]}
          onAction={(actionId) => {
            setMultiChoiceResult(actionId);
            console.log("Export format:", actionId);
          }}
          align="center"
        />
      </section>

      {/* Destructive Action with Two-Stage Confirmation */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Destructive Action (Two-Stage)</h2>
        <p className="text-sm text-muted-foreground">
          Click &ldquo;Delete&rdquo; once to enter confirm state, then click &ldquo;Confirm delete&rdquo; to execute
        </p>
        <DecisionPrompt
          prompt="Delete 12 files?"
          description="This action cannot be undone"
          selectedAction={destructiveResult}
          actions={[
            { id: "cancel", label: "Cancel", variant: "ghost" },
            {
              id: "delete",
              label: "Delete",
              confirmLabel: "Confirm delete",
              variant: "destructive",
              icon: <Trash2 className="h-4 w-4" />,
            },
          ]}
          onAction={(actionId) => {
            setDestructiveResult(actionId);
            console.log("Destructive action:", actionId);
          }}
          confirmTimeout={5000}
        />
      </section>

      {/* Async with Loading */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Async Action with Loading</h2>
        <DecisionPrompt
          prompt="Install 3 packages?"
          description="npm, lodash, and react-icons"
          selectedAction={asyncResult}
          actions={[
            { id: "no", label: "No", variant: "ghost" },
            { id: "install", label: "Yes, install", variant: "default", icon: <Download className="h-4 w-4" /> },
          ]}
          onAction={async (actionId) => {
            if (actionId === "install") {
              // Simulate async operation
              await new Promise((resolve) => setTimeout(resolve, 2000));
            }
            setAsyncResult(actionId);
            console.log("Async action:", actionId);
          }}
        />
      </section>

      {/* With onBeforeAction */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">With Validation (onBeforeAction)</h2>
        <DecisionPrompt
          prompt="Deploy to production?"
          description="This will trigger a new deployment"
          actions={[
            { id: "cancel", label: "Cancel", variant: "ghost" },
            { id: "deploy", label: "Deploy", variant: "default" },
          ]}
          onBeforeAction={(actionId) => {
            if (actionId === "deploy") {
              // Simulate validation check
              const hasPermission = Math.random() > 0.5;
              if (!hasPermission) {
                alert("You don't have permission to deploy");
                return false;
              }
            }
            return true;
          }}
          onAction={(actionId) => {
            console.log("Deployment action:", actionId);
          }}
        />
      </section>

      {/* Left Aligned */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Left Aligned Actions</h2>
        <DecisionPrompt
          prompt="Continue with current settings?"
          actions={[
            { id: "back", label: "Go back", variant: "ghost" },
            { id: "continue", label: "Continue", variant: "default" },
          ]}
          onAction={(actionId) => {
            console.log("Navigation:", actionId);
          }}
          align="left"
        />
      </section>

      {/* Reset Button */}
      <div className="pt-4">
        <button
          onClick={() => {
            setBinaryResult(undefined);
            setMultiChoiceResult(undefined);
            setDestructiveResult(undefined);
            setAsyncResult(undefined);
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Reset All Examples
        </button>
      </div>
    </div>
  );
}

export default DecisionPromptExample;
