import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner, SectionHeading, ServiceCard } from "@/components/site/ui";
import { getServices } from "@/lib/data";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { IMG } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Services",
  description: "Candid wedding photography, cinematography, drone shoots, pre-wedding shoots, albums and live streaming.",
};

export default async function ServicesPage({ searchParams }: PageProps<"/services">) {
  const { category } = await searchParams;
  const active = typeof category === "string" ? category : "";
  const all = await getServices();
  const list = active ? all.filter((s) => s.category === active) : all;
  const cats = SERVICE_CATEGORIES.filter((c) => all.some((s) => s.category === c));

  return (
    <>
      <PageBanner
        title="Our Services"
        subtitle="Photography, cinematography and drone coverage for weddings and every kind of event."
        image={`https://images.unsplash.com/photo-${IMG.camera1}?auto=format&fit=crop&w=1800&q=80`}
      />
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto pb-1">
          <Link href="/services" className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-bold", !active ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}>
            All services
          </Link>
          {cats.map((c) => (
            <Link
              key={c}
              href={`/services?category=${encodeURIComponent(c)}`}
              className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-bold", active === c ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}
            >
              {c}
            </Link>
          ))}
        </div>
        {list.length === 0 ? (
          <SectionHeading title="Services coming soon" subtitle="We are updating this section. Contact us for a custom quote in the meantime." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <ServiceCard key={s._id} s={s} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
