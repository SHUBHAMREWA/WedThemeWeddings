import AdminsManager from "@/components/admin/AdminsManager";
import { PageHeader } from "@/components/admin/AdminShell";
import { connectDB } from "@/lib/db";
import { getSession } from "@/lib/session";
import { adminView } from "@/lib/admins";
import { getAdminModel } from "@/models";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const session = await getSession();
  await connectDB();
  const docs = await getAdminModel().find({}, { passwordHash: 0 }).sort({ createdAt: 1 }).lean<Record<string, unknown>[]>();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Admins"
        subtitle="People who can log in to this admin panel. Each admin logs in with their own email and password."
      />
      <AdminsManager initial={docs.map((d) => adminView(d, session?.sub))} />
    </div>
  );
}
