"use client";

import { motion } from "framer-motion";
import { getStreakTier, formatDate } from "@/lib/utils";
import type { Habit, Completion } from "@/lib/types";

interface HabitStatsProps {
  habit: Habit;
  completions: Completion[];
  streak: number;
}

function calculateCompletionRate(
  habit: Habit,
  completions: Completion[],
  windowDays: number
): number {
  const today = new Date();
  let scheduled = 0;
  let completed = 0;

  const completedDates = new Set(completions.map((c) => c.completed_date));

  for (let i = 0; i < windowDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const isScheduled =
      habit.schedule_type === "daily" ||
      habit.schedule_days?.includes(d.getDay());

    if (isScheduled) {
      scheduled++;
      if (completedDates.has(formatDate(d))) {
        completed++;
      }
    }
  }

  return scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
}

function calculateLongestStreak(habit: Habit, completions: Completion[]): number {
  if (completions.length === 0) return 0;

  const completedDates = new Set(completions.map((c) => c.completed_date));
  const sortedDates = [...completedDates].sort();
  const earliest = new Date(sortedDates[0]);
  const latest = new Date(sortedDates[sortedDates.length - 1]);

  let longest = 0;
  let current = 0;
  const d = new Date(earliest);

  while (d <= latest) {
    const isScheduled =
      habit.schedule_type === "daily" ||
      habit.schedule_days?.includes(d.getDay());

    if (!isScheduled) {
      d.setDate(d.getDate() + 1);
      continue;
    }

    if (completedDates.has(formatDate(d))) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
    d.setDate(d.getDate() + 1);
  }

  return longest;
}

export function HabitStats({ habit, completions, streak }: HabitStatsProps) {
  const tier = getStreakTier(streak);
  const habitCompletions = completions.filter((c) => c.habit_id === habit.id);
  const rate7 = calculateCompletionRate(habit, habitCompletions, 7);
  const rate30 = calculateCompletionRate(habit, habitCompletions, 30);
  const rate90 = calculateCompletionRate(habit, habitCompletions, 90);
  const longestStreak = calculateLongestStreak(habit, habitCompletions);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border-card rounded-2xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-lg">
          {habit.emoji}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{habit.name}</p>
          <div className="flex items-center gap-1">
            {streak > 0 && <span className="text-xs">{tier.emoji}</span>}
            <span className={`text-xs font-bold ${tier.color}`}>
              {streak > 0 ? `${streak} day streak` : "No streak"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-tertiary">Best</p>
          <p className="text-sm font-bold text-streak-amber">{longestStreak}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "7d", value: rate7 },
          { label: "30d", value: rate30 },
          { label: "90d", value: rate90 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg-elevated rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold">{value}%</p>
            <p className="text-[10px] text-text-tertiary">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
