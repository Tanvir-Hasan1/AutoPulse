import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

// Wrap Svg components for React Native Animation
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface AutoPulseIconProps {
  size?: number;
  isAnimated?: boolean;
  theme?: 'midnight' | 'cyberpunk' | 'eco' | 'sunset' | 'custom';
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
}

export const AutoPulseIcon: React.FC<AutoPulseIconProps> = ({
  size = 120,
  isAnimated = true,
  theme = 'midnight',
  primaryColor,
  secondaryColor,
  glowColor,
}) => {
  // Animation drivers
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!isAnimated) {
      pulseAnim.setValue(0);
      rotateAnim.setValue(0);
      breatheAnim.setValue(1);
      return;
    }

    // 1. Flowing Telemetry Line Animation (Dash Offset)
    const telemetryFlow = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Slow Speedometer / Outer Ring Rotation
    const speedometerRotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 3. Heartbeat / Engine breathing effect
    const breatheEffect = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.04,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.96,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([telemetryFlow, speedometerRotation, breatheEffect]).start();

    return () => {
      telemetryFlow.stop();
      speedometerRotation.stop();
      breatheEffect.stop();
    };
  }, [isAnimated]);

  // Color theme definitions
  const getThemeColors = () => {
    switch (theme) {
      case 'cyberpunk':
        return {
          bg: '#0B0813',
          primary: '#FF2A54', // neon pink
          secondary: '#00E5FF', // electric cyan
          glow: 'rgba(0, 229, 255, 0.4)',
        };
      case 'eco':
        return {
          bg: '#080E09',
          primary: '#39FF14', // neon green
          secondary: '#00E5FF', // electric blue
          glow: 'rgba(57, 255, 20, 0.4)',
        };
      case 'sunset':
        return {
          bg: '#0F0906',
          primary: '#FF9500', // sunset orange
          secondary: '#FF3B30', // fiery red
          glow: 'rgba(255, 149, 0, 0.4)',
        };
      case 'custom':
        return {
          bg: '#0F0F12',
          primary: primaryColor || '#00E5FF',
          secondary: secondaryColor || '#FF2A54',
          glow: glowColor || 'rgba(0, 229, 255, 0.3)',
        };
      case 'midnight':
      default:
        return {
          bg: '#0F0F12', // deep obsidian
          primary: '#00E5FF', // electric cyan
          secondary: '#39FF14', // neon green
          glow: 'rgba(0, 229, 255, 0.3)',
        };
    }
  };

  const colors = getThemeColors();

  // Map rotation animation to degree angles
  const spinDegrees = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Map pulse animation to flow dash offsets
  const strokeDashoffset = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        style={StyleSheet.absoluteFill}
      >
        {/* Sleek Obsidian Glassmorphic Base */}
        <Circle
          cx="100"
          cy="100"
          r="92"
          fill={colors.bg}
          stroke="#262930"
          strokeWidth="3.5"
        />

        {/* 1. SPEEDOMETER ARC (Rotating Outer Telemetry Ring) */}
        <AnimatedG
          style={{
            transform: [{ rotate: spinDegrees }],
            transformOrigin: '100px 100px',
          }}
        >
          {/* Active Glowing Speedometer Gauge Segment */}
          <Path
            d="M 100,15 A 85,85 0 0,1 185,100"
            fill="none"
            stroke={colors.primary}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="15, 8"
          />
          {/* Faded Speedometer Gauge Segment */}
          <Path
            d="M 185,100 A 85,85 0 0,1 100,185 A 85,85 0 0,1 15,100 A 85,85 0 0,1 100,15"
            fill="none"
            stroke="#262930"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8, 10"
          />
        </AnimatedG>

        {/* 2. DYNAMIC MOTORCYCLE LEAP & ECG PULSE TRAIL (BREATHING NODE) */}
        <AnimatedG
          style={{
            transform: [{ scale: breatheAnim }],
            transformOrigin: '100px 100px',
          }}
        >
          {/* Background Telemetry Wave (Low Opacity Glow) */}
          <Path
            d="M 35,115 L 70,115 L 82,90 L 92,150 L 105,70 L 115,125 L 125,105 L 165,105"
            fill="none"
            stroke={colors.primary}
            strokeWidth="12"
            opacity="0.15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Animated Flowing Pulse ECG Wave Path */}
          <AnimatedPath
            d="M 35,115 L 70,115 L 82,90 L 92,150 L 105,70 L 115,125 L 125,105 L 165,105"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40, 60"
            // @ts-ignore
            strokeDashoffset={strokeDashoffset}
          />

          {/* Glowing Engine/Ignition Node in the Heartbeat Peak */}
          <AnimatedCircle
            cx="105"
            cy="70"
            r="8"
            fill={colors.secondary}
            shadowColor={colors.secondary}
            shadowOffset={{ width: 0, height: 0 }}
            shadowOpacity={0.8}
            shadowRadius={12}
          />
          <Circle
            cx="105"
            cy="70"
            r="4.5"
            fill="#FFF"
          />

          {/* Motocross Bike Leaping Silhouette Representation */}
          {/* Stylized geometric lines capturing the leap matching the bike.png profile */}
          <G transform="translate(68, 48) scale(0.68)">
            {/* Front Wheel */}
            <Circle cx="80" cy="50" r="16" fill="none" stroke={colors.primary} strokeWidth="3" opacity="0.9" />
            <Circle cx="80" cy="50" r="6" fill={colors.primary} />
            
            {/* Rear Wheel */}
            <Circle cx="12" cy="72" r="16" fill="none" stroke={colors.primary} strokeWidth="3" opacity="0.9" />
            <Circle cx="12" cy="72" r="6" fill={colors.primary} />

            {/* Aggressive Chassis Frame, Exhaust and Forks */}
            <Path
              d="M 12,72 L 40,65 L 56,40 L 80,50 M 56,40 L 72,15 M 12,72 L 30,48 L 56,40 M 30,48 L 5,42"
              fill="none"
              stroke={colors.primary}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Motocross Rider posture inspired from bike.png */}
            <Path
              d="M 38,40 C 35,28 42,16 52,14 C 58,13 62,18 64,25 L 72,28 M 48,32 L 40,48 L 32,50 M 52,14 L 62,4"
              fill="none"
              stroke="#FFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Rider Helmet */}
            <Circle cx="64" cy="5" r="7.5" fill="#FFF" />
            {/* Helmet Visor */}
            <Path d="M 64,1 L 73,3" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
          </G>
        </AnimatedG>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default AutoPulseIcon;
