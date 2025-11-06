"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "./loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface WebViewHandle {
  refresh: () => void;
}

export interface WebViewProps {
  repo: string;
  baseId: string;
  appId: string;
  domain?: string;
}

export default forwardRef<WebViewHandle, WebViewProps>(function WebView(
  props,
  ref,
) {
  function requestDevServer({ repoId }: { repoId: string }) {
    return requestDevServerInner({ repoId });
  }

  const devServerRef = useRef<FreestyleDevServerHandle>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      devServerRef.current?.refresh();
    },
  }));

  return (
    <div className="flex h-full flex-col overflow-hidden border-l transition-opacity duration-700">
      <FreestyleDevServer
        ref={devServerRef}
        actions={{ requestDevServer }}
        repoId={props.repo}
        loadingComponent={({ iframeLoading, devCommandRunning }) =>
          !devCommandRunning && (
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
          )
        }
      />
    </div>
  );
});
