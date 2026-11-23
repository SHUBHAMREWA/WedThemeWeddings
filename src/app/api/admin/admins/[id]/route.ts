import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getAdminModel } from "@/models";
import { adminView, cleanEmail, cleanName, emailError, passwordError } from "@/lib/admins";

type Ctx = RouteContext<"/api/admin/admins/[id]">;

/** Update name, email or password. Changing your own password needs your current password. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await connectDB();
  const Admin = getAdminModel();
  const admin = await Admin.findById(id);
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const isMe = id === session.sub;

  if (typeof b.name === "string") admin.name = cleanName(b.name);

  if (typeof b.email === "string") {
    const email = cleanEmail(b.email);
    const bad = emailError(email);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });
    if (email !== admin.email && (await Admin.exists({ email, _id: { $ne: id } }))) {
      return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
    }
    admin.email = email;
  }

  if (b.password !== undefined && b.password !== "") {
    const bad = passwordError(b.password);
    if (bad) return NextResponse.json({ error: bad }, { status: 400 });
    if (isMe) {
      const ok = typeof b.currentPassword === "string" && (await bcrypt.compare(b.currentPassword, admin.passwordHash));
      if (!ok) return NextResponse.json({ error: "Your current password is not correct" }, { status: 400 });
    }
    admin.passwordHash = await bcrypt.hash(b.password as string, 12);
  }

  await admin.save();
  return NextResponse.json({ item: adminView(admin.toObject(), session.sub) });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { session, error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (id === session.sub) {
    return NextResponse.json({ error: "You cannot remove yourself. Ask another admin to do it." }, { status: 400 });
  }
  await connectDB();
  const Admin = getAdminModel();
  if ((await Admin.countDocuments()) <= 1) {
    return NextResponse.json({ error: "At least one admin is required" }, { status: 400 });
  }
  const res = await Admin.deleteOne({ _id: id });
  if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
