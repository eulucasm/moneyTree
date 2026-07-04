import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, Award, BarChart3 } from 'lucide-react-native';
import GlassCard from '../GlassCard';

interface AdminKPIsProps {
  totalUsers: number;
  basicUsers: number;
  premiumUsers: number;
  conversionRate: string | number;
  mrr: number;
  isLargeScreen: boolean;
}

export default function AdminKPIs({ totalUsers, basicUsers, premiumUsers, conversionRate, mrr, isLargeScreen }: AdminKPIsProps) {
  return (
    <View style={[styles.kpiGrid, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
      <GlassCard style={styles.kpiCard}>
        <Users color="#0F5132" size={24} />
        <Text style={styles.kpiValue}>{totalUsers}</Text>
        <Text style={styles.kpiLabel}>Total de Usuários</Text>
        <Text style={styles.kpiSubText}>{basicUsers} Básico / {premiumUsers} Premium</Text>
      </GlassCard>

      <GlassCard style={styles.kpiCard}>
        <Award color="#10B981" size={24} />
        <Text style={[styles.kpiValue, { color: '#10B981' }]}>{premiumUsers}</Text>
        <Text style={styles.kpiLabel}>Assinantes Premium</Text>
        <Text style={styles.kpiSubText}>Planos ativos na nuvem</Text>
      </GlassCard>

      <GlassCard style={styles.kpiCard}>
        <BarChart3 color="#0EA5E9" size={24} />
        <Text style={[styles.kpiValue, { color: '#0EA5E9' }]}>{conversionRate}%</Text>
        <Text style={styles.kpiLabel}>Taxa de Conversão</Text>
        <Text style={styles.kpiSubText}>Proporção de conversão SaaS</Text>
      </GlassCard>

      <GlassCard style={styles.kpiCard}>
        <Text style={[styles.kpiValue, { color: '#0F5132' }]}>
          {mrr.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Text>
        <Text style={styles.kpiLabel}>MRR Estimado</Text>
        <Text style={styles.kpiSubText}>Receita Recorrente Mensal</Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  kpiGrid: { gap: 16 },
  kpiCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 4,
  },
  kpiValue: { fontSize: 26, fontWeight: '900', color: '#212529', marginTop: 8 },
  kpiLabel: { fontSize: 13, fontWeight: 'bold', color: '#495057' },
  kpiSubText: { fontSize: 11, color: '#6C757D', fontWeight: '500', marginTop: 2 },
});
