"use client";

import { motion } from "framer-motion";
import { Pencil, Archive, Globe, Lock } from "lucide-react";
import type { Habit } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onArchive: (id: string) => void;
}

export function HabitCard({ habit, onEdit, onArchive }: HabitCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-bg-card border border-border-card rounded-2xl p-4 flex items-center gap-3"
    >
      <div className="w-11 h-11 rounded-xl bg-bg-elevated flex items-center justify-center text-xl shrink-0">
        {habit.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-[15px] truncate">{habit.name}</p>
          {habit.is_public ? (
            <Globe size={12} className="text-accent-cyan shrink-0" />
          ) : (
            <Lock size={12} className="text-text-tertiary shrink-0" />
          )}
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">
          {habit.schedule_type === "daily"
            ? "Every day"
            : habit.schedule_days
                ?.map((d) => DAYS[d])
                .join(", ") ?? "No days set"}
        </p>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(habit)}
          className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onArchive(habit.id)}
          className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-danger transition-colors"
        >
          <Archive size={14} />
        </button>
      </div>
    </motion.div>
  );
}
