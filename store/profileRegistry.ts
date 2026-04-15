/**
 * profileRegistry.ts
 *
 * Maintains a lightweight registry of all known player names stored in
 * AsyncStorage at the key "sakhi-ledger-profiles".
 *
 * Each user's FULL game state is persisted separately under the key
 * "sakhi-ledger-<name-slug>" via redux-persist.  This registry only
 * keeps track of who has ever logged in so we can show them on the
 * Login screen.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const REGISTRY_KEY = 'sakhi-ledger-profiles';

export interface ProfileEntry {
  name: string;           // Human-readable name (as typed)
  slug: string;           // Lower-cased, safe key used in the persist key
  lastLogin: number;      // Unix timestamp (ms) – for sorting "recent first"
  avatar: string;         // e.g. '👩' or '👵' — snapshot saved at login
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Convert a display name to a storage-safe slug. */
export function nameToSlug(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

/** The AsyncStorage key for a specific user's redux-persist root. */
export function persistKeyForSlug(slug: string): string {
  return `sakhi-ledger-user-${slug}`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Load all registered profiles, sorted newest-first. */
export async function loadProfiles(): Promise<ProfileEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProfileEntry[];
    return parsed.sort((a, b) => b.lastLogin - a.lastLogin);
  } catch {
    return [];
  }
}

/** Register (or update) a profile entry. */
export async function registerProfile(entry: Omit<ProfileEntry, 'slug'>): Promise<void> {
  const slug = nameToSlug(entry.name);
  const profiles = await loadProfiles();
  const idx = profiles.findIndex(p => p.slug === slug);
  const updated: ProfileEntry = { ...entry, slug, lastLogin: Date.now() };

  if (idx >= 0) {
    profiles[idx] = updated;
  } else {
    profiles.push(updated);
  }

  await AsyncStorage.setItem(REGISTRY_KEY, JSON.stringify(profiles));
}

/** Remove a profile and its associated game state from storage. */
export async function deleteProfile(slug: string): Promise<void> {
  const profiles = await loadProfiles();
  const filtered = profiles.filter(p => p.slug !== slug);
  await AsyncStorage.setItem(REGISTRY_KEY, JSON.stringify(filtered));
  await AsyncStorage.removeItem(persistKeyForSlug(slug));
}

/** Check whether a given name slug has any persisted state. */
export async function profileExists(name: string): Promise<boolean> {
  const slug = nameToSlug(name);
  const profiles = await loadProfiles();
  return profiles.some(p => p.slug === slug);
}
