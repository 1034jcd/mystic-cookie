import { useState, useEffect, useCallback } from 'react';

export interface SavedFortune {
  id: number;
  text: string;
  category: string;
  luckyNumbers: number[];
  date: string;
}

export interface Stats {
  totalCracked: number;
  streak: number;
  lastCrackedDate: string | null;
}

export interface Subscription {
  active: boolean;
  purchasedAt: string | null;
}

interface FortuneStore {
  savedFortunes: SavedFortune[];
  stats: Stats;
  subscription: Subscription;
  saveFortune: (fortune: SavedFortune) => void;
  removeFortune: (id: number) => void;
  incrementCracked: () => void;
  setSubscriptionActive: (active: boolean) => void;
}

const getInitialState = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const useFortuneStore = (): FortuneStore => {
  const [savedFortunes, setSavedFortunes] = useState<SavedFortune[]>(() => 
    getInitialState('mystic_fortunes', [])
  );
  const [stats, setStats] = useState<Stats>(() => 
    getInitialState('mystic_stats', { totalCracked: 0, streak: 0, lastCrackedDate: null })
  );
  const [subscription, setSubscription] = useState<Subscription>(() => 
    getInitialState('mystic_sub', { active: false, purchasedAt: null })
  );

  useEffect(() => {
    window.localStorage.setItem('mystic_fortunes', JSON.stringify(savedFortunes));
  }, [savedFortunes]);

  useEffect(() => {
    window.localStorage.setItem('mystic_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    window.localStorage.setItem('mystic_sub', JSON.stringify(subscription));
  }, [subscription]);

  const saveFortune = useCallback((fortune: SavedFortune) => {
    setSavedFortunes((prev) => {
      if (prev.some(f => f.id === fortune.id)) return prev;
      return [fortune, ...prev];
    });
  }, []);

  const removeFortune = useCallback((id: number) => {
    setSavedFortunes((prev) => prev.filter(f => f.id !== id));
  }, []);

  const incrementCracked = useCallback(() => {
    setStats((prev) => {
      const today = new Date().toISOString().split('T')[0];
      let newStreak = prev.streak;
      
      if (prev.lastCrackedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];
        
        if (prev.lastCrackedDate === yStr) {
          newStreak += 1;
        } else if (prev.lastCrackedDate !== today) {
          newStreak = 1;
        }
      }

      return {
        totalCracked: prev.totalCracked + 1,
        streak: newStreak,
        lastCrackedDate: today
      };
    });
  }, []);

  const setSubscriptionActive = useCallback((active: boolean) => {
    setSubscription({
      active,
      purchasedAt: active ? new Date().toISOString() : null
    });
  }, []);

  return {
    savedFortunes,
    stats,
    subscription,
    saveFortune,
    removeFortune,
    incrementCracked,
    setSubscriptionActive
  };
};
