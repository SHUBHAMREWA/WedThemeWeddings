import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ResourceForm from "@/components/admin/ResourceForm";
import { PageHeader } from "@/components/admin/AdminShell";
import { getResource } from "@/lib/resources";

export default async function NewResource({ params }: PageProps<"/admin/[resource]/new">) {
  const { resource } = await params;
  const cfg = getResource(resource);
  if (!cfg) notFound();
  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/admin/${cfg.key}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> {cfg.label}
      </Link>
      <PageHeader title={`New ${cfg.singular}`} />
      <ResourceForm
        fields={cfg.fields}
        saveUrl={`/api/admin/r/${cfg.key}`}
        method="POST"
        backHref={`/admin/${cfg.key}`}
        redirectTo={`/admin/${cfg.key}/{id}`}
      />
    </div>
  );
}
