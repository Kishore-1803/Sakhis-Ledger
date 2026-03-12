import React from 'react';
import { Text, TextProps } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useDynamicTranslation } from '../utils/translate';
import { t } from '../utils/i18n';

interface TranslatedTextProps extends TextProps {
  text?: string;
  lang?: string;
  children?: React.ReactNode;
}

export function TranslatedText({ text, lang, children, ...props }: TranslatedTextProps) {
  const defaultLang = useSelector((state: RootState) => state.user.language as string);
  const currentLang = lang || defaultLang;

  let sourceText = text;
  if (!sourceText && typeof children === 'string') {
    sourceText = children;
  }

  if (!sourceText) {
      return <Text {...props}>{children}</Text>;
  }

  const staticTransl = t(sourceText as any, currentLang as any);
  let finalTranslation = staticTransl;

  const dynTransl = useDynamicTranslation(sourceText, currentLang);

  if (staticTransl === sourceText) {
      finalTranslation = dynTransl;
  }

  return <Text {...props}>{finalTranslation}</Text>;
}

export default TranslatedText;
