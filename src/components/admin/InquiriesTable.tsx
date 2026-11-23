"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { INQUIRY_STATUSES } from "@/lib/constants";
import { api } from "./upload";

type Inquiry = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  eventType?: string;
  eventDate?: string;
  city?: string;
  budget?: string;
  services?: string[];
  message?: string;
  status: string;
  notes?: string;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-brand-100 text-brand-700",
  contacted: "bg-amber-100 text-amber-800",
  booked: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
};

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function InquiriesTable() {
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(null);
    try {
      const res = await api<{ items: Inquiry[] }>(`/api/admin/inquiries${filter ? `?status=${filter}` : ""}`);
      setItems(res.items);
    } catch (e) {
      setError((e as Error).message);
      setItems([]);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function update(id: string, patch: Partial<Inquiry>) {
    setBusy(id);
    try {
      const res = await api<{ item: Inquiry }>(`/api/admin/inquiries/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setItems((prev) => prev?.map((x) => (x._id === id ? res.item : x)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this inquiry? This cannot be undone.")) return;
    setBusy(id);
    try {
      await api(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      setItems((prev) => prev?.filter((x) => x._id !== id) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", ...INQUIRY_STATUSES].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize ${
              filter === s ? "bg-brand-500 text-white" : "bg-white text-muted ring-1 ring-line hover:text-brand-600"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {items === null ? (
        <div className="card p-10 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">No inquiries here yet.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((it) => {
            const wa = it.phone.replace(/\D/g, "");
            return (
              <div key={it._id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-bold text-ink">{it.name}</p>
                    <p className="text-xs text-muted">Received {fmt(it.createdAt)}</p>
                  </div>
                  <select
                    value={it.status}
                    disabled={busy === it._id}
                    onChange={(e) => update(it._id, { status: e.target.value })}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-bold capitalize outline-none ${STATUS_STYLE[it.status]}`}
                  >
                    {INQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Event", it.eventType],
                    ["Date", fmt(it.eventDate)],
                    ["City", it.city],
                    ["Budget", it.budget],
                  ].map(([k, v]) =>
                    v ? (
                      <div key={k}>
                        <dt className="text-xs text-muted">{k}</dt>
                        <dd className="font-bold text-ink">{v}</dd>
                      </div>
                    ) : null
                  )}
                </dl>
                {it.services && it.services.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {it.services.map((s) => (
                      <span key={s} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {it.message && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-ink">{it.message}</p>}

                <textarea
                  className="input mt-3 min-h-16 text-xs"
                  placeholder="Private notes (saved when you click outside)"
                  defaultValue={it.notes}
                  onBlur={(e) => e.target.value !== (it.notes || "") && update(it._id, { notes: e.target.value })}
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`tel:${it.phone}`} className="btn-outline px-3 py-1.5">
                    <Phone className="h-4 w-4" /> {it.phone}
                  </a>
                  <a href={`https://wa.me/${wa.length === 10 ? `91${wa}` : wa}`} target="_blank" rel="noreferrer" className="btn-outline px-3 py-1.5">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                  {it.email && (
                    <a href={`mailto:${it.email}`} className="btn-outline px-3 py-1.5">
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  )}
                  <button onClick={() => remove(it._id)} disabled={busy === it._id} className="btn-ghost ml-auto px-3 py-1.5 text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
