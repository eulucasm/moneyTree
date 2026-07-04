import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Theme } from '@/constants/Colors';
import { UserPlus, Key, Mail, Sparkles, User, Calendar, Phone } from 'lucide-react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useFinancials } from '../context/FinancialContext';
import Toast from '../components/Toast';

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const formatDateMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 0) return '';
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export default function RegisterScreen() {
  const { updateUserProfile } = useFinancials();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isFirstNameFocused, setIsFirstNameFocused] = useState(false);
  const [isLastNameFocused, setIsLastNameFocused] = useState(false);
  const [isBirthDateFocused, setIsBirthDateFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const validateBirthDate = (dateStr: string) => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    const parts = dateStr.match(regex);
    if (!parts) return false;
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10);
    const year = parseInt(parts[3], 10);
    
    if (year < 1900 || year > new Date().getFullYear()) return false;
    if (month < 1 || month > 12) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !birthDate.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }
    
    if (!validateBirthDate(birthDate.trim())) {
      showToast('Por favor, insira uma data de nascimento válida (DD/MM/AAAA).', 'error');
      return;
    }

    if (password.length < 8 || password.length > 16) {
      showToast('A senha deve ter entre 8 e 16 caracteres.', 'error');
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase) {
      showToast('A senha deve conter pelo menos uma letra maiúscula.', 'error');
      return;
    }
    if (!hasLowercase) {
      showToast('A senha deve conter pelo menos uma letra minúscula.', 'error');
      return;
    }
    if (!hasNumber) {
      showToast('A senha deve conter pelo menos um número.', 'error');
      return;
    }
    if (!hasSpecial) {
      showToast('A senha deve conter pelo menos um caractere especial.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('As senhas digitadas não coincidem.', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Create firebase user credentials
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Initialize the profile with the user's name and registration month
      const now = new Date();
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      updateUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: birthDate.trim(),
        phone: phone.trim(),
        loginType: 'email',
        createdAt: currentPeriod,
        role: (email.trim().toLowerCase() === 'eulucasm@icloud.com' || email.trim().toLowerCase() === 'lucaspoletis@gmail.com') ? 'admin' : 'user',
        status: 'active',
        hasSeenWelcome: false,
      });

      showToast('Conta criada com sucesso!', 'success');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Ocorreu um erro ao criar a conta. Tente novamente.';
      if (err.code === 'auth/invalid-email') {
        errMsg = 'Endereço de e-mail inválido.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Este e-mail já está cadastrado.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'A senha informada é muito fraca.';
      } else if (err.message) {
        errMsg = err.message;
      }
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
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

            <View style={styles.form}>
              {/* Campo Nome */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#6C757D" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      isFirstNameFocused && styles.inputFocused
                    ]}
                    placeholder="Digite aqui seu nome"
                    placeholderTextColor={Theme.light.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setIsFirstNameFocused(true)}
                    onBlur={() => setIsFirstNameFocused(false)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Campo Sobrenome */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sobrenome</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#6C757D" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      isLastNameFocused && styles.inputFocused
                    ]}
                    placeholder="Digite aqui seu sobrenome"
                    placeholderTextColor={Theme.light.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setIsLastNameFocused(true)}
                    onBlur={() => setIsLastNameFocused(false)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Campo Data de Nascimento */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Data de Nascimento *</Text>
                <View style={styles.inputWrapper}>
                  <Calendar size={18} color="#6C757D" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      isBirthDateFocused && styles.inputFocused
                    ]}
                    placeholder="Ex: DD/MM/AAAA"
                    placeholderTextColor={Theme.light.textMuted}
                    value={birthDate}
                    onChangeText={(text) => setBirthDate(formatDateMask(text))}
                    onFocus={() => setIsBirthDateFocused(true)}
                    onBlur={() => setIsBirthDateFocused(false)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Campo Celular */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Celular *</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#6C757D" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      isPhoneFocused && styles.inputFocused
                    ]}
                    placeholder="Ex: (11) 99999-9999"
                    placeholderTextColor={Theme.light.textMuted}
                    value={phone}
                    onChangeText={(text) => setPhone(formatPhone(text))}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Campo E-mail */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-mail *</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#6C757D" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      isEmailFocused && styles.inputFocused
                    ]}
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

              {/* Campo Senha */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha * (8-16 caracteres, A-Z, a-z, 0-9 e especial)</Text>
                <View style={styles.inputWrapper}>
                  <Key size={18} color="#6C757D" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      isPasswordFocused && styles.inputFocused
                    ]}
                    placeholder="Defina sua senha de acesso"
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

              {/* Campo Confirmação de Senha */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmar Senha *</Text>
                <View style={styles.inputWrapper}>
                  <Key size={18} color="#6C757D" style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      isConfirmPasswordFocused && styles.inputFocused
                    ]}
                    placeholder="Repita sua senha"
                    placeholderTextColor={Theme.light.textMuted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Criar minha conta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.switchModeButton} 
                onPress={() => router.push('/login')}
                disabled={loading}
              >
                <Text style={styles.switchModeText}>
                  Já tem conta? Entre aqui
                </Text>
              </TouchableOpacity>
            </View>

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

// Reuse layout and styles from login
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    width: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  premiumBadgeText: {
    color: '#0F5132',
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F5132',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#212529',
    outlineWidth: 0,
  } as any,
  inputFocused: {
    borderColor: '#10B981',
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  switchModeText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
});
