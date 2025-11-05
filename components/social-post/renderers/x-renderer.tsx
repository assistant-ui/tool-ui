"use client";

import { Header } from "../header";
import { Body } from "../body";
import { Media } from "../media";
import { LinkPreview } from "../link-preview";
import { Actions } from "../actions";
import { Stats } from "../stats";

export function XRenderer() {
  return (
    <>
      <Header />
      <Body />
      <Media />
      <LinkPreview />
      <Actions />
      <Stats />
    </>
  );
}
