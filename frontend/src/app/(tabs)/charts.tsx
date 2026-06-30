import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, DimensionValue, useWindowDimensions } from 'react-native';
import { useFinancials } from '../../context/FinancialContext';
import GlassCard from '../../components/GlassCard';
import { useTheme } from '../../hooks/useTheme';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  DollarSign, 
  PieChart, 
  Activity, 
  Target,
  ChevronRight
} from 'lucide-react-native';

export default function ChartsScreen() {
  const { theme: colorScheme, colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const { 
    getMonthlySummary, 
    getMonthlyOutflowsList, 
    savingsGoal 
  } = useFinancials();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultPeriod = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod);

  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // 1. Generate lists and statistics for the 7 months projection (June to Dec 2025)
  const timelineData = [];
  for (let i = 0; i < 7; i++) {
    const monthIndex = (currentMonth - 1 + i) % 12;
    const yearOffset = Math.floor((currentMonth - 1 + i) / 12);
    const year = currentYear + yearOffset;
    const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    
    const summary = getMonthlySummary(monthStr);
    const outflowsList = getMonthlyOutflowsList(monthStr);

    // Group exit types
    const fixedVal = outflowsList.filter(o => o.type === 'fixed').reduce((sum, o) => sum + o.value, 0);
    const variableVal = outflowsList.filter(o => o.type === 'variable').reduce((sum, o) => sum + o.value, 0);
    const recurringVal = outflowsList.filter(o => o.type === 'recurring').reduce((sum, o) => sum + o.value, 0);
    const installmentVal = outflowsList.filter(o => o.type === 'installment').reduce((sum, o) => sum + o.value, 0);

    timelineData.push({
      monthStr,
      monthName: monthsNames[monthIndex],
      year,
      summary,
      fixedVal,
      variableVal,
      recurringVal,
      installmentVal,
    });
  }

  // 2. Select data for active month
  const selectedData = timelineData.find(d => d.monthStr === selectedPeriod) || timelineData[0];
  const { summary: selSummary } = selectedData;

  // Max value to scale Inflows vs Outflows chart (at least R$ 1.000)
  const maxFinancialVal = Math.max(
    ...timelineData.map(d => Math.max(d.summary.entriesTotal, d.summary.exitsTotal)), 
    1000
  );

  const scaleBarHeight = (value: number) => {
    const percentage = Math.min((value / maxFinancialVal) * 100, 100);
    return `${percentage}%` as DimensionValue;
  };

  // Max value to scale emergency reserve timeline (at least target or R$ 1.000)
  const maxSavingsVal = Math.max(
    ...timelineData.map(d => d.summary.totalSavings), 
    savingsGoal, 
    1000
  );

  const scaleSavingsHeight = (value: number) => {
    const percentage = Math.min((value / maxSavingsVal) * 100, 100);
    return `${percentage}%` as DimensionValue;
  };

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Category percentage calculation
  const totalSelExits = selSummary.exitsTotal;
  const fixedPercent = totalSelExits > 0 ? (selectedData.fixedVal / totalSelExits) * 100 : 0;
  const variablePercent = totalSelExits > 0 ? (selectedData.variableVal / totalSelExits) * 100 : 0;
  const recurringPercent = totalSelExits > 0 ? (selectedData.recurringVal / totalSelExits) * 100 : 0;
  const installmentPercent = totalSelExits > 0 ? (selectedData.installmentVal / totalSelExits) * 100 : 0;

  // Render a clean percentage indicator
  const renderPercentageIndicator = (pct: number) => `${pct.toFixed(0)}%`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingBottom: width < 768 ? 110 : 24 }]}>
      <View style={styles.header}>
        <Activity color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={32} />
        <Text style={[styles.headerText, { color: colors.text }]}>Relatórios Visuais</Text>
      </View>

      {/* CHART 1: Comparative Inflows vs Outflows (Bar Chart) */}
      <GlassCard style={styles.card}>
        <View style={styles.chartTitleContainer}>
          <View>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Comparativo Mensal</Text>
            <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>Projeção de faturamento (Entradas vs Saídas)</Text>
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Receitas</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Despesas</Text>
            </View>
          </View>
        </View>

        {/* The bar chart container */}
        <View style={styles.barChartWrapper}>
          <View style={styles.barChartGrid}>
            {timelineData.map((item) => {
              const isSelected = item.monthStr === selectedPeriod;
              return (
                <TouchableOpacity
                  key={item.monthStr}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPeriod(item.monthStr)}
                  style={[
                    styles.barColumnContainer,
                    isSelected && (colorScheme === 'dark' ? { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' } : styles.barColumnContainerActive)
                  ]}
                >
                  <View style={styles.barBarsRow}>
                    {/* Inflows Bar (Green) */}
                    <View style={[styles.barTrack, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F3F5' }]}>
                      <View style={[styles.barFill, { height: scaleBarHeight(item.summary.entriesTotal), backgroundColor: '#10B981' }]} />
                    </View>
                    {/* Outflows Bar (Red) */}
                    <View style={[styles.barTrack, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F3F5' }]}>
                      <View style={[styles.barFill, { height: scaleBarHeight(item.summary.exitsTotal), backgroundColor: '#EF4444' }]} />
                    </View>
                  </View>
                  <Text style={[styles.barMonthLabel, { color: colors.textMuted }, isSelected && styles.barMonthLabelActive]}>
                    {item.monthName.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.periodQuickSummary, { borderTopColor: colors.borderGlass, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.01)' : '#F8F9FA' }]}>
          <Text style={[styles.quickSummaryTitle, { color: colors.text }]}>
            Balanço de {selectedData.monthName} / {selectedData.year}:
          </Text>
          <View style={styles.quickSummaryMetrics}>
            <View style={styles.quickMetricBox}>
              <Text style={[styles.quickMetricLabel, { color: colors.textMuted }]}>Receitas (+)</Text>
              <Text style={[styles.quickMetricVal, { color: '#10B981' }]}>
                {formatCurrency(selSummary.entriesTotal)}
              </Text>
            </View>
            <View style={styles.quickMetricBox}>
              <Text style={[styles.quickMetricLabel, { color: colors.textMuted }]}>Despesas (-)</Text>
              <Text style={[styles.quickMetricVal, { color: '#EF4444' }]}>
                {formatCurrency(selSummary.exitsTotal)}
              </Text>
            </View>
            <View style={styles.quickMetricBox}>
              <Text style={[styles.quickMetricLabel, { color: colors.textMuted }]}>Sobra do Mês</Text>
              <Text style={[
                styles.quickMetricVal, 
                { color: selSummary.forecastLeftover >= 0 ? (colorScheme === 'dark' ? '#10B981' : '#0F5132') : '#EF4444' }
              ]}>
                {formatCurrency(selSummary.forecastLeftover)}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      <View style={[styles.gridRow, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {/* CHART 2: Expense Category Breakdown (Segmented Horizontal Chart) */}
        <GlassCard style={[styles.card, isLargeScreen ? styles.gridCard : { width: '100%' }]}>
          <View style={styles.sectionHeader}>
            <PieChart color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={22} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Distribuição das Despesas</Text>
          </View>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Mapeamento proporcional em {selectedData.monthName}
          </Text>

          {totalSelExits > 0 ? (
            <View style={styles.categoryDistributionContainer}>
              {/* Segmented bar */}
              <View style={styles.segmentedBar}>
                {fixedPercent > 0 && (
                  <View style={[styles.segment, { width: `${fixedPercent}%` as DimensionValue, backgroundColor: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]} />
                )}
                {variablePercent > 0 && (
                  <View style={[styles.segment, { width: `${variablePercent}%` as DimensionValue, backgroundColor: '#F59E0B' }]} />
                )}
                {recurringPercent > 0 && (
                  <View style={[styles.segment, { width: `${recurringPercent}%` as DimensionValue, backgroundColor: '#0EA5E9' }]} />
                )}
                {installmentPercent > 0 && (
                  <View style={[styles.segment, { width: `${installmentPercent}%` as DimensionValue, backgroundColor: '#8B5CF6' }]} />
                )}
              </View>

              {/* Legends with detail values */}
              <View style={styles.categoryList}>
                <View style={[styles.categoryRow, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
                  <View style={[styles.catIconBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(15, 81, 50, 0.2)' : '#E8F5E9' }]}>
                    <View style={[styles.catDot, { backgroundColor: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]} />
                  </View>
                  <View style={styles.catDetails}>
                    <Text style={[styles.catName, { color: colors.text }]}>Despesas Fixas</Text>
                    <Text style={[styles.catAmount, { color: colors.textMuted }]}>{formatCurrency(selectedData.fixedVal)}</Text>
                  </View>
                  <Text style={[styles.catPct, { color: colors.text }]}>{renderPercentageIndicator(fixedPercent)}</Text>
                </View>

                <View style={[styles.categoryRow, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
                  <View style={[styles.catIconBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7' }]}>
                    <View style={[styles.catDot, { backgroundColor: '#F59E0B' }]} />
                  </View>
                  <View style={styles.catDetails}>
                    <Text style={[styles.catName, { color: colors.text }]}>Despesas Variadas</Text>
                    <Text style={[styles.catAmount, { color: colors.textMuted }]}>{formatCurrency(selectedData.variableVal)}</Text>
                  </View>
                  <Text style={[styles.catPct, { color: colors.text }]}>{renderPercentageIndicator(variablePercent)}</Text>
                </View>

                <View style={[styles.categoryRow, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
                  <View style={[styles.catIconBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(14, 165, 233, 0.2)' : '#E0F2FE' }]}>
                    <View style={[styles.catDot, { backgroundColor: '#0EA5E9' }]} />
                  </View>
                  <View style={styles.catDetails}>
                    <Text style={[styles.catName, { color: colors.text }]}>Assinaturas Recorrentes</Text>
                    <Text style={[styles.catAmount, { color: colors.textMuted }]}>{formatCurrency(selectedData.recurringVal)}</Text>
                  </View>
                  <Text style={[styles.catPct, { color: colors.text }]}>{renderPercentageIndicator(recurringPercent)}</Text>
                </View>

                <View style={[styles.categoryRow, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
                  <View style={[styles.catIconBox, { backgroundColor: colorScheme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : '#F3E8FF' }]}>
                    <View style={[styles.catDot, { backgroundColor: '#8B5CF6' }]} />
                  </View>
                  <View style={styles.catDetails}>
                    <Text style={[styles.catName, { color: colors.text }]}>Compras Parceladas</Text>
                    <Text style={[styles.catAmount, { color: colors.textMuted }]}>{formatCurrency(selectedData.installmentVal)}</Text>
                  </View>
                  <Text style={[styles.catPct, { color: colors.text }]}>{renderPercentageIndicator(installmentPercent)}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sem despesas registradas neste período.</Text>
            </View>
          )}
        </GlassCard>

        {/* CHART 3: Savings Accumulation Timeline with Target Goal */}
        <GlassCard style={[styles.card, isLargeScreen ? styles.gridCard : { width: '100%' }]}>
          <View style={styles.sectionHeader}>
            <Target color={colorScheme === 'dark' ? colors.text : "#0F5132"} size={22} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Evolução da Reserva</Text>
          </View>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Poupança e Caixinhas vs Meta de {formatCurrency(savingsGoal)}
          </Text>

          <View style={styles.savingsChartWrapper}>
            {/* The savings grid timeline */}
            <View style={styles.savingsGraphContent}>
              {/* Target Line */}
              {savingsGoal > 0 && (
                <View 
                  style={[
                    styles.goalLine, 
                    { bottom: `${Math.min((savingsGoal / maxSavingsVal) * 100, 95)}%` as DimensionValue }
                  ]}
                >
                  <View style={[styles.goalLineBadge, { backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#E6F4EA', borderColor: '#10B981' }]}>
                    <Text style={[styles.goalLineBadgeText, { color: colorScheme === 'dark' ? '#10B981' : '#137333' }]}>Meta</Text>
                  </View>
                </View>
              )}

              <View style={styles.savingsColumnsContainer}>
                {timelineData.map((item) => {
                  const currentSavings = item.summary.totalSavings;
                  const isGoalReached = savingsGoal > 0 && currentSavings >= savingsGoal;
                  return (
                    <View key={item.monthStr} style={styles.savingsCol}>
                      <View style={[styles.savingsColTrack, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#F1F3F5' }]}>
                        <View 
                          style={[
                            styles.savingsColFill, 
                            { 
                              height: scaleSavingsHeight(currentSavings),
                              backgroundColor: isGoalReached ? '#10B981' : (colorScheme === 'dark' ? '#0EAF62' : '#0F5132') 
                            }
                          ]}
                        >
                          {currentSavings > 0 && (
                            <Text style={styles.colValText}>
                              {currentSavings >= 1000 ? `${(currentSavings / 1000).toFixed(1)}k` : currentSavings.toFixed(0)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Labels Row below graph area */}
            <View style={styles.savingsLabelsRow}>
              {timelineData.map((item) => (
                <View key={item.monthStr} style={styles.savingsLabelCol}>
                  <Text style={[styles.savingsMonthText, { color: colors.textMuted }]}>
                    {item.monthName.slice(0, 3)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.savingsSummaryFooter, { borderTopColor: colors.borderGlass, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.01)' : '#F8F9FA' }]}>
            <View style={styles.reserveStatusRow}>
              <Text style={[styles.reserveStatusLabel, { color: colors.text }]}>
                Reserva Atualizada ({timelineData[timelineData.length - 1].monthName.slice(0, 3)}/{timelineData[timelineData.length - 1].year}):
              </Text>
              <Text style={[styles.reserveStatusVal, { color: colorScheme === 'dark' ? '#10B981' : '#0F5132' }]}>
                {formatCurrency(timelineData[timelineData.length - 1].summary.totalSavings)}
              </Text>
            </View>
          </View>
        </GlassCard>
      </View>
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
    gap: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  headerText: {
    color: '#0F5132',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  card: {
    padding: 24,
    borderRadius: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
  },
  gridCard: {
    flex: 1,
    minWidth: 500,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#212529',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '500',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '600',
  },
  barChartWrapper: {
    height: 240,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingBottom: 4,
  },
  barChartGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  barColumnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingTop: 20,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  barColumnContainerActive: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  barBarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 6,
    flex: 1,
    width: '100%',
    paddingBottom: 8,
  },
  barTrack: {
    width: 16,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barMonthLabel: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '600',
    marginTop: 4,
  },
  barMonthLabelActive: {
    color: '#0F5132',
    fontWeight: 'bold',
  },
  periodQuickSummary: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  quickSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  quickSummaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickMetricBox: {
    flex: 1,
    minWidth: 120,
  },
  quickMetricLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 4,
  },
  quickMetricVal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryDistributionContainer: {
    marginTop: 20,
    gap: 20,
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#E9ECEF',
    width: '100%',
  },
  segment: {
    height: '100%',
  },
  categoryList: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  catIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catDetails: {
    flex: 1,
  },
  catName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  catAmount: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
    marginTop: 2,
  },
  catPct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F5132',
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '500',
  },
  savingsChartWrapper: {
    marginTop: 20,
  },
  savingsGraphContent: {
    height: 160,
    width: '100%',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingBottom: 4,
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#10B981',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  goalLineBadge: {
    backgroundColor: '#E6F4EA',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: -10,
    marginRight: 4,
  },
  goalLineBadgeText: {
    color: '#137333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  savingsColumnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
    zIndex: 5,
  },
  savingsCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingHorizontal: 4,
  },
  savingsColTrack: {
    width: 22,
    height: '100%',
    justifyContent: 'flex-end',
  },
  savingsColFill: {
    width: '100%',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  colValText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  savingsMonthText: {
    fontSize: 13,
    color: '#6C757D',
    fontWeight: '600',
  },
  savingsLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  savingsLabelCol: {
    flex: 1,
    alignItems: 'center',
  },
  savingsSummaryFooter: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  reserveStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reserveStatusLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
  },
  reserveStatusVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F5132',
  },
});
