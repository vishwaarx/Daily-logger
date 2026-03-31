"use client";

import { motion } from "framer-motion";
import { getInitials } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";
import Link from "next/link";

interface PodiumProps {
  entries: LeaderboardEntry[];
}

const MEDALS = ["", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
const HEIGHTS = [0, 140, 110, 90];

export function Podium({ entries }: PodiumProps) {
  // Reorder for visual: 2nd, 1st, 3rd
  const podiumOrder = [entries[1], entries[0], entries[2]].filter(Boolean);
  const displayOrder = entries.length >= 3 ? podiumOrder : entries;

  return (
    <div className="flex items-end justify-center gap-3 mb-6 px-2">
      {displayOrder.map((entry, i) => {
        const rank = entry.rank;
        const isFirst = rank === 1;
        const height = HEIGHTS[rank] ?? 80;

        return (
          <Link
            key={entry.profile.id}
            href={`/arena/${entry.profile.id}`}
            className="flex-1 max-w-[120px]"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isFirst
                    ? "bg-gradient-to-br from-accent-emerald to-accent-cyan ring-2 ring-accent-emerald/50"
                    : "bg-bg-elevated border border-border-card"
                }`}
              >
                <span
                  className={`text-sm font-bold ${
                    isFirst ? "text-bg-base" : "text-text-primary"
                  }`}
                >
                  {getInitials(entry.profile.display_name)}
                </span>
              </div>

              {/* Name */}
              <p className="text-xs font-medium text-center truncate w-full">
                {entry.profile.display_name}
              </p>

              {/* Medal + Score */}
              <p className="text-sm mt-0.5">
                {MEDALS[rank] || ""}{" "}
                <span className="font-bold">{entry.consistencyScore}%</span>
              </p>

              {/* Podium bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ delay: i * 0.1 + 0.2, type: "spring" }}
                className={`w-full mt-2 rounded-t-xl ${
                  isFirst
                    ? "bg-gradient-to-t from-accent-emerald/30 to-accent-emerald/10"
                    : "bg-bg-card border border-border-card border-b-0"
                }`}
              />
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
