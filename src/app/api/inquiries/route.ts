import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getInquiryModel } from "@/models";

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Public endpoint used by the contact / enquiry forms. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // Honeypot field: bots fill it, humans never see it.
  if (str(body.website)) return NextResponse.json({ ok: true });

  const name = str(body.name, 120);
  const phone = str(body.phone, 20);
  if (!name || !phone) {
    return NextResponse.json({ error: "Please share your name and phone number" }, { status: 400 });
  }
  if (!/^[+\d][\d\s-]{6,18}$/.test(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
  }

  const eventDate = str(body.eventDate, 30);
  await connectDB();
  await getInquiryModel().create({
    name,
    phone,
    email: str(body.email, 160),
    eventType: str(body.eventType, 60),
    eventDate: eventDate ? new Date(eventDate) : undefined,
    city: str(body.city, 80),
    budget: str(body.budget, 60),
    services: Array.isArray(body.services) ? body.services.map((s) => str(s, 60)).filter(Boolean).slice(0, 10) : [],
    message: str(body.message, 2000),
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
