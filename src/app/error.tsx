"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <span className="text-3xl">!</span>
      </div>
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-text-secondary mb-6">
        {error.message || "An unexpected error occurred"}
      </p>
      <button
        onClick={reset}
        className="h-[44px] px-6 rounded-xl bg-gradient-to-r from-accent-emerald to-accent-cyan font-semibold text-bg-base text-sm"
      >
        Try again
      </button>
    </div>
  );
}
