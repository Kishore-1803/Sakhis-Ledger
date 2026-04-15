# Multi-Player Login & Persistence — Problem Summary

## The App Context
**Sakhi's Ledger** — an offline-first React Native (Expo) financial literacy game for SHG women.
- Multiple players (e.g. Priya, Meena, Anita) share one physical device.
- Each player has their own XP, level, Fortune Tree growth, jar savings, Arena progress, quests, and streaks.
- All data must work 100% offline — no backend, no server, only `AsyncStorage` on the device.
- State management: **Redux Toolkit** + **redux-persist** (per-player namespaced keys).

---

## The Core Problem

### What the user experienced
1. Player Priya plays for the first time → completes Onboarding (language, didi, name).
2. Priya switches to another player.
3. **Next day, Priya clicks her name** from the login list.
4. ❌ The app asks for language, didi, and name **all over again**.
5. ❌ A second "Priya" entry gets added to the player list.
6. ❌ All of Priya's previous XP, tree points, jars, and Arena progress are gone.

---

## Root Causes Found (in order of discovery)

### Bug 1 — `persistor.purge()` was deleting player data
**Where:** `store/store.ts` → `switchUserProfile()`

**What happened:**
```typescript
// BROKEN sequence:
persistor.pause();
await persistor.flush();  // saves data to AsyncStorage ✅
await persistor.purge();  // IMMEDIATELY DELETES what was just saved ❌
```
Every time a player switched away, their entire game state (XP, hasOnboarded, jars, tree) was wiped from AsyncStorage. On return, there was nothing to load.

**Fix:** Removed `persistor.purge()` entirely.

---

### Bug 2 — `pause()` before `flush()` made flush() do nothing
**Where:** `store/store.ts` → `switchUserProfile()`

**What happened:**
```typescript
// BROKEN sequence:
persistor.pause();   // sets internal _isPaused = true
await persistor.flush();  // checks _isPaused → exits silently, writes NOTHING ❌
```
The redux-persist `pause()` sets an internal `_isPaused` flag. When `flush()` is called after `pause()`, it sees the flag and does nothing. So the player's data was **never saved** before the switch.

**Fix:** Replaced `flush()` with a **direct, manual AsyncStorage write** in redux-persist's exact serialization format:
```typescript
const payload = {
  _persist: JSON.stringify({ version: -1, rehydrated: true }),
  user: JSON.stringify(state.user),
  simulation: JSON.stringify(state.simulation),
  engagement: JSON.stringify(state.engagement),
};
await AsyncStorage.setItem(`persist:${currentPersistKey}`, JSON.stringify(payload));
// THEN pause (no longer interferes with saving)
persistor.pause();
```
A module-level `currentPersistKey` variable tracks which player's slot is active so we always write to the correct namespace.

---

### Bug 3 — PersistGate never remounted between players
**Where:** `App.tsx`

**What happened:**
```typescript
// BROKEN key logic:
<PersistGate key={activePersistor === persistor ? 'init' : String(activeSlug)} ...>
```
Inside `switchUserProfile`, the code does `persistor = newPersistor` before returning `newPersistor`. So `activePersistor === persistor` was **always true** — the key was always `'init'`. `PersistGate` never unmounted, never remounted, never waited for rehydration.

**Fix:** Used a plain incrementing counter (`gateKey`) as the `PersistGate` key:
```typescript
const [gateKey, setGateKey] = useState(0);
// On every player switch:
setGateKey(k => k + 1); // forces PersistGate to unmount → remount → rehydrate
```

---

### Bug 4 — Routing relied on Redux `hasOnboarded` before rehydration completed
**Where:** `App.tsx` → `AppNavigator`

**What happened:**
Even with the above fixes, there was a timing race. `hasOnboarded` is read from Redux state. After a player switch, `resetUser()` sets it to `false`. Rehydration (restoring `true` from AsyncStorage) is async. If the `AppNavigator` rendered even a millisecond before rehydration finished, it saw `hasOnboarded=false` and showed Onboarding.

**Fix:** Bypassed Redux entirely for this routing decision. The **LoginScreen already knows** if a player is existing or new:
```typescript
// In App root, two separate handlers:
const handleSelectExisting = (np, slug) => {
  setIsExistingPlayer(true);  // ← existing player: NEVER show Onboarding
  ...
};
const handleNewUser = (np, slug) => {
  setIsExistingPlayer(false); // ← new player: must go through Onboarding
  ...
};

// Routing rule:
const showOnboarding = !showLogin && isExistingPlayer !== true && !hasOnboarded;
//                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                     If existing player → skip regardless of Redux state
```
This is deterministic and has zero dependency on rehydration timing.

---

## What Each File Does Now

### `store/store.ts`
- `currentPersistKey` — tracks which player's AsyncStorage slot is currently active.
- `switchUserProfile(slug)` — saves departing player via direct `AsyncStorage.setItem`, pauses old persistor, resets all three slice states, swaps reducer key, creates new persistor, returns it.
- Returns the new `Persistor` so `App.tsx` can store it in React state and pass it to `PersistGate`.

### `App.tsx`
- `activePersistor` in React state — new object reference on every switch → triggers `PersistGate` remount.
- `gateKey` counter — plain incrementing number used as `key` on `PersistGate`.
- `isExistingPlayer` — `true` for returning players, `false` for new ones, `null` when nobody is logged in.
- `handleSelectExisting` / `handleNewUser` — two distinct handlers from `LoginScreen` so we can set `isExistingPlayer` correctly.
- `runStorageMigration()` — runs once on cold start; if `STORAGE_VERSION` doesn't match, calls `AsyncStorage.clear()` to wipe all corrupted data (bump the version string to force a clean slate for all players).

### `store/profileRegistry.ts`
- Stores the list of player names in `sakhi-ledger-profiles` (not their game data).
- Each player's actual game state lives in `persist:sakhi-ledger-user-<slug>`.
- `registerProfile()` saves/updates a player's name, avatar, and last login timestamp.
- `loadProfiles()` retrieves the list to show on the Login screen.

---

## What is Persisted Per Player

All three Redux slices are in the `whitelist`:

| Slice | Key data saved |
|---|---|
| `user` | name, hasOnboarded, language, guide, XP, level, streak, trophies, badges, daily missions, dark mode |
| `simulation` | balance, jars (household/children/savings/emergency), completedScenarios, activeScenarios, completedFraudCases, activeScams, financial health score |
| `engagement` | Fortune Tree (growthPoints, treeTier, branches), jar health, monthly reports |

---

## The Arena Resume Behaviour

`ScamBusterScreen` filters displayed cases as:
```typescript
const availableCases = (sim.activeScams).filter(
  fc => !sim.completedFraudCases.includes(fc.id)
);
```
Since both `activeScams` and `completedFraudCases` are persisted, if a player completes 2 of 5 Arena cases and switches, when they return they see exactly the remaining 3. Same pattern applies to Quests via `activeScenarios` / `completedScenarios`.

---

## Other Features Added in This Session

- **Guide Switcher in Settings** — players can swap between Savitri Didi and Shanti Didi mid-game from `LanguageSettingsModal` without losing any progress.
- **Offline Translation Cache** — `translate.ts` now uses a two-layer cache (memory + AsyncStorage). Dynamic text (scenarios, scam messages) fetched via Google Translate API is permanently cached locally. Works offline once seen online.
