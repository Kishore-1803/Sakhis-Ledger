import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { JarColors } from '../constants/theme';
import { Colors } from '../constants/theme';
import { TranslatedText } from './TranslatedText';
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
  
  const jarColor = JarColors[name] || Colors.sakhi.blue;
  const isGoalReached = amount >= goal;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>{isVectorIcon ? <Feather name={icon as any} size={24} color={Colors.sakhi.darker} /> : <Text style={styles.iconText}>{icon}</Text>}</View>

      <TranslatedText style={styles.name} numberOfLines={1} adjustsFontSizeToFit>{name}</TranslatedText>
      <Text style={[styles.amount, { color: isGoalReached ? Colors.feedback.success : Colors.neutral.darkGray }]}>
        ₹{(amount || 0).toLocaleString('en-IN')}
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}><TranslatedText style={styles.goalText}>goal</TranslatedText><Text style={styles.goalText}>: ₹{(goal || 0).toLocaleString('en-IN')}</Text></View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.neutral.lightGray + '60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  goalText: {
    fontSize: 11,
    color: '#8E9AAB',
    fontWeight: '500',
  },
});
