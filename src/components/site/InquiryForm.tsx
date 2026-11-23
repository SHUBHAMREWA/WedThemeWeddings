"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { BUDGETS, EVENT_TYPES, SERVICE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function InquiryForm({
  cities = [],
  defaults = {},
  compact,
}: {
  cities?: string[];
  defaults?: { event?: string; city?: string; message?: string };
  compact?: boolean;
}) {
  const [services, setServices] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setError("");
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, services }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      setError(json.error || "Something went wrong. Please try again.");
      return;
    }
    form.reset();
    setServices([]);
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-line">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="font-display mt-4 text-2xl text-ink">Thank you!</h3>
        <p className="mt-2 text-muted">We have received your enquiry and will call you back within a few hours.</p>
        <button className="btn-outline mt-6" onClick={() => setStatus("idle")}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line md:p-8">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="iq-name">Your name *</label>
          <input id="iq-name" name="name" className="input" required placeholder="Full name" />
        </div>
        <div>
          <label className="label" htmlFor="iq-phone">Phone / WhatsApp *</label>
          <input id="iq-phone" name="phone" className="input" required placeholder="+91 98765 43210" inputMode="tel" />
        </div>
        <div>
          <label className="label" htmlFor="iq-email">Email</label>
          <input id="iq-email" name="email" type="email" className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="iq-event">Event type</label>
          <select id="iq-event" name="eventType" className="input" defaultValue={defaults.event || ""}>
            <option value="">Select</option>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="iq-date">Event date</label>
          <input id="iq-date" name="eventDate" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="iq-city">City / venue</label>
          <input id="iq-city" name="city" className="input" list="iq-cities" defaultValue={defaults.city || ""} placeholder="e.g. Udaipur" />
          <datalist id="iq-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        {!compact && (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="iq-budget">Budget</label>
            <select id="iq-budget" name="budget" className="input">
              <option value="">Select a range</option>
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <span className="label">Services you need</span>
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map((s) => {
              const on = services.includes(s);
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setServices((p) => (on ? p.filter((x) => x !== s) : [...p, s]))}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-bold transition",
                    on ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="iq-msg">Tell us about your event</label>
          <textarea
            id="iq-msg"
            name="message"
            className="input min-h-28"
            defaultValue={defaults.message || ""}
            placeholder="Number of days, functions, guest count, anything special..."
          />
        </div>
      </div>
      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn-primary mt-6 w-full py-3 text-base" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        Send enquiry
      </button>
      <p className="mt-3 text-center text-xs text-muted">We usually reply within 2 hours. Your details are never shared.</p>
    </form>
  );
}
