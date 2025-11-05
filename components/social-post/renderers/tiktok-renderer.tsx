"use client";

import { Header } from "../header";
import { Body } from "../body";
import { Media } from "../media";
import { Actions } from "../actions";
import { Stats } from "../stats";
import { useSocialPost } from "../context";

export function TikTokRenderer() {
  const { cfg } = useSocialPost();
  const rail = cfg.tokens.actionLayout === "right-rail";

  return (
    <>
      <Header />
      <div className={rail ? "relative" : undefined}>
        <Media />
        {rail ? <Actions /> : null}
      </div>
      {!rail ? <Actions /> : null}
      <Body />
      <Stats />
    </>
  );
}
