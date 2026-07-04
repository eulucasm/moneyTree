import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { LogIn, Sparkles } from 'lucide-react-native';
import Toast from '../components/Toast';
import { useFinancials } from '../context/FinancialContext';
import LoginForm from '../components/auth/LoginForm';

export default function LoginScreen() {
  const { suspendedMsg, clearSuspendedMsg } = useFinancials();
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (suspendedMsg) {
      showToast(suspendedMsg, 'error');
      clearSuspendedMsg();
    }
  }, [suspendedMsg]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LogIn size={32} color="#0F5132" />
            </View>
            <View style={styles.premiumBadge}>
              <Sparkles size={12} color="#0F5132" style={{ marginRight: 4 }} />
              <Text style={styles.premiumBadgeText}>verdeco. cloud</Text>
            </View>
            <Text style={styles.title}>Money Tree</Text>
            <Text style={styles.subtitle}>Sua vida financeira, simplificada e segura.</Text>
          </View>

          <LoginForm showToast={showToast} />
        </View>
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
  content: { width: '100%', maxWidth: 400, paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconContainer: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#E9ECEF' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  premiumBadgeText: { color: '#0F5132', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F5132', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6C757D', textAlign: 'center', lineHeight: 20 },
});
