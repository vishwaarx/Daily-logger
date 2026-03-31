export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  schedule_type: "daily" | "specific_days";
  schedule_days: number[] | null;
  is_public: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Completion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  created_at: string;
}

export interface HabitWithStreak extends Habit {
  streak: number;
  completedToday: boolean;
}

export interface LeaderboardEntry {
  profile: Profile;
  consistencyScore: number;
  totalPublicTasks: number;
  bestStreak: number;
  rank: number;
}
