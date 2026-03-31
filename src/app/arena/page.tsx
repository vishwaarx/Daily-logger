"use client";

import { BottomNav } from "@/components/ui/BottomNav";
import { Podium } from "@/components/arena/Podium";
import { LeaderboardCard } from "@/components/arena/LeaderboardCard";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { Trophy } from "lucide-react";

export default function ArenaPage() {
  const { entries, loading } = useLeaderboard();
  const { user } = useAuth();

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-2 pb-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={22} className="text-streak-amber" />
          <h1 className="text-[26px] font-bold">Arena</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 rounded-2xl border border-border-card bg-bg-card">
            <p className="text-text-tertiary text-sm">
              No users on the leaderboard yet
            </p>
          </div>
        ) : (
          <>
            {/* Podium for top 3 */}
            {topThree.length >= 2 && <Podium entries={topThree} />}

            {/* Remaining users */}
            <div className="space-y-2.5">
              {(topThree.length < 2 ? entries : rest).map((entry) => (
                <LeaderboardCard
                  key={entry.profile.id}
                  entry={entry}
                  isCurrentUser={entry.profile.id === user?.id}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
