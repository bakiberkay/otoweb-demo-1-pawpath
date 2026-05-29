// theme.manifest.ts — declares this theme's compliance and registered extras.
// Read by theme-assembler at run-time to validate that every section in a
// schema is renderable by this theme. Unknown types halt the build loudly.

export const manifest = {
  name: "soft",
  version: "0.1.0",
  coreCompliant: true,                      // implements all 10 core section types
  registeredExtras: [] as const,            // no extras for v1
} as const;

export const CORE_SECTION_TYPES = [
  "hero",
  "text-block",
  "rich-text",
  "features",
  "services",
  "testimonials",
  "gallery",
  "faq",
  "cta",
  "contact-form",
] as const;

export type CoreSectionType = (typeof CORE_SECTION_TYPES)[number];
