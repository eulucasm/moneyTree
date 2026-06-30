import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFinancials, UserProfile } from '../../context/FinancialContext';
import GlassCard from '../../components/GlassCard';
import { Sparkles, CheckCircle2, Award, Zap, Shield } from 'lucide-react-native';
import Toast from '../../components/Toast';

export default function PlansScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const { userProfile, updateUserProfile } = useFinancials();

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleUpgradePlan = (planKey: UserProfile['activePlan']) => {
    updateUserProfile({ activePlan: planKey });
    showToast(
      `Plano atualizado para o ${
        planKey === 'free' ? 'Plano Básico' : 'Plano Premium'
      } com sucesso!`,
      'success'
    );
  };

  const plans = [
    {
      key: 'free' as const,
      name: 'Plano Básico',
      price: 'Grátis',
      period: '',
      features: [
        'Controle financeiro local',
        'Projeção para 7 meses',
        'Checklist de parcelas',
        'Backup manual em JSON',
      ],
      color: '#6C757D',
      icon: Shield,
      bg: '#F8F9FA',
    },
    {
      key: 'premium' as const,
      name: 'Plano Premium',
      price: 'R$ 39,90',
      period: '/mês',
      features: [
        'Sincronização em nuvem',
        'Acesso multi-dispositivo',
        'Backups automáticos',
        'Dashboard de KPIs avançado',
        'Gráficos interativos extras',
        'Cartões de crédito ilimitados',
        'Checklist ilimitado',
        'Suporte prioritário 24/7',
      ],
      color: '#10B981',
      icon: Award,
      bg: '#E8F5E9',
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: width < 768 ? 110 : 24 }]}
      >
        <View style={styles.header}>
          <Sparkles color="#0F5132" size={32} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerText}>Planos de Assinatura</Text>
            <Text style={styles.headerSubtitle}>
              Escolha a melhor opção para impulsionar e gerenciar sua vida financeira.
            </Text>
          </View>
        </View>

        <View style={[styles.plansGrid, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
          {plans.map((p) => {
            const isActive = userProfile?.activePlan === p.key;
            const PlanIcon = p.icon;

            return (
              <GlassCard
                key={p.key}
                style={[
                  styles.planCard,
                  isActive && { borderColor: p.color, borderWidth: 2 },
                  isLargeScreen && { flex: 1 },
                ]}
              >
                <View style={styles.planHeader}>
                  <View style={[styles.iconWrapper, { backgroundColor: p.bg }]}>
                    <PlanIcon color={p.color} size={28} />
                  </View>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: p.color }]}>
                      <Text style={styles.activeBadgeText}>Ativo</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.planName}>{p.name}</Text>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceValue}>{p.price}</Text>
                  <Text style={styles.pricePeriod}>{p.period}</Text>
                </View>

                <View style={styles.separator} />

                <View style={styles.featuresList}>
                  {p.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {!isActive ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleUpgradePlan(p.key)}
                    style={[styles.actionButton, { backgroundColor: p.color }]}
                  >
                    <Text style={styles.actionButtonText}>Adquirir {p.name}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.activePlaceholder}>
                    <Text style={[styles.activePlaceholderText, { color: p.color }]}>
                      Seu Plano Atual
                    </Text>
                  </View>
                )}
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#0F5132',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  plansGrid: {
    gap: 24,
    marginTop: 16,
  },
  planCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    justifyContent: 'space-between',
    minHeight: 460,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F5132',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 20,
  },
  featuresList: {
    gap: 12,
    flex: 1,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    lineHeight: 20,
    flex: 1,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  activePlaceholder: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  activePlaceholderText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
