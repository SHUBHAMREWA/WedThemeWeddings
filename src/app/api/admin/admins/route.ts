import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getAdminModel } from "@/models";
import { adminView, cleanEmail, cleanName, emailError, passwordError } from "@/lib/admins";

export async function GET() {
  const { session, error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const docs = await getAdminModel().find({}, { passwordHash: 0 }).sort({ createdAt: 1 }).lean<Record<string, unknown>[]>();
  return NextResponse.json({ items: docs.map((d) => adminView(d, session.sub)) });
}

export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = cleanEmail(b.email);
  const name = cleanName(b.name);
  const bad = emailError(email) || passwordError(b.password);
  if (bad) return NextResponse.json({ error: bad }, { status: 400 });

  await connectDB();
  const Admin = getAdminModel();
  if (await Admin.exists({ email })) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
  }
  const doc = await Admin.create({ email, name, passwordHash: await bcrypt.hash(b.password as string, 12) });
  return NextResponse.json({ item: adminView(doc.toObject(), session.sub) }, { status: 201 });
}
