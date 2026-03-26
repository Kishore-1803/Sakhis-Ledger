import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Feather from '@expo/vector-icons/Feather';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const slideY = useRef(new Animated.Value(-48)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.spring(slideY, {
      toValue: isOffline ? 0 : -48,
      useNativeDriver: Platform.OS !== 'web',
      speed: 20,
      bounciness: 4,
    }).start();
  }, [isOffline]);

  // Always render so animation works, but clip it when hidden
  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideY }] }]}>
      <Feather name="wifi-off" size={13} color="#FFF" style={{ marginRight: 6 }} />
      <Text style={styles.text}>
        Offline — Progress saved locally 📱  Koi dikkat nahin!
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#C0392B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
