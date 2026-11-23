import "server-only";

export const MIN_PASSWORD = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const cleanEmail = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase().slice(0, 160) : "");
export const cleanName = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 80) : "");

export function emailError(email: string) {
  return EMAIL_RE.test(email) ? null : "Please enter a valid email address";
}

export function passwordError(password: unknown) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD)
    return `Password must be at least ${MIN_PASSWORD} characters`;
  if (password.length > 200) return "Password is too long";
  return null;
}

/** Shape sent to the browser. Never includes the password hash. */
export function adminView(doc: Record<string, unknown>, meId?: string) {
  const id = String(doc._id);
  return {
    _id: id,
    name: (doc.name as string) || "",
    email: doc.email as string,
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).toISOString() : null,
    me: id === meId,
  };
}
