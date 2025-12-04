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

const customEditorStyleLight = EditorView.theme(
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
      borderRight: "none",
      marginLeft: "8px",
      userSelect: "none",
      pointerEvents: "none",
    },
    ".cm-line": {
      padding: "0",
    },
    "&.cm-focused": {
      outline: "none",
    },

    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "rgba(0, 0, 0, 0.8)",
    },
  },
  { dark: false },
);

const customEditorStyleDark = EditorView.theme(
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
      borderRight: "none",
      marginLeft: "8px",
      color: "rgba(255, 255, 255, 0.35)",
      userSelect: "none",
      pointerEvents: "none",
    },
    ".cm-line": {
      padding: "0",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255, 255, 255, 0.06)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "rgba(255, 255, 255, 0.8)",
    },
  },
  { dark: true },
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
    () => [
      json(),
      EditorView.lineWrapping,
      theme === "dark" ? customEditorStyleDark : customEditorStyleLight,
    ],
    [theme],
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
    <div className="relative">
      <CodeMirror
        value={text}
        height="100%"
        extensions={extensions}
        onChange={handleChange}
        theme={theme === "dark" ? githubDark : githubLight}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
        }}
        className="h-full [&_.cm-activeLineGutter]:text-[rgba(0,0,0,0.8)]! dark:[&_.cm-activeLineGutter]:text-[rgba(255,255,255,0.8)]! [&_.cm-editor]:h-full [&_.cm-editor]:bg-transparent! [&_.cm-gutters]:bg-transparent! [&_.cm-lineNumbers]:text-[rgba(0,0,0,0.25)]! dark:[&_.cm-lineNumbers]:text-[rgba(255,255,255,0.35)]! [&_.cm-matchingBracket]:bg-[rgba(0,0,0,0.1)]! dark:[&_.cm-matchingBracket]:bg-[rgba(255,255,255,0.15)]! [&_.cm-scroller]:h-full"
      />
      {error && (
        <div className="text-destructive pointer-events-none absolute bottom-2 left-2 z-20 rounded px-2 py-1 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}
