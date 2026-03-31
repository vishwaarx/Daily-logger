"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Heatmap } from "@/components/stats/Heatmap";
import { getInitials, getStreakTier, formatDate } from "@/lib/utils";
import type { Profile, Habit, Completion } from "@/lib/types";

function calculateStreak(habit: Habit, completions: Completion[]): number {
  const completedDates = new Set(
    completions.filter((c) => c.habit_id === habit.id).map((c) => c.completed_date)
  );

  const today = new Date();
  let streak = 0;
  const d = new Date(today);

  for (let i = 0; i < 120; i++) {
    const isScheduled =
      habit.schedule_type === "daily" || habit.schedule_days?.includes(d.getDay());

    if (!isScheduled) {
      d.setDate(d.getDate() - 1);
      continue;
    }

    if (completedDates.has(formatDate(d))) {
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

  return streak;
}

export default function ArenaProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    // Fetch profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(prof);

    // Fetch public habits
    const { data: hab } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_public", true)
      .eq("is_active", true)
      .order("sort_order");

    setHabits(hab ?? []);

    // Fetch completions for public habits
    if (hab && hab.length > 0) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);

      const { data: comp } = await supabase
        .from("completions")
        .select("*")
        .in(
          "habit_id",
          hab.map((h: Habit) => h.id)
        )
        .gte("completed_date", formatDate(startDate));

      setCompletions(comp ?? []);
    }

    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-6 h-6 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-5">
        <p className="text-text-tertiary">User not found</p>
        <Link href="/arena" className="text-accent-emerald text-sm mt-3">
          Back to Arena
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh px-5 pt-2 pb-8 overflow-y-auto">
      <Link
        href="/arena"
        className="flex items-center gap-2 mb-6 text-text-secondary text-sm"
      >
        <ArrowLeft size={16} />
        Back to Arena
      </Link>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-bg-elevated border-2 border-accent-emerald flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-accent-emerald">
            {getInitials(profile.display_name)}
          </span>
        </div>
        <h1 className="text-xl font-bold">{profile.display_name}</h1>
        <p className="text-xs text-text-tertiary mt-1">
          {habits.length} public task{habits.length !== 1 ? "s" : ""}
        </p>
      </motion.div>

      {/* Public tasks with streaks */}
      <div className="space-y-3 mb-6">
        {habits.map((habit) => {
          const streak = calculateStreak(habit, completions);
          const tier = getStreakTier(streak);

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-bg-card border border-border-card rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center text-lg">
                {habit.emoji}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{habit.name}</p>
                <p className="text-xs text-text-tertiary">
                  {habit.schedule_type === "daily"
                    ? "Every day"
                    : `${habit.schedule_days?.length ?? 0} days/week`}
                </p>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-sm">{tier.emoji}</span>
                  <span className={`text-sm font-bold ${tier.color}`}>
                    {streak}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Heatmap */}
      {habits.length > 0 && (
        <Heatmap habits={habits} completions={completions} days={30} />
      )}
    </div>
  );
}
