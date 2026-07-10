import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderActive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  borderActive = false,
}) => {
  const { colorScheme, colors } = useTheme();

  return (
    <View style={[
      styles.cardContainer, 
      {
        backgroundColor: colors.surfaceGlass,
        borderColor: borderActive ? colors.borderGlassActive : colors.borderGlass,
      },
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
    padding: 16,
    borderWidth: 1,
    // Subtle drop shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
});

export default GlassCard;
