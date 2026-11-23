import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="section-kicker">404</p>
      <h1 className="font-display mt-2 text-4xl text-ink">This page went out of frame</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </div>
  );
}
