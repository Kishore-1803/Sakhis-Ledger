import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Svg, Path } from 'react-native-svg';

interface JarHealthIndicatorProps {
  health: number; // 0-100
  cracksLevel: number; // 0-3
}

export const JarHealthIndicator: React.FC<JarHealthIndicatorProps> = ({ health, cracksLevel }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Critical state animations
    if (cracksLevel === 3) {
      // Shake animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: -5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.delay(1000),
        ])
      ).start();

      // Red pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shakeAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [cracksLevel]);

  // Determine color based on health
  const getHealthColor = () => {
    if (health > 75) return '#2ECC71'; // Green
    if (health > 50) return '#F39C12'; // Yellow
    if (health > 25) return '#E67E22'; // Orange
    return '#E74C3C'; // Red
  };

  // Generate crack paths based on level
  const getCrackPaths = () => {
    const cracks = [];

    if (cracksLevel >= 1) {
      // First crack - top right diagonal
      cracks.push('M60 10 L55 30 L50 40');
    }

    if (cracksLevel >= 2) {
      // Second crack - left side
      cracks.push('M20 25 L15 45 L20 60');
      // Third crack - bottom
      cracks.push('M40 70 L45 75 L50 70');
    }

    if (cracksLevel >= 3) {
      // Severe cracks
      cracks.push('M70 15 L65 35 L70 50');
      cracks.push('M30 50 L35 65 L30 75');
    }

    return cracks;
  };

  const healthColor = getHealthColor();
  const crackPaths = getCrackPaths();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ rotate: shakeAnim.interpolate({
            inputRange: [-5, 5],
            outputRange: ['-5deg', '5deg'],
          }) }, { scale: pulseAnim }],
        },
      ]}
    >
      {/* Health bar */}
      <View style={styles.healthBarContainer}>
        <View style={styles.healthBarBackground}>
          <View
            style={[
              styles.healthBarFill,
              {
                width: `${health}%`,
                backgroundColor: healthColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Cracks overlay */}
      {cracksLevel > 0 && (
        <Svg height="80" width="80" style={styles.cracksOverlay}>
          {crackPaths.map((path, index) => (
            <Path
              key={index}
              d={path}
              stroke="#333"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </Svg>
      )}

      {/* Glow effect for critical state */}
      {cracksLevel === 3 && (
        <View style={[styles.glowOverlay, { backgroundColor: 'rgba(231, 76, 60, 0.3)' }]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  healthBarContainer: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
  },
  healthBarBackground: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cracksOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
  },
});
