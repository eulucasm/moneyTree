import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface CardSelectorProps {
  selectedCard: string;
  onSelect: (cardKey: string) => void;
  cards: { key: string; name: string; color: string }[];
  label?: string;
}

export const CardSelector: React.FC<CardSelectorProps> = ({ selectedCard, onSelect, cards, label }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label || t('installments.cardUsed')}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card) => {
          const isSelected = selectedCard === card.key;
          return (
            <TouchableOpacity
              key={card.key}
              activeOpacity={0.8}
              onPress={() => onSelect(card.key)}
              style={[
                styles.cardMock,
                { backgroundColor: card.color },
                isSelected ? styles.selectedCard : styles.unselectedCard
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.chip}>••••</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check color="#0F5132" size={10} strokeWidth={3} />
                  </View>
                )}
              </View>
              <Text style={styles.cardName}>{card.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scrollContent: {
    paddingRight: 16,
    paddingVertical: 8,
    gap: 12,
  },
  cardMock: {
    width: 130,
    height: 80,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  unselectedCard: {
    borderWidth: 1,
    borderColor: 'transparent',
    opacity: 0.6,
  },
});

export default CardSelector;
