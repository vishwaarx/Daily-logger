"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { TaskToggle } from "@/components/today/TaskToggle";
import { DateSelector } from "@/components/today/DateSelector";
import { Confetti } from "@/components/animations/Confetti";
import { StreakMilestone, MILESTONE_THRESHOLDS } from "@/components/animations/StreakMilestone";
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

  const { profile, loading: authLoading, signOut } = useAuth();
  const { habits, loading: habitsLoading } = useHabits();
  const { isCompleted, toggleCompletion, loading: compLoading } =
    useCompletions(dateStr);
  const { streaks, recalculate: recalculateStreaks } = useStreak(habits);

  const [showMenu, setShowMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestone, setMilestone] = useState<{ streak: number; habitName: string } | null>(null);
  const prevStreaks = useRef<Record<string, number>>({});

  const todayHabits = useMemo(
    () => habits.filter((h) => isScheduledForDate(h, selectedDate)),
    [habits, selectedDate]
  );

  const completedCount = todayHabits.filter((h) => isCompleted(h.id)).length;
  const allDone = todayHabits.length > 0 && completedCount === todayHabits.length;

  const checkMilestone = useCallback(
    (habitId: string) => {
      const oldStreak = prevStreaks.current[habitId] ?? 0;
      const newStreak = (streaks[habitId] ?? 0) + 1; // anticipate +1 since toggle just happened
      const habit = habits.find((h) => h.id === habitId);

      for (const threshold of MILESTONE_THRESHOLDS) {
        if (oldStreak < threshold && newStreak >= threshold && habit) {
          setMilestone({ streak: threshold, habitName: habit.name });
          return;
        }
      }
    },
    [streaks, habits]
  );

  const handleToggle = async (habitId: string) => {
    const wasCompleted = isCompleted(habitId);
    prevStreaks.current = { ...streaks };

    await toggleCompletion(habitId);

    // Check if all done after this toggle
    const newCompletedCount = wasCompleted ? completedCount - 1 : completedCount + 1;
    if (newCompletedCount === todayHabits.length && todayHabits.length > 0) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }

    // Check for streak milestone (only when completing, not uncompleting)
    if (!wasCompleted) {
      checkMilestone(habitId);
    }

    // Recalculate streaks after toggle
    setTimeout(() => recalculateStreaks(), 500);
  };

  const loading = authLoading || habitsLoading || compLoading;
  const displayName = profile?.display_name || "there";
  const initials = getInitials(displayName);
  const isToday = dateStr === formatDate(new Date());

  return (
    <div className="flex flex-col min-h-dvh">
      <Confetti active={showConfetti} />

      {/* Streak milestone celebration */}
      <AnimatePresence>
        {milestone && (
          <StreakMilestone
            streak={milestone.streak}
            habitName={milestone.habitName}
            onDismiss={() => setMilestone(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 px-5 pt-2 pb-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-text-secondary">{getGreeting()},</p>
            <h1 className="text-[30px] font-extrabold">{displayName}</h1>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-[42px] h-[42px] rounded-full bg-bg-elevated border border-border-card flex items-center justify-center"
            >
              <span className="text-sm font-semibold text-accent-emerald">
                {initials}
              </span>
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-12 bg-bg-card border border-border-card rounded-xl shadow-lg overflow-hidden z-40"
                >
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      await signOut();
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-bg-elevated transition-colors whitespace-nowrap"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 rounded-2xl border border-border-card bg-bg-card"
          >
            {habits.length === 0 ? (
              <>
                <motion.p
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="text-4xl mb-3"
                >
                  &#127793;
                </motion.p>
                <p className="text-text-primary font-medium text-sm mb-1">
                  Start your journey
                </p>
                <p className="text-text-tertiary text-xs">
                  Head to Tasks to create your first habit
                </p>
              </>
            ) : isToday ? (
              <>
                <motion.p
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="text-4xl mb-3"
                >
                  &#127769;
                </motion.p>
                <p className="text-text-primary font-medium text-sm mb-1">
                  Your evening check-in awaits
                </p>
                <p className="text-text-tertiary text-xs">
                  No tasks scheduled for today
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl mb-2">&#128197;</p>
                <p className="text-text-secondary text-sm">
                  No tasks scheduled for this day
                </p>
              </>
            )}
          </motion.div>
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
