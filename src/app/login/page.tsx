"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh items-center justify-center px-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-accent-emerald to-accent-cyan flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
      >
        <span className="text-5xl">&#10003;</span>
      </motion.div>

      <h1 className="text-4xl font-extrabold mb-2">RoutineLog</h1>
      <p className="text-base text-text-secondary text-center mb-10">
        Track habits. Build streaks.
        <br />
        Stay consistent.
      </p>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-full bg-accent-emerald/20 flex items-center justify-center mx-auto">
            <span className="text-3xl">&#9993;</span>
          </div>
          <h2 className="text-xl font-bold">Check your email</h2>
          <p className="text-sm text-text-secondary">
            We sent a magic link to <span className="text-text-primary font-medium">{email}</span>
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-accent-emerald mt-4"
          >
            Use a different email
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Email address
            </label>
            <div className="flex items-center gap-3 h-[52px] rounded-[14px] bg-bg-input border border-border-card px-4 focus-within:border-accent-emerald transition-colors">
              <span className="text-text-tertiary text-lg">@</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-transparent outline-none text-[15px] text-text-primary placeholder:text-text-muted"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full h-[52px] rounded-[14px] bg-gradient-to-r from-accent-emerald to-accent-cyan font-semibold text-bg-base text-base disabled:opacity-50 transition-opacity"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>

          <p className="text-sm text-text-tertiary text-center leading-relaxed">
            We&apos;ll send a sign-in link to your email.
            <br />
            No password needed.
          </p>
        </form>
      )}
    </div>
  );
}
