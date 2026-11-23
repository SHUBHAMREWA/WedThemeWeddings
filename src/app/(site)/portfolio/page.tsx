import type { Metadata } from "next";
import Link from "next/link";
import { AlbumCard, PageBanner, SectionHeading } from "@/components/site/ui";
import { getAlbumEventTypes, getAlbums } from "@/lib/data";
import { cn } from "@/lib/utils";
import { IMG } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Wedding, pre-wedding, haldi, mehendi, birthday and corporate event albums and films.",
};

export default async function PortfolioPage({ searchParams }: PageProps<"/portfolio">) {
  const { type } = await searchParams;
  const active = typeof type === "string" ? type : "";
  const [albums, types] = await Promise.all([getAlbums({ eventType: active || undefined }), getAlbumEventTypes()]);

  return (
    <>
      <PageBanner
        title="Portfolio"
        subtitle="Real weddings and events, photographed and filmed by our team."
        image={`https://images.unsplash.com/photo-${IMG.wedding7}?auto=format&fit=crop&w=1800&q=80`}
      />
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto pb-1">
          <Link href="/portfolio" className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-bold", !active ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}>
            All
          </Link>
          {types.sort().map((t) => (
            <Link
              key={t}
              href={`/portfolio?type=${encodeURIComponent(t)}`}
              className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-bold", active === t ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100")}
            >
              {t}
            </Link>
          ))}
        </div>

        {albums.length === 0 ? (
          <SectionHeading
            title={active ? `No ${active} albums yet` : "Albums coming soon"}
            subtitle="We are curating our latest work. Ask us for a full sample gallery on WhatsApp."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => (
              <AlbumCard key={a._id} a={a} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
