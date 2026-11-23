"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, FileText, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { MediaLike, ResourceConfig } from "@/lib/resources";
import { collectMedia } from "@/lib/resources";
import { formatINR } from "@/lib/utils";
import { api } from "./upload";

type Item = Record<string, unknown> & { _id: string };

function thumb(url: string) {
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/c_fill,w_120,h_90,f_auto,q_auto/");
  }
  return url;
}

export default function ResourceList({ cfg }: { cfg: ResourceConfig }) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api<{ items: Item[] }>(`/api/admin/r/${cfg.key}`);
      setItems(res.items);
    } catch (e) {
      setError((e as Error).message);
      setItems([]);
    }
  }, [cfg.key]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const columns = cfg.fields.filter((f) => f.column && f.name !== cfg.titleField);

  const filtered = useMemo(() => {
    if (!items) return [];
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      cfg.fields.some((f) => typeof it[f.name] === "string" && (it[f.name] as string).toLowerCase().includes(s))
    );
  }, [items, q, cfg.fields]);

  async function remove(it: Item) {
    const files = collectMedia(cfg.fields, it).length;
    const name = String(it[cfg.titleField] ?? cfg.singular);
    const msg = files
      ? `Delete "${name}"? This will also permanently delete ${files} file(s) from Cloudinary. This cannot be undone.`
      : `Delete "${name}"? This cannot be undone.`;
    if (!window.confirm(msg)) return;
    setDeleting(it._id);
    setNotice("");
    try {
      const res = await api<{ deletedAssets: number }>(`/api/admin/r/${cfg.key}/${it._id}`, { method: "DELETE" });
      setItems((prev) => prev?.filter((x) => x._id !== it._id) ?? null);
      setNotice(`Deleted "${name}"${res.deletedAssets ? ` and ${res.deletedAssets} file(s) from Cloudinary` : ""}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  function renderCell(it: Item, name: string, type: string) {
    const v = it[name];
    if (type === "boolean")
      return v ? <Check className="h-4 w-4 text-green-600" /> : <span className="text-gray-300">-</span>;
    if (type === "number" && (name.toLowerCase().includes("price"))) return formatINR(v as number) || "-";
    if (v === undefined || v === null || v === "") return <span className="text-gray-300">-</span>;
    return String(v);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder={`Search ${cfg.label.toLowerCase()}...`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Link href={`/admin/${cfg.key}/new`} className="btn-primary">
          <Plus className="h-4 w-4" /> Add {cfg.singular}
        </Link>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="whitespace-nowrap border-b border-line bg-gray-50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">{cfg.fields.find((f) => f.name === cfg.titleField)?.label}</th>
              {columns.map((c) => (
                <th key={c.name} className="px-4 py-3">
                  {c.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items === null && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-10 text-center text-muted">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}
            {items !== null && filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-10 text-center text-muted">
                  No {cfg.label.toLowerCase()} yet.{" "}
                  <Link href={`/admin/${cfg.key}/new`} className="font-bold text-brand-600">
                    Add the first one
                  </Link>
                </td>
              </tr>
            )}
            {filtered.map((it) => {
              const img = cfg.imageField ? (it[cfg.imageField] as MediaLike | undefined) : undefined;
              const pdf = cfg.fields.find((f) => f.type === "pdf");
              return (
                <tr key={it._id} className="hover:bg-brand-50/30">
                  <td className="min-w-[260px] px-4 py-3">
                    <Link href={`/admin/${cfg.key}/${it._id}`} className="flex items-center gap-3">
                      {cfg.imageField &&
                        (img?.url ? (
                          <img src={thumb(img.url)} alt="" className="h-12 w-16 shrink-0 rounded object-cover" />
                        ) : (
                          <div className="h-12 w-16 shrink-0 rounded bg-gray-100" />
                        ))}
                      {!cfg.imageField && pdf && (it[pdf.name] as MediaLike | undefined)?.url && (
                        <FileText className="h-5 w-5 text-brand-500" />
                      )}
                      <span className="font-bold text-ink hover:text-brand-600">{String(it[cfg.titleField] ?? "")}</span>
                    </Link>
                  </td>
                  {columns.map((c) => (
                    <td key={c.name} className="px-4 py-3 text-muted">
                      {renderCell(it, c.name, c.type)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/${cfg.key}/${it._id}`} className="btn-ghost px-2.5 py-1.5" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(it)}
                        disabled={deleting === it._id}
                        className="btn-ghost px-2.5 py-1.5 text-red-600 hover:bg-red-50"
                        aria-label="Delete"
                      >
                        {deleting === it._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
