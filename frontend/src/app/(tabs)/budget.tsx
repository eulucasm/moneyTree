import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, LayoutAnimation, Platform, UIManager, useWindowDimensions, Animated } from 'react-native';
import { ExitId, PurchaseId } from '../../types/finance';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../components/GlassCard';
import FinancialInput from '../../components/FinancialInput';
import FinancialButton from '../../components/FinancialButton';
import { ChevronLeft, ChevronRight, Check, Square, Trash2, X, PlusCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Coins, Info, CreditCard, Plus } from 'lucide-react-native';
import CardSelector from '../../components/CardSelector';
import Toast from '../../components/Toast';
import { formatCurrency } from '../../utils/format';
import { useTheme } from '../../hooks/useTheme';
import { getEarliestDataMonth } from '../../services/summaryCalculator';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const detectCardTypeDynamic = (desc: string, cards: any[]): string | null => {
  const normalized = desc.toLowerCase();
  for (const card of cards) {
    const cardNameNormalized = card.name.toLowerCase();
    if (normalized.includes(cardNameNormalized) || (cardNameNormalized.length > 3 && normalized.includes(cardNameNormalized.slice(0, 4)))) {
      return card.id;
    }
  }
  // Fallbacks de compatibilidade de nomes antigos
  if (normalized.includes('roxo') || normalized.includes('nu ')) return 'nubank';
  if (normalized.includes('mercado') || normalized.includes('mp')) return 'mercadopago';
  return null;
};

export default function BudgetScreen() {
  const { theme: colorScheme, colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 800;

  const {
    entries,
    addEntry,
    deleteEntry,
    exits,
    addExit,
    deleteExit,
    toggleExitStatus,
    recurrings,
    addRecurring,
    deleteRecurring,
    purchases,
    addPurchase,
    getMonthlyOutflowsList,
    getMonthlySummary,
    creditCards,
    savingsLogs,
    installmentStatusMap,
    savingsGoal
  } = useFinanceStore();

  const userProfile = useAuthStore(s => s.userProfile);
  const userCreatedAt = userProfile?.createdAt || '2025-06';
  
  const { t } = useTranslation();

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);

  const formatPeriod = (year: number, month: number) => {
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  const selectedPeriod = formatPeriod(currentYear, currentMonth);

  // Month transitions (fade-in & slide-up)
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

  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const [addModalType, setAddModalType] = useState<'entry' | 'exit' | 'variable' | 'recurring' | 'installment' | null>(null);
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [installmentCount, setInstallmentCount] = useState('');
  const [startDateVal, setStartDateVal] = useState('');
  const [dueDateVal, setDueDateVal] = useState('');
  const [cardUsedVal, setCardUsedVal] = useState<string>('');
  const [formError, setFormError] = useState('');

  const [visibleInfos, setVisibleInfos] = useState<Record<string, boolean>>({});
  const toggleInfo = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVisibleInfos(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenInstallmentModal = () => {
    setStartDateVal(selectedPeriod);
    setCardUsedVal(creditCards[0]?.id || 'other');
    setAddModalType('installment');
  };

  const handleAddSubmit = () => {
    if (!desc.trim()) {
      setFormError('Descrição obrigatória');
      return;
    }
    const valParsed = parseFloat(val);
    if (isNaN(valParsed) || valParsed <= 0) {
      setFormError('Valor inválido');
      return;
    }

    if (addModalType === 'entry') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      addEntry(desc, valParsed, selectedPeriod);
      showToast('Entrada adicionada com sucesso!', 'success');
    } else if (addModalType === 'exit') {
      let dueParsed: number | undefined = undefined;
      if (dueDateVal.trim() !== '') {
        dueParsed = parseInt(dueDateVal, 10);
        if (isNaN(dueParsed) || dueParsed < 1 || dueParsed > 31) {
          setFormError('Dia de vencimento inválido (1-31)');
          return;
        }
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      addExit(desc, valParsed, selectedPeriod, 'fixed', dueParsed);
      showToast('Despesa fixa adicionada com sucesso!', 'success');
    } else if (addModalType === 'variable') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      addExit(desc, valParsed, selectedPeriod, 'variable');
      showToast('Despesa variada adicionada com sucesso!', 'success');
    } else if (addModalType === 'recurring') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      addRecurring(desc, valParsed, cardUsedVal);
      showToast('Assinatura recorrente adicionada!', 'success');
    } else if (addModalType === 'installment') {
      const instParsed = parseInt(installmentCount, 10);
      if (isNaN(instParsed) || instParsed <= 0) {
        setFormError('Mínimo 1 parcela');
        return;
      }
      if (!startDateVal.match(/^\d{4}-\d{2}$/)) {
        setFormError('Formato de mês início inválido (AAAA-MM)');
        return;
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      addPurchase(desc, valParsed, instParsed, startDateVal, cardUsedVal);
      showToast('Compra parcelada registrada com sucesso!', 'success');
    }

    setDesc('');
    setVal('');
    setInstallmentCount('');
    setStartDateVal('');
    setDueDateVal('');
    setCardUsedVal('nubank');
    setFormError('');
    setAddModalType(null);
  };

  const summary = React.useMemo(() => {
    const baseUserCreatedAt = userProfile?.createdAt || '2025-06';
    const trueCutoff = getEarliestDataMonth(baseUserCreatedAt, entries, exits, purchases);
    return getMonthlySummary(selectedPeriod, trueCutoff);
  }, [selectedPeriod, getMonthlySummary, userProfile, purchases, exits, recurrings, entries, savingsLogs, installmentStatusMap]);

  const currentOutflows = React.useMemo(() => {
    const baseUserCreatedAt = userProfile?.createdAt || '2025-06';
    const trueCutoff = getEarliestDataMonth(baseUserCreatedAt, entries, exits, purchases);
    return getMonthlyOutflowsList(selectedPeriod, trueCutoff);
  }, [selectedPeriod, getMonthlyOutflowsList, userProfile, purchases, exits, recurrings, installmentStatusMap]);
  const currentEntries = entries.filter(e => e.date === selectedPeriod);

  const fixedOutflows = currentOutflows.filter(o => o.type === 'fixed');
  const variableOutflows = currentOutflows.filter(o => o.type === 'variable');
  const recurringOutflows = currentOutflows.filter(o => o.type === 'recurring');
  const installmentOutflows = currentOutflows.filter(o => o.type === 'installment');

  const totalEntriesVal = currentEntries.reduce((sum, e) => sum + e.value, 0);
  const totalFixedVal = fixedOutflows.reduce((sum, o) => sum + o.value, 0);
  const totalRecurringVal = recurringOutflows.reduce((sum, o) => sum + o.value, 0);
  const totalInstallmentsVal = installmentOutflows.reduce((sum, o) => sum + o.value, 0);
  const totalVariableVal = variableOutflows.reduce((sum, o) => sum + o.value, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER & MONTH SELECTOR (SaaS Layout) */}
      <View style={[styles.headerArea, !isLargeScreen && styles.headerAreaMobile]}>
        <View style={[styles.headerTitles, isLargeScreen && { flex: 1, alignItems: 'flex-start' }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Orçamento</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Gestão detalhada do mês</Text>
        </View>

        <View style={[styles.selectorPill, { backgroundColor: colorScheme === 'dark' ? '#151C2C' : '#FFFFFF', borderColor: colors.borderGlass }]}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.selectorBtnPill}>
            <ChevronLeft color={colorScheme === 'dark' ? '#8B9BB4' : "#64748B"} size={16} />
          </TouchableOpacity>
          <Text style={[styles.selectorTextPill, { color: colors.text }]}>
            {monthsNames[currentMonth - 1]} {currentYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.selectorBtnPill}>
            <ChevronRight color={colorScheme === 'dark' ? '#8B9BB4' : "#64748B"} size={16} />
          </TouchableOpacity>
        </View>

        {isLargeScreen && <View style={{ flex: 1 }} />}
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: width < 768 ? 110 : 24 }]}>
        <Animated.View style={{ 
          opacity: contentOpacity, 
          transform: [{ translateY: contentTranslateY }],
          width: '100%', 
          gap: 16 
        }}>
        {/* SECTION 1: RESUMO ORÇAMENTÁRIO (3 Cards) */}
        <View style={[
          styles.cardsRow,
          isLargeScreen ? styles.rowLayout : styles.columnLayout
        ]}>
          {/* Card 1: Entradas */}
          <View style={[styles.summaryMetricCard, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <View style={styles.metricHeader}>
              <ArrowUpRight color="#10B981" size={16} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{t('common.entries')}</Text>
            </View>
            <Text style={[styles.metricVal, { color: '#10B981' }]}>
              {formatCurrency(summary.entriesTotal)}
            </Text>
          </View>

          {/* Card 2: Saídas */}
          <View style={[styles.summaryMetricCard, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <View style={styles.metricHeader}>
              <ArrowDownRight color="#DC3545" size={16} />
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{t('common.exits')}</Text>
            </View>
            <Text style={[styles.metricVal, { color: colors.text }]}>
              {formatCurrency(summary.exitsTotal)}
            </Text>
          </View>

          {/* Card 3: Balanço Geral (Ledger Style) */}
          <View style={[
            styles.summaryLedgerCard, 
            { backgroundColor: colors.surface, borderColor: colorScheme === 'dark' ? (summary.forecastLeftover >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : (summary.forecastLeftover >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)') }
          ]}>
            <View style={[styles.ledgerAccentTop, { backgroundColor: summary.forecastLeftover >= 0 ? '#10B981' : '#DC3545' }]} />
            
            <View style={styles.metricHeader}>
              <Coins color={colorScheme === 'dark' ? '#8B9BB4' : "#64748B"} size={16} />
              <Text style={[styles.metricLabel, { color: colors.text }]}>Balanço Geral</Text>
            </View>
            
            <View style={[styles.ledgerContent, { borderBottomColor: colorScheme === 'dark' ? 'rgba(38, 51, 77, 0.5)' : '#E5E7EB' }]}>
              <View style={styles.ledgerRow}>
                <Text style={[styles.ledgerLabel, { color: colorScheme === 'dark' ? '#8B9BB4' : '#64748B' }]}>Sobrou do Mês Passado:</Text>
                <Text style={[styles.ledgerVal, { color: colors.text }]}>{formatCurrency(summary.previousMonthSurplus)}</Text>
              </View>
              <View style={styles.ledgerRow}>
                <Text style={[styles.ledgerLabel, { color: colorScheme === 'dark' ? '#8B9BB4' : '#64748B' }]}>Total em Poupança:</Text>
                <Text style={[styles.ledgerVal, { color: '#10B981' }]}>{formatCurrency(summary.totalSavings)}</Text>
              </View>
            </View>

            <View style={[styles.ledgerRow, { marginTop: 16 }]}>
              <Text style={[styles.ledgerLabel, { color: colorScheme === 'dark' ? '#8B9BB4' : '#64748B' }]}>Previsão de Sobra:</Text>
              <Text style={[
                styles.ledgerValTotal,
                { color: summary.forecastLeftover >= 0 ? '#10B981' : '#DC3545' }
              ]}>
                {formatCurrency(summary.forecastLeftover)}
              </Text>
            </View>
          </View>
        </View>

        {/* Container Grid de Categorias (Masonry Layout) */}
        <View style={[
          styles.sectionsGrid,
          isLargeScreen ? styles.sectionsGridRow : styles.sectionsGridColumn
        ]}>
          
          {/* COLUNA ESQUERDA */}
          <View style={[styles.masonryColumn, !isLargeScreen && styles.masonryColumnMobile]}>
            
            {/* Card 1: Entradas */}
            <View style={[styles.sectionCard, { backgroundColor: colorScheme === 'dark' ? '#182133' : colors.surface, borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
              <View style={[styles.sectionHeaderInside, { borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.borderGlass }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.sectionTitleInside, { color: colors.text, flexShrink: 1 }]} numberOfLines={2}>{t('common.entries')}</Text>
                  <TouchableOpacity onPress={() => toggleInfo('entries')}>
                    <Info color={colors.textMuted} size={14} />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <Text style={[styles.sectionHeaderTotal, { color: totalEntriesVal > 0 ? '#10B981' : colors.textMuted }]}>{formatCurrency(totalEntriesVal)}</Text>
                  <TouchableOpacity onPress={() => setAddModalType('entry')} style={[styles.addButton, { borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
                    <Plus color={colorScheme === 'dark' ? '#8B9BB4' : colors.textMuted} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {visibleInfos['entries'] && (
                <View style={[styles.infoAlert, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9', borderColor: colors.borderGlass }]}>
                  <Text style={[styles.infoAlertText, { color: colors.textMuted }]}>Destinado a pagamentos recebidos.</Text>
                </View>
              )}

              <View style={styles.itemsListFlat}>
                {currentEntries.length === 0 ? (
                  <Text style={[styles.noItemsText, { color: colors.textMuted }]}>Nenhum registro cadastrado.</Text>
                ) : (
                  currentEntries.map((item, index) => {
                    const isLast = index === currentEntries.length - 1;
                    return (
                      <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat]}>
                        <Text style={[styles.itemDesc, { color: colors.text }]}>{item.description}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={[styles.itemVal, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                          <TouchableOpacity 
                            onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); deleteEntry(item.id); showToast('Entrada removida.', 'success'); }} 
                            style={styles.deleteBtn}
                          >
                            <Trash2 color={colors.textMuted} size={14} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* Card 5: Despesas Variadas (Movido para a coluna esquerda) */}
            <View style={[styles.sectionCard, { backgroundColor: colorScheme === 'dark' ? '#182133' : colors.surface, borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
              <View style={[styles.sectionHeaderInside, { borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.borderGlass }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.sectionTitleInside, { color: colors.text, flexShrink: 1 }]} numberOfLines={2}>Despesas Variadas</Text>
                  <TouchableOpacity onPress={() => toggleInfo('variables')}>
                    <Info color={colors.textMuted} size={14} />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <Text style={[styles.sectionHeaderTotal, { color: colors.text }]}>{formatCurrency(totalVariableVal)}</Text>
                  <TouchableOpacity onPress={() => setAddModalType('variable')} style={[styles.addButton, { borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
                    <Plus color={colorScheme === 'dark' ? '#8B9BB4' : colors.textMuted} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {visibleInfos['variables'] && (
                <View style={[styles.infoAlert, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9', borderColor: colors.borderGlass }]}>
                  <Text style={[styles.infoAlertText, { color: colors.textMuted }]}>Destinado a gastos não previstos do dia a dia.</Text>
                </View>
              )}

              <View style={styles.itemsListFlat}>
                {variableOutflows.length === 0 ? (
                  <Text style={[styles.noItemsText, { color: colors.textMuted }]}>Nenhum registro cadastrado.</Text>
                ) : (
                  variableOutflows.map((item, index) => {
                    const isLast = index === variableOutflows.length - 1;
                    return (
                      <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat, { opacity: item.status === 'ok' ? 0.6 : 1.0 }]}>
                        <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); toggleExitStatus(item.id as ExitId); }} style={styles.itemCheckBtn}>
                          {item.status === 'ok' ? <Check color="#10B981" size={16} /> : <Square color={colorScheme === 'dark' ? colors.textMuted : "#CED4DA"} size={16} />}
                        </TouchableOpacity>
                        <Text style={[styles.itemDesc, { color: colors.text }, item.status === 'ok' && styles.crossedText]}>{item.description}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={[styles.itemVal, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                          <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); deleteExit(item.id as ExitId); showToast('Despesa removida.', 'success'); }} style={styles.deleteBtn}>
                            <Trash2 color={colors.textMuted} size={14} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

          </View>

          {/* COLUNA DIREITA */}
          <View style={[styles.masonryColumn, !isLargeScreen && styles.masonryColumnMobile]}>
            
            {/* Card 2: Despesas Fixas */}
            <View style={[styles.sectionCard, { backgroundColor: colorScheme === 'dark' ? '#182133' : colors.surface, borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
              <View style={[styles.sectionHeaderInside, { borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.borderGlass }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.sectionTitleInside, { color: colors.text, flexShrink: 1 }]} numberOfLines={2}>Despesas Fixas</Text>
                  <TouchableOpacity onPress={() => toggleInfo('fixed')}>
                    <Info color={colors.textMuted} size={14} />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <Text style={[styles.sectionHeaderTotal, { color: colors.text }]}>{formatCurrency(totalFixedVal)}</Text>
                  <TouchableOpacity onPress={() => setAddModalType('exit')} style={[styles.addButton, { borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
                    <Plus color={colorScheme === 'dark' ? '#8B9BB4' : colors.textMuted} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {visibleInfos['fixed'] && (
                <View style={[styles.infoAlert, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9', borderColor: colors.borderGlass }]}>
                  <Text style={[styles.infoAlertText, { color: colors.textMuted }]}>Destinado a contas fixas como aluguel, conta de água, conta de luz, conta de telefone.</Text>
                </View>
              )}

              <View style={styles.itemsListFlat}>
                {fixedOutflows.length === 0 ? (
                  <Text style={[styles.noItemsText, { color: colors.textMuted }]}>Nenhum registro cadastrado.</Text>
                ) : (
                  fixedOutflows.map((item, index) => {
                    const isLast = index === fixedOutflows.length - 1;
                    const cardType = detectCardTypeDynamic(item.description, creditCards);
                    let cardSum = 0;
                    if (cardType) {
                      cardSum = installmentOutflows.filter(inst => inst.cardUsed === cardType).reduce((sum, inst) => sum + inst.value, 0);
                    }
                    return (
                      <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat, { flexDirection: 'column', alignItems: 'stretch', opacity: item.status === 'ok' ? 0.6 : 1.0 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); toggleExitStatus(item.id as ExitId); }} style={styles.itemCheckBtn}>
                            {item.status === 'ok' ? <Check color="#10B981" size={16} /> : <Square color={colorScheme === 'dark' ? colors.textMuted : "#CED4DA"} size={16} />}
                          </TouchableOpacity>
                          <Text style={[styles.itemDesc, { color: colors.text }, item.status === 'ok' && styles.crossedText]}>{item.description}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Text style={[styles.itemVal, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                            <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); deleteExit(item.id as ExitId); showToast('Despesa fixa removida.', 'success'); }} style={styles.deleteBtn}>
                              <Trash2 color={colors.textMuted} size={14} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        {cardSum > 0 && (
                          <View style={[styles.cardComparisonRowFlat, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8F9FA' }]}>
                            <Text style={[styles.cardComparisonTextFlat, { color: colors.textMuted }]}>
                              Previsão de faturas: {formatCurrency(cardSum)} | Diferença: {formatCurrency(item.value - cardSum)}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            {/* Card 4: Compras Parceladas */}
            <View style={[styles.sectionCard, { backgroundColor: colorScheme === 'dark' ? '#182133' : colors.surface, borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
              <View style={[styles.sectionHeaderInside, { borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.borderGlass }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.sectionTitleInside, { color: colors.text, flexShrink: 1 }]} numberOfLines={2}>Compras Parceladas</Text>
                  <TouchableOpacity onPress={() => toggleInfo('installments')}>
                    <Info color={colors.textMuted} size={14} />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <Text style={[styles.sectionHeaderTotal, { color: colors.text }]}>{formatCurrency(totalInstallmentsVal)}</Text>
                  <TouchableOpacity onPress={handleOpenInstallmentModal} style={[styles.addButton, { borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
                    <Plus color={colorScheme === 'dark' ? '#8B9BB4' : colors.textMuted} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {visibleInfos['installments'] && (
                <View style={[styles.infoAlert, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9', borderColor: colors.borderGlass }]}>
                  <Text style={[styles.infoAlertText, { color: colors.textMuted }]}>Destinado a compras com cartões na forma de parcelamento.</Text>
                </View>
              )}

              <View style={styles.itemsListFlat}>
                {installmentOutflows.length === 0 ? (
                  <Text style={[styles.noItemsText, { color: colors.textMuted }]}>Nenhum registro cadastrado.</Text>
                ) : (
                  installmentOutflows.map((item, index) => {
                    const isLast = index === installmentOutflows.length - 1;
                    const cardObj = creditCards.find(c => c.id === item.cardUsed);
                    return (
                      <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.itemDesc, { color: colors.text }]} numberOfLines={1}>{item.description}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            {cardObj && (
                              <View style={{ backgroundColor: `${cardObj.color}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ color: cardObj.color, fontSize: 10, fontWeight: 'bold' }}>{cardObj.name}</Text>
                              </View>
                            )}
                            <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '500' }}>
                              {(item as any).installmentNumber}/{(item as any).totalInstallments}
                            </Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={[styles.itemVal, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

          </View>
        </View>

        {/* Card 3: Recorrentes (Centralizado no final) */}
        <View style={{ width: isLargeScreen ? '49%' : '100%', alignSelf: 'center' }}>
          <View style={[styles.sectionCard, { backgroundColor: colorScheme === 'dark' ? '#182133' : colors.surface, borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
            <View style={[styles.sectionHeaderInside, { borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : colors.borderGlass }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingRight: 8 }}>
                <Text style={[styles.sectionTitleInside, { color: colors.text, flexShrink: 1 }]} numberOfLines={2}>{t('common.recurring')}</Text>
                <TouchableOpacity onPress={() => toggleInfo('recurrent')}>
                  <Info color={colors.textMuted} size={14} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <Text style={[styles.sectionHeaderTotal, { color: colors.text }]}>{formatCurrency(totalRecurringVal)}</Text>
                <TouchableOpacity onPress={() => setAddModalType('recurring')} style={[styles.addButton, { borderColor: colorScheme === 'dark' ? '#26334D' : colors.borderGlass }]}>
                  <Plus color={colorScheme === 'dark' ? '#8B9BB4' : colors.textMuted} size={16} />
                </TouchableOpacity>
              </View>
            </View>

            {visibleInfos['recurrent'] && (
              <View style={[styles.infoAlert, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9', borderColor: colors.borderGlass }]}>
                <Text style={[styles.infoAlertText, { color: colors.textMuted }]}>Destinado a assinaturas (ex: Netflix, Prime Video, Google, Spotify).</Text>
              </View>
            )}

            <View style={styles.itemsListFlat}>
              {recurrings.length === 0 ? (
                <Text style={[styles.noItemsText, { color: colors.textMuted, paddingHorizontal: 8 }]}>Nenhum registro cadastrado.</Text>
              ) : (
                recurrings.map((item, index) => {
                  const isLast = index === recurrings.length - 1;
                  return (
                    <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat]}>
                      <RefreshCw color={colorScheme === 'dark' ? '#8B9BB4' : "#6C757D"} size={14} style={{ marginRight: 8 }} />
                      <Text style={[styles.itemDesc, { color: colors.text }]}>{item.description}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={[styles.itemVal, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                        <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); deleteRecurring(item.id); showToast('Assinatura recorrente removida.', 'success'); }} style={styles.deleteBtn}>
                          <Trash2 color={colors.textMuted} size={14} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>
        </Animated.View>
      </ScrollView>

      {/* Adding Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addModalType !== null}
        onRequestClose={() => {
          setAddModalType(null);
          setDesc('');
          setVal('');
          setInstallmentCount('');
          setStartDateVal('');
          setDueDateVal('');
          setCardUsedVal(creditCards[0]?.id || 'nubank');
          setFormError('');
        }}
      >
        <View style={[styles.modalBg, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(33, 37, 41, 0.4)' }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.borderGlass, borderWidth: 1 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderGlass }]}>
              <View style={styles.modalTitleContainer}>
                {addModalType === 'entry' ? (
                  <ArrowUpRight color="#10B981" size={24} />
                ) : addModalType === 'installment' ? (
                  <CreditCard color={colors.text} size={24} />
                ) : (
                  <ArrowDownRight color="#DC3545" size={24} />
                )}
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Adicionar {addModalType === 'entry' ? 'Entrada' : addModalType === 'exit' ? 'Despesa Fixa' : addModalType === 'variable' ? 'Despesa Variada' : addModalType === 'recurring' ? 'Recorrente' : 'Compra Parcelada'}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setAddModalType(null);
                  setDesc('');
                  setVal('');
                  setInstallmentCount('');
                  setStartDateVal('');
                  setDueDateVal('');
                  setCardUsedVal(creditCards[0]?.id || 'nubank');
                  setFormError('');
                }} 
                style={[styles.closeModalBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA' }]}
              >
                <X color={colors.textMuted} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
              <FinancialInput
                label={addModalType === 'installment' ? 'Nome do Produto' : 'Descrição'}
                placeholder={
                  addModalType === 'installment' ? 'Ex: Celular Novo' :
                  addModalType === 'entry' ? 'Ex: Salário, freela, jobs' :
                  addModalType === 'exit' ? 'Ex: Água, Luz, aluguel, etc...' :
                  addModalType === 'recurring' ? 'Ex: Spotify, netflix, assinaturas...' :
                  addModalType === 'variable' ? 'Ex: padaria, mercado, rolês, etc...' :
                  'Ex: Salário, Claro, Spotify'
                }
                value={desc}
                onChangeText={setDesc}
              />

              <FinancialInput
                label={addModalType === 'installment' ? 'Valor Total' : 'Valor'}
                isCurrency={true}
                value={val}
                onChangeText={setVal}
              />

              {addModalType === 'exit' && (
                <FinancialInput
                  label="Dia do Vencimento (Opcional)"
                  placeholder="Ex: 5"
                  keyboardType="numeric"
                  value={dueDateVal}
                  onChangeText={setDueDateVal}
                />
              )}

              {addModalType === 'installment' && (
                <>
                  <FinancialInput
                    label="Número de Parcelas"
                    placeholder="10"
                    keyboardType="numeric"
                    value={installmentCount}
                    onChangeText={setInstallmentCount}
                  />
                  {val && installmentCount && !isNaN(parseFloat(val)) && !isNaN(parseInt(installmentCount, 10)) && parseInt(installmentCount, 10) > 0 && (
                    <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: -4, marginBottom: 8, paddingHorizontal: 4 }}>
                      Prévia por parcela: {formatCurrency(parseFloat(val) / parseInt(installmentCount, 10))}
                    </Text>
                  )}

                  <FinancialInput
                    label="Mês de Início"
                    placeholder="AAAA-MM (Ex: 2025-08)"
                    value={startDateVal}
                    onChangeText={setStartDateVal}
                  />
                </>
              )}

              {(addModalType === 'installment' || addModalType === 'recurring') && (
                <CardSelector
                  selectedCard={cardUsedVal}
                  onSelect={setCardUsedVal}
                  cards={creditCards.map(c => ({ key: c.id, name: c.name, color: c.color || '#64748B' }))}
                />
              )}

              {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

              <FinancialButton
                title="Adicionar"
                onPress={handleAddSubmit}
                style={{ marginTop: 12 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  headerAreaMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  headerTitles: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    minWidth: 150,
    justifyContent: 'space-between',
  },
  selectorBtnPill: {
    padding: 4,
  },
  selectorTextPill: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 24, 
    paddingBottom: 100,
    gap: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  cardsRow: {
    gap: 16,
    width: '100%',
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  summaryMetricCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  summaryLedgerCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  ledgerAccentTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  ledgerContent: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
    gap: 8,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  ledgerVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  ledgerValTotal: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionsGrid: {
    gap: 16,
    width: '100%',
    marginTop: 8,
  },
  sectionsGridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionsGridColumn: {
    flexDirection: 'column',
  },
  masonryColumn: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
  },
  masonryColumnMobile: {
    width: '100%',
  },
  sectionHeaderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionCard: {
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionCardMobile: {
    width: '100%',
    maxWidth: '100%',
  },
  sectionHeaderInside: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    padding: 20,
  },
  sectionTitleInside: {
    color: '#0F5132',
    fontSize: 16,
    fontWeight: 'bold',
  },

  itemsListFlat: {
    gap: 4,
    padding: 8,
  },
  itemRowFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  lastItemRowFlat: {
    // mantido vazio caso precise no futuro
  },
  itemCheckBtn: {
    marginRight: 12,
  },
  itemDesc: {
    color: '#212529',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  crossedText: {
    textDecorationLine: 'line-through',
    color: '#ADB5BD',
  },
  itemVal: {
    color: '#212529',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  noItemsText: {
    color: '#6C757D',
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(33, 37, 41, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
    color: '#0F5132',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
  },
  formErrorText: {
    color: '#DC3545',
    fontSize: 13,
    marginVertical: 4,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardComparisonRowFlat: {
    marginTop: 4,
  },
  cardComparisonTextFlat: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
  infoAlert: {
    backgroundColor: '#EBF5EE',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1E7DD',
    marginTop: 14,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  infoAlertText: {
    color: '#0F5132',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
