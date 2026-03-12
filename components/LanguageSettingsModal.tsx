import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setLanguage } from '../store/userSlice';
import { Colors } from '../constants/theme';
import { t, LanguageCode, LANGUAGES } from '../utils/i18n';
import TranslatedText from './TranslatedText';
import Feather from '@expo/vector-icons/Feather';

interface LanguageSettingsModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function LanguageSettingsModal({ visible, onDismiss }: LanguageSettingsModalProps) {
  const dispatch = useDispatch();
  const lang = useSelector((state: RootState) => state.user.language as LanguageCode);

  const handleLangSelect = (code: string) => {
    dispatch(setLanguage(code));
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20}}><Feather name='globe' size={24} color={Colors.neutral.darkGray} style={{ marginRight: 8 }} /><TranslatedText text='Settings' lang={lang} style={{fontSize: 20, fontWeight: '800', color: Colors.neutral.darkGray}} /></View>
          
          <TranslatedText text='Language' lang={lang} style={styles.sectionText} />
          <View style={styles.langGrid}>
            {LANGUAGES.map(l => (
              <TouchableOpacity 
                key={l.code} 
                style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
                onPress={() => handleLangSelect(l.code)}
              >
                <Text style={[styles.langLabel, lang === l.code && {color: Colors.sakhi.green}]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
            <TranslatedText text='Close' lang={lang} style={styles.closeBtnText} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: '700',
    marginBottom: 12,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  langBtn: {
    width: '48%',
    backgroundColor: Colors.neutral.offWhite,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  langBtnActive: {
    borderColor: Colors.sakhi.green,
    backgroundColor: Colors.sakhi.green + '10',
  },
  langLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.darkGray,
  },
  closeBtn: {
    backgroundColor: Colors.neutral.lightGray,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
  },
});
