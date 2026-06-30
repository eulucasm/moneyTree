import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinancials, UserProfile } from '../context/FinancialContext';
import GlassCard from '../components/GlassCard';
import { ArrowLeft, Users, Award, ShieldAlert, BarChart3, Search, Ban, UserCheck, Trash2, HelpCircle } from 'lucide-react-native';
import Toast from '../components/Toast';

export default function AdminScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const {
    user,
    userProfile,
    allUsers,
    fetchAllUsers,
    adminUpdateUserPlan,
    adminToggleUserSuspension,
    adminWipeUserData
  } = useFinancials();

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for actions loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Custom alert state
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    userId: string;
    type: 'plan' | 'suspend' | 'delete';
    targetValue?: any;
  }>({
    visible: false,
    title: '',
    message: '',
    userId: '',
    type: 'plan',
  });

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // Redirect non-admins
  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [userProfile]);

  // Sync users list on load
  useEffect(() => {
    if (userProfile?.role === 'admin') {
      fetchAllUsers();
    }
  }, []);

  if (userProfile?.role !== 'admin') {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F5132" />
        <Text style={styles.loadingText}>Verificando credenciais...</Text>
      </View>
    );
  }

  // Local filtering
  const filteredUsers = allUsers.filter(u => {
    const profile = u.userProfile || {};
    const name = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
    const email = (profile.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  // Compute metrics
  const totalUsers = allUsers.length;
  const premiumUsers = allUsers.filter(u => u.userProfile?.activePlan === 'premium').length;
  const basicUsers = totalUsers - premiumUsers;
  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0.0';
  const mrr = premiumUsers * 39.90;

  // Monthly growth grouping
  const growthByMonth: Record<string, number> = {};
  allUsers.forEach(u => {
    const month = u.userProfile?.createdAt || '2025-06';
    growthByMonth[month] = (growthByMonth[month] || 0) + 1;
  });

  const sortedMonths = Object.keys(growthByMonth).sort();

  const handleActionConfirm = async () => {
    const { userId, type, targetValue } = confirmModal;
    setConfirmModal(prev => ({ ...prev, visible: false }));
    setActionLoadingId(userId);

    try {
      if (type === 'plan') {
        await adminUpdateUserPlan(userId, targetValue);
        showToast('Plano do usuário atualizado com sucesso!', 'success');
      } else if (type === 'suspend') {
        await adminToggleUserSuspension(userId, targetValue);
        showToast(targetValue === 'suspended' ? 'Conta reativada com sucesso!' : 'Conta suspensa com sucesso!', 'success');
      } else if (type === 'delete') {
        await adminWipeUserData(userId);
        showToast('Dados e perfil do usuário deletados permanentemente!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Ocorreu um erro ao executar a ação.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/settings')}>
          <ArrowLeft color="#0F5132" size={20} />
          <Text style={styles.backButtonText}>Configurações</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel de Controle Admin</Text>
        <Text style={styles.headerSubtitle}>Administração de Contas, Assinaturas e Estatísticas Financeiras</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* KPIs Grid */}
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

        {/* Growth & User management columns */}
        <View style={[styles.columnsContainer, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
          {/* Main User List Section */}
          <View style={{ flex: 2, gap: 16 }}>
            <GlassCard style={styles.listCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Gerenciamento de Contas</Text>
                {/* Search input */}
                <View style={styles.searchContainer}>
                  <Search size={18} color="#6C757D" style={{ marginLeft: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar por nome ou e-mail..."
                    placeholderTextColor="#6C757D"
                  />
                </View>
              </View>

              {filteredUsers.length === 0 ? (
                <View style={styles.emptyState}>
                  <HelpCircle size={40} color="#6C757D" />
                  <Text style={styles.emptyText}>Nenhum usuário correspondente encontrado.</Text>
                </View>
              ) : (
                <View style={styles.usersList}>
                  {filteredUsers.map(item => {
                    const profile: UserProfile = item.userProfile || {};
                    const name = `${profile.firstName || 'Sem'} ${profile.lastName || 'Nome'}`;
                    const email = profile.email || 'Email não disponível';
                    const isPremium = profile.activePlan === 'premium';
                    const isSuspended = profile.status === 'suspended';
                    const isSelf = item.id === user?.uid;

                    return (
                      <View key={item.id} style={styles.userRow}>
                        <View style={styles.userInfoCol}>
                          <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                              {((profile.firstName?.slice(0, 1) || '') + (profile.lastName?.slice(0, 1) || '')).toUpperCase() || 'U'}
                            </Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.userNameText}>{name} {isSelf && '(Você)'}</Text>
                            <Text style={styles.userEmailText}>{email}</Text>
                            <View style={styles.badgesRow}>
                              <View style={[styles.badge, isPremium ? styles.badgePremium : styles.badgeBasic]}>
                                <Text style={[styles.badgeText, isPremium ? styles.badgeTextPremium : styles.badgeTextBasic]}>
                                  {isPremium ? 'Premium' : 'Básico'}
                                </Text>
                              </View>
                              <View style={[styles.badge, isSuspended ? styles.badgeSuspended : styles.badgeActive]}>
                                <Text style={[styles.badgeText, isSuspended ? styles.badgeTextSuspended : styles.badgeTextActive]}>
                                  {isSuspended ? 'Suspenso' : 'Ativo'}
                                </Text>
                              </View>
                              <Text style={styles.joinedText}>Cadastro: {profile.createdAt || 'N/A'}</Text>
                            </View>
                          </View>
                        </View>

                        {/* Administrative Operations */}
                        <View style={styles.actionsCol}>
                          {actionLoadingId === item.id ? (
                            <ActivityIndicator size="small" color="#0F5132" />
                          ) : (
                            <>
                              {/* Plan toggle */}
                              <TouchableOpacity
                                style={styles.actionBtn}
                                onPress={() => setConfirmModal({
                                  visible: true,
                                  title: isPremium ? 'Downgrade de Plano' : 'Upgrade de Plano',
                                  message: `Deseja alterar o plano de ${name} para ${isPremium ? 'Básico' : 'Premium'}?`,
                                  userId: item.id,
                                  type: 'plan',
                                  targetValue: isPremium ? 'free' : 'premium'
                                })}
                              >
                                <Award color={isPremium ? "#6C757D" : "#10B981"} size={18} />
                              </TouchableOpacity>

                              {/* Suspension toggle */}
                              {!isSelf && (
                                <TouchableOpacity
                                  style={styles.actionBtn}
                                  onPress={() => setConfirmModal({
                                    visible: true,
                                    title: isSuspended ? 'Reativar Conta' : 'Suspender Conta',
                                    message: `Tem certeza que deseja ${isSuspended ? 'reativar' : 'suspender'} a conta de ${name}? O usuário não conseguirá acessar o aplicativo enquanto estiver suspenso.`,
                                    userId: item.id,
                                    type: 'suspend',
                                    targetValue: profile.status || 'active'
                                  })}
                                >
                                  {isSuspended ? <UserCheck color="#10B981" size={18} /> : <Ban color="#DC3545" size={18} />}
                                </TouchableOpacity>
                              )}

                              {/* Wipe account data */}
                              {!isSelf && (
                                <TouchableOpacity
                                  style={styles.actionBtn}
                                  onPress={() => setConfirmModal({
                                    visible: true,
                                    title: 'Excluir Usuário Permanentemente',
                                    message: `ATENÇÃO: Isso apagará permanentemente o perfil de ${name} e todos os seus registros financeiros do banco de dados na nuvem. Esta operação é irreversível. Confirmar?`,
                                    userId: item.id,
                                    type: 'delete'
                                  })}
                                >
                                  <Trash2 color="#DC3545" size={18} />
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </GlassCard>
          </View>

          {/* Registration History column */}
          <View style={{ flex: 1, gap: 16 }}>
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
          </View>
        </View>
      </ScrollView>

      {/* Confirmation modal */}
      {confirmModal.visible && (
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalCard, confirmModal.type === 'delete' && { borderColor: '#FEE2E2' }]}>
            <View style={styles.modalHeader}>
              <ShieldAlert color={confirmModal.type === 'delete' ? '#DC3545' : '#0F5132'} size={24} />
              <Text style={[styles.modalTitle, confirmModal.type === 'delete' && { color: '#DC3545' }]}>
                {confirmModal.title}
              </Text>
            </View>
            <Text style={styles.modalMsg}>{confirmModal.message}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, confirmModal.type === 'delete' && { backgroundColor: '#DC3545' }]}
                onPress={handleActionConfirm}
              >
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      )}

      {/* Toast feedback */}
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
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E9ECEF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backButtonText: {
    color: '#0F5132',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    marginTop: 4,
  },
  scrollContent: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: 24,
  },
  kpiGrid: {
    gap: 16,
  },
  kpiCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 4,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#212529',
    marginTop: 8,
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#495057',
  },
  kpiSubText: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
    marginTop: 2,
  },
  columnsContainer: {
    gap: 24,
  },
  listCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    width: 280,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
    paddingHorizontal: 8,
    height: '100%',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
  usersList: {
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexWrap: 'wrap',
    gap: 16,
  },
  userInfoCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 260,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#0D6EFD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212529',
  },
  userEmailText: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePremium: {
    backgroundColor: '#D1E7DD',
  },
  badgeBasic: {
    backgroundColor: '#E2E3E5',
  },
  badgeActive: {
    backgroundColor: '#D1E7DD',
  },
  badgeSuspended: {
    backgroundColor: '#F8D7DA',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextPremium: {
    color: '#0F5132',
  },
  badgeTextBasic: {
    color: '#495057',
  },
  badgeTextActive: {
    color: '#0F5132',
  },
  badgeTextSuspended: {
    color: '#842029',
  },
  joinedText: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
  actionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 20,
  },
  growthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  growthSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 20,
  },
  growthList: {
    gap: 14,
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#495057',
    width: 60,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#F1F3F5',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0F5132',
    borderRadius: 5,
  },
  growthValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6C757D',
    width: 70,
    textAlign: 'right',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999,
  },
  modalCard: {
    width: '100%',
    maxWidth: 450,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E9ECEF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  modalMsg: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cancelBtnText: {
    color: '#495057',
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0F5132',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
