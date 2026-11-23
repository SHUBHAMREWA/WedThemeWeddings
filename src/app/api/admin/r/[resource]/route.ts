import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getResource } from "@/lib/resources";
import { getModel } from "@/models";
import { sanitize, uniqueSlug, validateRequired } from "@/lib/content";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/admin/r/[resource]">) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const items = await getModel(resource).find().sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, ctx: RouteContext<"/api/admin/r/[resource]">) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { resource } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = sanitize(cfg.fields, body);
  const invalid = validateRequired(cfg.fields, data);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  for (const [k, v] of Object.entries(data)) if (v === null || v === undefined) delete data[k];

  await connectDB();
  const Model = getModel(resource);
  if (cfg.hasSlug) {
    data.slug = await uniqueSlug(Model, String(data.slug || data[cfg.titleField] || ""));
  }
  const item = await Model.create(data);
  return NextResponse.json({ item }, { status: 201 });
}
