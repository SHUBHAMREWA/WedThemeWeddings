import "server-only";
import type { Field, MediaLike } from "./resources";
import { collectMedia } from "./resources";
import { destroyAssets } from "./cloudinary";
import { slugify } from "./utils";

function cleanMedia(v: unknown): MediaLike | undefined {
  if (!v || typeof v !== "object") return undefined;
  const m = v as MediaLike;
  if (!m.url || typeof m.url !== "string") return undefined;
  return {
    url: m.url,
    publicId: m.publicId,
    resourceType: m.resourceType || "image",
    format: m.format,
    bytes: m.bytes,
    width: m.width,
    height: m.height,
    originalName: m.originalName,
  };
}

/** Keep only known fields and coerce them into the right types. */
export function sanitize(fields: Field[], body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (!(f.name in body)) continue;
    const v = body[f.name];
    switch (f.type) {
      case "number": {
        const n = v === "" || v === null || v === undefined ? undefined : Number(v);
        out[f.name] = n === undefined || Number.isNaN(n) ? undefined : n;
        break;
      }
      case "boolean":
        out[f.name] = Boolean(v);
        break;
      case "date":
        out[f.name] = v ? new Date(String(v)) : undefined;
        break;
      case "list":
        out[f.name] = Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];
        break;
      case "image":
      case "pdf":
        out[f.name] = cleanMedia(v) ?? null;
        break;
      case "images":
        out[f.name] = Array.isArray(v) ? v.map(cleanMedia).filter(Boolean) : [];
        break;
      default:
        out[f.name] = typeof v === "string" ? v.trim() : v == null ? "" : String(v);
    }
  }
  return out;
}

export function validateRequired(fields: Field[], data: Record<string, unknown>) {
  for (const f of fields) {
    if (!f.required) continue;
    const v = data[f.name];
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    if (empty) return `${f.label} is required`;
  }
  return null;
}

/** Generate a unique slug for a model. */
export async function uniqueSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model: any,
  base: string,
  excludeId?: string
) {
  const root = slugify(base) || "item";
  let slug = root;
  let i = 2;
  while (await Model.exists(excludeId ? { slug, _id: { $ne: excludeId } } : { slug })) {
    slug = `${root}-${i++}`;
  }
  return slug;
}

/** Delete Cloudinary assets that were referenced before but are no longer referenced. */
export async function cleanupRemovedMedia(
  fields: Field[],
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
) {
  const keep = new Set(collectMedia(fields, after).map((m) => m.publicId));
  const removed = collectMedia(fields, before).filter((m) => !keep.has(m.publicId));
  if (removed.length) await destroyAssets(removed);
  return removed.length;
}
