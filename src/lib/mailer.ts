import "server-only";
import nodemailer from "nodemailer";
import { connectDB } from "./db";
import { decryptSecret } from "./crypto";
import { getSettings } from "./data";
import { getMailConfigModel } from "@/models";

export type MailConfig = {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  notifyTo: string[];
  sendConfirmation: boolean;
};

export type InquiryMail = {
  name: string;
  phone: string;
  email?: string;
  eventType?: string;
  eventDate?: Date;
  city?: string;
  budget?: string;
  services?: string[];
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (v?: string) => !!v && EMAIL_RE.test(v);

export function splitEmails(v?: string) {
  return (v || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(isEmail);
}

export async function getMailConfig(): Promise<MailConfig | null> {
  await connectDB();
  const doc = await getMailConfigModel().findOne({ key: "main" }).lean<Record<string, unknown>>();
  if (!doc) return null;
  const smtpUser = String(doc.smtpUser || "");
  return {
    enabled: !!doc.enabled,
    smtpHost: String(doc.smtpHost || "smtp.gmail.com"),
    smtpPort: Number(doc.smtpPort) || 465,
    smtpUser,
    smtpPass: decryptSecret(doc.smtpPassEnc as string),
    fromName: String(doc.fromName || ""),
    notifyTo: splitEmails(doc.notifyTo as string).length ? splitEmails(doc.notifyTo as string) : [smtpUser].filter(isEmail),
    sendConfirmation: doc.sendConfirmation !== false,
  };
}

function transporter(cfg: MailConfig) {
  return nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort,
    secure: cfg.smtpPort === 465,
    auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

/* ---------------- Templates ---------------- */

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fmtDate = (d?: Date) =>
  d && !isNaN(d.getTime()) ? d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";

function layout(siteName: string, title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;color:#222">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#e72e77;padding:22px 28px;color:#fff">
<div style="font-family:Georgia,serif;font-size:24px;font-weight:bold">${esc(siteName)}</div>
<div style="font-size:14px;opacity:.9;margin-top:4px">${esc(title)}</div></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#fafafa;font-size:12px;color:#888;border-top:1px solid #eee">
${esc(siteName)} · Wedding & event photography, cinematography and drone shoots</td></tr>
</table></td></tr></table></body></html>`;
}

function detailRows(q: InquiryMail) {
  const rows: [string, string][] = [
    ["Name", q.name],
    ["Phone", q.phone],
    ["Email", q.email || ""],
    ["Event", q.eventType || ""],
    ["Event date", fmtDate(q.eventDate)],
    ["City", q.city || ""],
    ["Budget", q.budget || ""],
    ["Services", (q.services || []).join(", ")],
  ];
  const tr = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#777;width:120px;font-size:14px">${esc(k)}</td>` +
        `<td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;font-weight:bold">${esc(v)}</td></tr>`
    )
    .join("");
  const msg = q.message
    ? `<p style="margin:18px 0 6px;color:#777;font-size:14px">Message</p><div style="background:#fdf0f5;border-radius:8px;padding:12px 14px;font-size:14px;white-space:pre-wrap">${esc(q.message)}</div>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;border-radius:8px">${tr}</table>${msg}`;
}

function detailText(q: InquiryMail) {
  return [
    `Name: ${q.name}`,
    `Phone: ${q.phone}`,
    q.email && `Email: ${q.email}`,
    q.eventType && `Event: ${q.eventType}`,
    fmtDate(q.eventDate) && `Event date: ${fmtDate(q.eventDate)}`,
    q.city && `City: ${q.city}`,
    q.budget && `Budget: ${q.budget}`,
    q.services?.length && `Services: ${q.services.join(", ")}`,
    q.message && `\nMessage:\n${q.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ---------------- Senders ---------------- */

/**
 * Sends the "new enquiry" email to the studio and a confirmation to the customer.
 * Never throws: an email problem must not lose the enquiry, which is already saved.
 */
export async function sendInquiryEmails(q: InquiryMail) {
  try {
    const cfg = await getMailConfig();
    if (!cfg?.enabled || !cfg.smtpUser || !cfg.smtpPass) return { skipped: true };
    const s = await getSettings();
    const siteName = cfg.fromName || s.siteName || "WedTheme Weddings";
    const from = { name: siteName, address: cfg.smtpUser };
    const t = transporter(cfg);
    const jobs: Promise<unknown>[] = [];

    if (cfg.notifyTo.length) {
      const subject = `New enquiry: ${q.name}${q.eventType ? ` · ${q.eventType}` : ""}${q.city ? ` · ${q.city}` : ""}`;
      const waDigits = q.phone.replace(/\D/g, "");
      const actions = `<p style="margin:22px 0 0">
<a href="tel:${esc(q.phone.replace(/\s/g, ""))}" style="display:inline-block;background:#e72e77;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold;font-size:14px;margin-right:8px">Call ${esc(q.name)}</a>
<a href="https://wa.me/${waDigits.length === 10 ? `91${waDigits}` : waDigits}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:bold;font-size:14px">WhatsApp</a></p>`;
      jobs.push(
        t.sendMail({
          from,
          to: cfg.notifyTo,
          replyTo: isEmail(q.email) ? { name: q.name, address: q.email! } : undefined,
          subject,
          text: `New enquiry from the website\n\n${detailText(q)}`,
          html: layout(
            siteName,
            "New enquiry from the website",
            `<p style="margin:0 0 16px;font-size:15px">You have a new enquiry. Reply to this email to answer ${esc(q.name)} directly.</p>${detailRows(q)}${actions}`
          ),
        })
      );
    }

    if (cfg.sendConfirmation && isEmail(q.email)) {
      const contact = [
        s.phone && `Phone / WhatsApp: <a href="tel:${esc(s.phone.replace(/\s/g, ""))}" style="color:#e72e77">${esc(s.phone)}</a>`,
        s.email && `Email: <a href="mailto:${esc(s.email)}" style="color:#e72e77">${esc(s.email)}</a>`,
        s.address && `Office: ${esc(s.address)}`,
      ]
        .filter(Boolean)
        .join("<br>");
      jobs.push(
        t.sendMail({
          from,
          to: { name: q.name, address: q.email! },
          replyTo: isEmail(s.email) ? s.email : cfg.notifyTo[0],
          subject: `We received your enquiry · ${siteName}`,
          text:
            `Hi ${q.name},\n\nThank you for contacting ${siteName}. We have received your enquiry and our team will call you shortly.\n\n` +
            `Your details:\n${detailText(q)}\n\n${s.phone ? `Phone / WhatsApp: ${s.phone}\n` : ""}${s.email ? `Email: ${s.email}\n` : ""}\nWarm regards,\n${siteName}`,
          html: layout(
            siteName,
            "Thank you for your enquiry",
            `<p style="margin:0 0 12px;font-size:16px">Hi ${esc(q.name)},</p>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6">Thank you for contacting <b>${esc(siteName)}</b>. We have received your enquiry and our team will call you shortly to talk about your celebration.</p>
<p style="margin:0 0 8px;color:#777;font-size:14px">Here is what you shared with us:</p>${detailRows(q)}
${contact ? `<p style="margin:22px 0 0;font-size:14px;line-height:1.7">${contact}</p>` : ""}
<p style="margin:22px 0 0;font-size:15px">Warm regards,<br><b>${esc(siteName)}</b></p>`
          ),
        })
      );
    }

    const results = await Promise.allSettled(jobs);
    const failed = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
    failed.forEach((f) => console.error("[mail] send failed:", (f.reason as Error)?.message));
    return { sent: results.length - failed.length, failed: failed.length };
  } catch (e) {
    console.error("[mail]", (e as Error).message);
    return { error: (e as Error).message };
  }
}

/** Used by the admin "Send test email" button. Throws with a readable message on failure. */
export async function sendTestEmail(cfg: MailConfig, to: string) {
  const t = transporter(cfg);
  try {
    await t.verify();
  } catch (e) {
    const msg = (e as Error).message || "";
    if (/535|Invalid login|Username and Password not accepted|BadCredentials/i.test(msg)) {
      throw new Error("Login failed. Check the email and use a Gmail App Password (not your normal password).");
    }
    throw new Error(`Could not connect to the mail server: ${msg}`);
  }
  const siteName = cfg.fromName || "WedTheme Weddings";
  await t.sendMail({
    from: { name: siteName, address: cfg.smtpUser },
    to,
    subject: `Test email · ${siteName}`,
    text: "Email notifications are working. New website enquiries will arrive at this address.",
    html: layout(
      siteName,
      "Test email",
      `<p style="margin:0;font-size:15px;line-height:1.6">Email notifications are working. New website enquiries will arrive at this address, and customers who leave an email will get a confirmation.</p>`
    ),
  });
}
