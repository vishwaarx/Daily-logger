"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Habit } from "@/lib/types";

const EMOJI_OPTIONS = [
  "🏃", "📖", "💪", "🧘", "💤", "💧", "🍎", "✍️",
  "🎯", "🧠", "🎵", "🏋️", "🚶", "📝", "🌅", "✅",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface HabitFormProps {
  habit?: Habit;
  onSubmit: (data: {
    name: string;
    emoji: string;
    schedule_type: "daily" | "specific_days";
    schedule_days: number[] | null;
    is_public: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

export function HabitForm({ habit, onSubmit, onClose }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? "");
  const [emoji, setEmoji] = useState(habit?.emoji ?? "✅");
  const [scheduleType, setScheduleType] = useState<"daily" | "specific_days">(
    habit?.schedule_type ?? "daily"
  );
  const [scheduleDays, setScheduleDays] = useState<number[]>(
    habit?.schedule_days ?? [1, 2, 3, 4, 5]
  );
  const [isPublic, setIsPublic] = useState(habit?.is_public ?? true);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: number) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSubmit({
      name: name.trim(),
      emoji,
      schedule_type: scheduleType,
      schedule_days: scheduleType === "specific_days" ? scheduleDays : null,
      is_public: isPublic,
    });
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-bg-card rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {habit ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="p-2 text-text-secondary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Emoji picker */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                    emoji === e
                      ? "bg-accent-emerald/20 ring-2 ring-accent-emerald"
                      : "bg-bg-elevated"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Task name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning walk"
              className="w-full h-[48px] rounded-[14px] bg-bg-input border border-border-card px-4 text-[15px] text-text-primary placeholder:text-text-muted outline-none focus:border-accent-emerald transition-colors"
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              Schedule
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setScheduleType("daily")}
                className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${
                  scheduleType === "daily"
                    ? "bg-accent-emerald text-bg-base"
                    : "bg-bg-elevated text-text-secondary"
                }`}
              >
                Every day
              </button>
              <button
                type="button"
                onClick={() => setScheduleType("specific_days")}
                className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${
                  scheduleType === "specific_days"
                    ? "bg-accent-emerald text-bg-base"
                    : "bg-bg-elevated text-text-secondary"
                }`}
              >
                Specific days
              </button>
            </div>

            <AnimatePresence>
              {scheduleType === "specific_days" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-1.5 overflow-hidden"
                >
                  {DAYS.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${
                        scheduleDays.includes(i)
                          ? "bg-accent-emerald text-bg-base"
                          : "bg-bg-elevated text-text-tertiary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                {isPublic ? "Public" : "Private"}
              </p>
              <p className="text-xs text-text-tertiary">
                {isPublic
                  ? "Visible on leaderboard"
                  : "Only you can see this"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                isPublic ? "bg-accent-emerald" : "bg-bg-elevated"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                  isPublic ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full h-[48px] rounded-[14px] bg-gradient-to-r from-accent-emerald to-accent-cyan font-semibold text-bg-base text-base disabled:opacity-50 transition-opacity"
          >
            {saving ? "Saving..." : habit ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
