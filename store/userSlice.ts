import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Types ──────────────────────────────────────────────────────────────────
export type BadgeId = 'first_quest' | 'scam_buster' | 'saver' | 'streak_3' | 'streak_7' | 'level_5' | 'daily_hero';

export const BADGE_META: Record<BadgeId, { label: string; icon: string; desc: string }> = {
  first_quest:  { label: 'First Quest',   icon: '🗺️',  desc: 'Completed your first financial quest' },
  scam_buster:  { label: 'Scam Buster',   icon: '🛡️',  desc: 'Busted 5 scams in the Arena' },
  saver:        { label: 'Saver Star',    icon: '⭐',  desc: 'Saved ₹5,000 in the Savings Jar' },
  streak_3:     { label: '3-Day Warrior', icon: '🔥',  desc: 'Maintained a 3-day streak' },
  streak_7:     { label: 'Week Champion', icon: '👑',  desc: 'Maintained a 7-day streak' },
  level_5:      { label: 'Level 5 Hero',  icon: '🏆',  desc: 'Reached Level 5' },
  daily_hero:   { label: 'Daily Hero',    icon: '⚡',  desc: 'Completed all daily missions on time' },
};

import { MistakeRecord } from '../engine/adaptiveEngine';

export interface PerformanceHistory {
  date: string;
  accuracyAvg: number;
  timeAvgSec: number;
  jarsEarned: number;
}

interface UserState {
  name: string;
  hasOnboarded: boolean;
  language: string;
  guide: 'savitri' | 'shanti';
  avatar: string;
  isDarkMode: boolean;

  // Gamification stats
  xp: number;
  level: number;
  streak: number;
  trophies: number;
  badges: BadgeId[];

  // Antigravity Core
  totalJars: number;
  mistakes: Record<string, MistakeRecord>;
  performanceHistory: PerformanceHistory[];

  // ── Daily Timed Session ────────────────────────────────────────────────────
  lastSessionDate: string;    // ISO date string e.g. '2026-03-25'
  dailyDeadline: number;      // Unix epoch (ms) when today's mission window expires
  dailyMissionsCompleted: string[]; // IDs of missions completed today
  dailyRewardClaimed: boolean; // Has the end-of-day bonus been claimed today
  jarsEarnedToday: number;
}

const initialState: UserState = {
  name: '',
  hasOnboarded: false,
  language: 'en',
  guide: 'savitri',
  avatar: '👩',
  isDarkMode: false,

  xp: 0,
  level: 1,
  streak: 0,
  trophies: 0,
  badges: [],

  totalJars: 0,
  mistakes: {},
  performanceHistory: [],

  lastSessionDate: '',
  dailyDeadline: 0,
  dailyMissionsCompleted: [],
  dailyRewardClaimed: false,
  jarsEarnedToday: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    completeOnboarding(state) {
      state.hasOnboarded = true;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setGuide(state, action: PayloadAction<'savitri' | 'shanti'>) {
      state.guide = action.payload;
      state.avatar = action.payload === 'savitri' ? '👩' : '👵';
    },
    setAvatar(state, action: PayloadAction<string>) {
      state.avatar = action.payload;
    },
    addXP(state, action: PayloadAction<number>) {
      state.xp += action.payload;
      // Progressive leveling: each level needs 500 more XP than the previous
      let newLevel = 1;
      let xpThreshold = 1000;
      let xpStep = 1000;
      while (state.xp >= xpThreshold) {
        newLevel++;
        xpStep += 500;
        xpThreshold += xpStep;
      }
      state.level = newLevel;
    },
    addTrophy(state) {
      state.trophies += 1;
    },
    incrementStreak(state) {
      state.streak += 1;
    },
    toggleDarkMode(state) {
      state.isDarkMode = !state.isDarkMode;
    },

    // ── Daily timed session ─────────────────────────────────────────────────
    /**
     * Called once per day on first app open.
     * - Resets today's missions + reward flag
     * - Auto-increments streak for consecutive days, resets it if the user
     *   skipped a day
     */
    setDailyDeadline(state, action: PayloadAction<{ dateStr: string; deadline: number }>) {
      const { dateStr, deadline } = action.payload;

      // Streak auto-calculation
      if (state.lastSessionDate && state.lastSessionDate !== dateStr) {
        const last = new Date(state.lastSessionDate);
        const today = new Date(dateStr);
        const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);
        if (diffDays === 1) {
          state.streak = (state.streak ?? 0) + 1; // consecutive → grow
        } else if (diffDays > 1) {
          state.streak = 1; // gap → restart
        }
      } else if (!state.lastSessionDate) {
        state.streak = 1; // very first day
      }

      state.lastSessionDate = dateStr;
      state.dailyDeadline = deadline;
      state.dailyMissionsCompleted = [];  // fresh missions each day
      state.dailyRewardClaimed = false;   // reward resets each day
    },

    /** Mark a specific daily mission as completed (idempotent). */
    completeDailyMission(state, action: PayloadAction<string>) {
      if (!state.dailyMissionsCompleted.includes(action.payload)) {
        state.dailyMissionsCompleted.push(action.payload);
      }
    },

    claimDailyReward(state) {
      if (!state.dailyRewardClaimed) {
        state.dailyRewardClaimed = true;
        state.trophies = (state.trophies ?? 0) + 1;
      }
    },

    // ── Antigravity Update Reducers ──────────────────────────────────────────
    applyAntigravityResults(state, action: PayloadAction<{ jarsEarned: number, updatedMistakes: Record<string, MistakeRecord> }>) {
      const { jarsEarned, updatedMistakes } = action.payload;
      state.totalJars += jarsEarned;
      state.jarsEarnedToday += jarsEarned;
      state.mistakes = updatedMistakes;
    },

    archiveDailyPerformance(state, action: PayloadAction<{ accuracyAvg: number, timeAvgSec: number }>) {
      if (state.lastSessionDate && state.jarsEarnedToday > 0) {
        state.performanceHistory.push({
          date: state.lastSessionDate,
          accuracyAvg: action.payload.accuracyAvg,
          timeAvgSec: action.payload.timeAvgSec,
          jarsEarned: state.jarsEarnedToday
        });
        state.jarsEarnedToday = 0;
      }
    },

    /** Unlock a badge (idempotent). */
    unlockBadge(state, action: PayloadAction<BadgeId>) {
      if (!state.badges.includes(action.payload)) {
        state.badges.push(action.payload);
        state.trophies += 1;
      }
    },
    resetUser() {
      return initialState;
    },
  },
});

export const {
  setUserName, completeOnboarding, setLanguage, setGuide,
  setAvatar, addXP, addTrophy, incrementStreak, toggleDarkMode,
  setDailyDeadline, completeDailyMission, claimDailyReward, unlockBadge,
  applyAntigravityResults, archiveDailyPerformance,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
