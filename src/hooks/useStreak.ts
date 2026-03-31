"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Habit } from "@/lib/types";

function isScheduledDay(habit: Habit, date: Date): boolean {
  if (habit.schedule_type === "daily") return true;
  if (!habit.schedule_days) return false;
  return habit.schedule_days.includes(date.getDay());
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function useStreak(habits: Habit[]) {
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const calculateStreaks = useCallback(async () => {
    if (habits.length === 0) {
      setStreaks({});
      setLoading(false);
      return;
    }

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 120);

    const habitIds = habits.map((h) => h.id);

    const { data: completions } = await supabase
      .from("completions")
      .select("habit_id, completed_date")
      .in("habit_id", habitIds)
      .gte("completed_date", formatDate(startDate))
      .lte("completed_date", formatDate(today));

    const completionSets: Record<string, Set<string>> = {};
    for (const c of completions ?? []) {
      if (!completionSets[c.habit_id]) {
        completionSets[c.habit_id] = new Set();
      }
      completionSets[c.habit_id].add(c.completed_date);
    }

    const newStreaks: Record<string, number> = {};

    for (const habit of habits) {
      const completedDates = completionSets[habit.id] ?? new Set();
      let streak = 0;
      const date = new Date(today);

      for (let i = 0; i < 120; i++) {
        if (!isScheduledDay(habit, date)) {
          date.setDate(date.getDate() - 1);
          continue;
        }

        const dateStr = formatDate(date);
        if (completedDates.has(dateStr)) {
          streak++;
          date.setDate(date.getDate() - 1);
        } else {
          if (i === 0 && formatDate(date) === formatDate(today)) {
            date.setDate(date.getDate() - 1);
            continue;
          }
          break;
        }
      }

      newStreaks[habit.id] = streak;
    }

    setStreaks(newStreaks);
    setLoading(false);
  }, [habits, supabase]);

  useEffect(() => {
    void calculateStreaks();
  }, [calculateStreaks]);

  return { streaks, loading, recalculate: calculateStreaks };
}
