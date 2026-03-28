import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../utils/useTheme';
import Feather from '@expo/vector-icons/Feather';

interface InsightCardProps {
  id: string;
  icon: string;
  message: string;
  actionable?: string;
  isStrength: boolean;
  onAction?: () => void;
}

export default function InsightCard({
  id,
  icon,
  message,
  actionable,
  isStrength,
  onAction,
}: InsightCardProps) {
  const theme = useTheme();

  const bgColor = isStrength ? '#D4EDDA' : '#FFF3CD';
  const borderColor = isStrength ? '#28A745' : '#FFC107';
  const textColor = isStrength ? '#155724' : '#856404';
  const accentColor = isStrength ? '#28A745' : '#FFC107';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor,
          borderLeftColor: accentColor,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.iconEmoji}>{icon}</Text>
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>

      {actionable && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: accentColor }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionText}>{actionable}</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconEmoji: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
