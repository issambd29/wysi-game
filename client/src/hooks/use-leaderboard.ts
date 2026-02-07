import { useQuery } from "@tanstack/react-query";
import { ref, get, query, limitToLast, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  level: number;
  levelName: string;
  difficulty: string;
  maxCombo: number;
  time: number;
  timestamp: number;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const scoresQuery = query(
        ref(db, "scores"),
        orderByChild("score"),
        limitToLast(20)
      );

      const snapshot = await get(scoresQuery);

      if (!snapshot.exists()) return [];

      const data = snapshot.val();
      const entries: LeaderboardEntry[] = Object.entries(data).map(([id, record]: [string, any]) => ({
        id,
        nickname: record.nickname || "Unknown",
        score: record.score || 0,
        level: record.level || 1,
        levelName: record.levelName || "Awakening",
        difficulty: record.difficulty || "normal",
        maxCombo: record.maxCombo || 0,
        time: record.time || 0,
        timestamp: record.timestamp || 0,
      }));

      return entries.sort((a, b) => b.score - a.score);
    },
    staleTime: 1000 * 30,
  });
}
