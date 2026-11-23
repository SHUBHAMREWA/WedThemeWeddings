import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { cloudinary, CLOUDINARY_FOLDER } from "@/lib/cloudinary";
import { RESOURCES, SETTINGS_FIELDS, collectMedia } from "@/lib/resources";
import { getModel, getSettingsModel } from "@/models";

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  resource_type: "image" | "raw" | "video";
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
};

/** Every publicId referenced anywhere in the database. */
async function usedPublicIds() {
  await connectDB();
  const used = new Map<string, string>();
  for (const cfg of Object.values(RESOURCES)) {
    const docs = await getModel(cfg.key).find().lean<Record<string, unknown>[]>();
    for (const d of docs) {
      for (const m of collectMedia(cfg.fields, d)) {
        if (m.publicId) used.set(m.publicId, `${cfg.singular}: ${String(d[cfg.titleField] ?? "")}`);
      }
    }
  }
  const settings = await getSettingsModel().findOne({ key: "main" }).lean<Record<string, unknown>>();
  for (const m of collectMedia(SETTINGS_FIELDS, settings)) if (m.publicId) used.set(m.publicId, "Site settings");
  return used;
}

/** Lists files stored in this site's Cloudinary folder, marking which ones are in use. */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const type = req.nextUrl.searchParams.get("type") === "raw" ? "raw" : "image";
  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

  try {
    const [res, used] = await Promise.all([
      cloudinary.api.resources({
        type: "upload",
        resource_type: type,
        prefix: `${CLOUDINARY_FOLDER}/`,
        max_results: 60,
        next_cursor: cursor,
      }) as Promise<{ resources: CloudinaryResource[]; next_cursor?: string }>,
      usedPublicIds(),
    ]);

    const items = res.resources.map((r) => ({
      publicId: r.public_id,
      url: r.secure_url,
      resourceType: r.resource_type,
      format: r.format,
      bytes: r.bytes,
      width: r.width,
      height: r.height,
      createdAt: r.created_at,
      usedBy: used.get(r.public_id) ?? null,
    }));
    return NextResponse.json({ items, nextCursor: res.next_cursor ?? null });
  } catch (e) {
    const err = e as { message?: string; error?: { message?: string } };
    return NextResponse.json({ error: err.error?.message || err.message || "Cloudinary error" }, { status: 500 });
  }
}
