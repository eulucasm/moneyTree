import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassCard from '../GlassCard';

interface GrowthCardProps {
  sortedMonths: string[];
  growthByMonth: Record<string, number>;
}

export default function GrowthCard({ sortedMonths, growthByMonth }: GrowthCardProps) {
  return (
    <GlassCard style={styles.growthCard}>
      <Text style={styles.growthTitle}>Crescimento de Contas</Text>
      <Text style={styles.growthSubtitle}>Histórico de cadastros por período</Text>
      
      <View style={styles.growthList}>
        {sortedMonths.length === 0 ? (
          <Text style={styles.emptyText}>Sem dados de registros.</Text>
        ) : (
          sortedMonths.map(month => {
            const count = growthByMonth[month];
            const maxCount = Math.max(...Object.values(growthByMonth));
            const progressPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <View key={month} style={styles.growthRow}>
                <Text style={styles.monthLabel}>{month}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                </View>
                <Text style={styles.growthValue}>{count} {count === 1 ? 'user' : 'users'}</Text>
              </View>
            );
          })
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  growthCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 20,
  },
  growthTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F5132' },
  growthSubtitle: { fontSize: 13, color: '#6C757D', fontWeight: '500', marginTop: 2, marginBottom: 20 },
  growthList: { gap: 14 },
  growthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  monthLabel: { fontSize: 13, fontWeight: 'bold', color: '#495057', width: 60 },
  barContainer: { flex: 1, height: 10, backgroundColor: '#F1F3F5', borderRadius: 5, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#0F5132', borderRadius: 5 },
  growthValue: { fontSize: 12, fontWeight: 'bold', color: '#6C757D', width: 70, textAlign: 'right' },
  emptyText: { fontSize: 14, color: '#6C757D', fontWeight: '500' },
});
