/**
 * translate.ts  –  Offline-first dynamic translation.
 *
 * Two-layer cache:
 *  1. memoryCache  – in-process Map, fastest (cleared on app restart)
 *  2. AsyncStorage – survives restarts; populated on first online translate
 *
 * Flow:
 *  • Check memory cache → return immediately if hit.
 *  • Check AsyncStorage → return immediately if hit (offline-safe).
 *  • Fetch from Google Translate API (needs internet).
 *      – On success: write to both caches, return translated text.
 *      – On failure (offline): return original English text as fallback.
 *
 * The static UI labels in i18n.ts are already fully offline because they are
 * bundled in the JS bundle.  This file only handles dynamic content like
 * scenario narratives, scam messages, and choice feedback.
 */

import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Cache ────────────────────────────────────────────────────────────────────

const memoryCache: Record<string, string> = {};
const STORAGE_PREFIX = 'sakhi-tx-v1:';

async function readFromStorage(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

async function writeToStorage(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, value);
  } catch {
    // Storage full or unavailable — silently skip; memory cache still works
  }
}

// ─── Core translation function ────────────────────────────────────────────────

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  if (targetLang === 'en') return text;

  const cacheKey = `${targetLang}:${text}`;

  // 1. Memory cache (fastest)
  if (memoryCache[cacheKey]) return memoryCache[cacheKey];

  // 2. AsyncStorage cache (offline-safe — survives app restart)
  const stored = await readFromStorage(cacheKey);
  if (stored) {
    memoryCache[cacheKey] = stored; // promote to memory cache
    return stored;
  }

  // 3. Fetch from network
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const json = await response.json();
    const translated: string = json[0].map((item: any) => item[0]).join('');

    // Persist to both caches so next time works offline
    memoryCache[cacheKey] = translated;
    writeToStorage(cacheKey, translated); // fire-and-forget
    return translated;
  } catch {
    // No internet — return original English as graceful fallback
    return text;
  }
}

// ─── React hook ───────────────────────────────────────────────────────────────

/**
 * useDynamicTranslation
 *
 * Returns the (possibly cached) translation of `text` in `targetLang`.
 * Shows the English original immediately, then swaps in the translation
 * once it is resolved (from cache = instant; from network = ~300 ms).
 */
export function useDynamicTranslation(text: string, targetLang: string): string {
  // Initialise with cached value if already in memory — avoids flash of
  // English text for content that has been seen before.
  const cacheKey = `${targetLang}:${text}`;
  const cachedInit = memoryCache[cacheKey] ?? null;

  const [translated, setTranslated] = useState<string>(
    targetLang === 'en' ? text : (cachedInit || text)
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (targetLang === 'en') {
      setTranslated(text);
      return;
    }

    // Try to resolve synchronously from memory (avoids flicker on re-render)
    const quick = memoryCache[`${targetLang}:${text}`];
    if (quick) {
      setTranslated(quick);
      return;
    }

    // Async path: AsyncStorage or network
    translateText(text, targetLang).then((res) => {
      if (mountedRef.current) setTranslated(res);
    });
  }, [text, targetLang]);

  return translated;
}
