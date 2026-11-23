import { NextResponse, type NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getInquiryModel } from "@/models";
import { INQUIRY_STATUSES } from "@/lib/constants";

type Ctx = RouteContext<"/api/admin/inquiries/[id]">;

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { status?: string; notes?: string };
  const update: Record<string, string> = {};
  if (body.status && (INQUIRY_STATUSES as readonly string[]).includes(body.status)) update.status = body.status;
  if (typeof body.notes === "string") update.notes = body.notes.slice(0, 2000);

  await connectDB();
  const item = await getInquiryModel().findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await connectDB();
  await getInquiryModel().findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
