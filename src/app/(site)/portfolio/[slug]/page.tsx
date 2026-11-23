import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import Gallery from "@/components/site/Gallery";
import { AlbumCard, PageBanner, SectionHeading } from "@/components/site/ui";
import { getAlbumBySlug, getAlbums } from "@/lib/data";
import { toEmbedUrl } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAlbumBySlug(slug);
  return a
    ? { title: a.title, description: a.description, openGraph: { images: a.coverImage?.url ? [a.coverImage.url] : [] } }
    : { title: "Album not found" };
}

export default async function AlbumPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();
  const more = (await getAlbums({ limit: 4 })).filter((a) => a._id !== album._id).slice(0, 3);
  const embed = toEmbedUrl(album.videoUrl);
  const images = album.images?.length ? album.images : album.coverImage ? [album.coverImage] : [];

  return (
    <>
      <PageBanner title={album.title} subtitle={album.eventType} image={album.coverImage?.url} />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Link href="/portfolio" className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to portfolio
        </Link>
        <div className="mb-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          {album.coupleNames && (
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-500" /> {album.coupleNames}</span>
          )}
          {album.location && (
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-500" /> {album.location}</span>
          )}
          {album.shootDate && (
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-500" />
              {new Date(album.shootDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
            </span>
          )}
        </div>
        {album.description && <p className="mb-10 max-w-3xl text-lg leading-relaxed text-ink">{album.description}</p>}

        {embed && (
          <div className="mb-12 aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe src={embed} title={album.title} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          </div>
        )}

        <Gallery images={images} title={album.title} />

        <div className="mt-14 rounded-2xl bg-blush p-8 text-center">
          <h2 className="font-display text-3xl text-ink">Love this story?</h2>
          <p className="mt-2 text-muted">Let us capture yours. Check our availability for your dates.</p>
          <Link href={`/contact?event=${encodeURIComponent(album.eventType)}`} className="btn-primary mt-5">
            Book your shoot
          </Link>
        </div>
      </section>

      {more.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <SectionHeading kicker="More stories" title="You might also like" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((a) => (
              <AlbumCard key={a._id} a={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
