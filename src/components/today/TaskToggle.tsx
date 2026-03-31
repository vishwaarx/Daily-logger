"use client";

import { motion } from "framer-motion";
import { Globe, Lock, Check } from "lucide-react";
import { getStreakTier } from "@/lib/utils";
import type { Habit } from "@/lib/types";

interface TaskToggleProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
}

export function TaskToggle({ habit, completed, streak, onToggle }: TaskToggleProps) {
  const tier = getStreakTier(streak);

  return (
    <motion.button
      layout
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      className={`w-full bg-bg-card border rounded-2xl p-4 flex items-center gap-3 transition-colors ${
        completed
          ? "border-accent-emerald/30 bg-accent-emerald/5"
          : "border-border-card"
      }`}
    >
      {/* Check circle */}
      <motion.div
        animate={completed ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          completed
            ? "bg-accent-emerald border-accent-emerald"
            : "border-border-card"
        }`}
      >
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <Check size={16} className="text-bg-base" />
          </motion.div>
        )}
      </motion.div>

      {/* Emoji */}
      <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-lg shrink-0">
        {habit.emoji}
      </div>

      {/* Name + visibility */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <p
            className={`font-semibold text-[15px] truncate transition-colors ${
              completed ? "text-text-secondary" : "text-text-primary"
            }`}
          >
            {habit.name}
          </p>
          {habit.is_public ? (
            <Globe size={10} className="text-accent-cyan shrink-0" />
          ) : (
            <Lock size={10} className="text-text-tertiary shrink-0" />
          )}
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div
          animate={completed ? { scale: [1, 1.15, 1] } : {}}
          className="flex items-center gap-1 shrink-0"
        >
          <span className="text-sm">{tier.emoji}</span>
          <span className={`text-sm font-bold ${tier.color}`}>{streak}</span>
        </motion.div>
      )}
    </motion.button>
  );
}
