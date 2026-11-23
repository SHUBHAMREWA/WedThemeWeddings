import "server-only";
import { connectDB, serialize } from "./db";
import { getModel, getSettingsModel } from "@/models";
import { demoSettings } from "./demo";
import type { MediaLike } from "./resources";

export type Media = MediaLike;

export type Settings = typeof demoSettings & { heroImages: Media[]; aboutImage?: Media };

export type Service = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription?: string;
  description?: string;
  coverImage?: Media;
  gallery: Media[];
  startingPrice?: number;
  priceUnit?: string;
  features: string[];
  featured?: boolean;
};

export type Album = {
  _id: string;
  title: string;
  slug: string;
  eventType: string;
  location?: string;
  coupleNames?: string;
  shootDate?: string;
  description?: string;
  coverImage?: Media;
  images: Media[];
  videoUrl?: string;
  featured?: boolean;
};

export type Pkg = {
  _id: string;
  name: string;
  eventType?: string;
  price?: number;
  priceNote?: string;
  description?: string;
  features: string[];
  brochure?: Media;
  highlighted?: boolean;
};

export type Gear = { _id: string; name: string; category: string; description?: string; image?: Media };

export type Testimonial = {
  _id: string;
  name: string;
  eventType?: string;
  location?: string;
  message: string;
  rating?: number;
  avatar?: Media;
};

export type Brochure = { _id: string; title: string; description?: string; file?: Media; coverImage?: Media };

const SORT = { order: 1, createdAt: -1 } as const;

/** Run a DB query; if the database isn't reachable yet, log and fall back instead of crashing the site. */
async function safe<T>(fallback: T, fn: () => Promise<unknown>): Promise<T> {
  try {
    await connectDB();
    return serialize<T>(await fn());
  } catch (e) {
    console.error("[data]", (e as Error).message);
    return fallback;
  }
}

const EMPTY_SETTINGS: Settings = {
  ...demoSettings,
  heroImages: demoSettings.heroImages,
};

export async function getSettings(): Promise<Settings> {
  const doc = await safe<Partial<Settings> | null>(null, () =>
    getSettingsModel().findOne({ key: "main" }).lean()
  );
  if (!doc) return EMPTY_SETTINGS;
  const merged = { ...EMPTY_SETTINGS } as Record<string, unknown>;
  for (const [k, v] of Object.entries(doc)) {
    const empty = v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0);
    if (!empty) merged[k] = v;
  }
  return merged as Settings;
}

export const getServices = (opts: { featured?: boolean; limit?: number } = {}) =>
  safe<Service[]>([], () =>
    getModel("services")
      .find({ active: { $ne: false }, ...(opts.featured ? { featured: true } : {}) })
      .sort(SORT)
      .limit(opts.limit ?? 100)
      .lean()
  );

export const getServiceBySlug = (slug: string) =>
  safe<Service | null>(null, () => getModel("services").findOne({ slug, active: { $ne: false } }).lean());

export const getAlbums = (opts: { featured?: boolean; eventType?: string; limit?: number } = {}) =>
  safe<Album[]>([], () =>
    getModel("portfolio")
      .find({
        published: { $ne: false },
        ...(opts.featured ? { featured: true } : {}),
        ...(opts.eventType ? { eventType: opts.eventType } : {}),
      })
      .sort(SORT)
      .limit(opts.limit ?? 200)
      .lean()
  );

export const getAlbumBySlug = (slug: string) =>
  safe<Album | null>(null, () => getModel("portfolio").findOne({ slug, published: { $ne: false } }).lean());

export const getAlbumEventTypes = () =>
  safe<string[]>([], () => getModel("portfolio").distinct("eventType", { published: { $ne: false } }));

export const getPackages = () =>
  safe<Pkg[]>([], () => getModel("packages").find({ active: { $ne: false } }).sort(SORT).lean());

export const getGear = () =>
  safe<Gear[]>([], () => getModel("gear").find({ active: { $ne: false } }).sort(SORT).lean());

export const getTestimonials = () =>
  safe<Testimonial[]>([], () => getModel("testimonials").find({ published: { $ne: false } }).sort(SORT).lean());

export const getBrochures = () =>
  safe<Brochure[]>([], () => getModel("brochures").find({ published: { $ne: false } }).sort(SORT).lean());
