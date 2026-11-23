import { NextResponse, type NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { collectMedia, getResource } from "@/lib/resources";
import { getModel } from "@/models";
import { cleanupRemovedMedia, sanitize, uniqueSlug, validateRequired } from "@/lib/content";
import { destroyAssets } from "@/lib/cloudinary";

type Ctx = RouteContext<"/api/admin/r/[resource]/[id]">;

async function load(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg || !isValidObjectId(id)) return null;
  await connectDB();
  return { cfg, Model: getModel(resource), id };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const r = await load(ctx);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const item = await r.Model.findById(r.id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const r = await load(ctx);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { cfg, Model, id } = r;

  const before = await Model.findById(id).lean<Record<string, unknown>>();
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = sanitize(cfg.fields, body);
  const invalid = validateRequired(cfg.fields, { ...before, ...data });
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  if (cfg.hasSlug) {
    const base = String(data.slug || before.slug || data[cfg.titleField] || before[cfg.titleField] || "");
    data.slug = await uniqueSlug(Model, base, id);
  }

  // Fields that were cleared are removed from the document
  const unset: Record<string, 1> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) {
      unset[k] = 1;
      delete data[k];
    }
  }

  const item = await Model.findByIdAndUpdate(
    id,
    { $set: data, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    { new: true, runValidators: true }
  ).lean<Record<string, unknown>>();

  // Any image or PDF removed in this edit is deleted from Cloudinary as well.
  const deletedAssets = await cleanupRemovedMedia(cfg.fields, before, item);
  return NextResponse.json({ item, deletedAssets });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const r = await load(ctx);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const item = await r.Model.findByIdAndDelete(r.id).lean<Record<string, unknown>>();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove every image and PDF of this item from Cloudinary.
  const media = collectMedia(r.cfg.fields, item);
  await destroyAssets(media);
  return NextResponse.json({ ok: true, deletedAssets: media.length });
}
