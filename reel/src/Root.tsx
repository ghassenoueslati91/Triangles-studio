import React from "react";
import { Composition } from "remotion";
import { Reel, TOTAL } from "./Reel";

export const Root: React.FC = () => (
  <>
    <Composition id="Reel-9x16" component={Reel} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Wide-16x9" component={Reel} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
  </>
);
