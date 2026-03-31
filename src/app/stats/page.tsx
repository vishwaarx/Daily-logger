"use client";

import { useEffect, useState, useCallback } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { WeeklyGrid } from "@/components/stats/WeeklyGrid";
import { Heatmap } from "@/components/stats/Heatmap";
import { HabitStats } from "@/components/stats/HabitStats";
import { useHabits } from "@/hooks/useHabits";
import { useStreak } from "@/hooks/useStreak";
import { createClient } from "@/lib/supabase/client";
import type { Completion } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function StatsPage() {
  const { habits, loading: habitsLoading } = useHabits();
  const { streaks } = useStreak(habits);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCompletions = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const { data } = await supabase
      .from("completions")
      .select("*")
      .eq("user_id", user.id)
      .gte("completed_date", formatDate(startDate));

    setCompletions(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  // Calculate week start (Sunday)
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  // Overall daily score
  const todayStr = formatDate(today);
  const todayCompletions = completions.filter((c) => c.completed_date === todayStr).length;
  const scheduledToday = habits.filter((h) => {
    if (h.schedule_type === "daily") return true;
    return h.schedule_days?.includes(today.getDay());
  }).length;
  const todayScore = scheduledToday > 0 ? Math.round((todayCompletions / scheduledToday) * 100) : 0;

  const isLoading = habitsLoading || loading;

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-2 pb-4 overflow-y-auto">
        <h1 className="text-[26px] font-bold mb-5">Your Stats</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <div className="flex items-center justify-center h-40 rounded-2xl border border-border-card bg-bg-card">
            <p className="text-text-tertiary text-sm">
              Create tasks to see your stats
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Today score */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-5 text-center">
              <p className="text-xs text-text-tertiary mb-1">Today&apos;s Score</p>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-accent-emerald to-accent-cyan bg-clip-text text-transparent">
                {todayScore}%
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {todayCompletions}/{scheduledToday} tasks
              </p>
            </div>

            {/* Weekly grid */}
            <WeeklyGrid
              habits={habits}
              completions={completions}
              weekStart={weekStart}
            />

            {/* Heatmap */}
            <Heatmap habits={habits} completions={completions} days={90} />

            {/* Per-habit stats */}
            <h2 className="text-sm font-medium text-text-secondary mt-2">
              Per Task
            </h2>
            {habits.map((habit) => (
              <HabitStats
                key={habit.id}
                habit={habit}
                completions={completions}
                streak={streaks[habit.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
