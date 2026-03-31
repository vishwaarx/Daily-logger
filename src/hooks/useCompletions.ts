"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Completion } from "@/lib/types";

export function useCompletions(date: string) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCompletions = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("completions")
      .select("*")
      .eq("user_id", user.id)
      .eq("completed_date", date);

    setCompletions(data ?? []);
    setLoading(false);
  }, [supabase, date]);

  useEffect(() => {
    void fetchCompletions();
  }, [fetchCompletions]);

  const toggleCompletion = async (habitId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const existing = completions.find((c) => c.habit_id === habitId);

    if (existing) {
      await supabase.from("completions").delete().eq("id", existing.id);
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const { data } = await supabase
        .from("completions")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completed_date: date,
        })
        .select()
        .single();

      if (data) {
        setCompletions((prev) => [...prev, data]);
      }
    }
  };

  const isCompleted = (habitId: string) =>
    completions.some((c) => c.habit_id === habitId);

  return { completions, loading, toggleCompletion, isCompleted, refetch: fetchCompletions };
}
