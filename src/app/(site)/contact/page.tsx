import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import InquiryForm from "@/components/site/InquiryForm";
import { PageBanner } from "@/components/site/ui";
import { getSettings } from "@/lib/data";
import { IMG } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Contact & Booking",
  description: "Check availability and get a quote for wedding photography, cinematography and drone coverage.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
  const s = await getSettings();
  const pkg = one(sp.package);

  const items = [
    s.phone && { icon: Phone, label: "Call us", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    s.whatsapp && { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` },
    s.email && { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s.address && { icon: MapPin, label: "Studio", value: s.address },
    { icon: Clock, label: "Hours", value: "Mon to Sun, 10am to 8pm" },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <>
      <PageBanner
        title="Book your shoot"
        subtitle="Tell us about your event and we will get back with availability and a custom quote."
        image={`https://images.unsplash.com/photo-${IMG.couple4}?auto=format&fit=crop&w=1800&q=80`}
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          {items.map(({ icon: Icon, label, value, href }) => {
            const body = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
                  <p className="font-bold text-ink">{value}</p>
                </div>
              </>
            );
            return href ? (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-xl p-4 ring-1 ring-line transition hover:ring-brand-300">
                {body}
              </a>
            ) : (
              <div key={label} className="flex items-center gap-4 rounded-xl p-4 ring-1 ring-line">
                {body}
              </div>
            );
          })}
          {s.cities?.length > 0 && (
            <div className="rounded-xl bg-blush p-5">
              <p className="font-bold text-ink">Cities we cover</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.cities.map((c) => (
                  <span key={c} className="rounded-full bg-white px-3 py-1 text-sm text-brand-700 ring-1 ring-brand-100">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <InquiryForm
          cities={s.cities}
          defaults={{
            event: one(sp.event),
            city: one(sp.city),
            message: pkg ? `I am interested in the ${pkg} package.` : "",
          }}
        />
      </section>
    </>
  );
}
