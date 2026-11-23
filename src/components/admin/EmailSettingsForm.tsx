"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2, Save, Send } from "lucide-react";

export type MailView = {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  hasPassword: boolean;
  fromName: string;
  notifyTo: string;
  sendConfirmation: boolean;
};

type Msg = { type: "ok" | "error"; text: string } | null;

export default function EmailSettingsForm({ initial }: { initial: MailView }) {
  const [v, setV] = useState(initial);
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [advanced, setAdvanced] = useState(initial.smtpHost !== "smtp.gmail.com" || initial.smtpPort !== 465);
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const [msg, setMsg] = useState<Msg>(null);

  const set = <K extends keyof MailView>(k: K, val: MailView[K]) => setV((s) => ({ ...s, [k]: val }));
  const payload = () => ({ ...v, smtpPass: pass });

  async function call(url: string, method: string, body: unknown) {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Something went wrong");
    return json;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    setMsg(null);
    try {
      const { item } = await call("/api/admin/email", "PUT", payload());
      setV(item);
      setPass("");
      setMsg({ type: "ok", text: item.enabled ? "Saved. Enquiry emails are on." : "Saved. Enquiry emails are off." });
    } catch (err) {
      setMsg({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function test() {
    setBusy("test");
    setMsg(null);
    try {
      const { to } = await call("/api/admin/email/test", "POST", payload());
      setMsg({ type: "ok", text: `Test email sent to ${to}. Check the inbox (and spam folder).` });
    } catch (err) {
      setMsg({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="card p-5 md:p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-brand-500"
            checked={v.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
          />
          <span>
            <span className="block font-bold text-ink">Send emails when someone sends an enquiry</span>
            <span className="text-sm text-muted">
              You get the enquiry details, and the customer gets a thank-you email with a copy of what they sent.
            </span>
          </span>
        </label>
      </div>

      <div className="card space-y-5 p-5 md:p-6">
        <div>
          <h2 className="text-lg font-black text-ink">Sender account</h2>
          <p className="text-sm text-muted">Emails are sent from this Gmail account.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="smtpUser">Gmail address</label>
            <input
              id="smtpUser"
              type="email"
              className="input"
              placeholder="wedtheme@gmail.com"
              value={v.smtpUser}
              onChange={(e) => set("smtpUser", e.target.value)}
              autoComplete="off"
            />
          </div>
          <div>
            <label className="label" htmlFor="smtpPass">App password</label>
            <div className="relative">
              <input
                id="smtpPass"
                type={showPass ? "text" : "password"}
                className="input pr-10"
                placeholder={v.hasPassword ? "Saved. Type a new one to change it" : "16-letter app password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 text-muted hover:text-ink"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {v.hasPassword && !pass && (
              <p className="mt-1 flex items-center gap-1 text-xs text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> App password saved (stored encrypted)
              </p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="fromName">Sender name</label>
            <input
              id="fromName"
              className="input"
              placeholder="WedTheme Weddings"
              value={v.fromName}
              onChange={(e) => set("fromName", e.target.value)}
            />
          </div>
        </div>

        <details className="rounded-lg bg-brand-50/60 p-4 text-sm" open={!v.hasPassword}>
          <summary className="cursor-pointer font-bold text-ink">How to get a Gmail app password</summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted">
            <li>Open your Google Account and go to <b>Security</b>.</li>
            <li>Turn on <b>2-Step Verification</b> (app passwords need it).</li>
            <li>Search for <b>App passwords</b> in the account search bar and open it.</li>
            <li>Type a name such as &quot;WedTheme website&quot; and click <b>Create</b>.</li>
            <li>Copy the 16-letter password and paste it above. Spaces are fine.</li>
          </ol>
          <p className="mt-3 text-muted">Do not use your normal Gmail password here. It will not work.</p>
        </details>

        <button type="button" className="text-sm font-bold text-brand-600 hover:underline" onClick={() => setAdvanced((a) => !a)}>
          {advanced ? "Hide" : "Show"} advanced settings (other email providers)
        </button>
        {advanced && (
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="smtpHost">SMTP server</label>
              <input id="smtpHost" className="input" value={v.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="smtpPort">Port</label>
              <input
                id="smtpPort"
                type="number"
                className="input"
                value={v.smtpPort}
                onChange={(e) => set("smtpPort", Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted">465 for SSL (Gmail default) or 587 for TLS.</p>
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-5 p-5 md:p-6">
        <div>
          <h2 className="text-lg font-black text-ink">Who gets the emails</h2>
        </div>
        <div>
          <label className="label" htmlFor="notifyTo">Send new enquiries to</label>
          <input
            id="notifyTo"
            className="input"
            placeholder={v.smtpUser || "wedtheme@gmail.com"}
            value={v.notifyTo}
            onChange={(e) => set("notifyTo", e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            Leave empty to use the Gmail address above. For more than one person, separate emails with commas.
          </p>
        </div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-brand-500"
            checked={v.sendConfirmation}
            onChange={(e) => set("sendConfirmation", e.target.checked)}
          />
          <span>
            <span className="block font-bold text-ink">Send a thank-you email to the customer</span>
            <span className="text-sm text-muted">Only when the customer fills in their email on the form.</span>
          </span>
        </label>
      </div>

      {msg && (
        <p className={msg.type === "ok" ? "rounded-md bg-green-50 p-3 text-sm text-green-800" : "rounded-md bg-red-50 p-3 text-sm text-red-700"}>
          {msg.text}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={!!busy}>
          {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
        <button type="button" className="btn-outline" onClick={test} disabled={!!busy}>
          {busy === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send test email
        </button>
      </div>
    </form>
  );
}
