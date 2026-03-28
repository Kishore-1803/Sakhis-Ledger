import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, Dimensions } from 'react-native';

interface LevelUpExplosionProps {
  visible: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  angle: number;
}

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 20;

export const LevelUpExplosion: React.FC<LevelUpExplosionProps> = ({ visible, onComplete }) => {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      angle: Math.random() * Math.PI * 2,
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset all particles
      particles.forEach(p => {
        p.x.setValue(0);
        p.y.setValue(0);
        p.opacity.setValue(0);
      });

      // Explode!
      const animations = particles.map(p =>
        Animated.parallel([
          Animated.timing(p.x, {
            toValue: Math.cos(p.angle) * 200,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: Math.sin(p.angle) * 200,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
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
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <View style={styles.star}>
            <Text style={styles.emoji}>⭐</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: height / 2,
    left: width / 2,
    width: 0,
    height: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
  },
  star: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
});
