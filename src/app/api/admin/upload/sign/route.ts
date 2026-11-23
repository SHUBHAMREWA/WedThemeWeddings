import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { cloudinary, CLOUDINARY_FOLDER } from "@/lib/cloudinary";

/**
 * Returns a signature so the browser can upload directly to Cloudinary
 * (no file size limits from our own server).
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { kind } = (await req.json().catch(() => ({}))) as { kind?: "image" | "pdf" };
  const secret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!secret || !apiKey || !cloudName) {
    return NextResponse.json({ error: "Cloudinary is not configured. Check your .env.local" }, { status: 500 });
  }

  const folder = `${CLOUDINARY_FOLDER}/${kind === "pdf" ? "documents" : "images"}`;
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, secret);

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey,
    cloudName,
    // PDFs are stored as "raw" so they can always be downloaded/viewed directly.
    resourceType: kind === "pdf" ? "raw" : "image",
  });
}
