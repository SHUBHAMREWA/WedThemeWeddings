import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ArrowLeft } from "lucide-react";
import ResourceForm from "@/components/admin/ResourceForm";
import { PageHeader } from "@/components/admin/AdminShell";
import { getResource } from "@/lib/resources";
import { connectDB, serialize } from "@/lib/db";
import { getModel } from "@/models";

export default async function EditResource({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource, id } = await params;
  const cfg = getResource(resource);
  if (!cfg || !isValidObjectId(id)) notFound();

  await connectDB();
  const doc = await getModel(resource).findById(id).lean();
  if (!doc) notFound();
  const item = serialize<Record<string, unknown> & { slug?: string }>(doc);

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={`/admin/${cfg.key}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> {cfg.label}
      </Link>
      <PageHeader title={`Edit ${cfg.singular}`} subtitle={String(item[cfg.titleField] ?? "")} />
      <ResourceForm
        key={id}
        fields={cfg.fields}
        item={item}
        saveUrl={`/api/admin/r/${cfg.key}/${id}`}
        method="PUT"
        backHref={`/admin/${cfg.key}`}
        publicHref={cfg.publicPath && item.slug ? `${cfg.publicPath}${item.slug}` : undefined}
      />
    </div>
  );
}
