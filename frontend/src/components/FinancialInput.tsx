import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface FinancialInputProps extends TextInputProps {
  label: string;
  error?: string;
  isCurrency?: boolean;
}

export const FinancialInput: React.FC<FinancialInputProps> = ({
  label,
  error,
  style,
  isCurrency,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { theme: colorScheme, colors } = useTheme();

  const formatDisplayValue = (val: string | undefined): string => {
    if (val === undefined || val === null || val === '') return '';
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return '';
    
    // Convert to cents to avoid float point issues
    const cents = Math.round(parsed * 100);
    const real = (cents / 100).toFixed(2);
    const [integerPart, decimalPart] = real.split('.');
    
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${formattedInteger},${decimalPart}`;
  };

  const handleChangeText = (text: string) => {
    if (!onChangeText) return;
    
    const clean = text.replace(/\D/g, '');
    if (!clean) {
      onChangeText('');
      return;
    }
    
    const cents = parseInt(clean, 10);
    const decimalValue = (cents / 100).toFixed(2);
    onChangeText(decimalValue);
  };

  const displayValue = isCurrency ? formatDisplayValue(value) : value;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        placeholder={placeholder || (isCurrency ? 'R$ 0,00' : undefined)}
        keyboardType={isCurrency ? 'numeric' : keyboardType}
        value={displayValue}
        onChangeText={isCurrency ? handleChangeText : onChangeText}
        style={[
          styles.input,
          { 
            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8F9FA',
            color: colors.text,
            borderColor: isFocused ? '#10B981' : colors.borderGlass,
          },
          isFocused && { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#FFFFFF' },
          error ? styles.inputError : null,
          style,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur && props.onBlur(e);
        }}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#DC3545', 
  },
  errorText: {
    color: '#DC3545',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FinancialInput;

