"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Habit } from "@/lib/types";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchHabits = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true });

    setHabits(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void fetchHabits();
  }, [fetchHabits]);

  const createHabit = async (habit: {
    name: string;
    emoji: string;
    schedule_type: "daily" | "specific_days";
    schedule_days: number[] | null;
    is_public: boolean;
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const maxOrder = habits.reduce((max, h) => Math.max(max, h.sort_order), -1);

    const { data, error } = await supabase
      .from("habits")
      .insert({
        ...habit,
        user_id: user.id,
        sort_order: maxOrder + 1,
      })
      .select()
      .single();

    if (!error && data) {
      setHabits((prev) => [...prev, data]);
    }
    return data;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const { data, error } = await supabase
      .from("habits")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      setHabits((prev) => prev.map((h) => (h.id === id ? data : h)));
    }
    return data;
  };

  const archiveHabit = async (id: string) => {
    return updateHabit(id, { is_active: false });
  };

  const reorderHabits = async (reordered: Habit[]) => {
    setHabits(reordered);
    const updates = reordered.map((h, i) => ({
      id: h.id,
      sort_order: i,
      user_id: h.user_id,
      name: h.name,
      emoji: h.emoji,
      schedule_type: h.schedule_type,
      schedule_days: h.schedule_days,
      is_public: h.is_public,
      is_active: h.is_active,
      created_at: h.created_at,
    }));

    await supabase.from("habits").upsert(updates);
  };

  const activeHabits = habits.filter((h) => h.is_active);
  const archivedHabits = habits.filter((h) => !h.is_active);

  return {
    habits: activeHabits,
    archivedHabits,
    allHabits: habits,
    loading,
    createHabit,
    updateHabit,
    archiveHabit,
    reorderHabits,
    refetch: fetchHabits,
  };
}
