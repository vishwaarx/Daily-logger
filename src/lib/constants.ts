export const COLORS = {
  bgBase: "#0A0A0F",
  bgCard: "#141419",
  bgElevated: "#1A1A22",
  bgInput: "#1E1E28",
  textPrimary: "#F5F5F0",
  textSecondary: "#8A8A95",
  textTertiary: "#5A5A65",
  textMuted: "#3A3A45",
  accentEmerald: "#10B981",
  accentCyan: "#06B6D4",
  accentTeal: "#0D9488",
  streakAmber: "#F59E0B",
  streakOrange: "#EA580C",
  streakRed: "#DC2626",
  borderSubtle: "#1E1E28",
  borderCard: "#2A2A35",
} as const;

export const STREAK_TIERS = [
  { min: 1, max: 6, label: "Starting", color: COLORS.streakAmber },
  { min: 7, max: 29, label: "1 week!", color: COLORS.streakAmber },
  { min: 30, max: 59, label: "1 month!", color: COLORS.streakOrange },
  { min: 60, max: 99, label: "2 months!", color: COLORS.streakOrange },
  { min: 100, max: Infinity, label: "Legend!", color: COLORS.streakRed },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Today", icon: "house" },
  { href: "/stats", label: "Stats", icon: "chart-no-axes-column-increasing" },
  { href: "/tasks", label: "Tasks", icon: "list-checks" },
  { href: "/arena", label: "Arena", icon: "trophy" },
] as const;
