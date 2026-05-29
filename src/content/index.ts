import siteData from "./site.json" with { type: "json" };
import editables from "./editables.json" with { type: "json" };
import type { Site } from "../schema";

// Edits via /admin (Decap CMS) only ever touch editables.json, keeping the
// structural shape of site.json stable. Per ADR 0002, a client-edited string
// is "authored" — we flip source here at build time so the translator (when
// it arrives) sees the correct provenance.

const base = siteData as unknown as Site;
const merged: Site = {
  ...base,
  strings: { ...base.strings },
};

for (const [id, canonical] of Object.entries(editables as Record<string, string>)) {
  const existing = merged.strings[id];
  if (!existing) continue;
  merged.strings[id] = { ...existing, canonical, source: "authored" };
}

export const example: Site = merged;
