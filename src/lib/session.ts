import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { connectDB } from "./db";
import { getAdminModel } from "@/models";

/**
 * Returns the signed-in admin, or null.
 * Also checks the admin still exists, so removing an admin signs them out straight away.
 */
export async function getSession() {
  const store = await cookies();
  const session = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!session || !isValidObjectId(session.sub)) return null;
  await connectDB();
  const exists = await getAdminModel().exists({ _id: session.sub });
  return exists ? session : null;
}

/** Use inside admin route handlers. Returns a 401 response when not signed in. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
