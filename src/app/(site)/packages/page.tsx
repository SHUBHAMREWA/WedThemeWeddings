import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FileDown, FileText } from "lucide-react";
import { PackageCard, PageBanner, SectionHeading } from "@/components/site/ui";
import { getBrochures, getPackages } from "@/lib/data";
import { formatBytes } from "@/lib/utils";
import { IMG } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Packages & Pricing",
  description: "Wedding photography and cinematography packages with drone coverage. Download our brochures and rate cards.",
};

export default async function PackagesPage() {
  const [packages, brochures] = await Promise.all([getPackages(), getBrochures()]);
  const groups = packages.reduce<Record<string, typeof packages>>((acc, p) => {
    const k = p.eventType || "Packages";
    (acc[k] ||= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <PageBanner
        title="Packages & Pricing"
        subtitle="Clear pricing for photography, films and drone coverage. Every package can be customised."
        image={`https://images.unsplash.com/photo-${IMG.ceremony}?auto=format&fit=crop&w=1800&q=80`}
      />

      <section className="mx-auto max-w-7xl px-4 py-14">
        {packages.length === 0 && (
          <SectionHeading title="Custom quotes" subtitle="Our packages are being updated. Send us your dates for a personalised quote." />
        )}
        {Object.entries(groups).map(([group, list]) => (
          <div key={group} className="mb-16 last:mb-0">
            <SectionHeading kicker="Packages" title={`${group} packages`} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <PackageCard key={p._id} p={p} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {brochures.length > 0 && (
        <section className="bg-blush py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading kicker="Downloads" title="Brochures & rate cards" subtitle="Download our detailed brochures as PDF." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brochures.map((b) => (
                <div key={b._id} className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line">
                  <div className="relative aspect-[16/9] bg-brand-50">
                    {b.coverImage?.url ? (
                      <Image src={b.coverImage.url} alt={b.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FileText className="h-14 w-14 text-brand-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-ink">{b.title}</h3>
                    {b.description && <p className="mt-1 flex-1 text-sm text-muted">{b.description}</p>}
                    {b.file?.url && (
                      <a href={b.file.url} target="_blank" rel="noreferrer" className="btn-primary mt-4">
                        <FileDown className="h-4 w-4" /> Download PDF {b.file.bytes ? `(${formatBytes(b.file.bytes)})` : ""}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-14 text-center">
        <h2 className="font-display text-3xl text-ink">Need something different?</h2>
        <p className="mt-2 text-muted">Destination weddings, multi-city events or just a drone add-on? We will build a package around you.</p>
        <Link href="/contact" className="btn-primary mt-6">Get a custom quote</Link>
      </section>
    </>
  );
}
