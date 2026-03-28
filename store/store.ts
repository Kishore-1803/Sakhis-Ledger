import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './userSlice';
import simulationReducer from './simulationSlice';
import engagementReducer from './engagementSlice';

const persistConfig = {
  key: 'sakhi-ledger-root',
  storage: AsyncStorage,
  whitelist: ['user', 'simulation', 'engagement'],
  // Fix for string-to-boolean casting issues
  transforms: [
    {
      in: (state: any) => state, // when saving to storage
      out: (state: any) => {
        // when loading from storage, convert string booleans to actual booleans
        if (state && state.user) {
          state.user.isDarkMode = state.user.isDarkMode === true || state.user.isDarkMode === 'true';
          state.user.hasOnboarded = state.user.hasOnboarded === true || state.user.hasOnboarded === 'true';
        }
        if (state && state.simulation) {
          state.simulation.lifeEventActive = state.simulation.lifeEventActive === true || state.simulation.lifeEventActive === 'true';
        }
        return state;
      },
    },
  ],
};

const rootReducer = combineReducers({
  user: userReducer,
  simulation: simulationReducer,
  engagement: engagementReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/FLUSH',
          'persist/PURGE',
          'persist/PAUSE',
          'persist/REGISTER',
        ],
        ignoredActionPaths: ['result', 'register', 'payload.result'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
