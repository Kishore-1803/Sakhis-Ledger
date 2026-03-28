import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, Easing } from 'react-native';

interface CoinDropAnimationProps {
  visible: boolean;
  startY?: number;
  endY?: number;
  onComplete?: () => void;
}

export const CoinDropAnimation: React.FC<CoinDropAnimationProps> = ({
  visible,
  startY = 0,
  endY = 200,
  onComplete,
}) => {
  const translateY = useRef(new Animated.Value(startY)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Reset
      translateY.setValue(startY);
      opacity.setValue(0);
      scale.setValue(1);

      // Coin drop with bounce
      Animated.sequence([
        // Fade in
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        // Drop with easeIn (gravity)
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: endY,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          // Slight rotation during fall
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Bounce back
        Animated.spring(translateY, {
          toValue: endY - 30,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        // Settle
        Animated.spring(translateY, {
          toValue: endY,
          friction: 5,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
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
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.coin}>🪙</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  coin: {
    fontSize: 40,
  },
});
