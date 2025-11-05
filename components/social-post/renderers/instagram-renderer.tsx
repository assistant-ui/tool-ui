"use client";

import { Header } from "../header";
import { Body } from "../body";
import { Media } from "../media";
import { Actions } from "../actions";
import { Stats } from "../stats";

export function InstagramRenderer() {
  return (
    <>
      <div className="px-3 py-3">
        <Header />
      </div>
      <Media />
      <div className="px-3">
        <Actions />
        <Body />
        <Stats />
      </div>
    </>
  );
}
