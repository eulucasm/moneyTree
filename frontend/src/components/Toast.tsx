import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, View, Platform } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import GlassCard from './GlassCard';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, visible, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { theme: colorScheme } = useTheme();

  useEffect(() => {
    if (visible) {
      // Slide and Fade In
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Platform.OS === 'web' ? 24 : 50,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        handleHide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const isSuccess = type === 'success';
  const isDark = colorScheme === 'dark';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <GlassCard
        style={[
          styles.toastContainer,
          {
            backgroundColor: isSuccess
              ? (isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
              : (isDark ? 'rgba(220, 53, 69, 0.15)' : 'rgba(220, 53, 69, 0.1)'),
            borderColor: isSuccess
              ? (isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)')
              : (isDark ? 'rgba(220, 53, 69, 0.4)' : 'rgba(220, 53, 69, 0.3)'),
          }
        ]}
      >
        <View style={styles.toastContent}>
          {isSuccess ? (
            <CheckCircle color={isDark ? '#10B981' : '#0F5132'} size={20} style={styles.icon} />
          ) : (
            <AlertCircle color="#DC3545" size={20} style={styles.icon} />
          )}
          <Text style={[
            styles.toastText, 
            { color: isSuccess ? (isDark ? '#10B981' : '#0F5132') : (isDark ? '#FCA5A5' : '#C53030') }
          ]}>
            {message}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    zIndex: 99999,
  },
  toastContainer: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    flexShrink: 0,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});

export default Toast;
