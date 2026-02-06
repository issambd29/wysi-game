import { useState, useEffect } from "react";
import { ref, get, set, child } from "firebase/database";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

export interface GameProfile {
  id: string;
  nickname: string;
  firstVisit: number;
  lastVisit: number;
}

const STORAGE_KEY = "earth_keeper_id";

export function useGameProfile() {
  const [profile, setProfile] = useState<GameProfile | null>(null);
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
            // Update last visit
            await set(ref(db, `users/${storedId}`), {
              ...userData,
              lastVisit: Date.now()
            });
            setProfile({ id: storedId, ...userData });
          } else {
            // ID exists locally but not in DB (cleared DB?), treat as new
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

  const createProfile = async (nickname: string) => {
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

  return { profile, loading, createProfile };
}
