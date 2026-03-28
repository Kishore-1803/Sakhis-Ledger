import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setLanguage } from '../store/userSlice';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import { AudioEngine } from '../utils/audioEngine';
import { t, LanguageCode } from '../utils/i18n';
import LanguageSettingsModal from './LanguageSettingsModal';
import { useDynamicTranslation } from '../utils/translate';
import Feather from '@expo/vector-icons/Feather';

interface GlobalHeaderProps {
  title: string;
  audioText?: string;
}

export default function GlobalHeader({ title, audioText }: GlobalHeaderProps) {
  const lang = useSelector((state: RootState) => state.user.language as LanguageCode);
  const [showSettings, setShowSettings] = useState(false);
  const theme = useTheme();

  // Format today's date
  const today = new Date();
  const dateString = today.toLocaleDateString(lang === 'en' ? 'en-IN' : lang, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const playAudio = () => {
    if (audioText) {
      AudioEngine.play(audioText, lang);
    }
  };

  return (
    <>
      <View style={[styles.topBar, { backgroundColor: theme.headerBg }]}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
          <View style={styles.rightIcons}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{dateString}</Text>
            </View>

            {audioText && (
              <TouchableOpacity style={styles.iconBtn} onPress={playAudio}>
                <Feather name="volume-2" size={18} color={Colors.sakhi.goldLight} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)}>
              <Feather name="settings" size={18} color={Colors.sakhi.goldLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <LanguageSettingsModal 
        visible={showSettings} 
        onDismiss={() => setShowSettings(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: '#218C53',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.sakhi.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    letterSpacing: 0.5,
    flexShrink: 1,
    marginRight: 8,
  },
  rightIcons: {
    color: Colors.sakhi.goldLight,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  dateText: {
    color: Colors.sakhi.goldLight,
    fontSize: 11,
    fontWeight: '800',
  },
  iconBtn: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  iconText: {
    fontSize: 18,
  },
});
