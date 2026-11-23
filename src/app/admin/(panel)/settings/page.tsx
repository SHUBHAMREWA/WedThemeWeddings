import ResourceForm from "@/components/admin/ResourceForm";
import { PageHeader } from "@/components/admin/AdminShell";
import { SETTINGS_FIELDS } from "@/lib/resources";
import { connectDB, serialize } from "@/lib/db";
import { getSettingsModel } from "@/models";

export default async function SettingsPage() {
  await connectDB();
  const doc = await getSettingsModel().findOne({ key: "main" }).lean();
  const item = doc ? serialize<Record<string, unknown>>(doc) : null;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Site settings" subtitle="Studio details, hero slideshow, about section, contact info and social links." />
      <ResourceForm fields={SETTINGS_FIELDS} item={item} saveUrl="/api/admin/settings" method="PUT" publicHref="/" />
    </div>
  );
}
