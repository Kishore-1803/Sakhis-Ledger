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
import userReducer, { resetUser, pauseDailyTimer, hydrateUser } from './userSlice';
import simulationReducer, { resetSimulation, hydrateSimulation } from './simulationSlice';
import engagementReducer, { resetEngagement, hydrateEngagement } from './engagementSlice';
import { persistKeyForSlug } from './profileRegistry';

// ─── Reducer ─────────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  user:       userReducer,
  simulation: simulationReducer,
  engagement: engagementReducer,
});

export type RootState    = ReturnType<typeof rootReducer>;
export type AppDispatch  = typeof store.dispatch;

// ─── Boolean-fix transform ────────────────────────────────────────────────────

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
 * Saves the current player's Redux state to AsyncStorage, then hot-swaps
 * the store to the incoming player's slot.
 *
 * @param slug  Storage-safe slug. Pass `null` to go back to Login screen.
 */
export async function switchUserProfile(slug: string | null): Promise<Persistor> {
  // ── 1. Flush + save departing player's state ──────────────────────────────
  //       flush() drains any pending debounced write from redux-persist so our
  //       manual snapshot is always consistent with what's in storage.
  try {
    await persistor.flush();
  } catch {}

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
    console.warn('[switchUserProfile] save failed:', e);
  }

  // ── 2. Stop old persistor — prevents stale writes after the reset ─────────
  persistor.pause();

  // ── 3. Reset in-memory Redux state ────────────────────────────────────────
  store.dispatch(resetUser());
  store.dispatch(resetSimulation());
  store.dispatch(resetEngagement());

  // ── 4. Swap to incoming player's storage namespace ────────────────────────
  const newKey = slug ? persistKeyForSlug(slug) : DEFAULT_KEY;
  currentPersistKey = newKey;

  // ── 5. Pre-load incoming player's data (before React render) ─────────────
  //       Dispatching hydrate actions ensures the store already holds the
  //       correct state when React re-renders, regardless of PersistGate timing.
  if (slug) {
    try {
      const raw = await AsyncStorage.getItem(`persist:${newKey}`);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;

        if (parsed.user) {
          try { store.dispatch(hydrateUser(JSON.parse(parsed.user))); } catch {}
        }
        if (parsed.simulation) {
          try { store.dispatch(hydrateSimulation(JSON.parse(parsed.simulation))); } catch {}
        }
        if (parsed.engagement) {
          try { store.dispatch(hydrateEngagement(JSON.parse(parsed.engagement))); } catch {}
        }
      }
    } catch (e) {
      console.warn('[switchUserProfile] pre-load failed:', e);
    }
  }

  // ── 6. Replace reducer + create fresh persistor for the new namespace ──────
  const newPersisted = persistReducer(buildPersistConfig(newKey), rootReducer);
  store.replaceReducer(newPersisted as any);

  const newPersistor = persistStore(store);
  persistor = newPersistor;

  // ── 7. Wait for REHYDRATE to complete before returning ────────────────────
  //       switchUserProfile only resolves AFTER the new persistor has fully
  //       bootstrapped (REHYDRATE done) — no more race conditions with
  //       Fortune Tree, Jars, or any other slice showing stale/reset state.
  await new Promise<void>((resolve) => {
    if (newPersistor.getState().bootstrapped) {
      resolve();
      return;
    }
    const unsub = newPersistor.subscribe(() => {
      if (newPersistor.getState().bootstrapped) {
        unsub();
        resolve();
      }
    });
    // Safety valve: if REHYDRATE never fires (e.g. storage error), don't hang
    setTimeout(() => { unsub(); resolve(); }, 3000);
  });

  return newPersistor;
}
