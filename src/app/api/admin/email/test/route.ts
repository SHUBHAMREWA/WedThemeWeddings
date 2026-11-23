import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getMailConfig, isEmail, sendTestEmail, splitEmails } from "@/lib/mailer";

/**
 * Sends a test email using the values currently in the form.
 * A blank password field means "use the saved one".
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const saved = await getMailConfig();
  const smtpUser = str(b.smtpUser).toLowerCase();
  const smtpPass = str(b.smtpPass).replace(/\s+/g, "") || saved?.smtpPass || "";
  if (!isEmail(smtpUser) || !smtpPass) {
    return NextResponse.json({ error: "Enter the sender email and app password first" }, { status: 400 });
  }
  const to = splitEmails(str(b.notifyTo))[0] || smtpUser;

  try {
    await sendTestEmail(
      {
        enabled: true,
        smtpHost: str(b.smtpHost) || "smtp.gmail.com",
        smtpPort: Number(b.smtpPort) || 465,
        smtpUser,
        smtpPass,
        fromName: str(b.fromName),
        notifyTo: [to],
        sendConfirmation: false,
      },
      to
    );
    return NextResponse.json({ ok: true, to });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
