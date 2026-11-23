"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, FileText, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import type { MediaLike } from "@/lib/resources";
import { formatBytes } from "@/lib/utils";
import { deleteFromCloudinary, uploadToCloudinary } from "./upload";

/**
 * How removal works:
 *  - A file uploaded in this editing session (not yet saved) is deleted from Cloudinary immediately.
 *  - A file that was already saved is removed from the form; the server deletes it from Cloudinary on Save.
 *  - Deleting a whole item deletes all of its files from Cloudinary.
 */
type RemoveCtx = {
  savedIds: Set<string>;
  onSessionUpload: (m: MediaLike) => void;
  onSessionDelete: (m: MediaLike) => void;
};

function thumb(url: string) {
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/image/upload/c_fill,w_400,h_300,f_auto,q_auto/");
  }
  return url;
}

async function removeAsset(m: MediaLike, ctx: RemoveCtx) {
  const saved = m.publicId ? ctx.savedIds.has(m.publicId) : false;
  const msg = saved
    ? "Remove this file? It will be permanently deleted from Cloudinary when you save."
    : "Remove this file? It will be permanently deleted from Cloudinary now.";
  if (!window.confirm(msg)) return false;
  if (!saved && m.publicId) {
    await deleteFromCloudinary(m);
    ctx.onSessionDelete(m);
  }
  return true;
}

function Dropzone({
  accept,
  multiple,
  onFiles,
  busy,
  label,
  icon,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  busy?: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      disabled={busy}
      className={`flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition ${
        over ? "border-brand-400 bg-brand-50" : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/50"
      }`}
    >
      {busy ? <Loader2 className="h-6 w-6 animate-spin text-brand-500" /> : icon}
      <span className="font-bold text-ink">{busy ? "Uploading..." : label}</span>
      <span className="text-xs text-muted">Click or drag & drop. Max 10 MB per file.</span>
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </button>
  );
}

function Progress({ items }: { items: { name: string; pct: number }[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 space-y-1">
      {items.map((p) => (
        <div key={p.name} className="text-xs text-muted">
          <div className="flex justify-between">
            <span className="truncate">{p.name}</span>
            <span>{p.pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded bg-gray-100">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${p.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ImageField({
  value,
  onChange,
  ctx,
}: {
  value?: MediaLike | null;
  onChange: (v: MediaLike | null) => void;
  ctx: RemoveCtx;
}) {
  const [progress, setProgress] = useState<{ name: string; pct: number }[]>([]);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(false);

  async function handle(files: File[]) {
    setError("");
    const file = files[0];
    try {
      setProgress([{ name: file.name, pct: 0 }]);
      const m = await uploadToCloudinary(file, "image", (pct) => setProgress([{ name: file.name, pct }]));
      ctx.onSessionUpload(m);
      // Replacing an unsaved upload: delete the previous one right away
      if (value?.publicId && !ctx.savedIds.has(value.publicId)) {
        await deleteFromCloudinary(value).catch(() => {});
      }
      onChange(m);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress([]);
    }
  }

  async function remove() {
    if (!value) return;
    setRemoving(true);
    try {
      if (await removeAsset(value, ctx)) onChange(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div>
      {value?.url ? (
        <div className="group relative w-full max-w-sm overflow-hidden rounded-lg border border-line">
          <img src={thumb(value.url)} alt="" className="aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/60 p-2 text-xs text-white">
            <span className="truncate">{value.originalName || value.publicId || "Image"}</span>
            <div className="flex gap-1">
              <label className="cursor-pointer rounded bg-white/20 px-2 py-1 hover:bg-white/30">
                Replace
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const f = Array.from(e.target.files || []);
                    e.target.value = "";
                    if (f.length) handle(f);
                  }}
                />
              </label>
              <button type="button" onClick={remove} disabled={removing} className="rounded bg-red-600 px-2 py-1 hover:bg-red-700">
                {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          {progress.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          )}
        </div>
      ) : (
        <Dropzone
          accept="image/*"
          onFiles={handle}
          busy={progress.length > 0}
          label="Upload image"
          icon={<ImagePlus className="h-6 w-6 text-brand-500" />}
        />
      )}
      <Progress items={progress} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function ImagesField({
  value,
  onChange,
  ctx,
}: {
  value?: MediaLike[];
  /** Receives an updater so parallel uploads never overwrite each other */
  onChange: (update: (prev: MediaLike[]) => MediaLike[]) => void;
  ctx: RemoveCtx;
}) {
  const list = value || [];
  const [progress, setProgress] = useState<{ name: string; pct: number }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handle(files: File[]) {
    setErrors([]);
    setProgress(files.map((f) => ({ name: f.name, pct: 0 })));
    const errs: string[] = [];
    // Upload 3 at a time
    const queue = [...files];
    async function worker() {
      while (queue.length) {
        const f = queue.shift()!;
        try {
          const m = await uploadToCloudinary(f, "image", (pct) =>
            setProgress((p) => p.map((x) => (x.name === f.name ? { ...x, pct } : x)))
          );
          ctx.onSessionUpload(m);
          onChange((prev) => [...prev, m]);
        } catch (e) {
          errs.push((e as Error).message);
        }
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    setProgress([]);
    setErrors(errs);
  }

  async function remove(m: MediaLike, idx: number) {
    setRemoving(m.publicId || m.url);
    try {
      if (await removeAsset(m, ctx)) onChange((prev) => prev.filter((_, i) => i !== idx));
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setRemoving(null);
    }
  }

  function move(idx: number, dir: -1 | 1) {
    onChange((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {list.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((m, idx) => (
            <div key={(m.publicId || m.url) + idx} className="group relative overflow-hidden rounded-lg border border-line">
              <img src={thumb(m.url)} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 p-1.5 text-white">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(idx, -1)} className="rounded bg-white/20 p-1 hover:bg-white/30" aria-label="Move left">
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => move(idx, 1)} className="rounded bg-white/20 p-1 hover:bg-white/30" aria-label="Move right">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(m, idx)}
                  disabled={removing === (m.publicId || m.url)}
                  className="rounded bg-red-600 p-1 hover:bg-red-700"
                  aria-label="Delete image"
                >
                  {removing === (m.publicId || m.url) ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">First</span>
              )}
            </div>
          ))}
        </div>
      )}
      <Dropzone
        accept="image/*"
        multiple
        onFiles={handle}
        busy={progress.length > 0}
        label={list.length ? "Add more images" : "Upload images"}
        icon={<Upload className="h-6 w-6 text-brand-500" />}
      />
      <Progress items={progress} />
      {errors.map((e) => (
        <p key={e} className="text-xs text-red-600">
          {e}
        </p>
      ))}
      {list.length > 0 && <p className="text-xs text-muted">{list.length} image(s)</p>}
    </div>
  );
}

export function PdfField({
  value,
  onChange,
  ctx,
}: {
  value?: MediaLike | null;
  onChange: (v: MediaLike | null) => void;
  ctx: RemoveCtx;
}) {
  const [progress, setProgress] = useState<{ name: string; pct: number }[]>([]);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(false);

  async function handle(files: File[]) {
    setError("");
    const file = files[0];
    try {
      setProgress([{ name: file.name, pct: 0 }]);
      const m = await uploadToCloudinary(file, "pdf", (pct) => setProgress([{ name: file.name, pct }]));
      ctx.onSessionUpload(m);
      if (value?.publicId && !ctx.savedIds.has(value.publicId)) {
        await deleteFromCloudinary(value).catch(() => {});
      }
      onChange(m);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setProgress([]);
    }
  }

  async function remove() {
    if (!value) return;
    setRemoving(true);
    try {
      if (await removeAsset(value, ctx)) onChange(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div>
      {value?.url ? (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-gray-50 p-3">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-brand-100 text-brand-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <a href={value.url} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold text-ink hover:text-brand-600">
              {value.originalName || value.publicId}
            </a>
            <p className="text-xs text-muted">{formatBytes(value.bytes)} PDF</p>
          </div>
          <button type="button" onClick={remove} disabled={removing} className="btn-ghost px-2 text-red-600">
            {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Remove
          </button>
        </div>
      ) : (
        <Dropzone
          accept="application/pdf"
          onFiles={handle}
          busy={progress.length > 0}
          label="Upload PDF"
          icon={<FileText className="h-6 w-6 text-brand-500" />}
        />
      )}
      <Progress items={progress} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export type { RemoveCtx };
