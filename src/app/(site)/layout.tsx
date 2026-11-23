import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <Header siteName={s.siteName} phone={s.phone} email={s.email} />
      <main className="flex-1">{children}</main>
      <Footer s={s} />
      <WhatsAppButton number={s.whatsapp} />
    </>
  );
}
