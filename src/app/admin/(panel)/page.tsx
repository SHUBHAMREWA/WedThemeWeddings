import Link from "next/link";
import { FileText, Images, Inbox, MessageSquareQuote, Package, Plane, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/admin/AdminShell";
import SeedButton from "@/components/admin/SeedButton";
import { connectDB, serialize } from "@/lib/db";
import { getInquiryModel, getModel } from "@/models";

type Lead = { _id: string; name: string; phone: string; eventType?: string; city?: string; createdAt: string; status: string };

async function getStats() {
  try {
    await connectDB();
    const keys = ["portfolio", "services", "packages", "gear", "testimonials", "brochures"] as const;
    const counts = await Promise.all(keys.map((k) => getModel(k).countDocuments()));
    const Inquiry = getInquiryModel();
    const [newLeads, totalLeads, recent] = await Promise.all([
      Inquiry.countDocuments({ status: "new" }),
      Inquiry.countDocuments(),
      Inquiry.find().sort({ createdAt: -1 }).limit(6).lean(),
    ]);
    return {
      ok: true as const,
      counts: Object.fromEntries(keys.map((k, i) => [k, counts[i]])) as Record<(typeof keys)[number], number>,
      newLeads,
      totalLeads,
      recent: serialize<Lead[]>(recent),
    };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message };
  }
}

export default async function Dashboard() {
  const stats = await getStats();
  if (!stats.ok) {
    return (
      <div className="card p-6 text-sm text-red-700">
        Could not connect to the database: {stats.error}. Check MONGODB_URI in .env.local.
      </div>
    );
  }
  const totalContent = Object.values(stats.counts).reduce((a, b) => a + b, 0);
  const cards = [
    { label: "New inquiries", value: stats.newLeads, sub: `${stats.totalLeads} total`, href: "/admin/inquiries", icon: Inbox, accent: true },
    { label: "Portfolio albums", value: stats.counts.portfolio, href: "/admin/portfolio", icon: Images },
    { label: "Services", value: stats.counts.services, href: "/admin/services", icon: Sparkles },
    { label: "Packages", value: stats.counts.packages, href: "/admin/packages", icon: Package },
    { label: "Gear & drones", value: stats.counts.gear, href: "/admin/gear", icon: Plane },
    { label: "Testimonials", value: stats.counts.testimonials, href: "/admin/testimonials", icon: MessageSquareQuote },
    { label: "Brochures", value: stats.counts.brochures, href: "/admin/brochures", icon: FileText },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your website content and leads." />

      {totalContent === 0 && (
        <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 border-brand-200 bg-brand-50 p-5">
          <div>
            <p className="font-bold text-ink">Your website has no content yet.</p>
            <p className="text-sm text-muted">Load sample services, albums, packages and reviews to see the design, then edit or replace them.</p>
          </div>
          <SeedButton />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, sub, href, icon: Icon, accent }) => (
          <Link key={label} href={href} className={`card flex items-center gap-4 p-5 transition hover:shadow-md ${accent ? "border-brand-200" : ""}`}>
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600"}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-black text-ink">{value}</p>
              <p className="text-sm text-muted">
                {label}
                {sub && <span className="block text-xs">{sub}</span>}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="font-bold text-ink">Latest inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm font-bold text-brand-600">
            View all
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="p-6 text-sm text-muted">No inquiries yet. They will appear here when visitors submit the contact form.</p>
        ) : (
          <ul className="divide-y divide-line">
            {stats.recent.map((l) => (
              <li key={l._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-bold text-ink">{l.name}</p>
                  <p className="text-muted">
                    {[l.eventType, l.city, l.phone].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="text-right text-xs text-muted">
                  <span className={`mb-1 inline-block rounded-full px-2 py-0.5 font-bold capitalize ${l.status === "new" ? "bg-brand-100 text-brand-700" : "bg-gray-100"}`}>
                    {l.status}
                  </span>
                  <p>{new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
