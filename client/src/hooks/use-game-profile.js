import { useState, useEffect } from "react";
import { ref, get, set, push, child } from "firebase/database";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

const STORAGE_KEY = "earth_keeper_id";

export function useGameProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const storedId = localStorage.getItem(STORAGE_KEY);
        
        if (storedId) {
          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, `users/${storedId}`));
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            await set(ref(db, `users/${storedId}`), {
              ...userData,
              lastVisit: Date.now()
            });
            setProfile({ id: storedId, ...userData });
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast({
          title: "Connection Issue",
          description: "Could not connect to the forest records.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  const createProfile = async (nickname) => {
    if (!nickname.trim()) return;
    
    const newId = nanoid();
    const newProfile = {
      nickname: nickname.trim(),
      firstVisit: Date.now(),
      lastVisit: Date.now()
    };

    try {
      await set(ref(db, `users/${newId}`), newProfile);
      localStorage.setItem(STORAGE_KEY, newId);
      setProfile({ id: newId, ...newProfile });
      
      toast({
        title: "Welcome, Keeper",
        description: "Your spirit has been bound to this realm.",
      });
      return true;
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast({
        title: "Registration Failed",
        description: "The ancient spirits could not record your name.",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveScore = async (data) => {
    const userId = localStorage.getItem(STORAGE_KEY);
    if (!userId || !profile) return;

    const record = {
      nickname: profile.nickname,
      userId,
      score: data.score,
      level: data.level,
      levelName: data.levelName,
      difficulty: data.difficulty,
      maxCombo: data.maxCombo,
      collected: data.collected,
      destroyed: data.destroyed,
      time: Math.floor(data.time),
      timestamp: Date.now(),
    };

    try {
      await push(ref(db, "scores"), record);

      const userRef = ref(db, `users/${userId}`);
      const snap = await get(userRef);
      if (snap.exists()) {
        const userData = snap.val();
        const currentBest = userData.bestScore || 0;
        const updates = { ...userData, lastVisit: Date.now() };
        if (data.score > currentBest) {
          updates.bestScore = data.score;
          updates.bestLevel = data.level;
          updates.bestLevelName = data.levelName;
          updates.bestDifficulty = data.difficulty;
        }
        await set(userRef, updates);
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  return { profile, loading, createProfile, saveScore };
}
