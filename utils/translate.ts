import { useState, useEffect } from 'react';

const memoryCache: Record<string, string> = {};

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  if (targetLang === 'en') return text;
  
  const cacheKey = `${targetLang}:${text}`;
  if (memoryCache[cacheKey]) return memoryCache[cacheKey];

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const json = await response.json();
    const translated = json[0].map((item: any) => item[0]).join('');
    memoryCache[cacheKey] = translated;
    return translated;
  } catch (e) {
    console.warn('Translation failed:', e);
    return text; // Fallback
  }
}

export function useDynamicTranslation(text: string, targetLang: string) {
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    let isMounted = true;
    if (targetLang === 'en') {
      setTranslated(text);
      return;
    }
    
    // Initial quick display
    setTranslated('...');
    
    translateText(text, targetLang).then((res) => {
      if (isMounted) setTranslated(res);
    });
    
    return () => { isMounted = false; };
  }, [text, targetLang]);

  return translated;
}
