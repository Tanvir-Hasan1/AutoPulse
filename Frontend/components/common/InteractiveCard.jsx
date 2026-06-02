import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const InteractiveCard = ({ children, onPress, style, delay = 0 }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={style}>
      <Animated.View style={animatedStyle}>
        <Pressable 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={(e) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onPress) onPress(e);
          }}
        >
          {children}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

export default InteractiveCard;
