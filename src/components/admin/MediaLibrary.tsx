"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { api, deleteFromCloudinary } from "./upload";

type Asset = {
  publicId: string;
  url: string;
  resourceType: "image" | "raw";
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  createdAt: string;
  usedBy: string | null;
};

function thumb(url: string) {
  return url.replace("/image/upload/", "/image/upload/c_fill,w_400,h_300,f_auto,q_auto/");
}

export default function MediaLibrary() {
  const [type, setType] = useState<"image" | "raw">("image");
  const [items, setItems] = useState<Asset[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [onlyUnused, setOnlyUnused] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(
    async (next?: string) => {
      setError("");
      if (!next) setItems(null);
      try {
        const res = await api<{ items: Asset[]; nextCursor: string | null }>(
          `/api/admin/media?type=${type}${next ? `&cursor=${encodeURIComponent(next)}` : ""}`
        );
        setItems((prev) => (next && prev ? [...prev, ...res.items] : res.items));
        setCursor(res.nextCursor);
      } catch (e) {
        setError((e as Error).message);
        setItems([]);
      }
    },
    [type]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set());
    load();
  }, [load]);

  async function removeMany(assets: Asset[]) {
    const used = assets.filter((a) => a.usedBy);
    const msg =
      `Permanently delete ${assets.length} file(s) from Cloudinary?` +
      (used.length ? `\n\nWarning: ${used.length} of them are used on the website and will show as broken.` : "") +
      "\n\nThis cannot be undone.";
    if (!window.confirm(msg)) return;
    setBusy("bulk");
    const failed: string[] = [];
    for (const a of assets) {
      try {
        await deleteFromCloudinary(a);
      } catch {
        failed.push(a.publicId);
      }
    }
    const removed = new Set(assets.map((a) => a.publicId).filter((id) => !failed.includes(id)));
    setItems((prev) => prev?.filter((x) => !removed.has(x.publicId)) ?? null);
    setSelected(new Set());
    if (failed.length) setError(`Could not delete ${failed.length} file(s).`);
    setBusy(null);
  }

  const visible = (items || []).filter((a) => !onlyUnused || !a.usedBy);
  const unusedCount = (items || []).filter((a) => !a.usedBy).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["image", "raw"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${type === t ? "bg-brand-500 text-white" : "bg-white text-muted ring-1 ring-line"}`}
          >
            {t === "image" ? "Images" : "PDFs"}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={onlyUnused} onChange={(e) => setOnlyUnused(e.target.checked)} className="accent-brand-500" />
          Show only unused ({unusedCount})
        </label>
        <div className="ml-auto flex gap-2">
          {unusedCount > 0 && (
            <button className="btn-outline px-3 py-1.5" disabled={busy === "bulk"} onClick={() => removeMany((items || []).filter((a) => !a.usedBy))}>
              Delete all unused
            </button>
          )}
          {selected.size > 0 && (
            <button
              className="btn-danger px-3 py-1.5"
              disabled={busy === "bulk"}
              onClick={() => removeMany((items || []).filter((a) => selected.has(a.publicId)))}
            >
              {busy === "bulk" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {items === null ? (
        <div className="card p-10 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted">No files found.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {visible.map((a) => (
            <div key={a.publicId} className={`card overflow-hidden ${selected.has(a.publicId) ? "ring-2 ring-brand-500" : ""}`}>
              <div className="relative">
                {a.resourceType === "image" ? (
                  <img src={thumb(a.url)} alt="" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-brand-50">
                    <FileText className="h-10 w-10 text-brand-500" />
                  </div>
                )}
                <input
                  type="checkbox"
                  className="absolute left-2 top-2 h-4 w-4 accent-brand-500"
                  checked={selected.has(a.publicId)}
                  onChange={(e) =>
                    setSelected((prev) => {
                      const n = new Set(prev);
                      if (e.target.checked) n.add(a.publicId);
                      else n.delete(a.publicId);
                      return n;
                    })
                  }
                />
                <span
                  className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    a.usedBy ? "bg-green-600 text-white" : "bg-amber-400 text-amber-950"
                  }`}
                >
                  {a.usedBy ? "In use" : "Unused"}
                </span>
              </div>
              <div className="space-y-1 p-2.5 text-xs">
                <p className="truncate font-bold text-ink" title={a.publicId}>
                  {a.publicId.split("/").pop()}
                </p>
                <p className="truncate text-muted" title={a.usedBy || ""}>
                  {a.usedBy || "Not used on the site"}
                </p>
                <p className="text-muted">
                  {formatBytes(a.bytes)}
                  {a.width ? ` · ${a.width}×${a.height}` : ""}
                </p>
                <div className="flex justify-between pt-1">
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                    <ExternalLink className="inline h-3.5 w-3.5" /> Open
                  </a>
                  <button
                    className="text-red-600 hover:underline"
                    disabled={busy === a.publicId}
                    onClick={async () => {
                      setBusy(a.publicId);
                      await removeMany([a]);
                      setBusy(null);
                    }}
                  >
                    <Trash2 className="inline h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cursor && (
        <div className="text-center">
          <button className="btn-outline" onClick={() => load(cursor)}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
