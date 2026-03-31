"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getInitials } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

export function LeaderboardCard({ entry, isCurrentUser }: LeaderboardCardProps) {
  return (
    <Link href={`/arena/${entry.profile.id}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`bg-bg-card border rounded-2xl p-4 flex items-center gap-3 ${
          isCurrentUser
            ? "border-accent-emerald/40 ring-1 ring-accent-emerald/20"
            : "border-border-card"
        }`}
      >
        {/* Rank */}
        <div className="w-8 text-center shrink-0">
          <span className="text-sm font-bold text-text-secondary">
            #{entry.rank}
          </span>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-card flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-accent-emerald">
            {getInitials(entry.profile.display_name)}
          </span>
        </div>

        {/* Name + tasks */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {entry.profile.display_name}
            {isCurrentUser && (
              <span className="text-xs text-text-tertiary ml-1">(you)</span>
            )}
          </p>
          <p className="text-xs text-text-tertiary">
            {entry.totalPublicTasks} tasks
            {entry.bestStreak > 0 && (
              <span className="ml-2 text-streak-amber">
                {entry.bestStreak} best streak
              </span>
            )}
          </p>
        </div>

        {/* Consistency score ring */}
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--color-bg-elevated)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="var(--color-accent-emerald)"
              strokeWidth="3"
              strokeDasharray={`${entry.consistencyScore * 0.974} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold">{entry.consistencyScore}%</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
