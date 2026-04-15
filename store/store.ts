/**
 * store.ts  –  Redux store with per-user persistence.
 *
 * Each player's state is persisted under its own namespace:
 *   "sakhi-ledger-user-<slug>"
 *
 * Call `switchUserProfile(slug)` to hot-swap the active profile at
 * runtime (login / logout / profile switch).  Until that is called
 * the store defaults to an anonymous in-memory-only session.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
  Persistor,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer, { resetUser } from './userSlice';
import simulationReducer, { resetSimulation } from './simulationSlice';
import engagementReducer, { resetEngagement } from './engagementSlice';
import { persistKeyForSlug } from './profileRegistry';

// ─── Reducer ─────────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  user:       userReducer,
  simulation: simulationReducer,
  engagement: engagementReducer,
});

export type RootState    = ReturnType<typeof rootReducer>;
export type AppDispatch  = typeof store.dispatch;

// ─── Boolean-fix transform (same logic as before) ────────────────────────────

const boolTransform = {
  in:  (state: any) => state,
  out: (state: any) => {
    if (state?.user) {
      state.user.isDarkMode    = state.user.isDarkMode    === true || state.user.isDarkMode    === 'true';
      state.user.hasOnboarded  = state.user.hasOnboarded  === true || state.user.hasOnboarded  === 'true';
    }
    if (state?.simulation) {
      state.simulation.lifeEventActive =
        state.simulation.lifeEventActive === true || state.simulation.lifeEventActive === 'true';
    }
    return state;
  },
};

// ─── buildPersistConfig ───────────────────────────────────────────────────────

function buildPersistConfig(key: string) {
  return {
    key,
    storage:    AsyncStorage,
    whitelist:  ['user', 'simulation', 'engagement'],
    transforms: [boolTransform],
  };
}

// ─── Store creation ───────────────────────────────────────────────────────────

/**
 * We start with a default anonymous key so the store can be created
 * synchronously at module load time (needed by the Provider wrapper).
 * Call switchUserProfile() as soon as the active slug is known.
 */
const DEFAULT_KEY = 'sakhi-ledger-anonymous';

const persistedReducer = persistReducer(buildPersistConfig(DEFAULT_KEY), rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ['result', 'register', 'payload.result'],
      },
    }),
});

export let persistor: Persistor = persistStore(store);

// Track the active persist key so we can manually save before switching.
let currentPersistKey = DEFAULT_KEY;

// ─── Profile switching ────────────────────────────────────────────────────────

/**
 * Saves the current player's Redux state directly to AsyncStorage, then
 * hot-swaps the store to the new player's slot.
 *
 * WHY manual write instead of persistor.flush():
 *   pause() sets an internal _isPaused flag that silently prevents flush()
 *   from writing.  Because we need to pause before anything else to stop
 *   race-condition writes, flush() was effectively a no-op — meaning the
 *   departing player's data was NEVER saved.  Writing the state ourselves
 *   via AsyncStorage.setItem (in redux-persist's exact serialisation format)
 *   is the only bulletproof approach.
 *
 * @param slug  The storage-safe slug. Pass `null` for "no player" state.
 */
export async function switchUserProfile(slug: string | null): Promise<Persistor> {
  // ── 1. Save departing player's state directly to their AsyncStorage slot ──
  //       Format must match redux-persist's default layout:
  //         AsyncStorage key : "persist:<rootKey>"
  //         Value            : JSON({ user: '{"name":...}', simulation: ..., _persist: ... })
  try {
    const state = store.getState() as any;
    const payload: Record<string, string> = {
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
    };
    if (state.user)       payload.user       = JSON.stringify(state.user);
    if (state.simulation) payload.simulation  = JSON.stringify(state.simulation);
    if (state.engagement) payload.engagement  = JSON.stringify(state.engagement);

    await AsyncStorage.setItem(
      `persist:${currentPersistKey}`,
      JSON.stringify(payload),
    );
  } catch (e) {
    // Non-fatal: in the worst case the departing player loses their last few
    // seconds of progress, but the incoming player's data is unaffected.
    console.warn('[switchUserProfile] manual save failed:', e);
  }

  // ── 2. Stop the old persistor so it can't write stale reset-state later ───
  persistor.pause();

  // ── 3. Clear in-memory Redux state.  Returning players will get their real
  //       state back from rehydration in step 5; new players start clean. ────
  store.dispatch(resetUser());
  store.dispatch(resetSimulation());
  store.dispatch(resetEngagement());

  // ── 4. Swap the persist key to the incoming player's slot ─────────────────
  const newKey = slug ? persistKeyForSlug(slug) : DEFAULT_KEY;
  currentPersistKey = newKey;

  const newPersisted = persistReducer(buildPersistConfig(newKey), rootReducer);
  store.replaceReducer(newPersisted as any);

  // ── 5. Create a fresh persistor — it reads from newKey and dispatches
  //       REHYDRATE.  PersistGate (remounted via gateKey in App.tsx) holds
  //       rendering until REHYDRATE completes, so returning players always
  //       land on Home (hasOnboarded=true) without ever seeing Onboarding. ───
  const newPersistor = persistStore(store);
  persistor = newPersistor;
  return newPersistor;
}
