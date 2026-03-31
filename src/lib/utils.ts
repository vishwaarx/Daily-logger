export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getStreakTier(streak: number) {
  if (streak >= 100) return { emoji: "👑", color: "text-streak-red", label: "Legend!", tier: 4 };
  if (streak >= 60) return { emoji: "🔥🔥🔥", color: "text-streak-orange", label: "2 months!", tier: 3 };
  if (streak >= 30) return { emoji: "🔥🔥", color: "text-streak-orange", label: "1 month!", tier: 2 };
  if (streak >= 7) return { emoji: "🔥", color: "text-streak-amber", label: "1 week!", tier: 1 };
  if (streak >= 1) return { emoji: "🔥", color: "text-streak-amber", label: "", tier: 0 };
  return { emoji: "", color: "text-text-tertiary", label: "", tier: -1 };
}
