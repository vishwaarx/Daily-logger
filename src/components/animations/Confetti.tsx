"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface ConfettiProps {
  active: boolean;
}

interface ParticleData {
  color: string;
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

function Particle({ data }: { data: ParticleData }) {
  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        y: [0, data.y],
        x: [0, data.x],
        opacity: [1, 1, 0],
        scale: [1, 0.5],
        rotate: [0, data.rotation],
      }}
      transition={{ duration: 1.2, delay: data.delay, ease: "easeOut" }}
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: data.color }}
    />
  );
}

function generateParticles(count: number): ParticleData[] {
  const colors = ["#10B981", "#06B6D4", "#F59E0B", "#EA580C", "#EF4444"];
  return Array.from({ length: count }, () => ({
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.random() * 300 - 150,
    y: -200 - Math.random() * 100,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.3,
  }));
}

export function Confetti({ active }: ConfettiProps) {
  const particles = useMemo(
    () => (active ? generateParticles(24) : []),
    [active]
  );

  return (
    <AnimatePresence>
      {active && particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          {particles.map((p, i) => (
            <Particle key={i} data={p} />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
