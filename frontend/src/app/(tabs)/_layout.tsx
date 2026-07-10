import React, { useRef, useState } from 'react';
import { Tabs, useRouter, usePathname, Redirect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, useWindowDimensions, ScrollView } from 'react-native';
import { 
  Bell, LayoutDashboard, Coins, CreditCard, History as HistoryIcon, 
  BarChart3, Settings as SettingsIcon, Menu as MenuIcon, X, Sparkles, 
  Sun, Moon, LogOut, TrendingUp, Target
} from 'lucide-react-native';
import { useFinancials } from '../../context/FinancialContext';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTheme } from '../../hooks/useTheme';
import NotificationModal from '../../components/NotificationModal';
import { useNotifications } from '../../hooks/useNotifications';
import { LinearGradient } from 'expo-linear-gradient';

const NAV_LINKS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Contas', path: '/budget', icon: Coins },
  { label: 'Faturas', path: '/installments', icon: CreditCard },
  { label: 'Histórico', path: '/history', icon: HistoryIcon },
  { label: 'Investimentos', path: '/investments', icon: TrendingUp },
  { label: 'Gráficos', path: '/charts', icon: BarChart3 },
];

function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, logout } = useFinancials();
  const [modalVisible, setModalVisible] = useState(false);
  const notifications = useNotifications();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { colorScheme, colors } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const initials = ((userProfile?.firstName?.slice(0, 1) || '') + (userProfile?.lastName?.slice(0, 1) || '')).toUpperCase() || 'LM';

  return (
    <View style={[styles.sidebarContainer, { backgroundColor: colors.surface, borderRightColor: colors.borderGlass }]}>
      <View style={styles.sidebarTop}>
        <View style={styles.logoContainerSidebar}>
          <LinearGradient colors={colors.tintGradient || [colors.tint, colors.tint]} style={styles.logoIcon}>
            <Target size={18} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.logoText, { color: colors.text, fontFamily: 'Inter_700Bold' }]}>Money Tree</Text>
        </View>

        <ScrollView style={styles.sidebarNav}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.path || (link.path === '/' && pathname === '/index');
            const Icon = link.icon;
            return (
              <TouchableOpacity 
                key={link.path}
                activeOpacity={0.8}
                style={[
                  styles.sidebarNavItem, 
                  isActive && { 
                    backgroundColor: colorScheme === 'dark' ? 'rgba(16,185,129,0.06)' : '#F4FBF7',
                    borderLeftWidth: 3,
                    borderLeftColor: colors.tint,
                    paddingLeft: 13, // compensate for 3px border to keep alignment
                  }
                ]}
                onPress={() => router.push(link.path as any)}
              >
                <Icon size={18} color={isActive ? colors.tint : colors.textMuted} />
                <Text style={[styles.sidebarNavText, { color: isActive ? colors.tint : colors.textMuted, fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_500Medium' }]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sidebarBottom}>
        <View style={styles.sidebarActions}>
          <TouchableOpacity style={[styles.sidebarIconBtn, { backgroundColor: colorScheme === 'dark' ? '#18181B' : '#F1F5F9' }]} onPress={toggleTheme}>
            {colorScheme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#475569" />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sidebarIconBtn, { backgroundColor: colorScheme === 'dark' ? '#18181B' : '#F1F5F9' }]} onPress={() => setModalVisible(true)}>
            <Bell size={18} color={colors.textSecondary} />
            {notifications.length > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sidebarIconBtn, { backgroundColor: colorScheme === 'dark' ? '#18181B' : '#F1F5F9' }]} onPress={() => router.push('/settings')}>
            <SettingsIcon size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.sidebarUserCard, { borderTopColor: colors.borderGlass }]}>
          <View style={[styles.avatar, colorScheme === 'dark' && { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: colors.tint }]}>
            <Text style={[styles.avatarText, { color: colors.tint, fontFamily: 'Inter_700Bold' }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={{ color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>{userProfile?.firstName}</Text>
            <Text style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 12, textTransform: 'capitalize' }}>{userProfile?.activePlan}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <LogOut size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      <NotificationModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

function MobileHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, logout } = useFinancials();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const notifications = useNotifications();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { colorScheme, colors } = useTheme();

  const initials = ((userProfile?.firstName?.slice(0, 1) || '') + (userProfile?.lastName?.slice(0, 1) || '')).toUpperCase() || 'LM';

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[
      styles.mobileHeaderContainer, 
      { backgroundColor: colorScheme === 'dark' ? 'rgba(24, 33, 51, 0.8)' : 'rgba(255, 255, 255, 0.85)' }
    ]}>
      <View style={styles.mobileHeaderContent}>
        <TouchableOpacity style={styles.mobileThemeBtn} onPress={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} color={colors.textSecondary} /> : <MenuIcon size={20} color={colors.textSecondary} />}
        </TouchableOpacity>

        <View style={[styles.logoContainerSidebar, { marginBottom: 0 }]}>
          <LinearGradient colors={colors.tintGradient || [colors.tint, colors.tint]} style={[styles.logoIcon, { width: 28, height: 28, borderRadius: 6 }]}>
            <Target size={14} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.logoText, { color: colors.text, fontFamily: 'Inter_700Bold', fontSize: 18 }]}>Money Tree</Text>
        </View>

        <View style={styles.mobileHeaderActions}>
          <TouchableOpacity style={styles.mobileThemeBtn} onPress={toggleTheme}>
            {colorScheme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#475569" />}
          </TouchableOpacity>
          <View style={[styles.avatar, { width: 32, height: 32, borderRadius: 16 }, colorScheme === 'dark' && { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: colors.tint }]}>
            <Text style={[styles.avatarText, { fontSize: 12, color: colors.tint, fontFamily: 'Inter_700Bold' }]}>{initials}</Text>
          </View>
        </View>
      </View>

      {menuOpen && (
        <View style={[styles.mobileMenu, { backgroundColor: colors.surface, borderBottomColor: colors.borderGlass }]}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.path || (link.path === '/' && pathname === '/index');
            return (
              <TouchableOpacity 
                key={link.path} 
                activeOpacity={0.7}
                onPress={() => { setMenuOpen(false); router.push(link.path as any); }}
                style={[styles.mobileMenuItem, isActive && { backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}
              >
                <Text style={[styles.mobileMenuText, isActive && styles.mobileMenuTextActive, { color: isActive ? colors.tint : colors.textMuted, fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_500Medium' }]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          <View style={{ height: 1, backgroundColor: colors.borderGlass, marginVertical: 8 }} />
          
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => { setMenuOpen(false); router.push('/settings'); }}
            style={styles.mobileMenuItem}
          >
            <Text style={[styles.mobileMenuText, { color: colors.textMuted, fontFamily: 'Inter_500Medium' }]}>
              Configurações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => { setMenuOpen(false); handleLogout(); }}
            style={styles.mobileMenuItem}
          >
            <Text style={[styles.mobileMenuText, { color: '#EF4444', fontFamily: 'Inter_500Medium' }]}>
              Sair
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <NotificationModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

export default function TabLayout() {
  const { user, authInitialized } = useFinancials();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const { colorScheme, colors } = useTheme();

  if (!authInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 16, color: colors.text, fontFamily: 'Inter_600SemiBold' }}>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? 'row' : 'column', backgroundColor: colors.background }}>
      {Platform.OS === 'web' && (
        <style type="text/css">{`
          ::-webkit-scrollbar {
            width: 14px;
            background: ${colorScheme === 'dark' ? '#09090B' : '#FFFFFF'};
          }
          ::-webkit-scrollbar-thumb {
            background: ${colorScheme === 'dark' ? '#27272A' : '#E4E4E7'};
            border-radius: 7px;
            border: 3px solid ${colorScheme === 'dark' ? '#09090B' : '#FFFFFF'};
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${colorScheme === 'dark' ? '#3F3F46' : '#D4D4D8'};
          }
        `}</style>
      )}
      
      {isLargeScreen && <DesktopSidebar />}
      
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            header: () => isLargeScreen ? null : <MobileHeader />,
            headerTransparent: true,
            tabBarStyle: (isLargeScreen || Platform.OS === 'web') ? { display: 'none' } : {
              ...styles.bottomTabBar,
              backgroundColor: colorScheme === 'dark' ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: colors.borderGlass,
            },
            tabBarActiveTintColor: colors.tint,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 10, marginBottom: 4 },
          }}>
          {NAV_LINKS.map(link => {
            const name = link.path === '/' ? 'index' : link.path.replace('/', '');
            const Icon = link.icon;
            return (
              <Tabs.Screen 
                key={name}
                name={name} 
                options={{ 
                  title: link.label,
                  tabBarIcon: ({ color, size }) => <Icon color={color} size={size} />
                }} 
              />
            );
          })}
          <Tabs.Screen name="plans" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 230,
    height: '100%',
    borderRightWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  sidebarTop: {
    padding: 24,
    flex: 1,
  },
  logoContainerSidebar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 19,
    letterSpacing: -0.5,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarNavText: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  sidebarBottom: {
    padding: 24,
  },
  sidebarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sidebarIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  mobileHeaderContainer: {
    borderRadius: Platform.OS === 'web' ? 16 : 0,
    marginTop: Platform.OS === 'web' ? 12 : 0,
    marginHorizontal: Platform.OS === 'web' ? 16 : 0,
    paddingTop: Platform.OS === 'ios' ? 40 : 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    ...Platform.select({
      web: { position: 'sticky', top: 12, zIndex: 50, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any,
    }),
  },
  mobileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mobileThemeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenu: {
    position: 'absolute',
    top: '100%',
    marginTop: 8,
    left: Platform.OS === 'web' ? 16 : 0,
    right: Platform.OS === 'web' ? 16 : 0,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderBottomWidth: 1,
    borderRadius: Platform.OS === 'web' ? 12 : 0,
    padding: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mobileMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  mobileMenuText: {
    fontSize: 15,
  },
  mobileMenuTextActive: {
    fontWeight: '700',
  },
  bottomTabBar: {
    borderTopWidth: 0,
    borderRadius: 24,
    borderWidth: 1,
    height: 62,
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    ...Platform.select({
      web: {
        position: 'fixed',
        bottom: 20,
        left: 0,
        right: 0,
        width: '90%',
        maxWidth: 480,
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      } as any,
      default: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
      }
    })
  },
});
