import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, LayoutAnimation, UIManager, Modal, useWindowDimensions } from 'react-native';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import GlassCard from '../../components/GlassCard';
import { formatCurrency } from '../../utils/format';
import { useTheme } from '../../hooks/useTheme';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronDown, 
  X, 
  Info,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CreditCard
} from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MonthItem {
  monthStr: string;
  name: string;
  year: number;
}

export default function HistoryScreen() {
  const { theme: colorScheme, colors } = useTheme();
  const { width } = useWindowDimensions();
  const getMonthlySummary = useFinanceStore(s => s.getMonthlySummary);
  const getMonthlyOutflowsList = useFinanceStore(s => s.getMonthlyOutflowsList);
  const entries = useFinanceStore(s => s.entries);
  const creditCards = useFinanceStore(s => s.creditCards);
  const userProfile = useAuthStore(s => s.userProfile);
  const userCreatedAt = userProfile?.createdAt || '2025-06';

  // Get current date details for comparison dynamically
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // State to track selected month for the detailed modal
  const [selectedMonthDetails, setSelectedMonthDetails] = useState<MonthItem | null>(null);

  // Generate list of up to 24 rolling months prior to the current month, starting from the user's creation cutoff
  const getPastMonths = () => {
    const list: Array<MonthItem> = [];
    const userCreatedAt = userProfile?.createdAt || '2025-06';
    const [startYear, startMonth] = userCreatedAt.split('-').map(Number);
    
    let year = startYear;
    let month = startMonth;

    while (year < currentYear || (year === currentYear && month < currentMonth)) {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      list.push({
        monthStr,
        name: monthsNames[month - 1],
        year,
      });

      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }
    // Keep at most 24 months, with the newest month first (descending)
    return list.reverse().slice(0, 24);
  };

  const pastMonths = getPastMonths();

  const getCardColorName = (cardId?: string) => {
    if (!cardId) return 'Outro';
    const card = creditCards.find(c => c.id === cardId);
    return card ? card.name : 'Outro';
  };

  const getCardColorHex = (cardId?: string) => {
    if (!cardId) return '#64748B';
    const card = creditCards.find(c => c.id === cardId);
    return card ? (card.color || '#64748B') : '#64748B';
  };

  const modalSummary = React.useMemo(() => {
    if (!selectedMonthDetails) return null;
    return getMonthlySummary(selectedMonthDetails.monthStr, userCreatedAt);
  }, [selectedMonthDetails, getMonthlySummary, userCreatedAt]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: width < 768 ? 110 : 24 }]}>
        
        {/* HEADER TELA */}
        <View style={styles.headerSection}>
          <History color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={24} />
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Histórico Mensal</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Conferência e levantamento de informações de até 24 meses anteriores.
            </Text>
          </View>
        </View>

        {/* LISTA DE MESES PASSADOS */}
        <View style={styles.monthsList}>
          {pastMonths.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
              <Info color={colors.textMuted} size={32} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Nenhum histórico disponível.</Text>
              <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
                O histórico exibe até 24 meses anteriores ao atual (a partir de Junho de 2025).
              </Text>
            </View>
          ) : (
            pastMonths.map((item) => {
              const summary = getMonthlySummary(item.monthStr, userCreatedAt);
              const isPositive = summary.forecastLeftover >= 0;

              return (
                <GlassCard key={item.monthStr} style={styles.monthCard}>
                  {/* Resumo do Mês */}
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setSelectedMonthDetails(item)}
                    style={styles.cardHeaderClickable}
                  >
                    <View style={styles.cardHeaderLeft}>
                      <View style={[
                        styles.indicatorBar, 
                        { backgroundColor: isPositive ? '#10B981' : '#DC3545' }
                      ]} />
                      <View>
                        <Text style={[styles.monthTitle, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.monthYear, { color: colors.textMuted }]}>{item.year}</Text>
                      </View>
                    </View>

                    <View style={styles.cardHeaderRight}>
                      <View style={styles.rightStats}>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>Balanço</Text>
                        <Text style={[
                          styles.statValue,
                          { color: isPositive ? '#10B981' : '#DC3545' }
                        ]}>
                          {formatCurrency(summary.forecastLeftover)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Detalhes Rápidos de Resumo */}
                  <View style={[styles.summaryMetricsRow, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8F9FA', borderColor: colors.borderGlass }]}>
                    <View style={styles.miniMetric}>
                      <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Entradas</Text>
                      <Text style={styles.miniValGreen}>
                        {formatCurrency(summary.entriesTotal)}
                      </Text>
                    </View>
                    <View style={styles.miniMetric}>
                      <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Saídas</Text>
                      <Text style={[styles.miniValNormal, { color: colors.text }]}>
                        {formatCurrency(summary.exitsTotal)}
                      </Text>
                    </View>
                    <View style={styles.miniMetric}>
                      <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Poupado</Text>
                      <Text style={styles.miniValSavings}>
                        {formatCurrency(summary.savingsPlaced)}
                      </Text>
                    </View>
                  </View>

                  {/* Link visual para consulta detalhada */}
                  <TouchableOpacity 
                    onPress={() => setSelectedMonthDetails(item)}
                    style={[styles.viewDetailedLink, { borderTopColor: colors.borderGlass }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.viewDetailedLinkText, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>Ver histórico detalhado</Text>
                    <ChevronDown size={14} color={colorScheme === 'dark' ? '#10B981' : '#0F5132'} style={{ transform: [{ rotate: '-90deg' }], marginLeft: 2 }} />
                  </TouchableOpacity>
                </GlassCard>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* MODAL DE HISTÓRICO DETALHADO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedMonthDetails !== null}
        onRequestClose={() => setSelectedMonthDetails(null)}
      >
        <View style={[styles.modalBg, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(33, 37, 41, 0.4)' }]}>
          <View style={[styles.modalContainer, { maxWidth: 600, backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderGlass }]}>
              <View style={styles.modalTitleContainer}>
                <History color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={24} />
                <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                  Consulta - {selectedMonthDetails?.name} {selectedMonthDetails?.year}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedMonthDetails(null)} style={[styles.closeModalBtn, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA' }]}>
                <X color={colors.text} size={20} />
              </TouchableOpacity>
            </View>

            {selectedMonthDetails && (
              <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.modalScrollContent}>
                
                {/* Resumo Rápido no Modal */}
                {modalSummary && (
                  <View style={[styles.modalSummaryBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8F9FA', borderColor: colors.borderGlass }]}>
                    <Text style={[styles.modalSummaryLabel, { color: colors.textMuted }]}>Balanço Projetado Final</Text>
                    <Text style={[
                      styles.modalSummaryValue,
                      { color: modalSummary.forecastLeftover >= 0 ? '#10B981' : '#DC3545' }
                    ]}>
                      {formatCurrency(modalSummary.forecastLeftover)}
                    </Text>
                    <View style={styles.modalSummaryMiniRow}>
                      <View style={styles.modalSummaryMiniCol}>
                        <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Entradas</Text>
                        <Text style={styles.miniValGreen}>
                          {formatCurrency(modalSummary.entriesTotal)}
                        </Text>
                      </View>
                      <View style={styles.modalSummaryMiniCol}>
                        <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Saídas</Text>
                        <Text style={[styles.miniValNormal, { color: colors.text }]}>
                          {formatCurrency(modalSummary.exitsTotal)}
                        </Text>
                      </View>
                      <View style={styles.modalSummaryMiniCol}>
                        <Text style={[styles.miniLabel, { color: colors.textMuted }]}>Poupado</Text>
                        <Text style={styles.miniValSavings}>
                          {formatCurrency(modalSummary.savingsPlaced)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={[styles.detailsDivider, { backgroundColor: colors.borderGlass }]} />

                {/* Lista de Entradas */}
                <View style={styles.modalDetailsSection}>
                  <View style={styles.modalSectionTitleRow}>
                    <ArrowUpRight color="#10B981" size={18} />
                    <Text style={[styles.detailsSectionHeader, { color: colors.text }]}>Rendimentos e Entradas</Text>
                  </View>
                  <View style={styles.detailsList}>
                    {entries.filter(e => e.date === selectedMonthDetails.monthStr).length === 0 ? (
                      <Text style={[styles.noTransactionsText, { color: colors.textMuted }]}>Nenhuma entrada registrada neste período.</Text>
                    ) : (
                      entries.filter(e => e.date === selectedMonthDetails.monthStr).map(entry => (
                        <View key={entry.id} style={[styles.transactionRow, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8F9FA', borderColor: colors.borderGlass }]}>
                          <Text style={[styles.transactionDesc, { color: colors.text }]}>{entry.description}</Text>
                          <Text style={styles.transactionValGreen}>+ {formatCurrency(entry.value)}</Text>
                        </View>
                      ))
                    )}
                  </View>
                </View>

                {/* Lista de Saídas */}
                <View style={styles.modalDetailsSection}>
                  <View style={styles.modalSectionTitleRow}>
                    <ArrowDownRight color="#DC3545" size={18} />
                    <Text style={[styles.detailsSectionHeader, { color: colors.text }]}>Contas, Assinaturas e Parcelas</Text>
                  </View>
                  <View style={styles.detailsList}>
                    {getMonthlyOutflowsList(selectedMonthDetails.monthStr, userCreatedAt).length === 0 ? (
                      <Text style={[styles.noTransactionsText, { color: colors.textMuted }]}>Nenhuma despesa registrada neste período.</Text>
                    ) : (
                      getMonthlyOutflowsList(selectedMonthDetails.monthStr, userCreatedAt).map(outflow => {
                        const cardColor = getCardColorHex(outflow.cardUsed);
                        return (
                          <View key={outflow.id} style={[styles.transactionRow, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8F9FA', borderColor: colors.borderGlass }]}>
                            <View style={styles.transactionDescCol}>
                              <Text style={[styles.transactionDesc, { color: colors.text }]}>{outflow.description}</Text>
                              <View style={styles.transactionTypeRow}>
                                {outflow.type === 'fixed' && (
                                  <Text style={[styles.typeBadgeFixed, colorScheme === 'dark' && { color: colors.textSecondary, backgroundColor: 'rgba(255,255,255,0.05)' }]}>Fixa</Text>
                                )}
                                {outflow.type === 'variable' && (
                                  <Text style={[styles.typeBadgeVar, colorScheme === 'dark' && { color: '#F97316', backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>Variável</Text>
                                )}
                                {outflow.type === 'recurring' && (
                                  <Text style={[styles.typeBadgeRec, colorScheme === 'dark' && { color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}><RefreshCw size={8} /> Assinatura</Text>
                                )}
                                {outflow.type === 'installment' && (
                                  <View style={[styles.typeBadgeInstContainer, { backgroundColor: cardColor + '15', borderColor: cardColor + '30' }]}>
                                    <CreditCard size={8} color={cardColor} />
                                    <Text style={[styles.typeBadgeInstText, { color: cardColor }]}>
                                      Parcela {outflow.installmentRef} ({getCardColorName(outflow.cardUsed)})
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>
                            <Text style={styles.transactionValRed}>- {formatCurrency(outflow.value)}</Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    color: '#0F5132',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#6C757D',
    fontSize: 13,
    marginTop: 2,
  },
  monthsList: {
    gap: 16,
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeaderClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  indicatorBar: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    textTransform: 'capitalize',
  },
  monthYear: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightStats: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 10,
    color: '#6C757D',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  miniMetric: {
    flex: 1,
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 10,
    color: '#6C757D',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  miniValGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  miniValNormal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
  },
  miniValSavings: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5132',
  },
  viewDetailedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  viewDetailedLinkText: {
    color: '#0F5132',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Modal layout
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(33, 37, 41, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 550,
    maxHeight: '85%',
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
    flex: 1,
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
    marginLeft: 12,
  },
  modalScrollContent: {
    gap: 16,
  },
  modalSummaryBox: {
    backgroundColor: '#EBF5EE',
    borderWidth: 1,
    borderColor: '#D1E7DD',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  modalSummaryLabel: {
    fontSize: 11,
    color: '#6C757D',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  modalSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalSummaryMiniRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#D1E7DD',
    paddingTop: 12,
  },
  modalSummaryMiniCol: {
    flex: 1,
    alignItems: 'center',
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#F1F3F5',
    marginVertical: 4,
  },
  modalDetailsSection: {
    gap: 10,
  },
  modalSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F5132',
    letterSpacing: -0.3,
  },
  detailsList: {
    gap: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  transactionDescCol: {
    flex: 1,
    gap: 4,
  },
  transactionDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
  },
  transactionTypeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBadgeFixed: {
    fontSize: 9,
    color: '#495057',
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '600',
  },
  typeBadgeVar: {
    fontSize: 9,
    color: '#9A3412',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '600',
  },
  typeBadgeRec: {
    fontSize: 9,
    color: '#0F5132',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '600',
  },
  typeBadgeInstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  typeBadgeInstText: {
    fontSize: 9,
    fontWeight: '600',
  },
  transactionValGreen: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10B981',
  },
  transactionValRed: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DC3545',
  },
  noTransactionsText: {
    fontSize: 12,
    color: '#ADB5BD',
    fontStyle: 'italic',
    paddingLeft: 12,
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
    marginTop: 16,
  },
  emptyText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: '#6C757D',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
