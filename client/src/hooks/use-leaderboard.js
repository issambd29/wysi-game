import { useQuery } from "@tanstack/react-query";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const snapshot = await get(ref(db, "scores"));

      if (!snapshot.exists()) return [];

      const data = snapshot.val();
      const entries = Object.entries(data).map(([id, record]) => ({
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

      return entries.sort((a, b) => b.score - a.score).slice(0, 20);
    },
    staleTime: 1000 * 30,
  });
}
