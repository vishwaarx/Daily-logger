"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const initials = getInitials(displayName) || "?";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) return;

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: name });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col min-h-dvh items-center px-8 pt-24">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[28px] font-bold mb-2"
      >
        Welcome!
      </motion.h1>
      <p className="text-[15px] text-text-secondary mb-10">
        Let&apos;s set up your profile
      </p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-3 mb-10"
      >
        <div className="w-[110px] h-[110px] rounded-full bg-bg-elevated border-[2.5px] border-accent-emerald flex items-center justify-center">
          <span className="text-[42px] font-bold text-accent-emerald">
            {initials}
          </span>
        </div>
        <p className="text-xs text-text-tertiary">
          This is how friends will see you
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <label className="text-sm font-medium text-text-secondary block">
          Display name
        </label>
        <div className="flex items-center gap-3 h-[52px] rounded-[14px] bg-bg-input border border-border-card px-4 focus-within:border-accent-emerald transition-colors">
          <span className="text-text-tertiary text-lg">&#128100;</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="flex-1 bg-transparent outline-none text-[15px] text-text-primary placeholder:text-text-muted"
            autoFocus
            maxLength={30}
          />
        </div>

        {error && <p className="text-sm text-danger text-center">{error}</p>}

        <button
          type="submit"
          disabled={saving || !displayName.trim()}
          className="w-full h-[52px] rounded-[14px] bg-gradient-to-r from-accent-emerald to-accent-cyan font-semibold text-bg-base text-base disabled:opacity-50 transition-opacity"
        >
          {saving ? "Saving..." : "Continue \u2192"}
        </button>
      </form>
    </div>
  );
}
