import { notFound } from "next/navigation";
import ResourceList from "@/components/admin/ResourceList";
import { PageHeader } from "@/components/admin/AdminShell";
import { getResource } from "@/lib/resources";

export default async function ResourceIndex({ params }: PageProps<"/admin/[resource]">) {
  const { resource } = await params;
  const cfg = getResource(resource);
  if (!cfg) notFound();
  return (
    <>
      <PageHeader title={cfg.label} subtitle={`Add, edit and remove ${cfg.label.toLowerCase()} shown on the website.`} />
      <ResourceList cfg={cfg} />
    </>
  );
}
