import { useQuery } from "@tanstack/react-query";
import { ref, get, query, limitToLast, orderByChild } from "firebase/database";
import { db } from "@/lib/firebase";

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number; // Assuming we might track a score or just use visit time as a placeholder
  lastVisit: number;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // For this demo, since we don't have game scores yet, we'll fetch recent users
      // In a real game, this would query by 'score'
      const recentUsersQuery = query(
        ref(db, "users"), 
        orderByChild("lastVisit"), 
        limitToLast(10)
      );
      
      const snapshot = await get(recentUsersQuery);
      
      if (!snapshot.exists()) return [];
      
      const data = snapshot.val();
      const entries: LeaderboardEntry[] = Object.entries(data).map(([id, user]: [string, any]) => ({
        id,
        nickname: user.nickname,
        score: Math.floor(Math.random() * 1000) + 100, // Mock score for visual
        lastVisit: user.lastVisit
      }));
      
      // Sort by mock score descending
      return entries.sort((a, b) => b.score - a.score);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
