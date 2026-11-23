/**
 * Single source of truth describing every content type editable from the admin panel.
 * Used by the admin UI (forms/lists) and by the API (to find Cloudinary assets to clean up).
 * Keep this file free of server-only imports.
 */
import { EVENT_TYPES, GEAR_CATEGORIES, SERVICE_CATEGORIES } from "./constants";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "date"
  | "list"
  | "image"
  | "images"
  | "pdf";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  placeholder?: string;
  help?: string;
  /** Show this field as a column in the admin list */
  column?: boolean;
};

export type ResourceConfig = {
  key: string;
  label: string;
  singular: string;
  titleField: string;
  imageField?: string;
  hasSlug?: boolean;
  /** Public page to open after saving (prefix + slug) */
  publicPath?: string;
  fields: Field[];
};

export const RESOURCES: Record<string, ResourceConfig> = {
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    titleField: "title",
    imageField: "coverImage",
    hasSlug: true,
    publicPath: "/services/",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, placeholder: "Wedding Cinematography" },
      { name: "slug", label: "Slug (URL)", type: "text", help: "Leave empty to generate from the title" },
      { name: "category", label: "Category", type: "select", options: SERVICE_CATEGORIES, required: true, column: true },
      { name: "shortDescription", label: "Short description", type: "textarea", placeholder: "One or two lines shown on cards" },
      { name: "description", label: "Full description", type: "textarea" },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "gallery", label: "Gallery images", type: "images" },
      { name: "startingPrice", label: "Starting price (₹)", type: "number", column: true },
      { name: "priceUnit", label: "Price unit", type: "text", placeholder: "per day" },
      { name: "features", label: "What's included", type: "list", placeholder: "4K cinema cameras" },
      { name: "featured", label: "Show on home page", type: "boolean", column: true },
      { name: "active", label: "Active", type: "boolean", column: true },
      { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first" },
    ],
  },
  portfolio: {
    key: "portfolio",
    label: "Portfolio",
    singular: "Album",
    titleField: "title",
    imageField: "coverImage",
    hasSlug: true,
    publicPath: "/portfolio/",
    fields: [
      { name: "title", label: "Album title", type: "text", required: true, column: true, placeholder: "Riya & Arjun, Udaipur" },
      { name: "slug", label: "Slug (URL)", type: "text", help: "Leave empty to generate from the title" },
      { name: "eventType", label: "Event type", type: "select", options: EVENT_TYPES, required: true, column: true },
      { name: "location", label: "Location", type: "text", column: true, placeholder: "Udaipur, Rajasthan" },
      { name: "coupleNames", label: "Client / couple names", type: "text" },
      { name: "shootDate", label: "Shoot date", type: "date" },
      { name: "description", label: "Story", type: "textarea" },
      { name: "coverImage", label: "Cover image", type: "image", required: true },
      { name: "images", label: "Album photos", type: "images" },
      { name: "videoUrl", label: "Film link (YouTube / Vimeo)", type: "text", placeholder: "https://youtu.be/..." },
      { name: "featured", label: "Show on home page", type: "boolean", column: true },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first" },
    ],
  },
  packages: {
    key: "packages",
    label: "Packages",
    singular: "Package",
    titleField: "name",
    fields: [
      { name: "name", label: "Package name", type: "text", required: true, column: true, placeholder: "Royal Wedding Film" },
      { name: "eventType", label: "Event type", type: "select", options: EVENT_TYPES, column: true },
      { name: "price", label: "Price (₹)", type: "number", column: true },
      { name: "priceNote", label: "Price note", type: "text", placeholder: "for 2 days, 2 events" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "features", label: "Inclusions", type: "list", placeholder: "Drone coverage" },
      { name: "brochure", label: "Brochure / rate card (PDF)", type: "pdf" },
      { name: "highlighted", label: "Mark as most popular", type: "boolean", column: true },
      { name: "active", label: "Active", type: "boolean", column: true },
      { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first" },
    ],
  },
  gear: {
    key: "gear",
    label: "Gear & Drones",
    singular: "Gear item",
    titleField: "name",
    imageField: "image",
    fields: [
      { name: "name", label: "Name", type: "text", required: true, column: true, placeholder: "DJI Mavic 3 Cine" },
      { name: "category", label: "Category", type: "select", options: GEAR_CATEGORIES, required: true, column: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "image" },
      { name: "active", label: "Active", type: "boolean", column: true },
      { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first" },
    ],
  },
  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    titleField: "name",
    imageField: "avatar",
    fields: [
      { name: "name", label: "Client name", type: "text", required: true, column: true },
      { name: "eventType", label: "Event type", type: "select", options: EVENT_TYPES, column: true },
      { name: "location", label: "Location", type: "text" },
      { name: "message", label: "Review", type: "textarea", required: true },
      { name: "rating", label: "Rating (1-5)", type: "number", column: true },
      { name: "avatar", label: "Photo", type: "image" },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first" },
    ],
  },
  brochures: {
    key: "brochures",
    label: "Brochures (PDF)",
    singular: "Brochure",
    titleField: "title",
    imageField: "coverImage",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, column: true, placeholder: "Wedding Rate Card 2026" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "file", label: "PDF file", type: "pdf", required: true },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "published", label: "Published", type: "boolean", column: true },
      { name: "order", label: "Sort order", type: "number", help: "Lower numbers show first" },
    ],
  },
};

export const SETTINGS_FIELDS: Field[] = [
  { name: "siteName", label: "Studio name", type: "text" },
  { name: "tagline", label: "Tagline", type: "text" },
  { name: "heroTitle", label: "Hero title", type: "text" },
  { name: "heroSubtitle", label: "Hero subtitle", type: "textarea" },
  { name: "heroImages", label: "Hero slideshow images", type: "images" },
  { name: "aboutTitle", label: "About title", type: "text" },
  { name: "aboutText", label: "About text", type: "textarea" },
  { name: "aboutImage", label: "About image", type: "image" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "whatsapp", label: "WhatsApp number (with country code, digits only)", type: "text", placeholder: "919876543210" },
  { name: "email", label: "Email", type: "text" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "cities", label: "Cities we cover", type: "list", placeholder: "Jaipur" },
  { name: "instagram", label: "Instagram URL", type: "text" },
  { name: "youtube", label: "YouTube URL", type: "text" },
  { name: "facebook", label: "Facebook URL", type: "text" },
  { name: "statEvents", label: "Stat: events shot", type: "text", placeholder: "850+" },
  { name: "statCities", label: "Stat: cities", type: "text", placeholder: "40+" },
  { name: "statYears", label: "Stat: years", type: "text", placeholder: "10+" },
  { name: "statRating", label: "Stat: rating", type: "text", placeholder: "4.9/5" },
];

export function getResource(key: string) {
  return RESOURCES[key] ?? null;
}

export type MediaLike = {
  url: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw";
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  originalName?: string;
};

/** Collect every Cloudinary asset referenced by a document, based on the field config. */
export function collectMedia(fields: Field[], doc: Record<string, unknown> | null | undefined): MediaLike[] {
  if (!doc) return [];
  const out: MediaLike[] = [];
  for (const f of fields) {
    const v = doc[f.name];
    if (!v) continue;
    if (f.type === "images" && Array.isArray(v)) {
      out.push(...(v as MediaLike[]).filter((m) => m?.publicId));
    } else if ((f.type === "image" || f.type === "pdf") && (v as MediaLike).publicId) {
      out.push(v as MediaLike);
    }
  }
  return out;
}
