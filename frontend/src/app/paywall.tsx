import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, X, Star, Shield, Zap } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../stores/useAuthStore';
import Toast from '../components/Toast';

export default function PaywallScreen() {
  const router = useRouter();
  const { colors, theme: colorScheme } = useTheme();
  const setUserProfile = useAuthStore(s => s.setUserProfile);

  const handleSubscribe = (plan: 'monthly' | 'quarterly') => {
    // Aqui no futuro chamaremos a Stripe ou o RevenueCat
    // Ex: const purchase = await Purchases.purchasePackage(package);
    
    // Por enquanto, apenas mockamos o sucesso
    setUserProfile({ activePlan: 'premium' });
    Toast.show({
      type: 'success',
      text1: 'Parabéns!',
      text2: 'Você agora é um assinante Pro do MoneyTree.',
    });
    router.back();
  };

  const benefits = [
    { icon: <Star size={20} color="#F59E0B" />, text: 'Cartões e Contas ilimitados' },
    { icon: <Zap size={20} color="#3B82F6" />, text: 'Acesso total à aba de Investimentos' },
    { icon: <Shield size={20} color="#10B981" />, text: 'Gráficos de Rebalanceamento inteligentes' },
    { icon: <Check size={20} color="#10B981" />, text: 'Suporte prioritário e Temas exclusivos' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      
      {/* Botão de Fechar */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <X size={24} color={colors.textMuted} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>PRO</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Desbloqueie todo o seu potencial financeiro</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Acesse ferramentas avançadas e elimine limites com o MoneyTree Pro.
        </Text>
      </View>

      {/* Benefícios */}
      <View style={[styles.benefitsCard, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: colors.borderGlass }]}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <View style={styles.benefitIcon}>{benefit.icon}</View>
            <Text style={[styles.benefitText, { color: colors.text }]}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      {/* Planos */}
      <View style={styles.plansContainer}>
        {/* Plano Mensal */}
        <TouchableOpacity 
          style={[styles.planCard, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: colors.borderGlass }]}
          onPress={() => handleSubscribe('monthly')}
        >
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: colors.text }]}>Mensal</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceCurrency, { color: colors.text }]}>R$</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>12,90</Text>
            <Text style={[styles.pricePeriod, { color: colors.textMuted }]}>/mês</Text>
          </View>
          <Text style={[styles.planDesc, { color: colors.textMuted }]}>Faturamento mensal recorrente.</Text>
        </TouchableOpacity>

        {/* Plano Trimestral (Destaque) */}
        <TouchableOpacity 
          style={[styles.planCard, styles.planCardHighlight]}
          onPress={() => handleSubscribe('quarterly')}
        >
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: '#FFFFFF' }]}>Trimestral</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceCurrency, { color: '#FFFFFF' }]}>R$</Text>
            <Text style={[styles.priceValue, { color: '#FFFFFF' }]}>34,90</Text>
            <Text style={[styles.pricePeriod, { color: 'rgba(255,255,255,0.7)' }]}>/trimestre</Text>
          </View>
          <Text style={[styles.planDesc, { color: 'rgba(255,255,255,0.7)' }]}>Equivale a R$ 11,63 por mês. Economize!</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        Você pode cancelar a qualquer momento. Ao assinar, você concorda com nossos Termos de Uso e Política de Privacidade.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  badgeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  badgeText: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsCard: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 32,
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  plansContainer: {
    width: '100%',
    gap: 16,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'stretch',
  },
  planCard: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    position: 'relative',
    marginBottom: Platform.OS === 'web' ? 0 : 16,
  },
  planCardHighlight: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    transform: [{ scale: Platform.OS === 'web' ? 1.05 : 1 }],
    zIndex: 1,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '900',
  },
  pricePeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
  planDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimer: {
    marginTop: 32,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
    opacity: 0.7,
  },
});
