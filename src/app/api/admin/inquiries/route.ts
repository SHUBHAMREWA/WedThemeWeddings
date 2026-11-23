import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { getInquiryModel } from "@/models";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const status = req.nextUrl.searchParams.get("status");
  await connectDB();
  const items = await getInquiryModel()
    .find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();
  return NextResponse.json({ items });
}
