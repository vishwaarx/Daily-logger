"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Profile, Habit, Completion, LeaderboardEntry } from "@/lib/types";

function calculateConsistencyScore(
  habits: Habit[],
  completions: Completion[],
  windowDays: number = 30
): number {
  const today = new Date();
  const completedDates = new Set(
    completions.map((c) => `${c.habit_id}:${c.completed_date}`)
  );

  let totalScheduled = 0;
  let totalCompleted = 0;

  for (let i = 0; i < windowDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);

    for (const habit of habits) {
      const isScheduled =
        habit.schedule_type === "daily" ||
        habit.schedule_days?.includes(d.getDay());

      if (isScheduled) {
        totalScheduled++;
        if (completedDates.has(`${habit.id}:${dateStr}`)) {
          totalCompleted++;
        }
      }
    }
  }

  return totalScheduled > 0
    ? Math.round((totalCompleted / totalScheduled) * 100)
    : 0;
}

function calculateBestStreak(habits: Habit[], completions: Completion[]): number {
  let bestStreak = 0;
  const today = new Date();

  for (const habit of habits) {
    const habitCompletions = new Set(
      completions
        .filter((c) => c.habit_id === habit.id)
        .map((c) => c.completed_date)
    );

    let streak = 0;
    const d = new Date(today);

    for (let i = 0; i < 120; i++) {
      const isScheduled =
        habit.schedule_type === "daily" ||
        habit.schedule_days?.includes(d.getDay());

      if (!isScheduled) {
        d.setDate(d.getDate() - 1);
        continue;
      }

      if (habitCompletions.has(formatDate(d))) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        if (i === 0 && formatDate(d) === formatDate(today)) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
    }

    bestStreak = Math.max(bestStreak, streak);
  }

  return bestStreak;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLeaderboard = useCallback(async () => {
    // Fetch all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .neq("display_name", "");

    if (!profiles || profiles.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch all public habits
    const { data: habits } = await supabase
      .from("habits")
      .select("*")
      .eq("is_public", true)
      .eq("is_active", true);

    // Fetch completions for public habits (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const publicHabitIds = (habits ?? []).map((h) => h.id);

    let completions: Completion[] = [];
    if (publicHabitIds.length > 0) {
      const { data } = await supabase
        .from("completions")
        .select("*")
        .in("habit_id", publicHabitIds)
        .gte("completed_date", formatDate(startDate));
      completions = data ?? [];
    }

    // Build leaderboard
    const leaderboard: LeaderboardEntry[] = (profiles as Profile[]).map((profile) => {
      const userHabits = (habits ?? []).filter((h: Habit) => h.user_id === profile.id);
      const userCompletions = completions.filter((c) => c.user_id === profile.id);

      return {
        profile,
        consistencyScore: calculateConsistencyScore(userHabits, userCompletions),
        totalPublicTasks: userHabits.length,
        bestStreak: calculateBestStreak(userHabits, userCompletions),
        rank: 0,
      };
    });

    // Sort and rank
    leaderboard.sort((a, b) => b.consistencyScore - a.consistencyScore);
    leaderboard.forEach((entry, i) => {
      entry.rank = i + 1;
    });

    setEntries(leaderboard);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, refetch: fetchLeaderboard };
}
