// Adapter — pure helpers that resolve schema references into rendered values.
//
// Components never reach into the schema directly. They call these helpers
// with `site` + an id. Keeps components simple, keeps the data source
// swappable (fixture import today; run artifact tomorrow; CMS later).
//
// Placeholder asset URLs (resolveAssetUrl) are inline SVG data URIs until the
// asset-resolver agent is real. The intent label is rendered into each SVG
// so you can see what real binary would replace it.

import type { Site, AssetRef } from "../schema";

// ---------------------------------------------------------------------------
// String resolution
// ---------------------------------------------------------------------------

export function getString(site: Site, id: string): string {
  const entry = site.strings[id];
  if (!entry) throw new Error(`[adapter] unknown string id: "${id}"`);
  return entry.canonical;
}

export function getStringOptional(site: Site, id: string | undefined): string | null {
  if (!id) return null;
  return getString(site, id);
}

// ---------------------------------------------------------------------------
// Entity resolution
// ---------------------------------------------------------------------------

export function getTestimonial(site: Site, id: string) {
  const t = site.entities.testimonials[id];
  if (!t) throw new Error(`[adapter] unknown testimonial id: "${id}"`);
  return t;
}

export function getService(site: Site, id: string) {
  const s = site.entities.services[id];
  if (!s) throw new Error(`[adapter] unknown service id: "${id}"`);
  return s;
}

export function getFeature(site: Site, id: string) {
  const f = site.entities.features[id];
  if (!f) throw new Error(`[adapter] unknown feature id: "${id}"`);
  return f;
}

export function getGalleryItem(site: Site, id: string) {
  const g = site.entities.galleryItems[id];
  if (!g) throw new Error(`[adapter] unknown gallery item id: "${id}"`);
  return g;
}

export function getSocialLink(site: Site, id: string) {
  const s = site.entities.socialLinks[id];
  if (!s) throw new Error(`[adapter] unknown social link id: "${id}"`);
  return s;
}

// ---------------------------------------------------------------------------
// Asset resolution — placeholder SVGs until asset-resolver lands
// ---------------------------------------------------------------------------

export function getAsset(site: Site, id: string): AssetRef {
  const a = site.assets[id];
  if (!a) throw new Error(`[adapter] unknown asset id: "${id}"`);
  return a;
}

export function resolveAssetUrl(site: Site, id: string): string {
  const asset = getAsset(site, id);
  return placeholderSvgDataUri(asset);
}

export function resolveAssetAlt(site: Site, id: string): string {
  const asset = getAsset(site, id);
  return getString(site, asset.altTextId);
}

// ---------------------------------------------------------------------------
// Route helpers
// ---------------------------------------------------------------------------

export function pageHref(slug: string): string {
  return slug === "" ? "/" : `/${slug}`;
}

// ---------------------------------------------------------------------------
// Placeholder SVG generation
// ---------------------------------------------------------------------------

function defaultDims(kind: AssetRef["kind"]): { w: number; h: number } {
  switch (kind) {
    case "icon":     return { w: 64,   h: 64  };
    case "logo":     return { w: 200,  h: 60  };
    case "image":    return { w: 1200, h: 800 };
    case "video":    return { w: 1280, h: 720 };
    case "document": return { w: 600,  h: 800 };
  }
}

function paletteForIntent(intent: string, kind: AssetRef["kind"]): { bg: string; fg: string } {
  if (kind === "icon")              return { bg: "#E8F0EF", fg: "#3F7A75" };
  if (kind === "logo")              return { bg: "#FBF7F2", fg: "#22201E" };
  if (intent === "hero-background") return { bg: "#F1E9DE", fg: "#A89F92" };
  if (intent === "og-default")      return { bg: "#3F7A75", fg: "#FBF7F2" };
  if (intent === "gallery")         return { bg: "#D9CFC1", fg: "#6B6661" };
  return { bg: "#E8E0D6", fg: "#6B6661" };
}

function placeholderSvgDataUri(asset: AssetRef): string {
  const { w, h } = asset.recommendedDimensions
    ? { w: asset.recommendedDimensions.width, h: asset.recommendedDimensions.height }
    : defaultDims(asset.kind);
  const { bg, fg } = paletteForIntent(asset.intent, asset.kind);
  const label = asset.intent;
  const fontSize = Math.max(12, Math.min(w, h) / 14);

  const body = asset.kind === "icon"
    ? `<circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)*0.32}" fill="none" stroke="${fg}" stroke-width="${Math.min(w,h)*0.04}"/>`
    : `<text x="50%" y="50%" font-family="Georgia, serif" font-style="italic" font-size="${fontSize}" fill="${fg}" text-anchor="middle" dy="0.35em" opacity="0.55">${label}</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/>${body}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
