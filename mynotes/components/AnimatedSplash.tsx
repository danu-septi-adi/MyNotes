import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { useColors } from '../hooks/useColors';

const { width } = Dimensions.get('window');
const LOGO_SIZE = 100;

interface Props {
  onFinish: () => void;
}

export default function AnimatedSplash({ onFinish }: Props) {
  const { colors } = useColors();
  const c = colors;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Sequence: fade in + scale up + subtle rotation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Ring pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale, {
              toValue: 2.5,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(ringScale, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start();

      // Icon subtle bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconBounce, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(iconBounce, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ).start(() => {
        // Fade out
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      });
    });
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });

  const bounce = iconBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const rotateRing = ringScale.interpolate({
    inputRange: [0, 2.5],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View style={[s.container, { backgroundColor: c.surface, opacity: fadeOutAnim }]}>
      {/* Animated rings */}
      <Animated.View
        style={[
          s.ring,
          {
            borderColor: c.primary,
            transform: [
              { scale: ringScale },
              { rotate: rotateRing },
            ],
            opacity: ringOpacity,
          },
        ]}
      />
      <Animated.View
        style={[
          s.ring2,
          {
            borderColor: c.primaryLight || c.primary,
            transform: [
              { scale: Animated.multiply(ringScale, 0.8) },
              { rotate: ringScale.interpolate({
                inputRange: [0, 2.5],
                outputRange: ['0deg', '-120deg'],
              })},
            ],
            opacity: ringOpacity,
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          s.logoWrap,
          {
            backgroundColor: c.primary,
            transform: [
              { scale: scaleAnim },
              { rotate: spin },
              { translateY: bounce },
            ],
            opacity: opacityAnim,
          },
        ]}>
        <MaterialCommunityIcons name="note-text-outline" size={48} color="#FFFFFF" />
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[s.appName, { color: c.text, opacity: opacityAnim }]}>
        MyNotes
      </Animated.Text>
      <Animated.Text style={[s.tagline, { color: c.textMuted, opacity: opacityAnim }]}>
        Catatan & Keuangan
      </Animated.Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  ring: {
    position: 'absolute',
    width: LOGO_SIZE * 2.5,
    height: LOGO_SIZE * 2.5,
    borderRadius: LOGO_SIZE * 1.25,
    borderWidth: 2,
  },
  ring2: {
    position: 'absolute',
    width: LOGO_SIZE * 1.8,
    height: LOGO_SIZE * 1.8,
    borderRadius: LOGO_SIZE * 0.9,
    borderWidth: 1.5,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 24,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
});