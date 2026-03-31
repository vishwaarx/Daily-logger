"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { TaskToggle } from "@/components/today/TaskToggle";
import { DateSelector } from "@/components/today/DateSelector";
import { Confetti } from "@/components/animations/Confetti";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { useCompletions } from "@/hooks/useCompletions";
import { useStreak } from "@/hooks/useStreak";
import { formatDate, getGreeting, getInitials } from "@/lib/utils";
import type { Habit } from "@/lib/types";

function isScheduledForDate(habit: Habit, date: Date): boolean {
  if (habit.schedule_type === "daily") return true;
  if (!habit.schedule_days) return false;
  return habit.schedule_days.includes(date.getDay());
}

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = formatDate(selectedDate);

  const { profile, loading: authLoading } = useAuth();
  const { habits, loading: habitsLoading } = useHabits();
  const { isCompleted, toggleCompletion, loading: compLoading } =
    useCompletions(dateStr);
  const { streaks } = useStreak(habits);

  const todayHabits = useMemo(
    () => habits.filter((h) => isScheduledForDate(h, selectedDate)),
    [habits, selectedDate]
  );

  const completedCount = todayHabits.filter((h) => isCompleted(h.id)).length;
  const allDone = todayHabits.length > 0 && completedCount === todayHabits.length;
  const [showConfetti, setShowConfetti] = useState(false);

  const handleToggle = async (habitId: string) => {
    await toggleCompletion(habitId);

    // Check if all done after this toggle
    const wasCompleted = isCompleted(habitId);
    const newCompletedCount = wasCompleted ? completedCount - 1 : completedCount + 1;
    if (newCompletedCount === todayHabits.length && todayHabits.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const loading = authLoading || habitsLoading || compLoading;
  const displayName = profile?.display_name || "there";
  const initials = getInitials(displayName);

  return (
    <div className="flex flex-col min-h-dvh">
      <Confetti active={showConfetti} />

      <div className="flex-1 px-5 pt-2 pb-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-text-secondary">{getGreeting()},</p>
            <h1 className="text-[30px] font-extrabold">{displayName}</h1>
          </div>
          <div className="w-[42px] h-[42px] rounded-full bg-bg-elevated border border-border-card flex items-center justify-center">
            <span className="text-sm font-semibold text-accent-emerald">
              {initials}
            </span>
          </div>
        </div>

        {/* Date selector */}
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Completion summary */}
        <AnimatePresence mode="wait">
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-accent-emerald/10 to-accent-cyan/10 border border-accent-emerald/20 text-center"
            >
              <p className="text-lg font-bold">Perfect day!</p>
              <p className="text-sm text-text-secondary">
                All {todayHabits.length} tasks done
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!allDone && todayHabits.length > 0 && (
          <div className="mb-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-bg-elevated rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-emerald to-accent-cyan rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(completedCount / todayHabits.length) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
            <span className="text-xs text-text-tertiary font-medium whitespace-nowrap">
              {completedCount}/{todayHabits.length}
            </span>
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todayHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 rounded-2xl border border-border-card bg-bg-card">
            <p className="text-2xl mb-2">&#127769;</p>
            <p className="text-text-secondary text-sm">
              {habits.length === 0
                ? "No tasks yet. Create one in Tasks tab!"
                : "No tasks scheduled for this day"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {todayHabits.map((habit) => (
                <TaskToggle
                  key={habit.id}
                  habit={habit}
                  completed={isCompleted(habit.id)}
                  streak={streaks[habit.id] ?? 0}
                  onToggle={() => handleToggle(habit.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
