"use client";

import { Header } from "../header";
import { Body } from "../body";
import { Media } from "../media";
import { Actions } from "../actions";
import { Stats } from "../stats";

export function InstagramRenderer() {
  return (
    <>
      <div className="px-3 pt-3">
        <Header />
      </div>
      <div className="px-3">
        <Media />
      </div>

      <div className="px-3 pt-3 pb-3">
        <Body />
        <Stats />
      </div>
    </>
  );
}
