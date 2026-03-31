import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-8 text-center">
      <p className="text-6xl font-extrabold bg-gradient-to-r from-accent-emerald to-accent-cyan bg-clip-text text-transparent mb-4">
        404
      </p>
      <h2 className="text-xl font-bold mb-2">Page not found</h2>
      <p className="text-sm text-text-secondary mb-6">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="h-[44px] px-6 rounded-xl bg-gradient-to-r from-accent-emerald to-accent-cyan font-semibold text-bg-base text-sm flex items-center"
      >
        Go home
      </Link>
    </div>
  );
}
