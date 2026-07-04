import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Search, HelpCircle, Award, UserCheck, Ban, Trash2 } from 'lucide-react-native';
import GlassCard from '../GlassCard';
import { UserProfile } from '../../context/FinancialContext';

interface UserListProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredUsers: any[];
  currentUser: any;
  actionLoadingId: string | null;
  setConfirmModal: (modal: any) => void;
}

export default function UserList({ searchQuery, setSearchQuery, filteredUsers, currentUser, actionLoadingId, setConfirmModal }: UserListProps) {
  return (
    <GlassCard style={styles.listCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gerenciamento de Contas</Text>
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
            const isSelf = item.id === currentUser?.uid;

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

                <View style={styles.actionsCol}>
                  {actionLoadingId === item.id ? (
                    <ActivityIndicator size="small" color="#0F5132" />
                  ) : (
                    <>
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
  );
}

const styles = StyleSheet.create({
  listCard: { borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9ECEF', padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E9ECEF', paddingBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F5132' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 8, width: 280, height: 40 },
  searchInput: { flex: 1, fontSize: 14, color: '#212529', paddingHorizontal: 8, height: '100%' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#6C757D', fontWeight: '500' },
  usersList: { gap: 12 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E9ECEF', flexWrap: 'wrap', gap: 16 },
  userInfoCol: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 260 },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E6F4FE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#0D6EFD', fontSize: 16, fontWeight: 'bold' },
  userNameText: { fontSize: 15, fontWeight: 'bold', color: '#212529' },
  userEmailText: { fontSize: 13, color: '#6C757D', fontWeight: '500', marginTop: 2 },
  badgesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePremium: { backgroundColor: '#D1E7DD' },
  badgeBasic: { backgroundColor: '#E2E3E5' },
  badgeActive: { backgroundColor: '#D1E7DD' },
  badgeSuspended: { backgroundColor: '#F8D7DA' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  badgeTextPremium: { color: '#0F5132' },
  badgeTextBasic: { color: '#495057' },
  badgeTextActive: { color: '#0F5132' },
  badgeTextSuspended: { color: '#842029' },
  joinedText: { fontSize: 11, color: '#6C757D', fontWeight: '500' },
  actionsCol: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9ECEF', alignItems: 'center', justifyContent: 'center' },
});
