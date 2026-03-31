"use client";

import { motion } from "framer-motion";
import type { Completion, Habit } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface HeatmapProps {
  habits: Habit[];
  completions: Completion[];
  days?: number;
}

function getIntensityColor(ratio: number): string {
  if (ratio === 0) return "#1a1a2e";
  if (ratio < 0.25) return "#064e3b";
  if (ratio < 0.5) return "#059669";
  if (ratio < 0.75) return "#10B981";
  return "#06B6D4";
}

export function Heatmap({ habits, completions, days = 90 }: HeatmapProps) {
  const today = new Date();
  const dates: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }

  // Count completions per date
  const completionsByDate: Record<string, number> = {};
  for (const c of completions) {
    completionsByDate[c.completed_date] = (completionsByDate[c.completed_date] ?? 0) + 1;
  }

  // Count scheduled habits per date
  const scheduledByDate: Record<string, number> = {};
  for (const date of dates) {
    const dateStr = formatDate(date);
    let count = 0;
    for (const h of habits) {
      if (h.schedule_type === "daily") {
        count++;
      } else if (h.schedule_days?.includes(date.getDay())) {
        count++;
      }
    }
    scheduledByDate[dateStr] = count;
  }

  // Build weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  for (const date of dates) {
    if (date.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="bg-bg-card border border-border-card rounded-2xl p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-3">
        Activity ({days} days)
      </h3>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((date) => {
              const dateStr = formatDate(date);
              const completed = completionsByDate[dateStr] ?? 0;
              const scheduled = scheduledByDate[dateStr] ?? 1;
              const ratio = scheduled > 0 ? completed / scheduled : 0;

              return (
                <motion.div
                  key={dateStr}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: wi * 0.01 }}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getIntensityColor(ratio) }}
                  title={`${dateStr}: ${completed}/${scheduled}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
