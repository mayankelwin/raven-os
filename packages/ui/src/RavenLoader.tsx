import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { RavenColors } from './base';

/**
 * RavenLoader - Premium initialization screen.
 * Used during the Raven-Os async boot sequence.
 */
export const RavenLoader = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    // Subtle rotation for a "scanning" feel
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glow} />
      
      <Animated.View style={[styles.circleContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]} />
        <View style={styles.core} />
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>RAVEN-OS</Text>
        <Text style={styles.subtitle}>INITIALIZING CORE...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RavenColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: RavenColors.primary,
    opacity: 0.1,
    ...Platform.select({
      web: { filter: 'blur(80px)' } as any,
    })
  },
  circleContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  ring: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: RavenColors.primary,
    borderRightColor: 'rgba(139, 92, 246, 0.1)',
  },
  core: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: RavenColors.primary,
    shadowColor: RavenColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 8,
  },
  subtitle: {
    color: RavenColors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
