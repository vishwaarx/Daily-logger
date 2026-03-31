"use client";

import { motion } from "framer-motion";
import type { Habit, Completion } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WeeklyGridProps {
  habits: Habit[];
  completions: Completion[];
  weekStart: Date;
}

export function WeeklyGrid({ habits, completions, weekStart }: WeeklyGridProps) {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const completionSet = new Set(
    completions.map((c) => `${c.habit_id}:${c.completed_date}`)
  );

  return (
    <div className="bg-bg-card border border-border-card rounded-2xl p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-3">This Week</h3>

      {/* Day headers */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        <div />
        {dates.map((d, i) => (
          <div key={i} className="text-center">
            <span className="text-[10px] text-text-tertiary">{DAYS[d.getDay()]}</span>
          </div>
        ))}
      </div>

      {/* Habit rows */}
      {habits.map((habit) => (
        <div key={habit.id} className="grid grid-cols-8 gap-1 items-center mb-1.5">
          <div className="text-sm truncate pr-1" title={habit.name}>
            {habit.emoji}
          </div>
          {dates.map((d, i) => {
            const dateStr = formatDate(d);
            const completed = completionSet.has(`${habit.id}:${dateStr}`);

            return (
              <div key={i} className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-5 h-5 rounded-full ${
                    completed
                      ? "bg-accent-emerald"
                      : "bg-bg-elevated border border-border-card"
                  }`}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
