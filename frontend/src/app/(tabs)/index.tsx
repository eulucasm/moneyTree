import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, Modal, TextInput, useWindowDimensions, Animated } from 'react-native';
import { SavingsItem } from '../../types/finance';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { formatCurrency } from '../../utils/format';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Home, 
  Play, 
  CreditCard, 
  ChevronRight, 
  Plus, 
  Edit, 
  X,
  Sparkles,
  Trash2,
  Settings,
  Check
} from 'lucide-react-native';
import GlassCard from '../../components/GlassCard';
import FinancialInput from '../../components/FinancialInput';
import FinancialButton from '../../components/FinancialButton';
import CardSelector from '../../components/CardSelector';
import Toast from '../../components/Toast';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

export default function DashboardScreen() {
  const { theme: colorScheme, colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;
  const isMediumScreen = width >= 600;

  const getMonthlySummary = useFinanceStore(s => s.getMonthlySummary);
  const getMonthlyOutflowsList = useFinanceStore(s => s.getMonthlyOutflowsList);
  const savingsGoal = useFinanceStore(s => s.savingsGoal);
  const updateSavingsGoal = useFinanceStore(s => s.updateSavingsGoal);
  const addSavingsItem = useFinanceStore(s => s.addSavingsItem);
  const deleteSavingsItem = useFinanceStore(s => s.deleteSavingsItem);
  const savingsLogs = useFinanceStore(s => s.savingsLogs);
  const purchases = useFinanceStore(s => s.purchases);
  const creditCards = useFinanceStore(s => s.creditCards);
  const addCreditCard = useFinanceStore(s => s.addCreditCard);
  const updateCreditCardLimit = useFinanceStore(s => s.updateCreditCardLimit);
  const deleteCreditCard = useFinanceStore(s => s.deleteCreditCard);
  const entries = useFinanceStore(s => s.entries);
  const exits = useFinanceStore(s => s.exits);
  const recurrings = useFinanceStore(s => s.recurrings);
  
  const userProfile = useAuthStore(s => s.userProfile);
  const userCreatedAt = userProfile?.createdAt || '2025-06';
  
  const router = useRouter();

  // Get current date details for default view dynamically
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultPeriod = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);
  
  const [selectedYearStr, selectedMonthStr] = selectedPeriod.split('-');
  const selectedYear = parseInt(selectedYearStr, 10);
  const selectedMonth = parseInt(selectedMonthStr, 10);

  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Modals state
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState(savingsGoal.toString());
  
  const [savingsDesc, setSavingsDesc] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsType, setSavingsType] = useState<'poupança' | 'caixinha'>('poupança');
  const [savingsBank, setSavingsBank] = useState<string>('nubank');

  const [newCardName, setNewCardName] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('');
  const [newCardColor, setNewCardColor] = useState('#8B5CF6');
  const [newCardDueDate, setNewCardDueDate] = useState('');
  const [newCardBestDay, setNewCardBestDay] = useState('');

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Re-run month fade-in and slide-up transition
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    contentOpacity.setValue(0);
    contentTranslateY.setValue(15);
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start();
  }, [selectedPeriod]);

  const availableColors = [
    '#8B5CF6', // Nubank Purple
    '#0EA5E9', // Mercado Pago Blue
    '#F97316', // Caixa Orange
    '#EF4444', // Bradesco Red
    '#0F5132', // Verdeco Green
    '#64748B', // Slate
    '#10B981', // Emerald
    '#EC4899', // Pink
  ];

  const handleAddCreditCard = () => {
    if (!newCardName.trim()) {
      showToast('Por favor, informe o nome da instituição.', 'error');
      return;
    }
    const limitVal = parseFloat(newCardLimit);
    if (isNaN(limitVal) || limitVal <= 0) {
      showToast('Por favor, informe um limite válido.', 'error');
      return;
    }

    const dueDay = parseInt(newCardDueDate, 10);
    const bestDay = parseInt(newCardBestDay, 10);
    
    if (newCardDueDate && (isNaN(dueDay) || dueDay < 1 || dueDay > 31)) {
      showToast('Por favor, informe um dia de vencimento válido (1 a 31).', 'error');
      return;
    }
    if (newCardBestDay && (isNaN(bestDay) || bestDay < 1 || bestDay > 31)) {
      showToast('Por favor, informe um melhor dia de compra válido (1 a 31).', 'error');
      return;
    }

    addCreditCard(
      newCardName,
      limitVal,
      newCardColor,
      newCardDueDate ? dueDay : undefined,
      newCardBestDay ? bestDay : undefined
    );
    setNewCardName('');
    setNewCardLimit('');
    setNewCardColor('#8B5CF6');
    setNewCardDueDate('');
    setNewCardBestDay('');
    showToast('Cartão cadastrado com sucesso!', 'success');
  };

  // Generate projections for 7 months (current month + 6 months ahead)
  const futureMonthsList = [];
  for (let i = 0; i < 7; i++) {
    const monthIndex = (currentMonth - 1 + i) % 12;
    const yearOffset = Math.floor((currentMonth - 1 + i) / 12);
    const futureYear = currentYear + yearOffset;
    const futureMonthStr = `${futureYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthlySummary = getMonthlySummary(futureMonthStr, userCreatedAt);

    futureMonthsList.push({
      monthStr: futureMonthStr,
      monthName: monthsNames[monthIndex],
      year: futureYear,
      summary: monthlySummary,
    });
  }

  // Get metrics for current month
  const summary = React.useMemo(() => getMonthlySummary(selectedPeriod, userCreatedAt), [selectedPeriod, getMonthlySummary, userCreatedAt, purchases, savingsLogs, entries, exits, recurrings]);
  const currentOutflows = React.useMemo(() => getMonthlyOutflowsList(selectedPeriod, userCreatedAt), [selectedPeriod, getMonthlyOutflowsList, userCreatedAt, purchases, exits, recurrings]);

  // Group outflows
  const fixedAndVariableOutflows = currentOutflows.filter(o => o.type === 'fixed' || o.type === 'variable');
  const recurringOutflows = currentOutflows.filter(o => o.type === 'recurring');
  const installmentOutflows = currentOutflows.filter(o => o.type === 'installment');

  const fixedAndVariableTotal = fixedAndVariableOutflows.reduce((sum, o) => sum + o.value, 0);
  const recurringTotal = recurringOutflows.reduce((sum, o) => sum + o.value, 0);
  const installmentTotal = installmentOutflows.reduce((sum, o) => sum + o.value, 0);

  const creditCardTotal = installmentTotal;

  const getCardUsedLimit = (cardKey: string) => {
    return installmentOutflows
      .filter(item => item.cardUsed === cardKey)
      .reduce((sum, item) => sum + item.value, 0);
  };

  // Savings progress calculation
  const totalSavings = summary.totalSavings;
  const progressPercent = savingsGoal > 0 ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;

  const handleUpdateGoal = () => {
    const val = parseFloat(newGoalValue);
    if (!isNaN(val) && val >= 0) {
      updateSavingsGoal(val);
      setGoalModalVisible(false);
      showToast('Meta atualizada com sucesso!', 'success');
    } else {
      showToast('Por favor, insira um valor de meta válido.', 'error');
    }
  };

  const handleAddSavings = () => {
    const val = parseFloat(savingsAmount);
    if (isNaN(val) || val <= 0) {
      showToast('Por favor, insira um valor válido.', 'error');
      return;
    }
    if (!savingsDesc.trim()) {
      showToast('Por favor, insira uma descrição / objetivo.', 'error');
      return;
    }
    addSavingsItem(selectedPeriod, savingsType, savingsBank, val, savingsDesc);
    setSavingsDesc('');
    setSavingsAmount('');
    setSavingsModalVisible(false);
    showToast('Valor guardado com sucesso!', 'success');
  };

  const getCardColorName = (cardUsed?: string) => {
    if (!cardUsed) return 'Outro';
    const card = creditCards.find(c => c.id === cardUsed);
    return card ? card.name : 'Outro';
  };

  const getCardColorHex = (cardUsed?: string) => {
    if (!cardUsed) return '#6C757D';
    const card = creditCards.find(c => c.id === cardUsed);
    return card ? (card.color || '#6C757D') : '#6C757D';
  };

  const savingsItemsList = Array.isArray(savingsLogs[selectedPeriod])
    ? (savingsLogs[selectedPeriod] as SavingsItem[])
    : [];

  const poupancaItems = savingsItemsList.filter(item => item.type === 'poupança');
  const caixinhaItems = savingsItemsList.filter(item => item.type === 'caixinha');

  const renderSavingsList = (items: SavingsItem[], sectionTitle: string) => {
    return (
      <View style={[styles.savingsSection, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
        <Text style={[styles.savingsSectionTitle, { color: colors.text }]}>{sectionTitle}</Text>
        {items.length === 0 ? (
          <Text style={[styles.noSavingsItemsText, { color: colors.textMuted }]}>Nenhuma reserva cadastrada.</Text>
        ) : (
          <View style={styles.savingsItemsList}>
            {items.map(item => {
              const cardColor = getCardColorHex(item.bank);
              const cardName = getCardColorName(item.bank);
              return (
                <View key={item.id} style={[styles.savingsItemRow, { borderBottomColor: colors.borderGlass }]}>
                  <View style={styles.savingsItemLeft}>
                    <View style={[styles.bankTag, { backgroundColor: cardColor + '20' }]}>
                      <Text style={[styles.bankTagText, { color: cardColor }]}>{cardName}</Text>
                    </View>
                    <Text style={[styles.savingsItemDesc, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
                  </View>
                  <View style={styles.savingsItemRight}>
                    <Text style={[styles.savingsItemAmount, { color: colors.text }]}>
                      R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        deleteSavingsItem(selectedPeriod, item.id);
                        showToast('Registro de poupança removido.', 'success');
                      }}
                      style={[styles.savingsDeleteBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(220, 53, 69, 0.15)' : '#FCE8E6' }]}
                    >
                      <Trash2 color="#DC3545" size={14} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingBottom: width < 768 ? 110 : 24 }]}>
      <Animated.View style={{ 
        opacity: contentOpacity, 
        transform: [{ translateY: contentTranslateY }],
        width: '100%' 
      }}>
      
      {/* SAUDAÇÃO */}
      <View style={styles.greetingSection}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greetingTitle, { color: colors.text }]}>Olá, Lucas!</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={[styles.greetingSubtitle, { color: colors.textMuted }]}>
              Aqui está o panorama financeiro de {monthsNames[selectedMonth - 1]} de {selectedYear}.
            </Text>
            {selectedPeriod !== defaultPeriod && (
              <TouchableOpacity 
                onPress={() => setSelectedPeriod(defaultPeriod)}
                style={[styles.resetMonthBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(16,185,129,0.1)' : '#E8F5E9', borderColor: colorScheme === 'dark' ? 'rgba(16,185,129,0.3)' : '#A7F3D0' }]}
              >
                <Text style={[styles.resetMonthBtnText, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>Voltar para o mês atual</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={[styles.badgePremium, { backgroundColor: colorScheme === 'dark' ? 'rgba(16,185,129,0.1)' : '#E8F5E9', borderColor: colorScheme === 'dark' ? 'rgba(16,185,129,0.3)' : '#A7F3D0' }]}>
          <Sparkles size={16} color={colorScheme === 'dark' ? '#10B981' : '#0F5132'} style={{ marginRight: 6 }} />
          <Text style={[styles.badgePremiumText, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>verdeco. PRO</Text>
        </View>
      </View>

      {/* CARDS DE SALDO E RESUMO */}
      <View style={[styles.cardsGrid, { flexDirection: isMediumScreen ? 'row' : 'column', flexWrap: 'wrap' }]}>
        
        {/* Card Principal: Saldo Atualizado */}
        <View style={[
          styles.cardMain, 
          { 
            backgroundColor: colors.surface,
            borderColor: summary.forecastLeftover >= 0 ? colors.borderGlassActive : '#FECACA',
            flex: 1,
            minWidth: isLargeScreen ? 200 : (isMediumScreen ? '47%' : '100%'),
          }
        ]}>
          <View style={[
            styles.cardLeftBorder, 
            { backgroundColor: summary.forecastLeftover >= 0 ? '#10B981' : '#DC3545' }
          ]} />
          <View style={styles.cardHeader}>
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Balanço Projetado</Text>
            <View style={[
              styles.badgeStatus,
              { backgroundColor: summary.forecastLeftover >= 0 ? (colorScheme === 'dark' ? 'rgba(16,185,129,0.15)' : '#E8F5E9') : (colorScheme === 'dark' ? 'rgba(220,53,69,0.15)' : '#FCE8E6') }
            ]}>
              <Text style={[
                styles.badgeStatusText,
                { color: summary.forecastLeftover >= 0 ? (colorScheme === 'dark' ? '#10B981' : '#0F5132') : (colorScheme === 'dark' ? '#FCA5A5' : '#C53030') }
              ]}>
                {summary.forecastLeftover >= 0 ? 'Positivo' : 'Negativo'}
              </Text>
            </View>
          </View>
          <Text style={[styles.cardValueMain, { color: colors.text }]}>
            {formatCurrency(summary.forecastLeftover)}
          </Text>
          <Text style={[styles.cardSubText, { color: colors.textMuted }]}>
            {summary.forecastLeftover >= 0 
              ? 'Muito bem! Projeção de sobra positiva para o final deste mês.' 
              : 'Atenção: Suas despesas programadas estão superiores às suas entradas este mês.'}
          </Text>
        </View>

        {/* Card: Entradas */}
        <View style={[styles.cardStandard, { backgroundColor: colors.surface, borderColor: colors.borderGlass, flex: 1, minWidth: isLargeScreen ? 200 : (isMediumScreen ? '47%' : '100%') }]}>
          <View style={styles.cardHeaderIcon}>
            <View style={[styles.iconWrapperSuccess, { backgroundColor: colorScheme === 'dark' ? 'rgba(16,185,129,0.1)' : '#E8F5E9' }]}>
              <TrendingUp size={20} color="#10B981" />
            </View>
            <Text style={[styles.cardLabelNormal, { color: colors.textMuted }]}>Total Entradas</Text>
          </View>
          <Text style={[styles.cardValueSuccess, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>
            {formatCurrency(summary.entriesTotal)}
          </Text>
          <Text style={[styles.cardSubText, { color: colors.textMuted }]}>Salário, vales e rendimentos eventuais.</Text>
        </View>

        {/* Card: Saídas */}
        <View style={[styles.cardStandard, { backgroundColor: colors.surface, borderColor: colors.borderGlass, flex: 1, minWidth: isLargeScreen ? 200 : (isMediumScreen ? '47%' : '100%') }]}>
          <View style={styles.cardHeaderIcon}>
            <View style={[styles.iconWrapperDanger, { backgroundColor: colorScheme === 'dark' ? 'rgba(220,53,69,0.1)' : '#FCE8E6' }]}>
              <TrendingDown size={20} color="#DC3545" />
            </View>
            <Text style={[styles.cardLabelNormal, { color: colors.textMuted }]}>Total Saídas</Text>
          </View>
          <Text style={[styles.cardValueNormal, { color: colors.text }]}>
            {formatCurrency(summary.exitsTotal)}
          </Text>
          <Text style={[styles.cardSubText, { color: colors.textMuted }]}>Contas fixas, assinaturas e parcelas ativas.</Text>
        </View>

        {/* Card: Cartão de Crédito */}
        <View style={[styles.cardStandard, { backgroundColor: colors.surface, borderColor: colors.borderGlass, flex: 1, minWidth: isLargeScreen ? 200 : (isMediumScreen ? '47%' : '100%') }]}>
          <View style={styles.cardHeaderIcon}>
            <View style={[styles.iconWrapperWarning, { backgroundColor: colorScheme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FFF3CD' }]}>
              <CreditCard size={20} color={colorScheme === 'dark' ? '#F59E0B' : '#0F5132'} />
            </View>
            <Text style={[styles.cardLabelNormal, { color: colors.textMuted }]}>Cartão de Crédito</Text>
          </View>
          <Text style={[styles.cardValueNormal, { color: colors.text }]}>
            {formatCurrency(creditCardTotal)}
          </Text>
          <Text style={[styles.cardSubText, { color: colors.textMuted }]}>Soma de todas as parcelas de cartão no mês.</Text>
        </View>

      </View>

      {/* PROJEÇÃO 6 MESES SLIDER */}
      <View style={styles.projectionContainer}>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Previsão para os Próximos 6 Meses (Clique para ver detalhes)</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={Platform.OS === 'web'} 
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {futureMonthsList.map((item, idx) => {
            const isFuturePositive = item.summary.forecastLeftover >= 0;
            const isSelected = selectedPeriod === item.monthStr;
            return (
              <TouchableOpacity
                key={item.monthStr}
                activeOpacity={0.8}
                onPress={() => setSelectedPeriod(item.monthStr)}
              >
                <GlassCard 
                  style={[
                    styles.projectionMiniCard,
                    isSelected && styles.projectionMiniCardActive
                  ]}
                >
                  <View style={styles.miniCardHeader}>
                    <Text style={[styles.miniCardMonth, { color: colors.text }]}>{item.monthName}</Text>
                    <Text style={[styles.miniCardYear, { color: colors.textMuted }]}>{item.year}</Text>
                  </View>
                  <View style={styles.miniCardStats}>
                    <View style={styles.miniStatRow}>
                      <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>Entradas:</Text>
                      <Text style={styles.miniStatValueVal}>
                        R$ {item.summary.entriesTotal.toFixed(0)}
                      </Text>
                    </View>
                    <View style={styles.miniStatRow}>
                      <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>Saídas:</Text>
                      <Text style={[styles.miniStatValueVal, { color: colors.textMuted }]}>
                        R$ {item.summary.exitsTotal.toFixed(0)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.miniCardDivider, { backgroundColor: colors.borderGlass }]} />
                  <Text style={[styles.miniCardForecastLabel, { color: colors.textMuted }]}>Sobra Estimada</Text>
                  <Text style={[
                    styles.miniCardForecastVal,
                    { color: isFuturePositive ? '#10B981' : '#DC3545' }
                  ]}>
                    R$ {item.summary.forecastLeftover.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </Text>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* RESUMO DE CARTÕES DE CRÉDITO */}
      <GlassCard style={[styles.creditCardSummaryCard, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
        <View style={[styles.savingsCardHeader, { flexDirection: isMediumScreen ? 'row' : 'column', alignItems: isMediumScreen ? 'center' : 'stretch', gap: 16 }]}>
          <View style={styles.savingsCardHeaderLeft}>
            <View style={[styles.iconWrapperSavings, { backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#E8F5E9' }]}>
              <CreditCard size={24} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.savingsTitle, { color: colors.text }]}>Faturas & Limites dos Cartões</Text>
              <Text style={[styles.savingsSubtitle, { color: colors.textMuted }]}>Acompanhamento de limite disponível e utilizado</Text>
            </View>
          </View>
          <View style={styles.savingsActions}>
            <TouchableOpacity 
              style={[styles.savingsBtnEdit, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9' }]} 
              activeOpacity={0.7}
              onPress={() => setCardModalVisible(true)}
            >
              <Settings size={14} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
              <Text style={[styles.savingsBtnEditText, { color: colorScheme === 'dark' ? colors.text : "#0F5132" }]}>Gerenciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.creditCardsGrid, { flexDirection: isMediumScreen ? 'row' : 'column' }]}>
          {creditCards.map(card => {
            const used = getCardUsedLimit(card.id);
            const available = Math.max(card.limit - used, 0);
            const percent = Math.min((used / card.limit) * 100, 100);
            const brandColor = card.color || '#64748B';

            return (
              <View key={card.id} style={[styles.creditCardItem, { backgroundColor: colorScheme === 'dark' ? '#151D30' : '#F8F9FA', borderColor: colors.borderGlass, flex: isMediumScreen ? 1 : undefined, flexGrow: isMediumScreen ? 1 : 0, flexShrink: 1, width: isLargeScreen ? 220 : (isMediumScreen ? '48%' : '100%') }]}>
                <View style={styles.cardItemNameRow}>
                  <View style={[styles.brandDot, { backgroundColor: brandColor }]} />
                  <Text style={[styles.cardItemName, { color: colors.text }]}>{card.name}</Text>
                </View>
                <Text style={[styles.cardItemAvailableStacked, { color: colors.text }]}>
                  Disp: {formatCurrency(available)}
                </Text>

                {/* Progress bar */}
                <View style={[styles.cardProgressBarTrack, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E9ECEF' }]}>
                  <View style={[styles.cardProgressBarFill, { width: `${percent}%`, backgroundColor: brandColor }]} />
                </View>

                <Text style={[styles.cardItemUsedStacked, { color: colors.textMuted }]}>
                  Usado: {formatCurrency(used)}
                </Text>
              </View>
            );
          })}
        </View>
      </GlassCard>

      {/* CARD DE POUPANÇA E RESERVA DE EMERGÊNCIA */}
      <GlassCard style={[styles.savingsCard, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
        <View style={[styles.savingsCardHeader, { flexDirection: isMediumScreen ? 'row' : 'column', alignItems: isMediumScreen ? 'center' : 'stretch', gap: 16 }]}>
          <View style={styles.savingsCardHeaderLeft}>
            <View style={[styles.iconWrapperSavings, { backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#E8F5E9' }]}>
              <Target size={24} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
            </View>
            <View>
              <Text style={[styles.savingsTitle, { color: colors.text }]}>Poupança & Reserva de Emergência</Text>
              <Text style={[styles.savingsSubtitle, { color: colors.textMuted }]}>Guarde dinheiro e acompanhe sua meta de segurança</Text>
            </View>
          </View>
          <View style={styles.savingsActions}>
            <TouchableOpacity 
              style={[styles.savingsBtnEdit, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9' }]} 
              activeOpacity={0.7}
              onPress={() => {
                setNewGoalValue(savingsGoal.toString());
                setGoalModalVisible(true);
              }}
            >
              <Edit size={14} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
              <Text style={[styles.savingsBtnEditText, { color: colorScheme === 'dark' ? colors.text : "#0F5132" }]}>Meta</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.savingsBtnAdd} 
              activeOpacity={0.7}
              onPress={() => {
                setSavingsDesc('');
                setSavingsAmount('');
                setSavingsType('poupança');
                setSavingsBank(creditCards[0]?.id || 'nubank');
                setSavingsModalVisible(true);
              }}
            >
              <Plus size={14} color="#FFFFFF" />
              <Text style={styles.savingsBtnAddText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.savingsBody, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8F9FA' }]}>
          <View style={styles.savingsMetricsRow}>
            <View>
              <Text style={[styles.savingsMetricLabel, { color: colors.textMuted }]}>Poupado Acumulado</Text>
              <Text style={[styles.savingsMetricVal, { color: colors.text }]}>
                {formatCurrency(totalSavings)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.savingsMetricLabel, { color: colors.textMuted }]}>Sua Meta</Text>
              <Text style={[styles.savingsMetricValGoal, { color: colors.text }]}>
                {formatCurrency(savingsGoal)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBarTrackLarge, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E9ECEF' }]}>
              <View style={[styles.progressBarFillLarge, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={[styles.progressPercentText, { color: colors.textMuted }]}>{progressPercent.toFixed(1)}% atingido</Text>
          </View>

          <View style={[styles.savingsDivider, { backgroundColor: colors.borderGlass }]} />
          <View style={[styles.savingsColumnsContainer, { flexDirection: isMediumScreen ? 'row' : 'column', gap: 24 }]}>
            {renderSavingsList(poupancaItems, '💰 Poupança Tradicional')}
            {renderSavingsList(caixinhaItems, '📦 Caixinhas / Metas')}
          </View>
        </View>
      </GlassCard>

      {/* CARD ÚNICO: FLUXO DE CAIXA DETALHADO */}
      <GlassCard style={[styles.unifiedOutflowsCard, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
        <View style={styles.unifiedHeader}>
          <View style={styles.unifiedHeaderLeft}>
            <View style={[styles.iconWrapperUnified, { backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#E8F5E9' }]}>
              <Target size={24} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
            </View>
            <View>
              <Text style={[styles.unifiedTitle, { color: colors.text }]}>Fluxo de Caixa Detalhado</Text>
              <Text style={[styles.unifiedSubtitle, { color: colors.textMuted }]}>Contas fixas, assinaturas ativas e parcelas programadas</Text>
            </View>
          </View>
        </View>

        <View style={[styles.threeColGrid, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
          {/* GRUPO 1: CONTAS FIXAS */}
          <View style={[styles.unifiedColumn, { backgroundColor: colorScheme === 'dark' ? '#151D30' : '#F8F9FA', borderColor: colors.borderGlass, flex: isLargeScreen ? 1 : undefined, width: isLargeScreen ? undefined : '100%' }]}>
            <View style={styles.columnHeader}>
              <Home size={16} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
              <Text style={[styles.columnTitle, { color: colors.text }]}>Contas Fixas / Variáveis</Text>
            </View>
            <View style={styles.listContainer}>
              {fixedAndVariableOutflows.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textMuted }]}>Nenhuma conta cadastrada para este mês.</Text>
              ) : (
                fixedAndVariableOutflows.slice(0, 5).map(item => (
                  <View key={item.id} style={[styles.listItem, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8F9FA', borderColor: colors.borderGlass }]}>
                    <View style={styles.listItemLeft}>
                      <View style={[
                        styles.statusIndicator, 
                        { backgroundColor: item.status === 'ok' ? '#10B981' : '#CED4DA' }
                      ]} />
                      <Text style={[styles.listItemTitle, { color: colors.text }, item.status === 'ok' && styles.crossedText]} numberOfLines={1}>
                        {item.description}
                      </Text>
                    </View>
                    <Text style={[styles.listItemValue, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                  </View>
                ))
              )}
            </View>
            <View style={[styles.columnFooter, { borderTopColor: colors.borderGlass }]}>
              <Text style={[styles.columnFooterLabel, { color: colors.textMuted }]}>Total</Text>
              <Text style={[styles.columnFooterValue, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>
                {formatCurrency(fixedAndVariableTotal)}
              </Text>
            </View>
          </View>

          {/* GRUPO 2: ASSINATURAS DIGITAIS */}
          <View style={[styles.unifiedColumn, { backgroundColor: colorScheme === 'dark' ? '#151D30' : '#F8F9FA', borderColor: colors.borderGlass, flex: isLargeScreen ? 1 : undefined, width: isLargeScreen ? undefined : '100%' }]}>
            <View style={styles.columnHeader}>
              <Play size={16} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
              <Text style={[styles.columnTitle, { color: colors.text }]}>Assinaturas Digitais</Text>
            </View>
            <View style={styles.listContainer}>
              {recurringOutflows.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textMuted }]}>Nenhuma assinatura ativa.</Text>
              ) : (
                recurringOutflows.slice(0, 5).map(item => (
                  <View key={item.id} style={[styles.listItem, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8F9FA', borderColor: colors.borderGlass }]}>
                    <View style={styles.listItemLeft}>
                      <View style={[styles.statusIndicator, { backgroundColor: '#10B981' }]} />
                      <Text style={[styles.listItemTitle, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
                    </View>
                    <Text style={[styles.listItemValue, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                  </View>
                ))
              )}
            </View>
            <View style={[styles.columnFooter, { borderTopColor: colors.borderGlass }]}>
              <Text style={[styles.columnFooterLabel, { color: colors.textMuted }]}>Total</Text>
              <Text style={[styles.columnFooterValue, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>
                {formatCurrency(recurringTotal)}
              </Text>
            </View>
          </View>

          {/* GRUPO 3: PARCELAMENTOS ATIVOS */}
          <View style={[styles.unifiedColumn, { backgroundColor: colorScheme === 'dark' ? '#151D30' : '#F8F9FA', borderColor: colors.borderGlass, flex: isLargeScreen ? 1 : undefined, width: isLargeScreen ? undefined : '100%' }]}>
            <View style={styles.columnHeader}>
              <CreditCard size={16} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
              <Text style={[styles.columnTitle, { color: colors.text }]}>Parcelamentos Ativos</Text>
            </View>
            <View style={styles.listContainer}>
              {installmentOutflows.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textMuted }]}>Nenhum parcelamento ativo neste mês.</Text>
              ) : (
                installmentOutflows.slice(0, 5).map(item => {
                  const cardColor = getCardColorHex(item.cardUsed);
                  const cardName = getCardColorName(item.cardUsed);
                  return (
                    <View key={item.id} style={[styles.progressItem, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#F8F9FA', borderColor: colors.borderGlass }]}>
                      <View style={styles.progressHeader}>
                        <View style={styles.progressTitleRow}>
                          <Text style={[styles.progressTitle, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
                          <View style={[styles.tagBrand, { backgroundColor: cardColor + '20' }]}>
                            <Text style={[styles.tagBrandText, { color: cardColor }]}>{cardName}</Text>
                          </View>
                        </View>
                        <Text style={[styles.progressCount, { color: colors.textMuted }]}>{item.installmentRef}</Text>
                      </View>
                      <View style={[styles.progressBarTrack, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E9ECEF' }]}>
                        <View style={[
                          styles.progressBarFill, 
                          { 
                            backgroundColor: cardColor,
                            width: item.installmentRef 
                              ? `${(parseInt(item.installmentRef.split('/')[0]) / parseInt(item.installmentRef.split('/')[1])) * 100}%` 
                              : '50%'
                          }
                        ]} />
                      </View>
                      <Text style={[styles.progressSubText, { color: colors.textMuted }]}>Parcela: {formatCurrency(item.value)}</Text>
                    </View>
                  );
                })
              )}
            </View>
            <View style={[styles.columnFooter, { borderTopColor: colors.borderGlass }]}>
              <Text style={[styles.columnFooterLabel, { color: colors.textMuted }]}>Total</Text>
              <Text style={[styles.columnFooterValue, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>
                {formatCurrency(installmentTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* BOTÃO ÚNICO DE GERENCIAR - SUPER DESTACADO E VISÍVEL */}
        <View style={styles.unifiedManageButtonContainer}>
          <TouchableOpacity 
            style={styles.unifiedManageButton}
            activeOpacity={0.8}
            onPress={() => router.push('/budget')}
          >
            <Text style={styles.unifiedManageButtonText}>Gerenciar Orçamento e Contas</Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </GlassCard>
      </Animated.View>

      {/* METAS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={[styles.modalBg, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(33, 37, 41, 0.4)' }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.borderGlass, borderWidth: 1 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderGlass }]}>
              <View style={styles.modalTitleContainer}>
                <Target color={colors.text} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Definir Meta da Poupança</Text>
              </View>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)} style={[styles.closeModalBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA' }]}>
                <X color={colors.textMuted} size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
              <FinancialInput
                label="Valor da Meta (R$)"
                isCurrency={true}
                value={newGoalValue}
                onChangeText={setNewGoalValue}
              />
              <FinancialButton
                title="Salvar Meta"
                onPress={handleUpdateGoal}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SAVINGS LOG MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={savingsModalVisible}
        onRequestClose={() => setSavingsModalVisible(false)}
      >
        <View style={[styles.modalBg, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(33, 37, 41, 0.4)' }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.borderGlass, borderWidth: 1 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderGlass }]}>
              <View style={styles.modalTitleContainer}>
                <TrendingUp color={colors.text} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Guardar Dinheiro</Text>
              </View>
              <TouchableOpacity onPress={() => setSavingsModalVisible(false)} style={[styles.closeModalBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA' }]}>
                <X color={colors.textMuted} size={20} />
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={{ gap: 12 }} style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Adicione um valor para guardar neste mês de {monthsNames[currentMonth - 1]}.
              </Text>
              
              <FinancialInput
                label="Descrição / Objetivo"
                placeholder="Ex: Reserva de Emergência, IPVA, Viagem"
                value={savingsDesc}
                onChangeText={setSavingsDesc}
              />
              
              <FinancialInput
                label="Valor a Guardar"
                isCurrency={true}
                value={savingsAmount}
                onChangeText={setSavingsAmount}
              />

              {/* Type Selection */}
              <View style={styles.typeSelectorContainer}>
                <Text style={[styles.typeSelectorLabel, { color: colors.text }]}>Tipo de Reserva</Text>
                <View style={styles.typeSelectorRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeSelectorBtn,
                      savingsType === 'poupança' ? styles.typeSelectorBtnActive : { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8F9FA', borderColor: colors.borderGlass }
                    ]}
                    onPress={() => setSavingsType('poupança')}
                  >
                    <Text style={savingsType === 'poupança' ? styles.typeTextActive : [styles.typeTextInactive, { color: colors.textMuted }]}>
                      Poupança
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeSelectorBtn,
                      savingsType === 'caixinha' ? styles.typeSelectorBtnActive : { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8F9FA', borderColor: colors.borderGlass }
                    ]}
                    onPress={() => setSavingsType('caixinha')}
                  >
                    <Text style={savingsType === 'caixinha' ? styles.typeTextActive : [styles.typeTextInactive, { color: colors.textMuted }]}>
                      Caixinha
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bank Selection */}
              <View style={styles.bankSelectorContainer}>
                <Text style={[styles.bankSelectorLabel, { color: colors.text }]}>Selecione o Banco</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.bankSelectorScroll}
                >
                  {creditCards.map(card => {
                    const isSelected = savingsBank === card.id;
                    const color = card.color || '#64748B';
                    return (
                      <TouchableOpacity
                        key={card.id}
                        activeOpacity={0.8}
                        onPress={() => setSavingsBank(card.id)}
                        style={[
                          styles.bankCardMock,
                          { backgroundColor: color },
                          isSelected ? styles.bankCardMockSelected : styles.bankCardMockUnselected
                        ]}
                      >
                        <View style={styles.bankCardHeader}>
                          <Text style={styles.bankCardChip}>••••</Text>
                          {isSelected && (
                            <View style={styles.checkBadge}>
                              <Check color="#0F5132" size={10} strokeWidth={3} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.bankCardName}>{card.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <FinancialButton
                title="Confirmar Valor"
                onPress={handleAddSavings}
                style={{ marginTop: 12 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CREDIT CARDS MANAGER MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cardModalVisible}
        onRequestClose={() => setCardModalVisible(false)}
      >
        <View style={[styles.modalBg, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(33, 37, 41, 0.4)' }]}>
          <View style={[styles.modalContainer, { maxWidth: 500, backgroundColor: colors.surface, borderColor: colors.borderGlass, borderWidth: 1 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderGlass }]}>
              <View style={styles.modalTitleContainer}>
                <CreditCard color={colors.text} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Gerenciar Cartões de Crédito</Text>
              </View>
              <TouchableOpacity onPress={() => setCardModalVisible(false)} style={[styles.closeModalBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA' }]}>
                <X color={colors.textMuted} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16 }} style={{ maxHeight: 400 }} showsVerticalScrollIndicator={true}>
              {/* Seção 1: Lista de Cartões Existentes */}
              <Text style={[styles.modalSubtitleSection, { color: colors.text }]}>Cartões Cadastrados & Limites</Text>
              <View style={styles.cardsManagerList}>
                {creditCards.map(card => {
                  return (
                    <View key={card.id} style={[styles.cardManagerRow, { borderBottomColor: colors.borderGlass }]}>
                      <View style={styles.cardManagerRowLeft}>
                        <View style={[styles.brandDot, { backgroundColor: card.color || '#64748B', marginRight: 6, marginTop: 4 }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.cardManagerName, { color: colors.text }]}>{card.name}</Text>
                          {(card.dueDate !== undefined || card.bestPurchaseDay !== undefined) && (
                            <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                              Venc: {card.dueDate ? `dia ${card.dueDate}` : 'N/A'} • Melhor Compra: {card.bestPurchaseDay ? `dia ${card.bestPurchaseDay}` : 'N/A'}
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.cardManagerRowRight}>
                        <TextInput
                          style={[styles.cardManagerLimitInput, { borderColor: colors.borderGlass, color: colors.text, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF' }]}
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                          placeholder="Limite"
                          defaultValue={card.limit.toString()}
                          onEndEditing={(e) => {
                            const val = parseFloat(e.nativeEvent.text);
                            if (!isNaN(val) && val >= 0) {
                              updateCreditCardLimit(card.id, val);
                            }
                          }}
                        />
                        {creditCards.length > 1 && (
                          <TouchableOpacity 
                            onPress={() => {
                              deleteCreditCard(card.id);
                              showToast('Cartão de crédito removido.', 'success');
                            }}
                            style={[styles.cardManagerDeleteBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(220,53,69,0.15)' : '#FCE8E6' }]}
                          >
                            <Trash2 color="#DC3545" size={16} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={[styles.modalDivider, { backgroundColor: colors.borderGlass }]} />

              {/* Seção 2: Adicionar Novo Cartão */}
              <Text style={[styles.modalSubtitleSection, { color: colors.text }]}>Cadastrar Novo Cartão</Text>
              
              <FinancialInput
                label="Nome da Instituição"
                placeholder="Ex: Banco do Brasil, C6 Bank"
                value={newCardName}
                onChangeText={setNewCardName}
              />
              
              <FinancialInput
                label="Limite Total"
                isCurrency={true}
                value={newCardLimit}
                onChangeText={setNewCardLimit}
              />

              <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <FinancialInput
                    label="Dia do Vencimento"
                    placeholder="Ex: 10"
                    keyboardType="numeric"
                    maxLength={2}
                    value={newCardDueDate}
                    onChangeText={setNewCardDueDate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FinancialInput
                    label="Melhor Dia de Compra"
                    placeholder="Ex: 3"
                    keyboardType="numeric"
                    maxLength={2}
                    value={newCardBestDay}
                    onChangeText={setNewCardBestDay}
                  />
                </View>
              </View>

              {/* Color Selector */}
              <View style={styles.colorSelectorContainer}>
                <Text style={[styles.colorSelectorLabel, { color: colors.text }]}>Cor Visual do Cartão</Text>
                <View style={styles.colorSelectorRow}>
                  {availableColors.map(color => {
                    const isSelected = newCardColor === color;
                    return (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorPill,
                          { backgroundColor: color },
                          isSelected && styles.colorPillSelected
                        ]}
                        onPress={() => setNewCardColor(color)}
                      />
                    );
                  })}
                </View>
              </View>

              <FinancialButton
                title="Cadastrar Cartão"
                onPress={handleAddCreditCard}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Toast 
        message={toastMessage} 
        type={toastType} 
        visible={toastVisible} 
        onHide={() => setToastVisible(false)} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  greetingSection: {
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F5132',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },
  badgePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgePremiumText: {
    color: '#0F5132',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardsGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
    marginBottom: 32,
  },
  cardMain: {
    flex: 1.2,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardValueMain: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
    letterSpacing: -0.5,
  },
  cardSubText: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 8,
    lineHeight: 16,
  },
  cardStandard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconWrapperSuccess: {
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  iconWrapperDanger: {
    padding: 8,
    backgroundColor: '#FCE8E6',
    borderRadius: 8,
  },
  iconWrapperWarning: {
    padding: 8,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  cardLabelNormal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  cardValueSuccess: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F5132',
    letterSpacing: -0.5,
  },
  cardValueNormal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    letterSpacing: -0.5,
  },
  projectionContainer: {
    marginBottom: 32,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 16,
  },
  horizontalScrollContent: {
    gap: 16,
    paddingRight: 16,
  },
  projectionMiniCard: {
    width: Platform.OS === 'web' ? 180 : 160,
    padding: 16,
    borderRadius: 12,
  },
  miniCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  miniCardMonth: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    textTransform: 'capitalize',
  },
  miniCardYear: {
    fontSize: 10,
    color: '#6C757D',
  },
  miniCardStats: {
    gap: 4,
  },
  miniStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#6C757D',
  },
  miniStatValueVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  miniCardDivider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 8,
  },
  miniCardForecastLabel: {
    fontSize: 10,
    color: '#6C757D',
    marginBottom: 2,
  },
  miniCardForecastVal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  savingsCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  savingsCardHeader: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    gap: 16,
    marginBottom: 20,
  },
  savingsCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapperSavings: {
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  savingsSubtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  savingsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  savingsBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#0F5132',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  savingsBtnEditText: {
    color: '#0F5132',
    fontSize: 12,
    fontWeight: '600',
  },
  savingsBtnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F5132',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  savingsBtnAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  savingsBody: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  savingsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  savingsMetricLabel: {
    fontSize: 11,
    color: '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  savingsMetricVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  savingsMetricValGoal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  progressBarWrapper: {
    gap: 6,
  },
  progressBarTrackLarge: {
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFillLarge: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  progressPercentText: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  twoColGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 32,
  },
  splitColumn: {
    flex: 1,
    gap: 32,
  },
  sectionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  crossedText: {
    textDecorationLine: 'line-through',
    color: '#ADB5BD',
  },
  noItemsText: {
    fontSize: 13,
    color: '#6C757D',
    textAlign: 'center',
    paddingVertical: 16,
  },
  showMoreBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  progressItem: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    flexShrink: 1,
  },
  tagBrand: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBrandText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  progressCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#495057',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressSubText: {
    fontSize: 11,
    color: '#6C757D',
  },
  modalBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 37, 41, 0.4)',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 16,
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F5132',
    letterSpacing: -0.5,
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    lineHeight: 18,
  },
  savingsDivider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 20,
  },
  savingsColumnsContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
  },
  savingsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  savingsSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 12,
  },
  noSavingsItemsText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  savingsItemsList: {
    gap: 10,
  },
  savingsItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  savingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bankTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bankTagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  savingsItemDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  savingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savingsItemAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  savingsDeleteBtn: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FCE8E6',
  },
  typeSelectorContainer: {
    marginVertical: 8,
  },
  typeSelectorLabel: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeSelectorBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  typeSelectorBtnActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#10B981',
  },
  typeSelectorBtnInactive: {
    backgroundColor: '#F8F9FA',
    borderColor: '#DEE2E6',
  },
  typeTextActive: {
    color: '#0F5132',
    fontSize: 13,
    fontWeight: 'bold',
  },
  typeTextInactive: {
    color: '#495057',
    fontSize: 13,
    fontWeight: '500',
  },
  bankSelectorContainer: {
    marginVertical: 12,
  },
  bankSelectorLabel: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bankSelectorScroll: {
    gap: 8,
    paddingRight: 16,
  },
  bankCardMock: {
    width: 120,
    height: 75,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bankCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankCardChip: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bankCardName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  bankCardMockSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.03 }],
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  bankCardMockUnselected: {
    borderWidth: 1,
    borderColor: 'transparent',
    opacity: 0.6,
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  projectionMiniCardActive: {
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  resetMonthBtn: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resetMonthBtnText: {
    color: '#0F5132',
    fontSize: 11,
    fontWeight: 'bold',
  },
  creditCardSummaryCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  creditCardsGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  creditCardItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  cardItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  cardItemAvailableStacked: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  cardProgressBarTrack: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardItemUsedStacked: {
    fontSize: 11,
    fontWeight: '600',
    color: '#495057',
  },
  unifiedOutflowsCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  unifiedHeader: {
    marginBottom: 24,
  },
  unifiedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapperUnified: {
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  unifiedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  unifiedSubtitle: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  threeColGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
  },
  unifiedColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 16,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 8,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  columnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  columnFooterLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6C757D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  columnFooterValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  modalSubtitleSection: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 8,
  },
  cardsManagerList: {
    gap: 12,
  },
  cardManagerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  cardManagerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardManagerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  cardManagerRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardManagerLimitInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    color: '#212529',
    fontWeight: 'bold',
    width: 100,
    textAlign: 'right',
  },
  cardManagerDeleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FCE8E6',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginVertical: 12,
  },
  colorSelectorContainer: {
    marginVertical: 4,
  },
  colorSelectorLabel: {
    color: '#495057',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorPillSelected: {
    borderColor: '#0F5132',
    transform: [{ scale: 1.1 }],
  },
  unifiedManageButtonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  unifiedManageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    gap: 8,
    width: '100%',
    maxWidth: 400,
  },
  unifiedManageButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
