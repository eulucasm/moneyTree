import React, { useRef, useState } from 'react';
import { Tabs, useRouter, usePathname, Redirect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, useWindowDimensions } from 'react-native';
import { 
  Bell, 
  LayoutDashboard, 
  Coins, 
  CreditCard, 
  History as HistoryIcon, 
  BarChart3, 
  Settings as SettingsIcon,
  Menu as MenuIcon,
  X,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react-native';
import { useFinancials } from '../../context/FinancialContext';
import { useThemeStore } from '../../stores/useThemeStore';
import { useColorScheme } from '../../components/useColorScheme';
import Theme from '../../constants/Colors';
import NotificationModal from '../../components/NotificationModal';
import { useNotifications } from '../../hooks/useNotifications';

function CustomHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile } = useFinancials();
  const avatarScale = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const notifications = useNotifications();

  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const colorScheme = useColorScheme();
  const colors = Theme[colorScheme];

  const navLinks = [
    { label: 'Dashboard', path: '/' },
    { label: 'Contas e Orçamento', path: '/budget' },
    { label: 'Faturas', path: '/installments' },
    { label: 'Histórico', path: '/history' },
    { label: 'Gráficos', path: '/charts' },
    { label: 'Planos', path: '/plans' },
  ];

  const handleMouseEnter = () => {
    Animated.timing(avatarScale, {
      toValue: 1.15,
      duration: 150,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleMouseLeave = () => {
    Animated.timing(avatarScale, {
      toValue: 1.0,
      duration: 150,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(avatarScale, {
        toValue: 0.9,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(avatarScale, {
        toValue: 1.0,
        friction: 3,
        useNativeDriver: Platform.OS !== 'web',
      })
    ]).start(() => {
      router.push('/settings');
    });
  };

  const initials = (
    (userProfile?.firstName?.slice(0, 1) || '') +
    (userProfile?.lastName?.slice(0, 1) || '')
  ).toUpperCase() || 'LM';

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.background, borderBottomColor: colors.borderGlass }]}>
      <View style={styles.headerContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>v</Text>
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>
            verde<Text style={styles.logoTextHighlight}>co.</Text>
          </Text>
        </View>

        {/* Navegação Desktop */}
        {isLargeScreen && (
          <View style={styles.navLinks}>
            {navLinks.map((link) => {
              const isActive = pathname === link.path || (link.path === '/' && pathname === '/index');
              return (
                <TouchableOpacity 
                  key={link.path} 
                  activeOpacity={0.7}
                  onPress={() => router.push(link.path as any)}
                  style={styles.navItem}
                >
                  <Text style={[
                    styles.navText, 
                    isActive && styles.navTextActive,
                    { color: isActive ? colors.text : colors.textMuted }
                  ]}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Ações */}
        <View style={styles.actionsContainer}>
          {/* Botão de Menu Hamburger para telas menores */}
          {!isLargeScreen && (
            <TouchableOpacity 
              style={[styles.hamburgerButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA' }]} 
              onPress={() => setMenuOpen(!menuOpen)}
              activeOpacity={0.7}
            >
              {menuOpen ? <X size={22} color={colors.text} /> : <MenuIcon size={22} color={colors.text} />}
            </TouchableOpacity>
          )}

          {/* Botão de Alternância de Tema Claro/Escuro */}
          <TouchableOpacity 
            style={[styles.themeButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA' }]} 
            activeOpacity={0.7}
            onPress={toggleTheme}
          >
            {colorScheme === 'dark' ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#495057" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.bellButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F8F9FA' }]} 
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            <Bell size={20} color={colors.textSecondary} />
            {notifications.length > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handlePress}
            // @ts-ignore
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Animated.View style={[
              styles.avatar, 
              { transform: [{ scale: avatarScale }] },
              userProfile?.activePlan === 'premium' && {
                backgroundColor: '#FEF3C7',
                borderColor: '#F59E0B'
              }
            ]}>
              <Text style={[
                styles.avatarText,
                userProfile?.activePlan === 'premium' && { color: '#B45309' },
                { color: colors.text }
              ]}>
                {initials}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown de Navegação Mobile */}
      {!isLargeScreen && menuOpen && (
        <View style={[styles.mobileDropdown, { backgroundColor: colorScheme === 'dark' ? '#151D30' : '#FFFFFF', borderBottomColor: colors.borderGlass }]}>
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path === '/' && pathname === '/index');
            return (
              <TouchableOpacity 
                key={link.path} 
                activeOpacity={0.7}
                onPress={() => {
                  setMenuOpen(false);
                  router.push(link.path as any);
                }}
                style={[
                  styles.mobileDropdownItem, 
                  isActive && styles.mobileDropdownItemActive,
                  { borderBottomColor: isActive ? colors.borderGlassActive : (colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8F9FA') }
                ]}
              >
                <Text style={[
                  styles.mobileDropdownText, 
                  isActive && styles.mobileDropdownTextActive,
                  { color: isActive ? colors.text : colors.textMuted }
                ]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      
      <NotificationModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

export default function TabLayout() {
  const { user, authInitialized } = useFinancials();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  // if (!authInitialized) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
  //       <Text style={{ fontSize: 16, color: '#0F5132', fontWeight: 'bold' }}>Carregando...</Text>
  //     </View>
  //   );
  // }

  // if (!user) {
  //   return <Redirect href="/login" />;
  // }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: isLargeScreen ? { display: 'none' } : styles.bottomTabBar,
        tabBarActiveTintColor: '#0F5132',
        tabBarInactiveTintColor: '#6C757D',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        header: () => <CustomHeader />,
      }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Início',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="budget" 
        options={{ 
          title: 'Contas',
          tabBarIcon: ({ color, size }) => <Coins color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="installments" 
        options={{ 
          title: 'Faturas',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => <HistoryIcon color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="charts" 
        options={{ 
          title: 'Gráficos',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="plans" 
        options={{ 
          title: 'Planos',
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 50,
      } as any,
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#10B981',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 22,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F5132',
    letterSpacing: -0.5,
  },
  logoTextHighlight: {
    color: '#10B981',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    // Em telas mobile reais, poderíamos criar um menu sanduíche.
    // Mas focando na interface Web requisitada:
    display: 'flex', 
  },
  navItem: {
    paddingVertical: 8,
  },
  navText: {
    color: '#6C757D',
    fontWeight: '500',
    fontSize: 15,
  },
  navTextActive: {
    color: '#0F5132',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    backgroundColor: '#DC3545',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    fontWeight: 'bold',
    color: '#0F5132',
  },
  bottomTabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(15, 81, 50, 0.08)',
    height: 68,
    paddingBottom: 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
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
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      } as any,
      default: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
      }
    })
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileDropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingVertical: 8,
    paddingHorizontal: 24,
    gap: 4,
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 64,
        left: 0,
        right: 0,
        zIndex: 49,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
      }
    })
  },
  mobileDropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  mobileDropdownItemActive: {
    borderBottomColor: '#E8F5E9',
  },
  mobileDropdownText: {
    color: '#6C757D',
    fontSize: 15,
    fontWeight: '500',
  },
  mobileDropdownTextActive: {
    color: '#0F5132',
    fontWeight: '700',
  },
});
