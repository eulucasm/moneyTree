import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView } from 'react-native';
import { UserPlus, Sparkles } from 'lucide-react-native';
import Toast from '../components/Toast';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterScreen() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <UserPlus size={32} color="#0F5132" />
              </View>
              <View style={styles.premiumBadge}>
                <Sparkles size={12} color="#0F5132" style={{ marginRight: 4 }} />
                <Text style={styles.premiumBadgeText}>Crie sua conta</Text>
              </View>
              <Text style={styles.title}>Money Tree</Text>
              <Text style={styles.subtitle}>Cadastre-se para gerenciar suas contas de forma inteligente e sincronizada.</Text>
            </View>

            <RegisterForm showToast={showToast} />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast 
        message={toastMessage} 
        type={toastType} 
        visible={toastVisible} 
        onHide={() => setToastVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32, width: '100%' },
  content: { width: '100%', maxWidth: 400, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  iconContainer: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#E9ECEF' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  premiumBadgeText: { color: '#0F5132', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F5132', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6C757D', textAlign: 'center', lineHeight: 20 },
});
