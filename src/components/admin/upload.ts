"use client";

import type { MediaLike } from "@/lib/resources";

export const MAX_UPLOAD_MB = 10;

type SignResponse = {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
  resourceType: "image" | "raw";
  error?: string;
};

/** Upload a file straight from the browser to Cloudinary using a server-issued signature. */
export async function uploadToCloudinary(
  file: File,
  kind: "image" | "pdf",
  onProgress?: (percent: number) => void
): Promise<MediaLike> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`${file.name} is larger than ${MAX_UPLOAD_MB} MB`);
  }
  if (kind === "image" && !file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);
  if (kind === "pdf" && file.type !== "application/pdf") throw new Error(`${file.name} is not a PDF`);

  const signRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const sig = (await signRes.json()) as SignResponse;
  if (!signRes.ok) throw new Error(sig.error || "Could not start upload");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.error?.message || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });

  return {
    url: String(result.secure_url),
    publicId: String(result.public_id),
    resourceType: result.resource_type as MediaLike["resourceType"],
    format: (result.format as string) || (kind === "pdf" ? "pdf" : undefined),
    bytes: result.bytes as number,
    width: result.width as number | undefined,
    height: result.height as number | undefined,
    originalName: file.name,
  };
}

/** Permanently delete an asset from Cloudinary. */
export async function deleteFromCloudinary(asset: MediaLike) {
  if (!asset.publicId) return;
  const res = await fetch("/api/admin/upload/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId: asset.publicId, resourceType: asset.resourceType || "image" }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "Could not delete from Cloudinary");
  }
}

/** Small typed fetch helper for admin API calls. */
export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
  }
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json as T;
}
