import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import GlassCard from '../GlassCard';

interface AdminModalsProps {
  confirmModal: {
    visible: boolean;
    title: string;
    message: string;
    userId: string;
    type: 'plan' | 'suspend' | 'delete';
    targetValue?: any;
  };
  setConfirmModal: (modal: any) => void;
  handleActionConfirm: () => void;
}

export default function AdminModals({ confirmModal, setConfirmModal, handleActionConfirm }: AdminModalsProps) {
  if (!confirmModal.visible) return null;

  return (
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
  );
}

const styles = StyleSheet.create({
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 9999 },
  modalCard: { width: '100%', maxWidth: 450, padding: 24, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E9ECEF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F5132' },
  modalMsg: { fontSize: 14, color: '#495057', lineHeight: 20, fontWeight: '500', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF' },
  cancelBtnText: { color: '#495057', fontSize: 14, fontWeight: 'bold' },
  confirmBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#0F5132' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});
