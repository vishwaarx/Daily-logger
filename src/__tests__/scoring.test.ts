import { describe, it, expect } from "vitest";
import { calculateHabitStreak, calculateConsistencyScore } from "@/lib/scoring";
import type { Habit, Completion } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function makeHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "h1",
    user_id: "u1",
    name: "Test",
    emoji: "✅",
    schedule_type: "daily",
    schedule_days: null,
    is_public: true,
    sort_order: 0,
    is_active: true,
    created_at: "2026-01-01",
    ...overrides,
  };
}

function makeCompletion(habitId: string, date: string): Completion {
  return {
    id: `c-${habitId}-${date}`,
    habit_id: habitId,
    user_id: "u1",
    completed_date: date,
    created_at: date,
  };
}

function daysAgo(n: number, ref: Date = new Date("2026-04-01")): string {
  const d = new Date(ref);
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

const REF_DATE = new Date("2026-04-01");

describe("calculateHabitStreak", () => {
  it("returns 0 for no completions", () => {
    const habit = makeHabit();
    expect(calculateHabitStreak(habit, new Set(), REF_DATE)).toBe(0);
  });

  it("counts consecutive daily completions", () => {
    const habit = makeHabit();
    // Completed yesterday, day before, and day before that (3 day streak)
    const dates = new Set([daysAgo(1), daysAgo(2), daysAgo(3)]);
    expect(calculateHabitStreak(habit, dates, REF_DATE)).toBe(3);
  });

  it("stops at a gap", () => {
    const habit = makeHabit();
    // Completed yesterday and 3 days ago, but NOT 2 days ago
    const dates = new Set([daysAgo(1), daysAgo(3)]);
    expect(calculateHabitStreak(habit, dates, REF_DATE)).toBe(1);
  });

  it("skips non-scheduled days for specific_days habits", () => {
    // REF_DATE is 2026-04-01 (Wednesday, day 3)
    const habit = makeHabit({
      schedule_type: "specific_days",
      schedule_days: [1, 3, 5], // Mon, Wed, Fri
    });
    // Completed Wed (today-0 skipped as today), Mon (yesterday was Tue, not scheduled, so Mon=2 days ago)
    // Actually let's trace: Apr 1 = Wed (scheduled, today so skip),
    // Mar 31 = Tue (not scheduled, skip), Mar 30 = Mon (scheduled)
    // Mar 29 = Sun (not scheduled, skip), Mar 28 = Sat (not scheduled, skip)
    // Mar 27 = Fri (scheduled)
    const dates = new Set(["2026-03-30", "2026-03-27"]);
    expect(calculateHabitStreak(habit, dates, REF_DATE)).toBe(2);
  });

  it("resets streak when a scheduled day is missed", () => {
    const habit = makeHabit({
      schedule_type: "specific_days",
      schedule_days: [1, 3, 5], // Mon, Wed, Fri
    });
    // Completed Fri Mar 27 but missed Mon Mar 30
    const dates = new Set(["2026-03-27"]);
    expect(calculateHabitStreak(habit, dates, REF_DATE)).toBe(0);
  });

  it("allows today to be incomplete without breaking streak", () => {
    const habit = makeHabit();
    // Today is scheduled but not completed; yesterday and day before are completed
    const dates = new Set([daysAgo(1), daysAgo(2)]);
    expect(calculateHabitStreak(habit, dates, REF_DATE)).toBe(2);
  });

  it("includes today if completed", () => {
    const habit = makeHabit();
    const dates = new Set([daysAgo(0), daysAgo(1), daysAgo(2)]);
    expect(calculateHabitStreak(habit, dates, REF_DATE)).toBe(3);
  });
});

describe("calculateConsistencyScore", () => {
  it("returns 0 for no habits", () => {
    expect(calculateConsistencyScore([], [], 7, REF_DATE)).toBe(0);
  });

  it("returns 100 when all days completed", () => {
    const habit = makeHabit();
    const completions: Completion[] = [];
    for (let i = 0; i < 7; i++) {
      completions.push(makeCompletion("h1", daysAgo(i)));
    }
    expect(calculateConsistencyScore([habit], completions, 7, REF_DATE)).toBe(100);
  });

  it("returns correct percentage for partial completions", () => {
    const habit = makeHabit();
    // Complete 3 out of 7 days
    const completions = [
      makeCompletion("h1", daysAgo(0)),
      makeCompletion("h1", daysAgo(2)),
      makeCompletion("h1", daysAgo(4)),
    ];
    expect(calculateConsistencyScore([habit], completions, 7, REF_DATE)).toBe(43); // 3/7 = 42.8 -> 43
  });

  it("only counts scheduled days for specific_days habits", () => {
    // Wed Apr 1 is day 3. Over 7 days (Apr 1 back to Mar 26):
    // Wed(3), Tue, Mon(1), Sun, Sat, Fri(5), Thu
    // Scheduled days: Wed, Mon, Fri = 3 scheduled days
    const habit = makeHabit({
      schedule_type: "specific_days",
      schedule_days: [1, 3, 5],
    });
    // Complete all 3 scheduled days
    const completions = [
      makeCompletion("h1", "2026-04-01"), // Wed
      makeCompletion("h1", "2026-03-30"), // Mon
      makeCompletion("h1", "2026-03-27"), // Fri
    ];
    expect(calculateConsistencyScore([habit], completions, 7, REF_DATE)).toBe(100);
  });

  it("handles multiple habits", () => {
    const h1 = makeHabit({ id: "h1" });
    const h2 = makeHabit({ id: "h2" });
    // 7 day window, 2 daily habits = 14 scheduled
    // h1: all 7 done, h2: 0 done
    const completions: Completion[] = [];
    for (let i = 0; i < 7; i++) {
      completions.push(makeCompletion("h1", daysAgo(i)));
    }
    expect(calculateConsistencyScore([h1, h2], completions, 7, REF_DATE)).toBe(50);
  });
});
