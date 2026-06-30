import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, Animated, View, Platform } from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, visible, onHide }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toastContainer,
        isSuccess ? styles.successBg : styles.errorBg,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.toastContent}>
        {isSuccess ? (
          <CheckCircle color="#0F5132" size={20} style={styles.icon} />
        ) : (
          <AlertCircle color="#DC3545" size={20} style={styles.icon} />
        )}
        <Text style={[styles.toastText, isSuccess ? styles.successText : styles.errorText]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 99999,
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
  successBg: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A7F3D0',
  },
  errorBg: {
    backgroundColor: '#FCE8E6',
    borderColor: '#FECACA',
  },
  successText: {
    color: '#0F5132',
  },
  errorText: {
    color: '#C53030',
  },
});

export default Toast;
