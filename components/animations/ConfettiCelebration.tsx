import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';

interface ConfettiCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  startX: number;
  color: string;
  size: number;
}

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 50;
const COLORS = ['#FFD700', '#2ECC71', '#FF69B4', '#FFA500', '#87CEEB'];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ visible, onComplete }) => {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      rotation: new Animated.Value(0),
      startX: Math.random() * width,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset all particles
      particles.forEach(p => {
        p.x.setValue(p.startX);
        p.y.setValue(-50);
        p.opacity.setValue(0);
        p.rotation.setValue(0);
      });

      // Create falling confetti animation
      const animations = particles.map((p, index) =>
        Animated.parallel([
          // Fade in immediately
          Animated.timing(p.opacity, {
            toValue: 1,
            duration: 100,
            delay: index * 30,
            useNativeDriver: true,
          }),
          // Fall with gravity
          Animated.timing(p.y, {
            toValue: height + 100,
            duration: 3000,
            delay: index * 30,
            useNativeDriver: true,
          }),
          // Slight horizontal drift
          Animated.timing(p.x, {
            toValue: p.startX + (Math.random() - 0.5) * 100,
            duration: 3000,
            delay: index * 30,
            useNativeDriver: true,
          }),
          // Rotation
          Animated.timing(p.rotation, {
            toValue: Math.random() * 720 - 360, // -360 to 360 degrees
            duration: 3000,
            delay: index * 30,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.parallel(animations).start(() => {
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: particle.size,
              height: particle.size * 1.5,
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ['-360deg', '360deg'],
                  }),
                },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});
