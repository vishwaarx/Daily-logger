import type { Habit, Completion } from "./types";
import { formatDate } from "./utils";

/**
 * Calculate streak for a single habit: consecutive scheduled days completed,
 * walking backwards from the reference date.
 */
export function calculateHabitStreak(
  habit: Habit,
  completedDates: Set<string>,
  referenceDate: Date = new Date()
): number {
  let streak = 0;
  const d = new Date(referenceDate);
  const todayStr = formatDate(referenceDate);

  for (let i = 0; i < 120; i++) {
    const isScheduled =
      habit.schedule_type === "daily" ||
      (habit.schedule_days?.includes(d.getDay()) ?? false);

    if (!isScheduled) {
      d.setDate(d.getDate() - 1);
      continue;
    }

    const dateStr = formatDate(d);
    if (completedDates.has(dateStr)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      // Today is special: if today is scheduled but not yet completed, don't break streak
      if (i === 0 && dateStr === todayStr) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

/**
 * Calculate consistency score over a rolling window.
 * Score = (completed scheduled days / total scheduled days) * 100
 */
export function calculateConsistencyScore(
  habits: Habit[],
  completions: Completion[],
  windowDays: number = 30,
  referenceDate: Date = new Date()
): number {
  const completedDates = new Set(
    completions.map((c) => `${c.habit_id}:${c.completed_date}`)
  );

  let totalScheduled = 0;
  let totalCompleted = 0;

  for (let i = 0; i < windowDays; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);

    for (const habit of habits) {
      const isScheduled =
        habit.schedule_type === "daily" ||
        (habit.schedule_days?.includes(d.getDay()) ?? false);

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
