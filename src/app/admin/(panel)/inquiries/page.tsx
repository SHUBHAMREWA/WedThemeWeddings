import { PageHeader } from "@/components/admin/AdminShell";
import InquiriesTable from "@/components/admin/InquiriesTable";

export default function InquiriesPage() {
  return (
    <>
      <PageHeader title="Inquiries" subtitle="Leads submitted from the website contact and booking forms." />
      <InquiriesTable />
    </>
  );
}
