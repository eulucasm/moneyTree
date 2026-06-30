import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView, TextInput, Platform, useWindowDimensions } from 'react-native';
import { useFinancials, UserProfile } from '../../context/FinancialContext';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../components/GlassCard';
import { 
  Trash2, 
  Globe, 
  Sparkles, 
  User, 
  Download, 
  Upload, 
  Lock, 
  CheckCircle2, 
  MapPin, 
  CreditCard,
  Layers,
  Key,
  Cloud
} from 'lucide-react-native';
import { router } from 'expo-router';

const showAlert = (
  title: string,
  message: string,
  buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmBtn = buttons.find(b => b.style !== 'cancel') || buttons[1];
      const cancelBtn = buttons.find(b => b.style === 'cancel') || buttons[0];
      const accepted = window.confirm(`${title}\n\n${message}`);
      if (accepted) {
        if (confirmBtn?.onPress) confirmBtn.onPress();
      } else {
        if (cancelBtn?.onPress) cancelBtn.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      if (buttons && buttons[0] && buttons[0].onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const { 
    language, 
    changeLanguage, 
    clearAllData, 
    userProfile, 
    updateUserProfile,
    importBackupData,
    entries,
    exits,
    recurrings,
    purchases,
    savingsLogs,
    savingsGoal,
    user,
    syncStatus,
    lastUpdatedAt,
    logout,
    deleteAccount
  } = useFinancials();

  const { t } = useTranslation();

  const [customConfirm, setCustomConfirm] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    cancelText: string;
    type?: 'success' | 'danger' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
  });

  const showAlert = (
    title: string,
    message: string,
    buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[]
  ) => {
    let confirmText = 'OK';
    let cancelText = '';
    let onConfirm = () => {};

    if (buttons && buttons.length > 0) {
      if (buttons.length === 1) {
        confirmText = buttons[0].text;
        onConfirm = buttons[0].onPress || (() => {});
      } else {
        const cancelBtn = buttons.find(b => b.style === 'cancel');
        const confirmBtn = buttons.find(b => b.style !== 'cancel') || buttons[1];

        if (cancelBtn) {
          cancelText = cancelBtn.text;
        }
        if (confirmBtn) {
          confirmText = confirmBtn.text;
          onConfirm = confirmBtn.onPress || (() => {});
        }
      }
    }

    let type: 'success' | 'danger' | 'info' = 'info';
    const lowerTitle = title.toLowerCase();
    const lowerMessage = message.toLowerCase();
    if (
      lowerTitle.includes('erro') ||
      lowerTitle.includes('excluir') ||
      lowerTitle.includes('sair') ||
      lowerTitle.includes('limpar') ||
      lowerTitle.includes('perigo')
    ) {
      type = 'danger';
    } else if (
      lowerTitle.includes('sucesso') ||
      lowerTitle.includes('copiado') ||
      lowerTitle.includes('atualizado') ||
      lowerTitle.includes('deslogado') ||
      lowerTitle.includes('restaurado') ||
      lowerTitle.includes('importado') ||
      lowerMessage.includes('sucesso')
    ) {
      type = 'success';
    }

    setCustomConfirm({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm,
    });
  };

  // Form states
  const [firstName, setFirstName] = useState(userProfile?.firstName || 'Lucas');
  const [lastName, setLastName] = useState(userProfile?.lastName || 'Macedo');
  const [city, setCity] = useState(userProfile?.city || 'Campinas');
  const [state, setState] = useState(userProfile?.state || 'SP');
  const [loginType, setLoginType] = useState<UserProfile['loginType']>(userProfile?.loginType || 'google');
  const [password, setPassword] = useState(userProfile?.password || '');
  const [showPassword, setShowPassword] = useState(false);

  // Backup states
  const [backupInput, setBackupInput] = useState('');
  const [isImportVisible, setIsImportVisible] = useState(false);
  const fileInputRef = useRef<any>(null);

  // Sync state with context updates
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName);
      setLastName(userProfile.lastName);
      setCity(userProfile.city);
      setState(userProfile.state);
      setLoginType(userProfile.loginType);
      setPassword(userProfile.password || '');
    }
  }, [userProfile]);

  const handleSaveProfile = () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert('Erro', 'Nome e Sobrenome são obrigatórios.');
      return;
    }
    updateUserProfile({
      firstName,
      lastName,
      city,
      state,
      loginType,
      password: loginType === 'email' ? password : '',
    });
    showAlert('Sucesso!', 'Informações de perfil salvas com sucesso.');
  };

  const handleLogout = async () => {
    showAlert(
      'Sair da conta?',
      'Seus dados locais serão limpos por segurança. Ao fazer login novamente, seus dados serão recuperados da nuvem.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            showAlert('Deslogado!', 'Sua sessão foi encerrada com sucesso.', [
              {
                text: 'OK',
                onPress: () => {
                  router.replace('/login');
                }
              }
            ]);
          }
        }
      ]
    );
  };

  const handleCleanData = () => {
    setCustomConfirm({
      visible: true,
      title: t('common.cleanData'),
      message: t('common.cleanDataConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        await clearAllData();
        showAlert('Sucesso!', 'Todos os dados foram limpos do seu dispositivo.');
      }
    });
  };

  const handleDeleteAccount = () => {
    setCustomConfirm({
      visible: true,
      title: 'Excluir minha conta?',
      message: 'Esta ação apagará permanentemente a sua conta cloud e todos os seus dados da nuvem e deste dispositivo. Esta operação é irreversível.',
      confirmText: 'Excluir Conta',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteAccount();
          showAlert('Sucesso!', 'Sua conta e dados foram apagados com sucesso.', [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/login');
              }
            }
          ]);
        } catch (err: any) {
          if (err.message === 'reauth_required') {
            showAlert(
              'Ação de Segurança',
              'Para excluir sua conta, você precisa ter feito login recentemente. Por favor, saia e faça login novamente para realizar esta ação.'
            );
          } else {
            showAlert('Erro', 'Ocorreu um erro ao excluir sua conta: ' + err.message);
          }
        }
      }
    });
  };

  const handleExportBackup = () => {
    const backupObj = {
      entries,
      exits,
      recurrings,
      purchases,
      savingsLogs,
      savingsGoal,
      userProfile,
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);

    if (Platform.OS === 'web') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `moneytree_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showAlert('Sucesso!', 'Arquivo de backup gerado e baixado no seu navegador.');
    } else {
      // Native Clipboard fallback
      setBackupInput(jsonStr);
      setIsImportVisible(true);
      showAlert('Backup Copiado!', 'O código JSON foi copiado e exibido no campo abaixo para restauração rápida.');
    }
  };

  const handleImportBackupText = async () => {
    if (!backupInput.trim()) {
      showAlert('Erro', 'Cole a string JSON de backup no campo antes de continuar.');
      return;
    }
    const success = await importBackupData(backupInput);
    if (success) {
      showAlert('Sucesso!', 'Backup restaurado com sucesso.');
      setBackupInput('');
      setIsImportVisible(false);
    } else {
      showAlert('Erro', 'Formato de backup inválido.');
    }
  };

  const handleWebFileImport = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const success = await importBackupData(text);
        if (success) {
          showAlert('Sucesso!', 'Backup do arquivo JSON importado com sucesso.');
        } else {
          showAlert('Erro', 'Erro ao ler arquivo de backup. Formato incompatível.');
        }
      }
    };
    reader.readAsText(file);
  };

  const languages = [
    { key: 'pt', label: t('settings.languages.pt') },
    { key: 'en', label: t('settings.languages.en') },
    { key: 'es', label: t('settings.languages.es') },
    { key: 'fr', label: t('settings.languages.fr') },
  ];

  const isSuccess = customConfirm.type === 'success';
  const isInfo = customConfirm.type === 'info';
  const isDanger = customConfirm.type === 'danger' || !customConfirm.type;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: width < 768 ? 110 : 24 }]}>
      <View style={styles.header}>
        <User color="#0F5132" size={32} />
        <Text style={styles.headerText}>Configuração de Conta</Text>
      </View>

      <View style={styles.mainGrid}>
        {/* LEFT COLUMN: User Info and Backup */}
        <View style={[styles.leftColumn, { minWidth: isLargeScreen ? 500 : '100%' }]}>
          {/* Firebase Cloud Sync Card */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Cloud color="#0F5132" size={24} />
              <Text style={styles.sectionTitle}>Sincronização Cloud</Text>
            </View>

            {user ? (
              <View style={styles.syncDetails}>
                <View style={styles.syncRow}>
                  <Text style={styles.syncLabel}>Conta:</Text>
                  <Text style={styles.syncValue} numberOfLines={1}>{user.email}</Text>
                </View>
                <View style={styles.syncRow}>
                  <Text style={styles.syncLabel}>Status:</Text>
                  <View style={[
                    styles.syncBadge,
                    syncStatus === 'synced' && styles.syncBadgeSynced,
                    syncStatus === 'syncing' && styles.syncBadgeSyncing,
                    syncStatus === 'error' && styles.syncBadgeError,
                  ]}>
                    <Text style={[
                      styles.syncBadgeText,
                      syncStatus === 'synced' && { color: '#0F5132' },
                      syncStatus === 'syncing' && { color: '#004085' },
                      syncStatus === 'error' && { color: '#721C24' },
                    ]}>
                      {syncStatus === 'synced' && 'Sincronizado'}
                      {syncStatus === 'syncing' && 'Sincronizando...'}
                      {syncStatus === 'error' && 'Erro de Sincronia'}
                      {syncStatus === 'offline' && 'Offline'}
                    </Text>
                  </View>
                </View>
                {lastUpdatedAt > 0 && (
                  <View style={styles.syncRow}>
                    <Text style={styles.syncLabel}>Última sincronia:</Text>
                    <Text style={styles.syncValueDate}>
                      {new Date(lastUpdatedAt).toLocaleString('pt-BR')}
                    </Text>
                  </View>
                )}

                {userProfile?.role === 'admin' && (
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => router.push('/admin' as any)}
                    style={[styles.logoutButton, { backgroundColor: '#0F5132', borderColor: '#0F5132', marginBottom: 10 }]}
                  >
                    <Text style={[styles.logoutButtonText, { color: '#FFFFFF' }]}>Painel Admin</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={handleLogout}
                  style={styles.logoutButton}
                >
                  <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.syncDetails}>
                <Text style={styles.syncDesc}>
                  Você está usando o modo local (Offline-first). Seus dados estão salvos apenas neste dispositivo.
                </Text>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => router.replace('/login')}
                  style={styles.loginBtnSettings}
                >
                  <Text style={styles.loginBtnSettingsText}>Acessar / Criar Conta Cloud</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>

          {/* User Profile Form */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <User color="#0F5132" size={24} />
              <Text style={styles.sectionTitle}>Dados do Perfil</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Seu nome"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Sobrenome</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Seu sobrenome"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Sua cidade"
                />
              </View>
              <View style={styles.formField}>
                <Text style={styles.label}>Estado (UF)</Text>
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder="Ex: SP"
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Login Type Selector */}
            <View style={styles.loginTypeContainer}>
              <Text style={styles.label}>Método de Login</Text>
              <View style={styles.selectorPills}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setLoginType('google')}
                  style={[
                    styles.pill,
                    loginType === 'google' ? styles.pillActive : styles.pillInactive
                  ]}
                >
                  <Text style={[
                    styles.pillText,
                    loginType === 'google' ? styles.pillTextActive : styles.pillTextInactive
                  ]}>
                    Google OAuth
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setLoginType('email')}
                  style={[
                    styles.pill,
                    loginType === 'email' ? styles.pillActive : styles.pillInactive
                  ]}
                >
                  <Text style={[
                    styles.pillText,
                    loginType === 'email' ? styles.pillTextActive : styles.pillTextInactive
                  ]}>
                    E-mail e Senha
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Password input (only visible/active for Email Login) */}
            {loginType === 'email' ? (
              <View style={styles.formField}>
                <Text style={styles.label}>Senha de Acesso</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Sua senha secreta"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.showPasswordButton}
                  >
                    <Key size={18} color="#6C757D" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.googleNotice}>
                <Lock size={16} color="#0E5A36" style={{ marginRight: 8 }} />
                <Text style={styles.googleNoticeText}>
                  Login integrado via Google. A senha está desativada para a sua segurança.
                </Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSaveProfile}
              style={styles.buttonPrimary}
            >
              <Text style={styles.buttonPrimaryText}>Salvar Informações</Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Backup & System Data */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Layers color="#0F5132" size={24} />
              <Text style={styles.sectionTitle}>Backup e Restauração</Text>
            </View>
            <Text style={styles.cardDescription}>
              Exporte seus dados (receitas, boletos, investimentos e perfil) para um arquivo JSON portátil e faça importações a qualquer momento.
            </Text>

            {Platform.OS === 'web' && (
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                onChange={handleWebFileImport}
              />
            )}

            <View style={styles.backupActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleExportBackup}
                style={styles.backupButton}
              >
                <Download size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.backupButtonText}>Exportar Backup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  if (Platform.OS === 'web') {
                    fileInputRef.current?.click();
                  } else {
                    setIsImportVisible(!isImportVisible);
                  }
                }}
                style={styles.backupButtonOutline}
              >
                <Upload size={18} color="#0F5132" style={{ marginRight: 8 }} />
                <Text style={styles.backupButtonOutlineText}>
                  {Platform.OS === 'web' ? 'Selecionar Arquivo' : 'Código de Importação'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Paste Box for restoring fallback / mobile */}
            {(isImportVisible || Platform.OS !== 'web') && (
              <View style={styles.importTextBox}>
                <Text style={styles.label}>Colar Código JSON de Backup</Text>
                <TextInput
                  style={styles.textarea}
                  value={backupInput}
                  onChangeText={setBackupInput}
                  placeholder='Cole o JSON aqui...'
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleImportBackupText}
                  style={styles.importSubmitButton}
                >
                  <Text style={styles.importSubmitButtonText}>Confirmar Restauração</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        </View>

        {/* RIGHT COLUMN: Plans, Languages & Dangerous actions */}
        <View style={[styles.rightColumn, { minWidth: isLargeScreen ? 500 : '100%' }]}>
          {/* Subscription Active Plan Card */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Sparkles color="#0F5132" size={24} />
              <Text style={styles.sectionTitle}>Plano Vigente</Text>
            </View>
            <Text style={styles.cardDescription}>
              {userProfile?.activePlan === 'premium' 
                ? 'Você está utilizando o plano Premium do Money Tree. Aproveite todos os recursos liberados para sua gestão.'
                : 'Você está utilizando o plano Básico do Money Tree. Adquira o Premium para liberar sincronização em nuvem e recursos extras.'}
            </Text>
            <View style={styles.activePlanBadgeContainer}>
              <Text style={styles.activePlanLabel}>Plano Atual:</Text>
              <View style={[
                styles.activePlanBadge,
                { backgroundColor: userProfile?.activePlan === 'premium' ? '#10B981' : '#6C757D' }
              ]}>
                <Text style={styles.activePlanBadgeText}>
                  {userProfile?.activePlan === 'premium' ? 'Premium' : 'Básico'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/plans' as any)}
              style={styles.changePlanButton}
            >
              <Text style={styles.changePlanButtonText}>Adquirir Outro Plano</Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Languages Section */}
          <GlassCard style={styles.card}>
            <View style={styles.sectionHeader}>
              <Globe color="#0F5132" size={24} />
              <Text style={styles.sectionTitle}>{t('common.language')}</Text>
            </View>
            <View style={styles.langList}>
              {languages.map((lang) => {
                const isSelected = language === lang.key;
                return (
                  <TouchableOpacity
                    key={lang.key}
                    activeOpacity={0.8}
                    onPress={() => changeLanguage(lang.key)}
                    style={[
                      styles.langItem,
                      isSelected ? styles.langItemSelected : styles.langItemUnselected,
                    ]}
                  >
                    <Text style={[
                      styles.langText,
                      isSelected ? styles.langTextActive : styles.langTextInactive
                    ]}>
                      {lang.label}
                    </Text>
                    {isSelected && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>

          {/* Danger Zone Section */}
          <GlassCard style={[styles.card, styles.dangerCard]}>
            <View style={styles.sectionHeader}>
              <Trash2 color="#DC3545" size={24} />
              <Text style={[styles.sectionTitle, { color: '#DC3545' }]}>
                {t('common.cleanData')}
              </Text>
            </View>
            <Text style={styles.dangerDescription}>
              Esta ação apagará permanentemente todos os lançamentos de receitas, saídas, faturas de cartões e configurações de perfil gravados no seu dispositivo.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCleanData}
              style={styles.dangerButton}
            >
              <Text style={styles.dangerButtonText}>{t('common.cleanData')}</Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Excluir Conta Section */}
          <GlassCard style={[styles.card, styles.dangerCard]}>
            <View style={styles.sectionHeader}>
              <Trash2 color="#DC3545" size={24} />
              <Text style={[styles.sectionTitle, { color: '#DC3545' }]}>
                Excluir Minha Conta
              </Text>
            </View>
            <Text style={styles.dangerDescription}>
              Esta ação excluirá permanentemente sua conta da nuvem e todos os dados vinculados a ela. Esta operação não pode ser desfeita.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDeleteAccount}
              style={styles.dangerButton}
            >
              <Text style={styles.dangerButtonText}>Excluir Conta</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </View>
      
      <Text style={styles.footerVersion}>Money Tree SaaS v0.2.0 • Minimalist Tech • Protótipo 2025</Text>
    </ScrollView>

    {/* Custom Confirmation Modal */}
    {customConfirm.visible && (
      <View style={styles.alertOverlay}>
        <GlassCard style={[
          styles.alertCard,
          isSuccess && { borderColor: '#A7F3D0' },
          isInfo && { borderColor: '#E0F2FE' },
          isDanger && { borderColor: '#FEE2E2' }
        ]}>
          <View style={styles.alertHeader}>
            {isSuccess ? (
              <CheckCircle2 color="#10B981" size={28} />
            ) : isInfo ? (
              <Sparkles color="#0EA5E9" size={28} />
            ) : (
              <Trash2 color="#DC3545" size={28} />
            )}
            <Text style={[
              styles.alertTitle,
              isSuccess && { color: '#10B981' },
              isInfo && { color: '#0EA5E9' },
              isDanger && { color: '#DC3545' }
            ]}>{customConfirm.title}</Text>
          </View>
          <Text style={styles.alertMessage}>{customConfirm.message}</Text>
          <View style={styles.alertButtons}>
            {!!customConfirm.cancelText && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.alertCancelButton}
                onPress={() => setCustomConfirm(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.alertCancelButtonText}>
                  {customConfirm.cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.alertConfirmButton,
                isSuccess && { backgroundColor: '#10B981' },
                isInfo && { backgroundColor: '#0EA5E9' },
                isDanger && { backgroundColor: '#DC3545' }
              ]}
              onPress={() => {
                setCustomConfirm(prev => ({ ...prev, visible: false }));
                customConfirm.onConfirm();
              }}
            >
              <Text style={styles.alertConfirmButtonText}>
                {customConfirm.confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    )}
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
  mainGrid: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  leftColumn: {
    flex: 1,
    gap: 24,
  },
  rightColumn: {
    flex: 1,
    gap: 24,
  },
  card: {
    padding: 24,
    borderRadius: 16,
  },
  cardDescription: {
    color: '#6C757D',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#212529',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
  },
  loginTypeContainer: {
    marginBottom: 16,
  },
  selectorPills: {
    flexDirection: 'row',
    gap: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E9ECEF',
  },
  pillActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#10B981',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextInactive: {
    color: '#495057',
  },
  pillTextActive: {
    color: '#0F5132',
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  googleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  googleNoticeText: {
    color: '#137333',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  buttonPrimary: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  backupButton: {
    flex: 1,
    backgroundColor: '#0F5132',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backupButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backupButtonOutline: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0F5132',
  },
  backupButtonOutlineText: {
    color: '#0F5132',
    fontSize: 14,
    fontWeight: 'bold',
  },
  importTextBox: {
    marginTop: 8,
    gap: 12,
  },
  textarea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
    color: '#212529',
    height: 100,
    textAlignVertical: 'top',
  },
  importSubmitButton: {
    backgroundColor: '#0F5132',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  importSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activePlanBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  activePlanLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
  },
  activePlanBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activePlanBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  changePlanButton: {
    backgroundColor: '#0F5132',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  changePlanButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  langList: {
    gap: 10,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  langItemUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E9ECEF',
  },
  langItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#10B981',
  },
  langText: {
    fontSize: 15,
    fontWeight: '600',
  },
  langTextActive: {
    color: '#0F5132',
  },
  langTextInactive: {
    color: '#495057',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  dangerCard: {
    borderColor: '#F8D7DA',
    borderWidth: 1,
  },
  dangerDescription: {
    color: '#6C757D',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#DC3545',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#DC3545',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footerVersion: {
    textAlign: 'center',
    color: '#ADB5BD',
    fontSize: 13,
    marginTop: 32,
    fontWeight: '600',
  },
  syncDetails: {
    gap: 12,
    marginTop: 8,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  syncLabel: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '600',
  },
  syncValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212529',
    maxWidth: 200,
  },
  syncValueDate: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E9ECEF',
  },
  syncBadgeSynced: {
    backgroundColor: '#E8F5E9',
  },
  syncBadgeSyncing: {
    backgroundColor: '#CCE5FF',
  },
  syncBadgeError: {
    backgroundColor: '#F8D7DA',
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6C757D',
  },
  syncDesc: {
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
    marginBottom: 8,
  },
  loginBtnSettings: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  loginBtnSettingsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DC3545',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#DC3545',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F8D7DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC3545',
  },
  alertMessage: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 24,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alertCancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertCancelButtonText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: 'bold',
  },
  alertConfirmButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
