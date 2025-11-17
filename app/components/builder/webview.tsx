"use client";

import { requestDevServer as requestDevServerInner } from "./webview-actions";
import "@/app/styles/builder-loader.css";
import {
  FreestyleDevServer,
  FreestyleDevServerHandle,
} from "freestyle-sandboxes/react/dev-server";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface WebViewHandle {
  refresh: () => void;
}

export default forwardRef<
  WebViewHandle,
  {
    repo: string;
  }
>(function WebView(props, ref) {
  console.log("WebView", props);
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
