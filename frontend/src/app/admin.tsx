import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinancials } from '../context/FinancialContext';
import { ArrowLeft } from 'lucide-react-native';
import Toast from '../components/Toast';

import AdminKPIs from '../components/admin/AdminKPIs';
import UserList from '../components/admin/UserList';
import GrowthCard from '../components/admin/GrowthCard';
import AdminModals from '../components/admin/AdminModals';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (userProfile?.role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [userProfile]);

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

  const filteredUsers = allUsers.filter(u => {
    const profile = u.userProfile || {};
    const name = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
    const email = (profile.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const totalUsers = allUsers.length;
  const premiumUsers = allUsers.filter(u => u.userProfile?.activePlan === 'premium').length;
  const basicUsers = totalUsers - premiumUsers;
  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0.0';
  const mrr = premiumUsers * 39.90;

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/settings')}>
          <ArrowLeft color="#0F5132" size={20} />
          <Text style={styles.backButtonText}>Configurações</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel de Controle Admin</Text>
        <Text style={styles.headerSubtitle}>Administração de Contas, Assinaturas e Estatísticas Financeiras</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AdminKPIs 
          totalUsers={totalUsers} 
          basicUsers={basicUsers} 
          premiumUsers={premiumUsers} 
          conversionRate={conversionRate} 
          mrr={mrr} 
          isLargeScreen={isLargeScreen} 
        />

        <View style={[styles.columnsContainer, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
          <View style={[{ gap: 16, width: '100%' }, isLargeScreen && { flex: 2 }]}>
            <UserList 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredUsers={filteredUsers}
              currentUser={user}
              actionLoadingId={actionLoadingId}
              setConfirmModal={setConfirmModal}
            />
          </View>
          <View style={[{ gap: 16, width: '100%' }, isLargeScreen && { flex: 1 }]}>
            <GrowthCard sortedMonths={sortedMonths} growthByMonth={growthByMonth} />
          </View>
        </View>
      </ScrollView>

      <AdminModals 
        confirmModal={confirmModal}
        setConfirmModal={setConfirmModal}
        handleActionConfirm={handleActionConfirm}
      />

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
  outerContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 12, fontSize: 15, fontWeight: 'bold', color: '#0F5132' },
  header: { padding: 24, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E9ECEF' },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 12 },
  backButtonText: { color: '#0F5132', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F5132' },
  headerSubtitle: { fontSize: 14, color: '#6C757D', fontWeight: '500', marginTop: 4 },
  scrollContent: { padding: 24, maxWidth: 1200, width: '100%', alignSelf: 'center', gap: 24 },
  columnsContainer: { gap: 24 },
});
