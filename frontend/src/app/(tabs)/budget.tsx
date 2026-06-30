import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, LayoutAnimation, Platform, UIManager, useWindowDimensions, Animated } from 'react-native';
import { ExitId, PurchaseId } from '../../types/finance';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from 'react-i18next';
import GlassCard from '../../components/GlassCard';
import FinancialInput from '../../components/FinancialInput';
import FinancialButton from '../../components/FinancialButton';
import { ChevronLeft, ChevronRight, Check, Square, Trash2, X, PlusCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Coins, Info, CreditCard } from 'lucide-react-native';
import CardSelector from '../../components/CardSelector';
import Toast from '../../components/Toast';
import { formatCurrency } from '../../utils/format';

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

  // Month transitions
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    contentOpacity.setValue(0.3);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
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
      addRecurring(desc, valParsed);
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

  const summary = React.useMemo(() => getMonthlySummary(selectedPeriod, userCreatedAt), [selectedPeriod, getMonthlySummary, userCreatedAt, purchases, exits, recurrings, entries, savingsLogs, installmentStatusMap]);
  const currentOutflows = React.useMemo(() => getMonthlyOutflowsList(selectedPeriod, userCreatedAt), [selectedPeriod, getMonthlyOutflowsList, userCreatedAt, purchases, exits, recurrings, installmentStatusMap]);
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
    <View style={styles.container}>
      {/* Month Selector Bar */}
      <View style={styles.selectorBar}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.selectorBtn}>
          <ChevronLeft color="#0F5132" size={24} />
        </TouchableOpacity>
        <Text style={styles.selectorText}>
          {monthsNames[currentMonth - 1]} {currentYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.selectorBtn}>
          <ChevronRight color="#0F5132" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: width < 768 ? 110 : 24 }]}>
        <Animated.View style={{ opacity: contentOpacity, width: '100%', gap: 16 }}>
        {/* Totais do Mês Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo Orçamentário</Text>
          
          <View style={[
            styles.cardsRow,
            isLargeScreen ? styles.rowLayout : styles.columnLayout
          ]}>
            {/* Card 1: Entradas */}
            <View style={[styles.innerCard, !isLargeScreen && styles.innerCardMobile]}>
              <View style={styles.innerCardHeader}>
                <ArrowUpRight color="#10B981" size={20} />
                <Text style={styles.innerCardLabel}>{t('common.entries')}</Text>
              </View>
              <Text style={[styles.innerCardVal, { color: '#10B981' }]}>
                {formatCurrency(summary.entriesTotal)}
              </Text>
            </View>
 
            {/* Card 2: Saídas */}
            <View style={[styles.innerCard, !isLargeScreen && styles.innerCardMobile]}>
              <View style={styles.innerCardHeader}>
                <ArrowDownRight color="#DC3545" size={20} />
                <Text style={styles.innerCardLabel}>{t('common.exits')}</Text>
              </View>
              <Text style={[styles.innerCardVal, { color: '#DC3545' }]}>
                {formatCurrency(summary.exitsTotal)}
              </Text>
            </View>
 
            {/* Card 3: Balanço Geral */}
            <View style={[styles.innerCard, styles.innerCardHighlighted, !isLargeScreen && styles.innerCardMobile]}>
              <View style={styles.innerCardHeader}>
                <Coins color="#0F5132" size={20} />
                <Text style={[styles.innerCardLabel, { color: '#0F5132', fontWeight: 'bold' }]}>Balanço Geral</Text>
              </View>
              
              <View style={styles.miniTable}>
                <View style={styles.miniTableRow}>
                  <Text style={styles.miniTableLabel}>{t('common.surplus')}:</Text>
                  <Text style={styles.miniTableVal}>{formatCurrency(summary.previousMonthSurplus)}</Text>
                </View>
                <View style={styles.miniTableRow}>
                  <Text style={styles.miniTableLabel}>{t('common.totalSavings')}:</Text>
                  <Text style={[styles.miniTableVal, { color: '#0F5132' }]}>
                    {formatCurrency(summary.totalSavings)}
                  </Text>
                </View>
                <View style={styles.dividerMini} />
                <View style={styles.miniTableRow}>
                  <Text style={[styles.miniTableLabel, { fontWeight: '700' }]}>{t('common.forecast')}:</Text>
                  <Text style={[
                    styles.miniTableVal,
                    { 
                      color: summary.forecastLeftover >= 0 ? '#10B981' : '#DC3545',
                      fontWeight: '800'
                    }
                  ]}>
                    {formatCurrency(summary.forecastLeftover)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Container Grid de Categorias */}
        <View style={[
          styles.sectionsGrid,
          isLargeScreen ? styles.sectionsGridRow : styles.sectionsGridColumn
        ]}>
          
          {/* Card 1: Entradas */}
          <View style={[styles.sectionCard, !isLargeScreen && styles.sectionCardMobile]}>
            <View style={styles.sectionHeaderInside}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                <Text style={styles.sectionTitleInside}>{t('common.entries')}</Text>
                <TouchableOpacity onPress={() => toggleInfo('entries')}>
                  <Info color="#0F5132" size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.sectionHeaderTotal}>{formatCurrency(totalEntriesVal)}</Text>
                <TouchableOpacity 
                  onPress={() => setAddModalType('entry')} 
                  style={styles.addButton}
                >
                  <PlusCircle color="#10B981" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {visibleInfos['entries'] && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>Destinado a pagamentos recebidos.</Text>
              </View>
            )}

            <View style={styles.itemsListFlat}>
              {currentEntries.length === 0 ? (
                <Text style={styles.noItemsText}>Nenhuma entrada cadastrada neste mês.</Text>
              ) : (
                currentEntries.map((item, index) => {
                  const isLast = index === currentEntries.length - 1;
                  return (
                    <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat]}>
                      <Text style={styles.itemDesc}>
                        {item.description}
                      </Text>
                      <Text style={styles.itemVal}>{formatCurrency(item.value)}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          deleteEntry(item.id);
                          showToast('Entrada removida.', 'success');
                        }} 
                        style={styles.deleteBtn}
                      >
                        <Trash2 color="#DC3545" size={16} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Card 2: Despesas Fixas */}
          <View style={[styles.sectionCard, !isLargeScreen && styles.sectionCardMobile]}>
            <View style={styles.sectionHeaderInside}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                <Text style={styles.sectionTitleInside}>Despesas Fixas</Text>
                <TouchableOpacity onPress={() => toggleInfo('fixed')}>
                  <Info color="#0F5132" size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.sectionHeaderTotal}>{formatCurrency(totalFixedVal)}</Text>
                <TouchableOpacity 
                  onPress={() => setAddModalType('exit')} 
                  style={styles.addButton}
                >
                  <PlusCircle color="#DC3545" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {visibleInfos['fixed'] && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>Destinado a contas fixas como aluguel, conta de água, conta de luz, conta de telefone.</Text>
              </View>
            )}

            <View style={styles.itemsListFlat}>
              {fixedOutflows.length === 0 ? (
                <Text style={styles.noItemsText}>Nenhuma despesa fixa cadastrada neste mês.</Text>
              ) : (
                fixedOutflows.map((item, index) => {
                  const isLast = index === fixedOutflows.length - 1;
                  const cardType = detectCardTypeDynamic(item.description, creditCards);
                  const cardSum = cardType ? installmentOutflows
                    .filter(inst => inst.cardUsed === cardType)
                    .reduce((sum, inst) => sum + inst.value, 0) : 0;
                  return (
                    <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat, { flexDirection: 'column', alignItems: 'stretch', opacity: item.status === 'ok' ? 0.6 : 1.0 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity 
                          onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            toggleExitStatus(item.id as ExitId);
                          }}
                          style={styles.itemCheckBtn}
                        >
                          {item.status === 'ok' ? (
                            <Check color="#10B981" size={20} />
                          ) : (
                            <Square color="#CED4DA" size={20} />
                          )}
                        </TouchableOpacity>
                        <Text style={[
                          styles.itemDesc,
                          item.status === 'ok' && styles.crossedText
                        ]}>
                          {item.description}
                        </Text>
                        <Text style={styles.itemVal}>{formatCurrency(item.value)}</Text>
                        <TouchableOpacity 
                          onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            deleteExit(item.id as ExitId);
                            showToast('Despesa fixa removida.', 'success');
                          }} 
                          style={styles.deleteBtn}
                        >
                          <Trash2 color="#DC3545" size={16} />
                        </TouchableOpacity>
                      </View>
                      {cardSum > 0 && (
                        <View style={styles.cardComparisonRowFlat}>
                          <Text style={styles.cardComparisonTextFlat}>
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

          {/* Card 3: Recorrentes */}
          <View style={[styles.sectionCard, !isLargeScreen && styles.sectionCardMobile]}>
            <View style={styles.sectionHeaderInside}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                <Text style={styles.sectionTitleInside}>{t('common.recurring')} ("Todo mês")</Text>
                <TouchableOpacity onPress={() => toggleInfo('recurrent')}>
                  <Info color="#0F5132" size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.sectionHeaderTotal}>{formatCurrency(totalRecurringVal)}</Text>
                <TouchableOpacity 
                  onPress={() => setAddModalType('recurring')} 
                  style={styles.addButton}
                >
                  <PlusCircle color="#0F5132" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {visibleInfos['recurrent'] && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>Destinado a assinaturas (ex: Netflix, Prime Video, Google, Spotify).</Text>
              </View>
            )}

            <View style={styles.itemsListFlat}>
              {recurrings.length === 0 ? (
                <Text style={styles.noItemsText}>Nenhuma despesa recorrente cadastrada.</Text>
              ) : (
                recurrings.map((item, index) => {
                  const isLast = index === recurrings.length - 1;
                  return (
                    <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat]}>
                      <RefreshCw color="#0F5132" size={16} style={{ marginRight: 8 }} />
                      <Text style={styles.itemDesc}>{item.description}</Text>
                      <Text style={styles.itemVal}>{formatCurrency(item.value)}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          deleteRecurring(item.id);
                          showToast('Assinatura recorrente removida.', 'success');
                        }} 
                        style={styles.deleteBtn}
                      >
                        <Trash2 color="#DC3545" size={16} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Card 4: Compras Parceladas */}
          <View style={[styles.sectionCard, !isLargeScreen && styles.sectionCardMobile]}>
            <View style={styles.sectionHeaderInside}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                <Text style={styles.sectionTitleInside}>Compras Parceladas</Text>
                <TouchableOpacity onPress={() => toggleInfo('installments')}>
                  <Info color="#0F5132" size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.sectionHeaderTotal}>{formatCurrency(totalInstallmentsVal)}</Text>
                <TouchableOpacity 
                  onPress={handleOpenInstallmentModal} 
                  style={styles.addButton}
                >
                  <PlusCircle color="#0F5132" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {visibleInfos['installments'] && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>Destinado a compras com cartões na forma de parcelamento.</Text>
              </View>
            )}

            <View style={styles.itemsListFlat}>
              {installmentOutflows.length === 0 ? (
                <Text style={styles.noItemsText}>Nenhuma parcela de cartão vencendo neste mês.</Text>
              ) : (
                installmentOutflows.map((item, index) => {
                  const isLast = index === installmentOutflows.length - 1;
                  return (
                    <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat]}>
                      <Text style={[
                        styles.itemDesc,
                        { flex: 1 }
                      ]} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <Text style={styles.itemVal}>{formatCurrency(item.value)}</Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Card 5: Despesas Variadas */}
          <View style={[styles.sectionCard, !isLargeScreen && styles.sectionCardMobile]}>
            <View style={styles.sectionHeaderInside}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
                <Text style={styles.sectionTitleInside}>Despesas Variadas</Text>
                <TouchableOpacity onPress={() => toggleInfo('variables')}>
                  <Info color="#0F5132" size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.sectionHeaderTotal}>{formatCurrency(totalVariableVal)}</Text>
                <TouchableOpacity 
                  onPress={() => setAddModalType('variable')} 
                  style={styles.addButton}
                >
                  <PlusCircle color="#DC3545" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {visibleInfos['variables'] && (
              <View style={styles.infoAlert}>
                <Text style={styles.infoAlertText}>Destinado a gastos não previstos do dia a dia.</Text>
              </View>
            )}

            <View style={styles.itemsListFlat}>
              {variableOutflows.length === 0 ? (
                <Text style={styles.noItemsText}>Nenhuma despesa variada cadastrada neste mês.</Text>
              ) : (
                variableOutflows.map((item, index) => {
                  const isLast = index === variableOutflows.length - 1;
                  return (
                    <View key={item.id} style={[styles.itemRowFlat, isLast && styles.lastItemRowFlat, { opacity: item.status === 'ok' ? 0.6 : 1.0 }]}>
                      <TouchableOpacity 
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          toggleExitStatus(item.id as ExitId);
                        }}
                        style={styles.itemCheckBtn}
                      >
                        {item.status === 'ok' ? (
                          <Check color="#10B981" size={20} />
                        ) : (
                          <Square color="#CED4DA" size={20} />
                        )}
                      </TouchableOpacity>
                      <Text style={[
                        styles.itemDesc,
                        item.status === 'ok' && styles.crossedText
                      ]}>
                        {item.description}
                      </Text>
                      <Text style={styles.itemVal}>{formatCurrency(item.value)}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          deleteExit(item.id as ExitId);
                          showToast('Despesa removida.', 'success');
                        }} 
                        style={styles.deleteBtn}
                      >
                        <Trash2 color="#DC3545" size={16} />
                      </TouchableOpacity>
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
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                {addModalType === 'entry' ? (
                  <ArrowUpRight color="#10B981" size={24} />
                ) : addModalType === 'installment' ? (
                  <CreditCard color="#0F5132" size={24} />
                ) : (
                  <ArrowDownRight color="#DC3545" size={24} />
                )}
                <Text style={styles.modalTitle}>
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
                style={styles.closeModalBtn}
              >
                <X color="#495057" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>
              <FinancialInput
                label={addModalType === 'installment' ? 'Nome do Produto' : 'Descrição'}
                placeholder={addModalType === 'installment' ? 'Ex: Celular Novo' : 'Ex: Salário, Claro, Spotify'}
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

                  <FinancialInput
                    label="Mês de Início"
                    placeholder="AAAA-MM (Ex: 2025-08)"
                    value={startDateVal}
                    onChangeText={setStartDateVal}
                  />

                  <CardSelector
                    selectedCard={cardUsedVal}
                    onSelect={setCardUsedVal}
                    cards={creditCards.map(c => ({ key: c.id, name: c.name, color: c.color || '#64748B' }))}
                  />
                </>
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
  selectorBar: {
    position: 'absolute',
    top: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    width: '92%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  selectorBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#F1F3F5',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorText: {
    color: '#0F5132',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeaderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 90, // Leave space for floating selector
    paddingBottom: 100,
    gap: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 16,
  },
  summaryTitle: {
    color: '#0F5132',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
  innerCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 125,
    justifyContent: 'flex-start',
  },
  innerCardMobile: {
    width: '100%',
  },
  innerCardHighlighted: {
    backgroundColor: '#EBF5EE',
    borderColor: '#D1E7DD',
  },
  innerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  innerCardLabel: {
    color: '#495057',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  innerCardVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  miniTable: {
    gap: 6,
    width: '100%',
  },
  miniTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniTableLabel: {
    color: '#495057',
    fontSize: 12,
    fontWeight: '500',
  },
  miniTableVal: {
    color: '#212529',
    fontSize: 12,
    fontWeight: '600',
  },
  dividerMini: {
    height: 1,
    backgroundColor: '#D1E7DD',
    marginVertical: 4,
  },
  sectionsGrid: {
    gap: 20,
    width: '100%',
    marginTop: 8,
  },
  sectionsGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  sectionsGridColumn: {
    flexDirection: 'column',
  },
  sectionCard: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: '45%',
    maxWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCardMobile: {
    width: '100%',
    maxWidth: '100%',
  },
  sectionHeaderInside: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 8,
  },
  sectionTitleInside: {
    color: '#0F5132',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsListFlat: {
    gap: 0,
  },
  itemRowFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  lastItemRowFlat: {
    borderBottomWidth: 0,
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
    padding: 4,
  },
  cardComparisonRowFlat: {
    marginTop: 4,
    marginLeft: 32,
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
    marginBottom: 14,
  },
  infoAlertText: {
    color: '#0F5132',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
