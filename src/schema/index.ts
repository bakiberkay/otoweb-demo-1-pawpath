// otoweb content schema — proposed (Gate 3 review)
//
// This is the central artifact of the system. Every other agent consumes or
// produces this schema. Do not edit without operator approval.
//
// This file lives in packages/schema/proposed/ until accepted. On approval it
// moves to packages/schema/index.ts and Zod is installed as a real dep.

import { z } from "zod";

// =============================================================================
// ID brand types — prefixed, url-safe, human-readable
// =============================================================================

export const StringId      = z.string().regex(/^str_[a-z0-9_-]+$/);
export const AssetId       = z.string().regex(/^ast_[a-z0-9_-]+$/);
export const SectionId     = z.string().regex(/^sec_[a-z0-9_-]+$/);
export const PageId        = z.string().regex(/^pg_[a-z0-9_-]+$/);
export const TestimonialId = z.string().regex(/^tst_[a-z0-9_-]+$/);
export const ServiceId     = z.string().regex(/^svc_[a-z0-9_-]+$/);
export const FeatureId     = z.string().regex(/^ftr_[a-z0-9_-]+$/);
export const GalleryItemId = z.string().regex(/^gal_[a-z0-9_-]+$/);
export const SocialLinkId  = z.string().regex(/^soc_[a-z0-9_-]+$/);

// BCP-47-ish: "en", "de", "tr", "en-US", "pt-BR"
export const LangCode = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/);

// =============================================================================
// Strings table — every human-facing string lives here, id-keyed.
//
// Per ADR 0002, each entry carries `source` so the translator can skip
// placeholders. Translations themselves live in a separate per-run artifact
// (runs/<run-id>/translations/<lang>.json), NOT in this schema.
// =============================================================================

export const StringEditorMeta = z.object({
  label:     z.string(),                                // shown in /admin
  helpText:  z.string().optional(),
  multiline: z.boolean().default(false),
  maxLength: z.number().int().positive().optional(),
});

export const StringEntry = z.object({
  source:    z.enum(["authored", "placeholder"]),
  canonical: z.string(),                                // text in the canonical language
  editorMeta: StringEditorMeta,
});

export const StringsTable = z.record(StringId, StringEntry);

// =============================================================================
// Assets — logical refs only. Binaries are resolved by asset-resolver and
// recorded in runs/<run-id>/asset-manifest.json. The schema never holds bytes.
// =============================================================================

export const AssetKind = z.enum(["image", "logo", "icon", "video", "document"]);

export const AssetRef = z.object({
  id:     AssetId,
  kind:   AssetKind,
  intent: z.string(),                                   // semantic role: "hero-background", "service-icon"
  recommendedDimensions: z.object({
    width:  z.number().int().positive(),
    height: z.number().int().positive(),
  }).optional(),
  altTextId: StringId,                                  // alt text is a string, not an asset prop
  editorMeta: z.object({
    label:               z.string(),
    helpText:            z.string().optional(),
    replaceableViaAdmin: z.boolean().default(true),
  }),
});

// =============================================================================
// Shared entities — id-keyed stores for list-like content that can be
// referenced from multiple sections.
// =============================================================================

export const Testimonial = z.object({
  id:             TestimonialId,
  quoteStringId:  StringId,
  authorStringId: StringId,
  roleStringId:   StringId.optional(),
  avatarAssetId:  AssetId.optional(),
});

export const Service = z.object({
  id:                  ServiceId,
  titleStringId:       StringId,
  descriptionStringId: StringId,
  priceStringId:       StringId.optional(),             // string, not number — "$50/hr", "From $200"
  ctaLabelStringId:    StringId.optional(),
  ctaHref:             z.string().optional(),
  iconAssetId:         AssetId.optional(),
});

export const Feature = z.object({
  id:                  FeatureId,
  titleStringId:       StringId,
  descriptionStringId: StringId,
  iconAssetId:         AssetId.optional(),
});

export const GalleryItem = z.object({
  id:              GalleryItemId,
  assetId:         AssetId,
  captionStringId: StringId.optional(),
});

export const SocialLink = z.object({
  id:             SocialLinkId,
  platform:       z.enum(["twitter", "instagram", "facebook", "linkedin", "youtube", "tiktok", "github", "other"]),
  handleStringId: StringId,                             // "@brand" — displayed
  url:            z.string().url(),                     // structural; not a translatable string
});

// =============================================================================
// Section types — discriminated union. Unknown type = hard error.
//
// `rich-text` is a real first-class core type, never an implicit fallback.
// =============================================================================

const sectionBase = z.object({
  id: SectionId,
  editorMeta: z.object({
    label:    z.string(),                               // "Home — Hero" — surfaces in admin nav
    helpText: z.string().optional(),
  }),
});

export const HeroSection = sectionBase.extend({
  type:                      z.literal("hero"),
  variant:                   z.enum(["centered", "split-left", "split-right"]).default("centered"),
  eyebrowStringId:           StringId.optional(),
  headlineStringId:          StringId,
  subheadStringId:           StringId.optional(),
  primaryCtaLabelStringId:   StringId.optional(),
  primaryCtaHref:            z.string().optional(),
  secondaryCtaLabelStringId: StringId.optional(),
  secondaryCtaHref:          z.string().optional(),
  backgroundAssetId:         AssetId.optional(),
});

export const TextBlockSection = sectionBase.extend({
  type:                  z.literal("text-block"),
  variant:               z.enum(["single", "two-column"]).default("single"),
  eyebrowStringId:       StringId.optional(),
  headingStringId:       StringId,
  bodyStringId:          StringId,
  secondaryBodyStringId: StringId.optional(),           // two-column second body
});

export const RichTextSection = sectionBase.extend({
  type:            z.literal("rich-text"),
  contentStringId: StringId,                            // markdown stored as a long string
});

export const FeaturesSection = sectionBase.extend({
  type:            z.literal("features"),
  variant:         z.enum(["grid-2", "grid-3", "grid-4", "list"]).default("grid-3"),
  headingStringId: StringId.optional(),
  introStringId:   StringId.optional(),
  featureIds:      z.array(FeatureId).min(1),
});

export const ServicesSection = sectionBase.extend({
  type:            z.literal("services"),
  variant:         z.enum(["cards", "list", "pricing-cards"]).default("cards"),
  headingStringId: StringId.optional(),
  introStringId:   StringId.optional(),
  serviceIds:      z.array(ServiceId).min(1),
});

export const TestimonialsSection = sectionBase.extend({
  type:            z.literal("testimonials"),
  variant:         z.enum(["carousel", "grid", "quote-stack"]).default("grid"),
  headingStringId: StringId.optional(),
  testimonialIds:  z.array(TestimonialId).min(1),
});

export const GallerySection = sectionBase.extend({
  type:            z.literal("gallery"),
  variant:         z.enum(["grid", "masonry", "carousel"]).default("grid"),
  headingStringId: StringId.optional(),
  galleryItemIds:  z.array(GalleryItemId).min(1),
});

export const FAQSection = sectionBase.extend({
  type:            z.literal("faq"),
  headingStringId: StringId.optional(),
  introStringId:   StringId.optional(),
  items: z.array(z.object({
    questionStringId: StringId,
    answerStringId:   StringId,
  })).min(1),
});

export const CTASection = sectionBase.extend({
  type:                      z.literal("cta"),
  variant:                   z.enum(["banner", "centered", "split"]).default("centered"),
  headingStringId:           StringId,
  bodyStringId:              StringId.optional(),
  primaryCtaLabelStringId:   StringId,
  primaryCtaHref:            z.string(),
  secondaryCtaLabelStringId: StringId.optional(),
  secondaryCtaHref:          z.string().optional(),
  backgroundAssetId:         AssetId.optional(),
});

export const ContactFormField = z.object({
  name:                z.string(),                      // HTML name attribute
  kind:                z.enum(["text", "email", "phone", "textarea", "select", "checkbox"]),
  labelStringId:       StringId,
  placeholderStringId: StringId.optional(),
  required:            z.boolean().default(false),
  options: z.array(z.object({                           // for select/checkbox
    value:         z.string(),
    labelStringId: StringId,
  })).optional(),
});

export const ContactFormSection = sectionBase.extend({
  type:                   z.literal("contact-form"),
  headingStringId:        StringId.optional(),
  introStringId:          StringId.optional(),
  fields:                 z.array(ContactFormField).min(1),
  submitLabelStringId:    StringId,
  successMessageStringId: StringId,
  errorMessageStringId:   StringId,
  routing: z.object({
    kind:        z.enum(["netlify-forms", "webhook"]),
    destination: z.string(),                            // webhook URL, or "" for netlify-forms
  }),
});

export const CoreSection = z.discriminatedUnion("type", [
  HeroSection,
  TextBlockSection,
  RichTextSection,
  FeaturesSection,
  ServicesSection,
  TestimonialsSection,
  GallerySection,
  FAQSection,
  CTASection,
  ContactFormSection,
]);

// Theme-extras: a theme widens this union at build time by registering its
// extra section variants. The schema itself does not enumerate them; validation
// of section.type against (core ∪ theme.registeredExtras) happens in
// theme-assembler, with unknown types halting loudly.
export const Section = CoreSection;

// =============================================================================
// Pages
// =============================================================================

export const PageSEO = z.object({
  titleStringId:       StringId.optional(),             // overrides site default
  descriptionStringId: StringId.optional(),
  ogImageAssetId:      AssetId.optional(),
  noindex:             z.boolean().default(false),
});

export const Page = z.object({
  id:                PageId,
  slug:              z.string(),                        // "" for home (route "/"), "about" for /about
  navLabelStringId:  StringId,
  sectionIds:        z.array(SectionId).min(1),
  seo:               PageSEO.optional(),
  editorMeta: z.object({
    label:     z.string(),
    helpText:  z.string().optional(),
    showInNav: z.boolean().default(true),
  }),
});

// =============================================================================
// Site meta
// =============================================================================

export const SiteMeta = z.object({
  brand: z.object({
    nameStringId:    StringId,
    taglineStringId: StringId.optional(),
    logoAssetId:     AssetId.optional(),
  }),
  contact: z.object({
    emailStringId:   StringId.optional(),
    phoneStringId:   StringId.optional(),
    addressStringId: StringId.optional(),
  }),
  social: z.array(SocialLinkId),
  seo: z.object({
    defaultTitleStringId:       StringId,
    defaultDescriptionStringId: StringId,
    defaultOgImageAssetId:      AssetId.optional(),
  }),
});

// =============================================================================
// i18n + theme binding
// =============================================================================

export const I18nConfig = z.object({
  canonical: LangCode,                                  // language sections are authored in
  targets:   z.array(LangCode).default([]),             // additional languages requested
});

export const ThemeBinding = z.object({
  themeName: z.string(),                                // matches a directory in themes/
});

// =============================================================================
// Site — the top-level schema
// =============================================================================

export const Site = z.object({
  schemaVersion: z.literal(1),
  id:            z.string(),                            // run/site identifier; doubles as repo name
  meta:          SiteMeta,
  i18n:          I18nConfig,
  theme:         ThemeBinding,
  pages:         z.array(Page).min(3).max(7),           // per founding brief
  sections:      z.record(SectionId, Section),          // flat pool — pages reference by id
  entities: z.object({
    testimonials:  z.record(TestimonialId, Testimonial).default({}),
    services:      z.record(ServiceId, Service).default({}),
    features:      z.record(FeatureId, Feature).default({}),
    galleryItems:  z.record(GalleryItemId, GalleryItem).default({}),
    socialLinks:   z.record(SocialLinkId, SocialLink).default({}),
  }),
  strings: StringsTable,
  assets:  z.record(AssetId, AssetRef),
});

export type Site               = z.infer<typeof Site>;
export type Page               = z.infer<typeof Page>;
export type Section            = z.infer<typeof Section>;
export type StringEntry        = z.infer<typeof StringEntry>;
export type AssetRef           = z.infer<typeof AssetRef>;
export type Testimonial        = z.infer<typeof Testimonial>;
export type Service            = z.infer<typeof Service>;
export type Feature            = z.infer<typeof Feature>;
export type GalleryItem        = z.infer<typeof GalleryItem>;
export type SocialLink         = z.infer<typeof SocialLink>;
