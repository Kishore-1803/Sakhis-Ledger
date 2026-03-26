import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { JarColors } from '../constants/theme';
import { Colors } from '../constants/theme';
import { TranslatedText } from './TranslatedText';
import { useTheme } from '../utils/useTheme';
import Feather from '@expo/vector-icons/Feather';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface JarCardProps {
  name: string;
  amount: number;
  icon: string;
  goal?: number;
  onPress?: () => void;
  isVectorIcon?: boolean;
}

export default function JarCard({ name, amount = 0, icon, goal = 5000, onPress, isVectorIcon = true }: JarCardProps) {
  const theme = useTheme();
  const jarColor = JarColors[name] || Colors.sakhi.blue;
  const isGoalReached = amount >= goal;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderTopColor: jarColor, borderLeftColor: jarColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: jarColor + '20', borderColor: Colors.sakhi.goldDark }]}>
        {isVectorIcon
          ? <Feather name={icon as any} size={24} color={jarColor} />
          : <Text style={styles.iconText}>{icon}</Text>}
      </View>

      <TranslatedText style={[styles.name, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{name}</TranslatedText>
      <Text style={[styles.amount, { color: Colors.sakhi.goldLight }]}>
        ₹{(amount || 0).toLocaleString('en-IN')}
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
        <TranslatedText style={[styles.goalText, { color: theme.textSub }]}>goal</TranslatedText>
        <Text style={[styles.goalText, { color: theme.textSub }]}>: ₹{(goal || 0).toLocaleString('en-IN')}</Text>
      </View>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${Math.min(100, (amount / goal) * 100)}%`, backgroundColor: isGoalReached ? Colors.feedback.success : jarColor }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    marginBottom: 16,
    borderTopWidth: 5,
    borderLeftWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  iconText: {
    fontSize: 24,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  amount: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  goalText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
