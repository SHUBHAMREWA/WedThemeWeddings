"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { api } from "./upload";

export type AdminRow = { _id: string; name: string; email: string; createdAt: string | null; me: boolean };

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

function PasswordInput({ id, value, onChange, placeholder, autoComplete = "new-password" }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="input pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 px-3 text-muted hover:text-ink"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

type FormState = { name: string; email: string; password: string; currentPassword: string };
const EMPTY: FormState = { name: "", email: "", password: "", currentPassword: "" };

/** Add form (editing = null) or edit form for one admin. */
function AdminForm({ editing, onDone, onCancel }: {
  editing: AdminRow | null;
  onDone: (row: AdminRow) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(editing ? { ...EMPTY, name: editing.name, email: editing.email } : EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof FormState) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { item } = editing
        ? await api<{ item: AdminRow }>(`/api/admin/admins/${editing._id}`, { method: "PATCH", body: JSON.stringify(f) })
        : await api<{ item: AdminRow }>("/api/admin/admins", { method: "POST", body: JSON.stringify(f) });
      onDone(item);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const pre = editing ? `e-${editing._id}` : "new";
  return (
    <form onSubmit={submit} className="card space-y-4 border-brand-200 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-ink">{editing ? `Edit ${editing.name || editing.email}` : "Add a new admin"}</h2>
        <button type="button" onClick={onCancel} className="text-muted hover:text-ink" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${pre}-name`}>Name</label>
          <input id={`${pre}-name`} className="input" value={f.name} onChange={(e) => set("name")(e.target.value)} placeholder="Rahul" />
        </div>
        <div>
          <label className="label" htmlFor={`${pre}-email`}>Email (used to log in)</label>
          <input
            id={`${pre}-email`}
            type="email"
            className="input"
            value={f.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="rahul@gmail.com"
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label className="label" htmlFor={`${pre}-pass`}>{editing ? "New password" : "Password"}</label>
          <PasswordInput
            id={`${pre}-pass`}
            value={f.password}
            onChange={set("password")}
            placeholder={editing ? "Leave empty to keep the current password" : "At least 8 characters"}
          />
        </div>
        {editing?.me && f.password && (
          <div>
            <label className="label" htmlFor={`${pre}-cur`}>Your current password</label>
            <PasswordInput id={`${pre}-cur`} value={f.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" />
          </div>
        )}
      </div>
      {!editing && (
        <p className="text-sm text-muted">Share this email and password with the new admin. They log in at /admin/login.</p>
      )}
      {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <KeyRound className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editing ? "Save changes" : "Add admin"}
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminsManager({ initial }: { initial: AdminRow[] }) {
  const [rows, setRows] = useState(initial);
  const [mode, setMode] = useState<"add" | string | null>(null); // "add" or the id being edited
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(row: AdminRow) {
    if (!confirm(`Remove ${row.email}? They will be logged out and can no longer open the admin panel.`)) return;
    setBusy(row._id);
    setError("");
    try {
      await api(`/api/admin/admins/${row._id}`, { method: "DELETE" });
      setRows((r) => r.filter((x) => x._id !== row._id));
      setNotice(`${row.email} was removed.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const editing = mode && mode !== "add" ? rows.find((r) => r._id === mode) ?? null : null;

  return (
    <div className="space-y-5">
      {mode === null && (
        <button className="btn-primary" onClick={() => { setMode("add"); setNotice(""); }}>
          <Plus className="h-4 w-4" /> Add admin
        </button>
      )}
      {mode !== null && (
        <AdminForm
          key={mode}
          editing={editing}
          onCancel={() => setMode(null)}
          onDone={(item) => {
            setRows((r) => (editing ? r.map((x) => (x._id === item._id ? item : x)) : [...r, item]));
            setNotice(editing ? `Saved changes for ${item.email}.` : `${item.email} can now log in to the admin panel.`);
            setMode(null);
          }}
        />
      )}

      {notice && <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-gray-50 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-black text-brand-700">
                      {(r.name || r.email).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-ink">
                        {r.name || "—"}
                        {r.me && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            <ShieldCheck className="h-3 w-3" /> You
                          </span>
                        )}
                      </p>
                      <p className="truncate text-muted">{r.email}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{fmt(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      className="btn-ghost px-3 py-2"
                      onClick={() => { setMode(r._id); setNotice(""); setError(""); }}
                      aria-label={`Edit ${r.email}`}
                    >
                      <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
                    </button>
                    {!r.me && (
                      <button
                        className="btn-ghost px-3 py-2 text-red-600 hover:bg-red-50"
                        onClick={() => remove(r)}
                        disabled={busy === r._id || rows.length <= 1}
                        aria-label={`Remove ${r.email}`}
                      >
                        {busy === r._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
