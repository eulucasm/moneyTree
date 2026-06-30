import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, Platform, TextInput, useWindowDimensions, LayoutAnimation, Animated } from 'react-native';
import { useFinancials, PurchaseId } from '../../context/FinancialContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/format';
import GlassCard from '../../components/GlassCard';
import FinancialInput from '../../components/FinancialInput';
import FinancialButton from '../../components/FinancialButton';
import CardSelector from '../../components/CardSelector';
import Toast from '../../components/Toast';
import { 
  Plus, 
  CreditCard, 
  Calendar, 
  Trash2, 
  X, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Square,
  Settings as SettingsIcon
} from 'lucide-react-native';

export default function InstallmentsScreen() {
  const { theme: colorScheme, colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 800;

  const { 
    purchases, 
    addPurchase, 
    deletePurchase, 
    getMonthlyOutflowsList, 
    toggleInstallmentStatus,
    creditCards,
    addCreditCard,
    updateCreditCardLimit,
    deleteCreditCard,
    installmentStatusMap
  } = useFinancials();
  
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

  // Selected Month state (defaults to dynamic current month)
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);

  // Selected Card Tab state
  const [selectedCard, setSelectedCard] = useState<string>('');

  // Add Purchase Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [installments, setInstallments] = useState('');
  const [startDate, setStartDate] = useState(''); 
  const [cardUsed, setCardUsed] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Credit Card modal state in installments.tsx
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardLimit, setNewCardLimit] = useState('');
  const [newCardColor, setNewCardColor] = useState('#8B5CF6');
  const [newCardDueDate, setNewCardDueDate] = useState('');
  const [newCardBestDay, setNewCardBestDay] = useState('');

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

  React.useEffect(() => {
    if (creditCards.length > 0) {
      if (!selectedCard) setSelectedCard(creditCards[0].id);
      if (!cardUsed) setCardUsed(creditCards[0].id);
    }
  }, [creditCards]);

  const formatPeriod = (year: number, month: number) => {
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  const selectedPeriod = formatPeriod(currentYear, currentMonth);

  // Month and Card Transitions
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    contentOpacity.setValue(0.3);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod, selectedCard]);

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

  // Open modal and pre-fill startDate with selected period
  const handleOpenAddModal = () => {
    setStartDate(selectedPeriod);
    setCardUsed(selectedCard || (creditCards[0]?.id || ''));
    setModalVisible(true);
  };

  const handleAdd = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = 'Obrigatório';
    
    const valParsed = parseFloat(totalValue);
    if (isNaN(valParsed) || valParsed <= 0) newErrors.totalValue = 'Valor inválido';
    
    const instParsed = parseInt(installments, 10);
    if (isNaN(instParsed) || instParsed <= 0) newErrors.installments = 'Mínimo 1';
    
    if (!startDate.match(/^\d{4}-\d{2}$/)) newErrors.startDate = 'Formato AAAA-MM';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addPurchase(description, valParsed, instParsed, startDate, cardUsed);
    
    setDescription('');
    setTotalValue('');
    setInstallments('');
    setStartDate('');
    setErrors({});
    setModalVisible(false);
    
    showToast('Compra parcelada registrada com sucesso!', 'success');
  };

  const handleDeletePress = (purchaseId: PurchaseId, desc: string) => {
    if (Platform.OS === 'web') {
      const confirmWeb = window.confirm(`Deseja excluir o parcelamento "${desc}" e todas as suas parcelas futuras?`);
      if (confirmWeb) {
        deletePurchase(purchaseId);
        showToast('Parcelamento excluído com sucesso.', 'success');
      }
    } else {
      Alert.alert(
        'Excluir compra?',
        `Deseja excluir "${desc}" e todas as suas parcelas associadas?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive', 
            onPress: () => {
              deletePurchase(purchaseId);
              showToast('Parcelamento excluído com sucesso.', 'success');
            } 
          }
        ]
      );
    }
  };

  const getCardColor = (cardId: string) => {
    const card = creditCards.find(c => c.id === cardId);
    return card?.color || '#64748B';
  };

  const getCardName = (cardId: string) => {
    const card = creditCards.find(c => c.id === cardId);
    return card?.name || 'Outros';
  };

  // Get active installments for the selected month
  const monthlyOutflows = getMonthlyOutflowsList(selectedPeriod);
  const installmentOutflows = monthlyOutflows.filter(o => o.type === 'installment');

  // Filter installments for the selected card
  const filteredInstallments = installmentOutflows.filter(inst => inst.cardUsed === selectedCard);

  // Sum of installments on this card for the selected month
  const cardFaturaSum = filteredInstallments.reduce((sum, inst) => sum + inst.value, 0);

  const getFaturaSumForCard = (cardId: string) => {
    return installmentOutflows
      .filter(inst => inst.cardUsed === cardId)
      .reduce((sum, inst) => sum + inst.value, 0);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Month Selector Bar (Floating style matching budget.tsx) */}
      <View style={[styles.selectorBar, { backgroundColor: colorScheme === 'dark' ? '#151D30' : '#E8F5E9', borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#C8E6C9' }]}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.selectorBtn}>
          <ChevronLeft color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={24} />
        </TouchableOpacity>
        <Text style={[styles.selectorText, { color: colors.text }]}>
          {monthsNames[currentMonth - 1]} {currentYear}
        </Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.selectorBtn}>
          <ChevronRight color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: width < 768 ? 110 : 24 }]}>
        <Animated.View style={{ opacity: contentOpacity, width: '100%', gap: 16 }}>
        
        {/* Seção de Cartões e Faturas */}
        <View style={styles.sectionHeaderWithAction}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Seus Cartões e Faturas</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Visão direta dos valores programados para {monthsNames[currentMonth - 1]}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.manageCardsBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9' }]}
            onPress={() => setCardModalVisible(true)}
            activeOpacity={0.7}
          >
            <SettingsIcon size={14} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
            <Text style={[styles.manageCardsBtnText, { color: colorScheme === 'dark' ? colors.text : "#0F5132" }]}>Gerenciar</Text>
          </TouchableOpacity>
        </View>

        {/* Grid de Minicards de Cartões (Largura fixa para evitar esticar ímpar) */}
        <View style={styles.cardsGridContainer}>
          {creditCards.map((card) => {
            const isSelected = selectedCard === card.id;
            const color = card.color || '#64748B';
            const sum = getFaturaSumForCard(card.id);
            const percent = Math.min((sum / card.limit) * 100, 100);
            
            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCard(card.id)}
                style={[
                  styles.cardSelectorItem,
                  { backgroundColor: colorScheme === 'dark' ? '#151D30' : '#FFFFFF' },
                  isSelected ? { borderColor: color, borderWidth: 2 } : { borderColor: colors.borderGlass, borderWidth: 1 },
                  isSelected && styles.cardSelectorItemActive
                ]}
              >
                <View style={styles.cardSelectorItemHeader}>
                  <View style={[styles.brandDot, { backgroundColor: color }]} />
                  <Text style={[styles.cardSelectorItemName, { color: colors.text }]} numberOfLines={1}>
                    {card.name}
                  </Text>
                </View>
                <Text style={[styles.cardSelectorItemValue, { color: colors.text }]}>
                  {formatCurrency(sum)}
                </Text>
                <Text style={[styles.cardSelectorItemSub, { color: colors.textMuted }]}>
                  Limite usado: {percent.toFixed(0)}%
                </Text>
                <View style={[styles.progressBarTrackMini, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E9ECEF' }]}>
                  <View style={[styles.progressBarFillMini, { width: `${percent}%`, backgroundColor: color }]} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
 
        {/* List Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Parcelas Ativas - {getCardName(selectedCard)}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Fatura de {monthsNames[currentMonth - 1]}: {formatCurrency(cardFaturaSum)}
          </Text>
        </View>

        {/* Installments List */}
        <View style={styles.purchasesList}>
          {filteredInstallments.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
              <Info color={colors.textMuted} size={32} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Nenhuma parcela para este mês.</Text>
              <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
                Não há parcelas ativas no cartão {getCardName(selectedCard)} em {monthsNames[currentMonth - 1]}.
              </Text>
            </View>
          ) : (
            filteredInstallments.map((item) => {
              return (
                <GlassCard key={item.id} style={[styles.purchaseItem, { opacity: item.status === 'ok' ? 0.6 : 1.0 }]}>
                  <View style={styles.purchaseLeft}>
                    <TouchableOpacity 
                      onPress={() => {
                        toggleInstallmentStatus(item.id as PurchaseId, selectedPeriod);
                        const isChecking = item.status !== 'ok';
                        showToast(
                          isChecking ? 'Parcela marcada como paga!' : 'Parcela marcada como pendente.',
                          'success'
                        );
                      }}
                      style={styles.itemCheckBtn}
                    >
                      {item.status === 'ok' ? (
                        <Check color="#10B981" size={22} />
                      ) : (
                        <Square color={colorScheme === 'dark' ? colors.textMuted : "#CED4DA"} size={22} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.purchaseTextContainer}>
                      <Text style={[
                        styles.purchaseDesc,
                        { color: colors.text },
                        item.status === 'ok' && styles.crossedText
                      ]}>
                        {item.description}
                      </Text>
                      <View style={styles.metaRow}>
                        <Calendar size={12} color={colors.textMuted} />
                        <Text style={[styles.metaText, { color: colors.textMuted }]}>Parcela {item.installmentRef}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.purchaseRight}>
                    <Text style={[styles.totalValText, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleDeletePress(item.id as PurchaseId, item.description)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 color="#DC3545" size={18} />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            })
          )}
        </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handleOpenAddModal}
        style={[styles.fab, { bottom: width < 768 ? 96 : 32 }]}
      >
        <Plus color="#ffffff" size={28} />
      </TouchableOpacity>

      {/* Add Purchase Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderGlass }]}>
              <View style={styles.modalTitleContainer}>
                <CreditCard color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('installments.newInstallment')}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalBtn}>
                <X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <FinancialInput
                label={t('installments.productName')}
                placeholder="Ex: Celular Novo, Computador"
                value={description}
                onChangeText={setDescription}
                error={errors.description}
              />

              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <FinancialInput
                    label={t('installments.totalValue')}
                    isCurrency={true}
                    value={totalValue}
                    onChangeText={setTotalValue}
                    error={errors.totalValue}
                  />
                </View>
                <View style={styles.flexHalf}>
                  <FinancialInput
                    label={t('installments.numberOfInstallments')}
                    placeholder="10"
                    keyboardType="numeric"
                    value={installments}
                    onChangeText={setInstallments}
                    error={errors.installments}
                  />
                </View>
              </View>

              <FinancialInput
                label={t('installments.startDate')}
                placeholder="AAAA-MM (Ex: 2025-08)"
                value={startDate}
                onChangeText={setStartDate}
                error={errors.startDate}
              />

              <CardSelector
                selectedCard={cardUsed}
                onSelect={setCardUsed}
                cards={creditCards.map(c => ({ key: c.id, name: c.name, color: c.color || '#64748B' }))}
              />

              <FinancialButton
                title={t('common.add')}
                onPress={handleAdd}
                style={styles.modalAddBtn}
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
        <View style={styles.modalBg}>
          <View style={[styles.modalContainer, { maxWidth: 500, backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderGlass }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Gerenciar Cartões de Crédito</Text>
              <TouchableOpacity onPress={() => setCardModalVisible(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16 }} style={{ maxHeight: 400 }} showsVerticalScrollIndicator={true}>
              {/* Seção 1: Lista de Cartões Existentes */}
              <Text style={[styles.modalSubtitleSection, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>Cartões Cadastrados & Limites</Text>
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
                          style={[styles.cardManagerLimitInput, { borderColor: colors.borderGlass, color: colors.text }]}
                          keyboardType="numeric"
                          placeholder="Limite"
                          defaultValue={card.limit.toString()}
                          onEndEditing={(e) => {
                            const val = parseFloat(e.nativeEvent.text);
                            if (!isNaN(val) && val >= 0) {
                              updateCreditCardLimit(card.id, val);
                              showToast('Limite atualizado!', 'success');
                            }
                          }}
                        />
                        {creditCards.length > 1 && (
                          <TouchableOpacity 
                            onPress={() => {
                              deleteCreditCard(card.id);
                              showToast('Cartão de crédito removido.', 'success');
                            }}
                            style={styles.cardManagerDeleteBtn}
                          >
                            <Trash2 color="#DC3545" size={16} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.modalDivider} />

              {/* Seção 2: Adicionar Novo Cartão */}
              <Text style={styles.modalSubtitleSection}>Cadastrar Novo Cartão</Text>
              
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
                <Text style={styles.colorSelectorLabel}>Cor Visual do Cartão</Text>
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
  scrollContent: {
    padding: 24,
    paddingTop: 90, // Leave space for floating selector
    paddingBottom: 120, // Space for FAB
    gap: 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  sectionHeader: {
    marginVertical: 4,
    gap: 2,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginVertical: 4,
  },
  sectionTitle: {
    color: '#0F5132',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6C757D',
  },
  manageCardsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  manageCardsBtnText: {
    color: '#0F5132',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  cardSelectorItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: 250, // Fixed width to prevent odd item stretching
    flexGrow: 0,
    flexShrink: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderColor: '#E9ECEF',
    borderWidth: 1,
  },
  cardSelectorItemActive: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.08,
  },
  cardSelectorItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardSelectorItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
  },
  cardSelectorItemValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  cardSelectorItemSub: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 8,
  },
  progressBarTrackMini: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFillMini: {
    height: '100%',
    borderRadius: 2,
  },
  purchasesList: {
    gap: 12,
  },
  purchaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  purchaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemCheckBtn: {
    padding: 2,
  },
  purchaseTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  purchaseDesc: {
    color: '#212529',
    fontSize: 15,
    fontWeight: '700',
  },
  crossedText: {
    textDecorationLine: 'line-through',
    color: '#ADB5BD',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    color: '#6C757D',
    fontSize: 12,
    fontWeight: '500',
  },
  purchaseRight: {
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 12,
  },
  totalValText: {
    color: '#212529',
    fontSize: 15,
    fontWeight: 'bold',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginTop: 8,
  },
  emptyText: {
    color: '#495057',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: '#6C757D',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
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
    maxHeight: '90%',
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
  modalForm: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flexHalf: {
    flex: 1,
  },
  modalAddBtn: {
    marginTop: 16,
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
});
