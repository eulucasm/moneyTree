import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { X, TrendingUp } from 'lucide-react-native';
import { useInvestmentStore, AssetClass } from '../stores/useInvestmentStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useTheme } from '../hooks/useTheme';

const ASSET_CLASSES: AssetClass[] = ['Ações', 'Exterior', 'ETFs', 'FIIs', 'Renda Fixa', 'Criptomoedas'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function AllAssetsScreen() {
  const { colorScheme, colors } = useTheme();
  const { portfolio, deleteAsset } = useInvestmentStore();
  
  const [activeFilter, setActiveFilter] = useState<AssetClass | 'Todos'>('Todos');

  const renderClassColor = (c: AssetClass | 'Todos') => {
    switch(c) {
      case 'Ações': return '#DC3545';
      case 'Exterior': return '#10B981';
      case 'ETFs': return '#0D6EFD';
      case 'FIIs': return '#6F42C1';
      case 'Renda Fixa': return '#FD7E14';
      case 'Criptomoedas': return '#E83E8C';
      case 'Todos': return colors.text;
      default: return '#6C757D';
    }
  };

  const filteredAssets = activeFilter === 'Todos' 
    ? [...portfolio.assets].reverse() 
    : [...portfolio.assets].reverse().filter(a => a.assetClass === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          title: 'Todos os Ativos',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }} 
      />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Filtros Container Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass, marginBottom: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Filtrar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                { 
                  borderColor: colors.borderGlass,
                  backgroundColor: activeFilter === 'Todos' ? (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : '#E9ECEF') : 'transparent'
                }
              ]}
              onPress={() => setActiveFilter('Todos')}
            >
              <Text style={{ color: colors.text, fontWeight: activeFilter === 'Todos' ? 'bold' : 'normal' }}>Todos</Text>
            </TouchableOpacity>
            {ASSET_CLASSES.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.filterChip,
                  { 
                    borderColor: colors.borderGlass,
                    backgroundColor: activeFilter === c ? `${renderClassColor(c)}20` : 'transparent'
                  }
                ]}
                onPress={() => setActiveFilter(c)}
              >
                <Text style={{ 
                  color: activeFilter === c ? renderClassColor(c) : colors.textMuted, 
                  fontWeight: activeFilter === c ? 'bold' : 'normal' 
                }}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Assets List Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ativos</Text>
          </View>

          {filteredAssets.length === 0 ? (
            <View style={styles.emptyState}>
              <TrendingUp size={48} color={colors.borderGlassActive} />
              <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Nenhum ativo encontrado.</Text>
            </View>
          ) : (
            <View>
               {filteredAssets.map(asset => (
                  <View key={asset.id} style={[styles.assetRow, { borderBottomColor: colors.borderGlass }]}>
                    <View style={styles.assetInfo}>
                      <Text style={[styles.assetTicker, { color: colors.text }]}>{asset.ticker}</Text>
                      <View style={[styles.badgeClass, { backgroundColor: `${renderClassColor(asset.assetClass)}15` }]}>
                        <Text style={[styles.badgeClassText, { color: renderClassColor(asset.assetClass) }]}>{asset.assetClass}</Text>
                      </View>
                    </View>
                    <View style={styles.assetActions}>
                      <Text style={[styles.assetValue, { color: colors.text }]}>{formatCurrency(asset.currentValue)}</Text>
                      <TouchableOpacity onPress={() => deleteAsset(asset.id)} style={styles.btnDelete}>
                        <X size={16} color="#DC3545" />
                      </TouchableOpacity>
                    </View>
                  </View>
               ))}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 15,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assetTicker: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeClass: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeClassText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  assetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnDelete: {
    padding: 8,
  },
});
