import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || "wedtheme";

export type ResourceType = "image" | "video" | "raw";

export type MediaAsset = {
  url: string;
  publicId?: string;
  resourceType?: ResourceType;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  originalName?: string;
};

/** Delete a single asset from Cloudinary. Safe to call for assets that no longer exist. */
export async function destroyAsset(publicId?: string, resourceType: ResourceType = "image") {
  if (!publicId) return { result: "skipped" };
  const res = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
  return res as { result: string };
}

export async function destroyAssets(assets: MediaAsset[]) {
  const results = await Promise.allSettled(
    assets.filter((a) => a?.publicId).map((a) => destroyAsset(a.publicId, a.resourceType || "image"))
  );
  return results;
}

export { cloudinary };
