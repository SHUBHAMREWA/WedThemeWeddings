import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { destroyAsset, CLOUDINARY_FOLDER, type ResourceType } from "@/lib/cloudinary";

/** Permanently delete an asset from Cloudinary. */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { publicId, resourceType } = (await req.json().catch(() => ({}))) as {
    publicId?: string;
    resourceType?: ResourceType;
  };
  if (!publicId) return NextResponse.json({ error: "publicId is required" }, { status: 400 });
  if (!publicId.startsWith(`${CLOUDINARY_FOLDER}/`)) {
    return NextResponse.json({ error: "Only assets uploaded by this site can be deleted" }, { status: 403 });
  }
  try {
    const result = await destroyAsset(publicId, resourceType || "image");
    return NextResponse.json({ ok: true, result: result.result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
