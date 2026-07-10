import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { useTheme } from '../hooks/useTheme';

interface PremiumGateProps {
  children: React.ReactNode;
  featureName: string;
  description: string;
}

export default function PremiumGate({ children, featureName, description }: PremiumGateProps) {
  const userProfile = useAuthStore(s => s.userProfile);
  const isPremium = userProfile?.activePlan === 'premium';
  const router = useRouter();
  const { colors, colorScheme } = useTheme();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* O conteúdo fica em background e inativo */}
      <View style={styles.backgroundContent} pointerEvents="none">
        {children}
      </View>

      {/* Camada de Desfoque e Overlay */}
      <BlurView 
        intensity={colorScheme === 'dark' ? 80 : 50} 
        tint={colorScheme === 'dark' ? 'dark' : 'light'} 
        style={StyleSheet.absoluteFill} 
      />

      {/* Conteúdo do Paywall Mock */}
      <View style={styles.overlayContent} pointerEvents="box-none">
        <View style={[styles.paywallCard, { backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.iconCircle}>
            <Lock size={24} color="#10B981" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{featureName}</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
          
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeButtonText}>Desbloquear com o Pro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundContent: {
    flex: 1,
    opacity: 0.5, // Reduz a opacidade para reforçar o bloqueio
  },
  overlayContent: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 10,
  },
  paywallCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
