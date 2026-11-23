"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Loader2, Plus, Save, X } from "lucide-react";
import type { Field, MediaLike } from "@/lib/resources";
import { collectMedia } from "@/lib/resources";
import { ImageField, ImagesField, PdfField, type RemoveCtx } from "./MediaFields";
import { api, deleteFromCloudinary } from "./upload";

type Values = Record<string, unknown>;

function initialValues(fields: Field[], item?: Values | null): Values {
  const v: Values = {};
  for (const f of fields) {
    const cur = item?.[f.name];
    switch (f.type) {
      case "boolean":
        v[f.name] = cur ?? (f.name === "active" || f.name === "published");
        break;
      case "list":
      case "images":
        v[f.name] = Array.isArray(cur) ? cur : [];
        break;
      case "date":
        v[f.name] = cur ? String(cur).slice(0, 10) : "";
        break;
      case "number":
        v[f.name] = cur ?? "";
        break;
      case "image":
      case "pdf":
        v[f.name] = cur ?? null;
        break;
      default:
        v[f.name] = cur ?? "";
    }
  }
  return v;
}

function ListField({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex gap-2">
        <input
          className="input"
          value={draft}
          placeholder={placeholder || "Type and press Enter"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-outline px-3" onClick={add}>
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((item, i) => (
            <li key={item + i} className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">
              {item}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-brand-100"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={`Remove ${item}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ResourceForm({
  fields,
  item,
  saveUrl,
  method,
  backHref,
  redirectTo,
  publicHref,
}: {
  fields: Field[];
  item?: Values | null;
  saveUrl: string;
  method: "POST" | "PUT";
  backHref?: string;
  /** Where to go after creating. "{id}" is replaced with the new id. */
  redirectTo?: string;
  publicHref?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => initialValues(fields, item));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(collectMedia(fields, item).map((m) => m.publicId!))
  );
  // Files uploaded in this session that are not saved yet
  const sessionUploads = useRef<Map<string, MediaLike>>(new Map());

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (sessionUploads.current.size) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const ctx: RemoveCtx = useMemo(
    () => ({
      savedIds,
      onSessionUpload: (m) => m.publicId && sessionUploads.current.set(m.publicId, m),
      onSessionDelete: (m) => m.publicId && sessionUploads.current.delete(m.publicId),
    }),
    [savedIds]
  );

  const set = (name: string, v: unknown) => setValues((prev) => ({ ...prev, [name]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      const res = await api<{ item: Values & { _id: string }; deletedAssets?: number }>(saveUrl, {
        method,
        body: JSON.stringify(values),
      });
      sessionUploads.current.clear();
      setSavedIds(new Set(collectMedia(fields, res.item).map((m) => m.publicId!)));
      if (method === "POST" && redirectTo) {
        router.push(redirectTo.replace("{id}", res.item._id));
        router.refresh();
        return;
      }
      setValues(initialValues(fields, res.item));
      setSaved(
        res.deletedAssets ? `Saved. ${res.deletedAssets} removed file(s) deleted from Cloudinary.` : "Saved successfully."
      );
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    const pending = [...sessionUploads.current.values()];
    if (pending.length) {
      if (!window.confirm(`Discard changes? ${pending.length} new upload(s) will be deleted from Cloudinary.`)) return;
      await Promise.allSettled(pending.map((m) => deleteFromCloudinary(m)));
      sessionUploads.current.clear();
    }
    if (backHref) router.push(backHref);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="card divide-y divide-line">
        {fields.map((f) => (
          <div key={f.name} className="grid gap-2 p-5 md:grid-cols-[220px_1fr] md:gap-6">
            <div>
              <label className="label" htmlFor={f.name}>
                {f.label} {f.required && <span className="text-brand-500">*</span>}
              </label>
              {f.help && <p className="text-xs text-muted">{f.help}</p>}
            </div>
            <div>
              {f.type === "text" && (
                <input
                  id={f.name}
                  className="input"
                  value={String(values[f.name] ?? "")}
                  placeholder={f.placeholder}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.type === "textarea" && (
                <textarea
                  id={f.name}
                  className="input min-h-28"
                  value={String(values[f.name] ?? "")}
                  placeholder={f.placeholder}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.type === "number" && (
                <input
                  id={f.name}
                  type="number"
                  className="input max-w-xs"
                  value={String(values[f.name] ?? "")}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.type === "date" && (
                <input
                  id={f.name}
                  type="date"
                  className="input max-w-xs"
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.type === "select" && (
                <select
                  id={f.name}
                  className="input max-w-sm"
                  value={String(values[f.name] ?? "")}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                >
                  <option value="">Select...</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}
              {f.type === "boolean" && (
                <label className="inline-flex cursor-pointer items-center gap-3">
                  <input
                    id={f.name}
                    type="checkbox"
                    className="peer sr-only"
                    checked={Boolean(values[f.name])}
                    onChange={(e) => set(f.name, e.target.checked)}
                  />
                  <span className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-brand-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                  <span className="text-sm text-muted">{values[f.name] ? "Yes" : "No"}</span>
                </label>
              )}
              {f.type === "list" && (
                <ListField
                  value={(values[f.name] as string[]) || []}
                  onChange={(v) => set(f.name, v)}
                  placeholder={f.placeholder}
                />
              )}
              {f.type === "image" && (
                <ImageField value={values[f.name] as MediaLike | null} onChange={(v) => set(f.name, v)} ctx={ctx} />
              )}
              {f.type === "pdf" && (
                <PdfField value={values[f.name] as MediaLike | null} onChange={(v) => set(f.name, v)} ctx={ctx} />
              )}
              {f.type === "images" && (
                <ImagesField
                  value={values[f.name] as MediaLike[]}
                  onChange={(update) =>
                    setValues((prev) => ({ ...prev, [f.name]: update((prev[f.name] as MediaLike[]) || []) }))
                  }
                  ctx={ctx}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save"}
        </button>
        {backHref && (
          <button type="button" className="btn-ghost" onClick={cancel}>
            Cancel
          </button>
        )}
        {publicHref && (
          <Link href={publicHref} target="_blank" className="btn-ghost">
            <ExternalLink className="h-4 w-4" /> View on site
          </Link>
        )}
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        {saved && (
          <p className="flex items-center gap-1 text-sm font-bold text-green-700">
            <CheckCircle2 className="h-4 w-4" /> {saved}
          </p>
        )}
      </div>
    </form>
  );
}
