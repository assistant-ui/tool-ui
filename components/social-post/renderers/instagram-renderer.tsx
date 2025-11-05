"use client";

import { Header } from "../header";
import { Body } from "../body";
import { Media } from "../media";
import { Actions } from "../actions";
import { Stats } from "../stats";

export function InstagramRenderer() {
  return (
    <>
      <Header />
      <Media />
      <Actions />
      <Body />
      <Stats />
    </>
  );
}
