import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gradientColors?: string[];
  borderActive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  borderActive = false,
}) => {
  return (
    <View style={[
      styles.cardContainer, 
      borderActive ? styles.borderActive : styles.borderDefault,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    padding: 16,
    // Subtle drop shadow for web/iOS to match the minimalist tech design
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, // Android shadow
  },
  borderDefault: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  borderActive: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
});

export default GlassCard;
