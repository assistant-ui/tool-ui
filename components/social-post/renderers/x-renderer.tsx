"use client";

import { Header } from "../header";
import { Body } from "../body";
import { Media } from "../media";
import { QuotedPost } from "../quoted-post";
import { Actions } from "../actions";
import { LinkPreview } from "../link-preview";

export function XRenderer() {
  return (
    <>
      <Header />
      <Body />
      <Media />
      <QuotedPost />
      <LinkPreview />
      <Actions />
    </>
  );
}
