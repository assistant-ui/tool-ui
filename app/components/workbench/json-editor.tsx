"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { useTheme } from "next-themes";

interface JsonEditorProps {
  label: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

const customEditorStyle = EditorView.theme(
  {
    "&": {
      fontSize: "14px",
      fontFamily: "ui-monospace, monospace",
    },
    ".cm-content": {
      padding: "16px",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
    },
    ".cm-line": {
      padding: "0",
    },
    "&.cm-focused": {
      outline: "none",
    },
  },
  { dark: false },
);

export function JsonEditor({
  label: _label,
  value,
  onChange,
}: JsonEditorProps) {
  const [text, setText] = useState(() => {
    if (Object.keys(value).length === 0) {
      return "";
    }
    return JSON.stringify(value, null, 2);
  });
  const [error, setError] = useState<string | null>(null);
  const lastSentValueRef = useRef<string>("");
  const { theme } = useTheme();

  const extensions = useMemo(
    () => [json(), EditorView.lineWrapping, customEditorStyle],
    [],
  );

  useEffect(() => {
    const newValueStr = JSON.stringify(value);

    if (newValueStr === lastSentValueRef.current) {
      return;
    }

    if (Object.keys(value).length === 0) {
      setText("");
    } else {
      setText(JSON.stringify(value, null, 2));
    }
    setError(null);
  }, [value]);

  const handleChange = (newText: string) => {
    setText(newText);

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
    <div className="relative bg-white dark:bg-[#0d1117]">
      <CodeMirror
        value={text}
        height="100%"
        extensions={extensions}
        onChange={handleChange}
        theme={theme === "dark" ? githubDark : githubLight}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLineGutter: false,
          highlightActiveLine: false,
        }}
        className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:h-full"
      />
      {error && (
        <div className="text-destructive bg-background/90 pointer-events-none absolute bottom-2 left-2 z-20 rounded px-2 py-1 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
