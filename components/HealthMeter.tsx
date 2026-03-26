import React from 'react';
import { View, Text } from 'react-native';
import { Colors, FIN_HEALTH_LABELS } from '../constants/theme';
import { getFinHealthLevel } from '../engine/simulationEngine';

interface HealthMeterProps {
  score: number;
  size?: number;
}

export default function HealthMeter({ score, size = 140 }: HealthMeterProps) {
  const level = getFinHealthLevel(score);
  const config = FIN_HEALTH_LABELS[level];
  const circumference = 2 * Math.PI * (size / 2 - 12);
  const progress = (score / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Gold outer ring */}
        <View
          style={{
            position: 'absolute',
            width: size - 8,
            height: size - 8,
            borderRadius: (size - 8) / 2,
            borderWidth: 2,
            borderColor: Colors.sakhi.goldDark + '50',
          }}
        />
        {/* Background circle */}
        <View
          style={{
            position: 'absolute',
            width: size - 16,
            height: size - 16,
            borderRadius: (size - 16) / 2,
            borderWidth: 10,
            borderColor: Colors.sakhi.goldDark + '20',
          }}
        />
        {/* Progress circle */}
        <View
          style={{
            position: 'absolute',
            width: size - 16,
            height: size - 16,
            borderRadius: (size - 16) / 2,
            borderWidth: 10,
            borderColor: config.color,
            opacity: 0.9,
            transform: [{ rotate: '-90deg' }],
            borderTopColor: score >= 25 ? config.color : 'transparent',
            borderRightColor: score >= 50 ? config.color : 'transparent',
            borderBottomColor: score >= 75 ? config.color : 'transparent',
            borderLeftColor: score < 25 ? 'transparent' : config.color,
          }}
        />
        {/* Score text */}
        <Text style={{
          fontSize: size * 0.25,
          fontWeight: '900',
          color: Colors.sakhi.goldLight,
          textShadowColor: 'rgba(0,0,0,0.2)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}>
          {score}
        </Text>
        <Text style={{ fontSize: size * 0.09, color: Colors.sakhi.goldDark, fontWeight: '800', letterSpacing: 1 }}>
          FIN-HEALTH
        </Text>
      </View>
      <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '800', color: config.color }}>
        {config.label}
      </Text>
    </View>
  );
}
