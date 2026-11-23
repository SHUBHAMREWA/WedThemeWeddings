import { PageHeader } from "@/components/admin/AdminShell";
import MediaLibrary from "@/components/admin/MediaLibrary";

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="Media library"
        subtitle="Every image and PDF stored in your Cloudinary folder. Files not used anywhere on the site are marked Unused and can be deleted safely."
      />
      <MediaLibrary />
    </>
  );
}
