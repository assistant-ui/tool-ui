"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface JsonEditorProps {
  label: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

/**
 * Standalone JSON editor component with live validation.
 * Updates internal text state on value changes and calls onChange only when valid JSON is entered.
 * Empty/null values show as empty textarea with "null" placeholder.
 */
export function JsonEditor({ label, value, onChange }: JsonEditorProps) {
  const [text, setText] = useState(() => {
    // Empty string for empty objects (null state) - only on initial render
    if (Object.keys(value).length === 0) {
      return "";
    }
    return JSON.stringify(value, null, 2);
  });
  const [error, setError] = useState<string | null>(null);

  // Track the last value we sent via onChange to prevent circular updates
  const lastSentValueRef = useRef<string>("");

  // Sync text state when value prop changes (e.g., switching components/tabs)
  useEffect(() => {
    const newValueStr = JSON.stringify(value);

    // Don't update if this is the same value we just sent via onChange
    if (newValueStr === lastSentValueRef.current) {
      return;
    }

    // Update text to match the new value
    if (Object.keys(value).length === 0) {
      setText("");
    } else {
      setText(JSON.stringify(value, null, 2));
    }
    setError(null);
  }, [value]);

  const handleChange = (newText: string) => {
    setText(newText);

    // Treat empty string or whitespace-only as null
    const trimmed = newText.trim();
    if (trimmed === "" || trimmed === "null") {
      setError(null);
      const emptyObj = {};
      lastSentValueRef.current = JSON.stringify(emptyObj);
      onChange(emptyObj);
      return;
    }

    try {
      const parsed = JSON.parse(newText);
      setError(null);
      lastSentValueRef.current = JSON.stringify(parsed);
      onChange(parsed);
    } catch {
      setError("Invalid JSON");
    }
  };

  return (
    <div className="flex h-full flex-col space-y-2">
      <Label className="text-xs">{label}</Label>
      <Textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 font-mono text-xs"
        placeholder="null"
      />
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}
