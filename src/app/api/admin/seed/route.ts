import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getModel, getSettingsModel } from "@/models";
import { uniqueSlug } from "@/lib/content";
import { RESOURCES } from "@/lib/resources";
import { demoGear, demoPackages, demoPortfolio, demoServices, demoSettings, demoTestimonials } from "@/lib/demo";

const DATA: Record<string, Record<string, unknown>[]> = {
  services: demoServices,
  portfolio: demoPortfolio,
  packages: demoPackages,
  gear: demoGear,
  testimonials: demoTestimonials,
};

/** Loads demo content into every EMPTY collection. Never overwrites existing content. */
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();

  const created: Record<string, number> = {};
  for (const [key, rows] of Object.entries(DATA)) {
    const Model = getModel(key);
    if ((await Model.estimatedDocumentCount()) > 0) continue;
    for (const row of rows) {
      const doc = { ...row };
      if (RESOURCES[key].hasSlug) doc.slug = await uniqueSlug(Model, String(row[RESOURCES[key].titleField]));
      await Model.create(doc);
    }
    created[key] = rows.length;
  }

  const Settings = getSettingsModel();
  if (!(await Settings.exists({ key: "main" }))) {
    await Settings.create({ key: "main", ...demoSettings });
    created.settings = 1;
  }
  return NextResponse.json({ ok: true, created });
}
