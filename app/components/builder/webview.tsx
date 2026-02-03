"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "@/app/styles/builder-loader.css";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

export interface WebViewHandle {
  refresh: () => void;
}

type DevServerResponse = Awaited<ReturnType<typeof requestDevServerInner>>;

export default forwardRef<
  WebViewHandle,
  {
    repo: string;
  }
>(function WebView(props, ref) {
  const [devServer, setDevServer] = useState<DevServerResponse | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const devServerUrl = useMemo(
    () => devServer?.ephemeralUrl ?? null,
    [devServer],
  );

  const requestDevServer = useCallback(async () => {
    setRequesting(true);
    setIframeLoading(true);
    setError(null);
    try {
      const response = await requestDevServerInner({ repoId: props.repo });
      setDevServer(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setDevServer(null);
      setIframeLoading(false);
    } finally {
      setRequesting(false);
    }
  }, [props.repo]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      void requestDevServer();
    },
  }));

  useEffect(() => {
    if (!props.repo) {
      setDevServer(null);
      setError("Repo ID is missing.");
      return;
    }
    void requestDevServer();
  }, [props.repo, requestDevServer]);

  return (
    <div className="flex h-full flex-col overflow-hidden border-l transition-opacity duration-700">
      {(requesting || iframeLoading) && !devServer?.devCommandRunning && (
        <div className="flex h-full items-center justify-center">
          <div>
            <div className="text-center">
              {iframeLoading ? "JavaScript Loading" : "Starting VM"}
            </div>
            <div>
              <div className="loader"></div>
            </div>
          </div>
        </div>
      )}
      {error ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {error}
        </div>
      ) : devServerUrl ? (
        <iframe
          key={devServerUrl}
          className="h-full w-full border-0"
          src={devServerUrl}
          onLoad={() => setIframeLoading(false)}
        />
      ) : null}
    </div>
  );
});
