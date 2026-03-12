import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setLanguage } from '../store/userSlice';
import { Colors } from '../constants/theme';
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

  const translatedAudioText = useDynamicTranslation(audioText || '', lang);

  // Format today's date
  const today = new Date();
  const dateString = today.toLocaleDateString(lang === 'en' ? 'en-IN' : lang, {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const playAudio = () => {
    if (audioText) {
      AudioEngine.play(translatedAudioText, lang);
    }
  };

  return (
    <>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.rightIcons}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{dateString}</Text>
            </View>

            {audioText && (
              <TouchableOpacity style={styles.iconBtn} onPress={playAudio}>
                <Feather name="volume-2" size={18} color={Colors.neutral.white} />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)}>
              <Feather name="settings" size={18} color={Colors.neutral.white} />
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
    backgroundColor: Colors.sakhi.green,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.neutral.white,
    flex: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '700',
  },
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
});
