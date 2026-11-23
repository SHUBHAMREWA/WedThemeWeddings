import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { getAdminModel } from "@/models";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  await connectDB();
  const Admin = getAdminModel();
  const normalized = email.toLowerCase().trim();

  // Bootstrap: if no admin exists yet, create one from ADMIN_EMAIL / ADMIN_PASSWORD.
  if ((await Admin.estimatedDocumentCount()) === 0) {
    const envEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const envPass = process.env.ADMIN_PASSWORD;
    if (envEmail && envPass) {
      await Admin.create({ email: envEmail, name: "Admin", passwordHash: await bcrypt.hash(envPass, 12) });
    }
  }

  const admin = await Admin.findOne({ email: normalized });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken({ sub: String(admin._id), email: admin.email, name: admin.name });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
