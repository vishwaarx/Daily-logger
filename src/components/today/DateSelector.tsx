"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date();
  const todayStr = formatDate(today);
  const selectedStr = formatDate(selectedDate);
  const isToday = todayStr === selectedStr;

  // Generate 7 days centered around selected date
  const dates: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const goBack = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const goForward = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (formatDate(d) <= todayStr) {
      onDateChange(d);
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <button onClick={goBack} className="p-2 text-text-secondary">
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-text-secondary">
          {isToday
            ? "Today"
            : `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`}
        </p>
        <button
          onClick={goForward}
          className="p-2 text-text-secondary disabled:opacity-30"
          disabled={isToday}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex gap-1.5 justify-center">
        {dates.map((date) => {
          const dateStr = formatDate(date);
          const isSel = dateStr === selectedStr;
          const isFuture = dateStr > todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onDateChange(date)}
              disabled={isFuture}
              className={`flex flex-col items-center w-10 py-1.5 rounded-xl transition-colors ${
                isSel
                  ? "bg-accent-emerald"
                  : isFuture
                  ? "opacity-30"
                  : "bg-bg-card"
              }`}
            >
              <span
                className={`text-[10px] font-medium ${
                  isSel ? "text-bg-base" : "text-text-tertiary"
                }`}
              >
                {DAYS_SHORT[date.getDay()]}
              </span>
              <span
                className={`text-sm font-bold ${
                  isSel ? "text-bg-base" : "text-text-primary"
                }`}
              >
                {date.getDate()}
              </span>
              {dateStr === todayStr && !isSel && (
                <motion.div className="w-1 h-1 rounded-full bg-accent-emerald mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
