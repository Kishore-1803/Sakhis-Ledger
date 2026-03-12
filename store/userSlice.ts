import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  hasOnboarded: boolean;
  language: string;
  guide: 'savitri' | 'shanti';
  avatar: string;
  
  // Gamification stats
  xp: number;
  level: number;
  streak: number;
  trophies: number;
}

const initialState: UserState = {
  name: '',
  hasOnboarded: false,
  language: 'en',
  guide: 'savitri',
  avatar: '👩',
  
  xp: 0,
  level: 1,
  streak: 0,
  trophies: 0,
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
      state.avatar = action.payload === 'savitri' ? '👩' : '👵'; // Simple avatar change
    },
    setAvatar(state, action: PayloadAction<string>) {
      state.avatar = action.payload;
    },
    addXP(state, action: PayloadAction<number>) {
      state.xp += action.payload;
      
      // Progressive leveling logic: XP required for each new level increases
      let newLevel = 1;
      let xpThreshold = 1000; // XP needed for Level 2
      let xpStep = 1000;      // Base step

      while (state.xp >= xpThreshold) {
        newLevel++;
        xpStep += 500; // Next level gap becomes larger by 500
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
    resetUser() {
      return initialState;
    },
  },
});

export const { 
  setUserName, completeOnboarding, setLanguage, setGuide, 
  setAvatar, addXP, addTrophy, incrementStreak, resetUser 
} = userSlice.actions;

export default userSlice.reducer;
