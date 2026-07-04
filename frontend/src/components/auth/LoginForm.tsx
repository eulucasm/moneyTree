import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { Theme } from '@/constants/Colors';
import { Mail, Key } from 'lucide-react-native';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebase';

const GoogleIcon = () => {
  if (Platform.OS === 'web') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.06 2.18v2.77h3.3c1.92-1.78 3.02-4.4 3.02-7.5l-.2-.3z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.3-2.77c-.92.62-2.1 1-3.63 1-3.11 0-5.74-2.11-6.68-4.96H1.03v2.85C3.01 20.12 7.16 24 12 24z" />
        <path fill="#FBBC05" d="M5.32 14.36A7.16 7.16 0 0 1 4.9 12c0-.82.14-1.63.4-2.36V6.78H1.03A11.94 11.94 0 0 0 0 12c0 1.92.45 3.74 1.25 5.36l4.07-3z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.16 0 3.01 3.88 1.03 8.21l4.29 3.16c.94-2.85 3.57-4.96 6.68-4.96z" />
      </svg>
    );
  }
  return (
    <View style={{ width: 18, height: 18, backgroundColor: '#4285F4', borderRadius: 9, marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>G</Text>
    </View>
  );
};

interface LoginFormProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function LoginForm({ showToast }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (Platform.OS === 'web') {
      try {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        showToast('Login com Google realizado!', 'success');
        setTimeout(() => { router.replace('/(tabs)'); }, 800);
      } catch (err: any) {
        console.error(err);
        showToast('Erro ao logar com o Google: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Login com Google nativo disponível na versão compilada PRO. Por favor, use E-mail/Senha por enquanto!', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Bem-vindo de volta!', 'success');
      setTimeout(() => { router.replace('/(tabs)'); }, 1000);
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Ocorreu um erro. Tente novamente.';
      if (err.code === 'auth/invalid-email') errMsg = 'Endereço de e-mail inválido.';
      else if (err.code === 'auth/user-disabled') errMsg = 'Esta conta foi desativada.';
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') errMsg = 'E-mail ou senha incorretos.';
      else if (err.message) errMsg = err.message;
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={loading}>
        <GoogleIcon />
        <Text style={styles.googleButtonText}>Continue com o Google</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou faça login com e-mail</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-mail de Acesso</Text>
        <View style={styles.inputWrapper}>
          <Mail size={18} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, isEmailFocused && styles.inputFocused]}
            placeholder="seu@email.com"
            placeholderTextColor={Theme.light.textMuted}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha de Acesso</Text>
        <View style={styles.inputWrapper}>
          <Key size={18} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, isPasswordFocused && styles.inputFocused]}
            placeholder="Digite sua senha"
            placeholderTextColor={Theme.light.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Entrar na Conta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchModeButton} onPress={() => router.push('/register' as any)} disabled={loading}>
        <Text style={styles.switchModeText}>Não tem conta? Crie uma gratuitamente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%' },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 12, paddingVertical: 14, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  googleButtonText: { fontSize: 15, fontWeight: '600', color: '#212529' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E9ECEF' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#6C757D', fontWeight: '500' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#495057', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CED4DA', borderRadius: 12, paddingHorizontal: 14 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#212529', outlineWidth: 0 } as any,
  inputFocused: { borderColor: '#10B981' },
  primaryButton: { backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  primaryButtonText: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  switchModeButton: { alignItems: 'center', paddingVertical: 12, marginTop: 12 },
  switchModeText: { fontSize: 13, color: '#10B981', fontWeight: '600' },
});
