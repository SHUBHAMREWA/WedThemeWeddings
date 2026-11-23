import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { encryptSecret } from "@/lib/crypto";
import { isEmail, splitEmails } from "@/lib/mailer";
import { getMailConfigModel } from "@/models";

/** The app password is never sent back to the browser; only whether one is saved. */
function publicView(doc: Record<string, unknown> | null) {
  return {
    enabled: !!doc?.enabled,
    smtpHost: (doc?.smtpHost as string) || "smtp.gmail.com",
    smtpPort: (doc?.smtpPort as number) || 465,
    smtpUser: (doc?.smtpUser as string) || "",
    hasPassword: !!doc?.smtpPassEnc,
    fromName: (doc?.fromName as string) || "",
    notifyTo: (doc?.notifyTo as string) || "",
    sendConfirmation: doc?.sendConfirmation !== false,
  };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const doc = await getMailConfigModel().findOne({ key: "main" }).lean<Record<string, unknown>>();
  return NextResponse.json({ item: publicView(doc) });
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const smtpUser = str(b.smtpUser).toLowerCase();
  const notifyTo = str(b.notifyTo, 500);
  const port = Number(b.smtpPort) || 465;
  if (smtpUser && !isEmail(smtpUser)) return NextResponse.json({ error: "Sender email is not valid" }, { status: 400 });
  if (notifyTo && splitEmails(notifyTo).length === 0)
    return NextResponse.json({ error: "Enter at least one valid email to receive enquiries" }, { status: 400 });
  if (port < 1 || port > 65535) return NextResponse.json({ error: "SMTP port is not valid" }, { status: 400 });

  await connectDB();
  const Mail = getMailConfigModel();
  const before = await Mail.findOne({ key: "main" }).lean<Record<string, unknown>>();

  const set: Record<string, unknown> = {
    enabled: !!b.enabled,
    smtpHost: str(b.smtpHost) || "smtp.gmail.com",
    smtpPort: port,
    smtpUser,
    fromName: str(b.fromName, 100),
    notifyTo: splitEmails(notifyTo).join(", "),
    sendConfirmation: b.sendConfirmation !== false,
  };
  // Gmail shows app passwords in groups of 4 ("abcd efgh ijkl mnop"); spaces are not part of it.
  const pass = str(b.smtpPass, 200).replace(/\s+/g, "");
  if (pass) set.smtpPassEnc = encryptSecret(pass);
  const unset = b.clearPassword ? { smtpPassEnc: 1 } : undefined;
  if (unset) delete set.smtpPassEnc;

  const willHavePassword = unset ? false : !!(pass || before?.smtpPassEnc);
  if (set.enabled && (!smtpUser || !willHavePassword)) {
    return NextResponse.json({ error: "Add the sender email and app password before turning notifications on" }, { status: 400 });
  }

  const doc = await Mail.findOneAndUpdate(
    { key: "main" },
    { $set: set, ...(unset ? { $unset: unset } : {}) },
    { new: true, upsert: true }
  ).lean<Record<string, unknown>>();
  return NextResponse.json({ item: publicView(doc) });
}
