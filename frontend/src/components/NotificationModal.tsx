import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { X, AlertCircle, AlertTriangle, Info, BellRing } from 'lucide-react-native';
import GlassCard from './GlassCard';
import { AppNotification, useNotificationUIStore, useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../hooks/useTheme';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const notifications = useNotifications();
  const dismissNotification = useNotificationUIStore(s => s.dismiss);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;
  const { theme: colorScheme, colors } = useTheme();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 20, duration: 200, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'critical': return <AlertCircle color="#DC3545" size={24} />;
      case 'warning': return <AlertTriangle color="#F59E0B" size={24} />;
      case 'info': return <Info color="#3B82F6" size={24} />;
    }
  };

  const getBorderColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'critical': return '#DC354540';
      case 'warning': return '#F59E0B40';
      case 'info': return '#3B82F640';
    }
  };

  const isDark = colorScheme === 'dark';

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim, backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(233, 236, 239, 0.6)' }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.container, 
            { 
              transform: [{ translateY: slideAnim }],
              width: isMobile ? '90%' : 400,
              backgroundColor: colors.surface,
              borderColor: colors.borderGlass,
            }
          ]}
        >
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderGlass }]}>
            <View style={styles.headerLeft}>
              <BellRing color={colors.text} size={20} />
              <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8F9FA' }]}>
              <X color={colors.textMuted} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 16 }}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <BellRing color={colors.textMuted} size={32} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tudo limpo por aqui!</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>Nenhuma notificação nova no momento.</Text>
              </View>
            ) : (
              notifications.map((notif) => (
                <GlassCard 
                  key={notif.id} 
                  style={[styles.notificationCard, { borderColor: getBorderColor(notif.type), borderWidth: 1 }]}
                >
                  <View style={styles.notifHeader}>
                    <View style={styles.notifTitleRow}>
                      {getIcon(notif.type)}
                      <Text style={[styles.notifTitle, { color: colors.text }]}>{notif.title}</Text>
                    </View>
                    <TouchableOpacity onPress={() => dismissNotification(notif.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <X color={colors.textMuted} size={16} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>{notif.message}</Text>
                </GlassCard>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80, // Space below header
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
  },
  container: {
    borderRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
  },
  list: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 8,
  },
  emptySub: {
    fontWeight: '400',
    fontSize: 14,
    textAlign: 'center',
  },
  notificationCard: {
    padding: 16,
    marginBottom: 12,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 16,
  },
  notifTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  notifMessage: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 32, // align with text
  }
});
