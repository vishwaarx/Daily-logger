"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ConfettiProps {
  active: boolean;
}

function Particle({ delay }: { delay: number }) {
  const colors = ["#10B981", "#06B6D4", "#F59E0B", "#EA580C", "#EF4444"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * 300 - 150;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        y: [0, -200 - Math.random() * 100],
        x: [0, x],
        opacity: [1, 1, 0],
        scale: [1, 0.5],
        rotate: [0, rotation],
      }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color }}
    />
  );
}

export function Confetti({ active }: ConfettiProps) {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (active) {
      setParticles(Array.from({ length: 24 }, (_, i) => i));
      const timer = setTimeout(() => setParticles([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          {particles.map((i) => (
            <Particle key={i} delay={Math.random() * 0.3} />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
