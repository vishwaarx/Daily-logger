"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface StreakMilestoneProps {
  streak: number;
  habitName: string;
  onDismiss: () => void;
}

const MILESTONE_MESSAGES: Record<number, { title: string; emoji: string }> = {
  7: { title: "1 Week Streak!", emoji: "\uD83D\uDD25" },
  30: { title: "1 Month Streak!", emoji: "\uD83D\uDD25\uD83D\uDD25" },
  60: { title: "2 Month Streak!", emoji: "\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25" },
  100: { title: "LEGENDARY!", emoji: "\uD83D\uDC51" },
};

export function StreakMilestone({ streak, habitName, onDismiss }: StreakMilestoneProps) {
  const milestone = MILESTONE_MESSAGES[streak];
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => i));
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!milestone) return null;

  const colors = ["#10B981", "#06B6D4", "#F59E0B", "#EA580C", "#EF4444", "#A855F7"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onDismiss}
      >
        {/* Particles */}
        {particles.map((i) => {
          const color = colors[i % colors.length];
          const angle = (i / particles.length) * 360;
          const radius = 120 + Math.random() * 80;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x,
                y,
                opacity: [1, 1, 0],
                scale: [0, 1.5, 0.5],
              }}
              transition={{ duration: 1.5, delay: Math.random() * 0.3 }}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          );
        })}

        {/* Milestone card */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-bg-card border border-border-card rounded-3xl p-8 text-center shadow-2xl z-10"
        >
          <motion.p
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: 2, duration: 0.5 }}
            className="text-5xl mb-3"
          >
            {milestone.emoji}
          </motion.p>
          <h2 className="text-2xl font-extrabold mb-1">{milestone.title}</h2>
          <p className="text-sm text-text-secondary mb-2">{habitName}</p>
          <p className="text-3xl font-black bg-gradient-to-r from-streak-amber to-streak-red bg-clip-text text-transparent">
            {streak} days
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export const MILESTONE_THRESHOLDS = [7, 30, 60, 100];
