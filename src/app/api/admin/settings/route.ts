import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { SETTINGS_FIELDS } from "@/lib/resources";
import { getSettingsModel } from "@/models";
import { cleanupRemovedMedia, sanitize } from "@/lib/content";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const item = (await getSettingsModel().findOne({ key: "main" }).lean()) ?? {};
  return NextResponse.json({ item });
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const Settings = getSettingsModel();
  const before = await Settings.findOne({ key: "main" }).lean<Record<string, unknown>>();

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = sanitize(SETTINGS_FIELDS, body);
  const unset: Record<string, 1> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) {
      unset[k] = 1;
      delete data[k];
    }
  }
  const item = await Settings.findOneAndUpdate(
    { key: "main" },
    { $set: data, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    { new: true, upsert: true }
  ).lean<Record<string, unknown>>();

  const deletedAssets = await cleanupRemovedMedia(SETTINGS_FIELDS, before, item);
  return NextResponse.json({ item, deletedAssets });
}
