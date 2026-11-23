import EmailSettingsForm, { type MailView } from "@/components/admin/EmailSettingsForm";
import { PageHeader } from "@/components/admin/AdminShell";
import { connectDB } from "@/lib/db";
import { getMailConfigModel } from "@/models";

export const dynamic = "force-dynamic";

export default async function EmailSettingsPage() {
  await connectDB();
  const doc = await getMailConfigModel().findOne({ key: "main" }).lean<Record<string, unknown>>();
  const initial: MailView = {
    enabled: !!doc?.enabled,
    smtpHost: (doc?.smtpHost as string) || "smtp.gmail.com",
    smtpPort: (doc?.smtpPort as number) || 465,
    smtpUser: (doc?.smtpUser as string) || "",
    hasPassword: !!doc?.smtpPassEnc,
    fromName: (doc?.fromName as string) || "",
    notifyTo: (doc?.notifyTo as string) || "",
    sendConfirmation: doc?.sendConfirmation !== false,
  };
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Email notifications" subtitle="Get an email for every new enquiry and send customers a thank-you email." />
      <EmailSettingsForm initial={initial} />
    </div>
  );
}
