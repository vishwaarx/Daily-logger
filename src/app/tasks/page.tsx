"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { HabitCard } from "@/components/tasks/HabitCard";
import { HabitForm } from "@/components/tasks/HabitForm";
import { useHabits } from "@/hooks/useHabits";
import type { Habit } from "@/lib/types";

export default function TasksPage() {
  const { habits, archivedHabits, loading, createHabit, updateHabit, archiveHabit } =
    useHabits();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();

  const handleCreate = async (data: {
    name: string;
    emoji: string;
    schedule_type: "daily" | "specific_days";
    schedule_days: number[] | null;
    is_public: boolean;
  }) => {
    await createHabit(data);
    setShowForm(false);
  };

  const handleEdit = async (data: {
    name: string;
    emoji: string;
    schedule_type: "daily" | "specific_days";
    schedule_days: number[] | null;
    is_public: boolean;
  }) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
      setEditingHabit(undefined);
    }
  };

  const handleArchive = async (id: string) => {
    await archiveHabit(id);
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-2 pb-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[26px] font-bold">My Tasks</h1>
          <button
            onClick={() => setShowForm(true)}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-emerald to-accent-cyan flex items-center justify-center"
          >
            <Plus size={20} className="text-bg-base" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 rounded-2xl border border-border-card bg-bg-card">
            <p className="text-text-tertiary text-sm mb-2">No tasks yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-accent-emerald font-medium"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={(h) => setEditingHabit(h)}
                  onArchive={handleArchive}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {archivedHabits.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-text-tertiary mb-3">
              Archived ({archivedHabits.length})
            </h2>
            <div className="space-y-2 opacity-60">
              {archivedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-bg-card border border-border-card rounded-2xl p-3 flex items-center gap-3"
                >
                  <span className="text-lg">{habit.emoji}</span>
                  <span className="text-sm text-text-secondary line-through">
                    {habit.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />

      <AnimatePresence>
        {showForm && (
          <HabitForm
            onSubmit={handleCreate}
            onClose={() => setShowForm(false)}
          />
        )}
        {editingHabit && (
          <HabitForm
            habit={editingHabit}
            onSubmit={handleEdit}
            onClose={() => setEditingHabit(undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
