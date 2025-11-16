"use client";

import React from "react";

export function WidgetOverlay({ active }: { active?: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-sm animate-pulse z-10" />
  );
}
