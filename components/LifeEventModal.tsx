import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Colors } from '../constants/theme';
import TranslatedText from './TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { LifeEvent } from '../engine/lifeEvents';

interface LifeEventModalProps {
  event: LifeEvent | null;
  visible: boolean;
  onDismiss: () => void;
}

const severityConfig: Record<string, { icon: any; color: string }> = {
  low: { icon: 'info', color: Colors.feedback.info },
  medium: { icon: 'alert-triangle', color: Colors.feedback.warning },
  high: { icon: 'alert-octagon', color: Colors.feedback.danger },
};

export default function LifeEventModal({ event, visible, onDismiss }: LifeEventModalProps) {
  const lang = useSelector((state: RootState) => state.user.language as string);
  if (!event) return null;
  const severity = severityConfig[event.severity] || severityConfig.medium;
  const isPositive = event.impact.amount > 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Feather name={severity.icon} size={48} color={severity.color} style={{ marginBottom: 12 }} />
          <TranslatedText text='Life Event!' lang={lang} style={[styles.title, { color: severity.color }]} />
          <TranslatedText text={event.title} lang={lang} style={styles.eventTitle} />
          <TranslatedText text={event.description} lang={lang} style={styles.description} />

          <View style={[styles.impactBox, { backgroundColor: isPositive ? Colors.feedback.success + '15' : Colors.feedback.danger + '15' }]}>
            <TranslatedText text={`${isPositive ? '+' : '-'}₹${Math.abs(event.impact.amount)} • ${event.impact.jar} Jar`} lang={lang} style={[styles.impactText, { color: isPositive ? Colors.feedback.success : Colors.feedback.danger }]} />
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: severity.color }]} onPress={onDismiss}>
            <TranslatedText text='I Understand' lang={lang} style={styles.buttonText} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  alertEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  impactBox: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  impactText: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
