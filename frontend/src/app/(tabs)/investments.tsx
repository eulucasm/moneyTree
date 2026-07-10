import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinancials } from '../../context/FinancialContext';
import { useInvestmentStore, AssetClass } from '../../stores/useInvestmentStore';
import { useFinanceStore } from '../../stores/useFinanceStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useTheme } from '../../hooks/useTheme';
import GlassCard from '../../components/GlassCard';
import { Lock, TrendingUp, Plus, Edit, X, Check, Search, PieChart, Target } from 'lucide-react-native';
import PremiumGate from '../../components/PremiumGate';

const ASSET_CLASSES: AssetClass[] = ['Ações', 'Exterior', 'ETFs', 'FIIs', 'Renda Fixa', 'Criptomoedas'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatCurrencyInput = (text: string) => {
  const onlyDigits = text.replace(/\D/g, '');
  if (!onlyDigits) return '';
  const val = (parseInt(onlyDigits, 10) / 100).toFixed(2);
  return val.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
};

const parseCurrencyInput = (text: string) => {
  if (!text) return 0;
  return parseFloat(text.replace(/\./g, '').replace(',', '.')) || 0;
};

export default function InvestmentsScreen() {
  const router = useRouter();
  const { userProfile, updateUserProfile } = useFinancials();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const { colorScheme, colors } = useTheme();

  // Savings State
  const savingsGoal = useFinanceStore(s => s.savingsGoal);
  const updateSavingsGoal = useFinanceStore(s => s.updateSavingsGoal);
  const creditCards = useFinanceStore(s => s.creditCards);
  const savingsLogs = useFinanceStore(s => s.savingsLogs);
  const addSavingsItem = useFinanceStore(s => s.addSavingsItem);
  const deleteSavingsItem = useFinanceStore(s => s.deleteSavingsItem);

  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const savingsItemsList = Array.isArray(savingsLogs[currentPeriod])
    ? (savingsLogs[currentPeriod] as any[])
    : [];
  const summary = useFinancials().getMonthlySummary(currentPeriod);
  const totalSavings = summary.totalSavings;
  const progressPercent = savingsGoal > 0 ? Math.min((totalSavings / savingsGoal) * 100, 100) : 0;

  const { portfolio, getTotalInvested, getRebalancingPlan, addAsset, updateTargets, deleteAsset } = useInvestmentStore();
  const totalInvested = getTotalInvested();

  const poupancaItems = savingsItemsList.filter(item => item.type === 'poupança');
  const caixinhaItems = savingsItemsList.filter(item => item.type === 'caixinha');

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState(savingsGoal.toString());
  
  const [savingsDesc, setSavingsDesc] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsType, setSavingsType] = useState<'poupança' | 'caixinha'>('poupança');
  const [savingsBank, setSavingsBank] = useState<string>('nubank');

  const getCardColorHex = (id: string) => creditCards.find(c => c.id === id)?.color || '#10B981';
  const getCardColorName = (id: string) => creditCards.find(c => c.id === id)?.name || id;

  const renderSavingsList = (items: any[], sectionTitle: string) => {
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12, fontSize: 16 }]}>{sectionTitle}</Text>
        {items.length === 0 ? (
          <Text style={{ color: colors.textMuted }}>Nenhuma reserva cadastrada.</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {items.map(item => {
              const cardColor = getCardColorHex(item.bank);
              return (
                <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.borderGlass }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cardColor }} />
                    <View>
                      <Text style={{ color: colors.text, fontWeight: 'bold' }}>{item.description}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{getCardColorName(item.bank)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{formatCurrency(item.amount)}</Text>
                    <TouchableOpacity onPress={() => deleteSavingsItem(currentPeriod, item.id)} style={{ padding: 4 }}>
                      <X size={16} color="#DC3545" />
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
  
  const [contributionInput, setContributionInput] = useState('');
  const contributionAmount = parseCurrencyInput(contributionInput);
  
  const rebalancingPlan = getRebalancingPlan(contributionAmount);
  // Modals state
  const [addAssetModalVisible, setAddAssetModalVisible] = useState(false);
  const [assetClassTarget, setAssetClassTarget] = useState<AssetClass>('Ações');
  const [assetTicker, setAssetTicker] = useState('');
  const [assetValue, setAssetValue] = useState('');
  
  const [targetsModalVisible, setTargetsModalVisible] = useState(false);
  const [tempTargets, setTempTargets] = useState({ ...portfolio });

  const handleAddAsset = () => {
    if (!assetTicker || !assetValue) return;
    addAsset({
      assetClass: assetClassTarget,
      ticker: assetTicker,
      currentValue: parseCurrencyInput(assetValue),
    });
    setAssetTicker('');
    setAssetValue('');
    setAddAssetModalVisible(false);
  };

  const handleSaveTargets = () => {
    updateTargets({
      targetStocks: tempTargets.targetStocks,
      targetForeign: tempTargets.targetForeign,
      targetETFs: tempTargets.targetETFs,
      targetREITs: tempTargets.targetREITs,
      targetFixed: tempTargets.targetFixed,
      targetCrypto: tempTargets.targetCrypto,
    });
    setTargetsModalVisible(false);
  };

  const saveNewGoal = () => {
    const val = parseCurrencyInput(newGoalValue);
    if (!isNaN(val) && val >= 0) {
      updateSavingsGoal(val);
      setGoalModalVisible(false);
    }
  };

  const handleSaveSavings = () => {
    const val = parseCurrencyInput(savingsAmount);
    if (!isNaN(val) && val > 0 && savingsDesc.trim()) {
      addSavingsItem(currentPeriod, savingsType, savingsBank, val, savingsDesc.trim());
      setSavingsDesc('');
      setSavingsAmount('');
      setSavingsModalVisible(false);
    }
  };



  const renderClassColor = (c: AssetClass | 'Reserva') => {
    switch(c) {
      case 'Ações': return '#DC3545';
      case 'Exterior': return '#10B981';
      case 'ETFs': return '#0D6EFD';
      case 'FIIs': return '#6F42C1';
      case 'Renda Fixa': return '#FD7E14';
      case 'Criptomoedas': return '#E83E8C';
      case 'Reserva': return '#0EA5E9';
      default: return '#6C757D';
    }
  };

  return (
    <PremiumGate 
      featureName="Módulo de Investimentos" 
      description="Assuma o controle total do seu patrimônio. Crie sua carteira ideal, descubra onde aportar seu dinheiro para manter o rebalanceamento perfeito e visualize sua evolução."
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: width < 1024 ? (Platform.OS === 'ios' ? 120 : 80) : 24 }]}>
      <View style={[styles.header, { flexDirection: isLargeScreen ? 'row' : 'column', gap: isLargeScreen ? 0 : 16 }]}>
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Meus Investimentos</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>Gerencie seu patrimônio e rebalanceie sua carteira</Text>
        </View>
        <TouchableOpacity 
          style={[styles.btnTarget, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA', borderColor: colors.borderGlass }]}
          onPress={() => {
            setTempTargets({ ...portfolio });
            setTargetsModalVisible(true);
          }}
        >
          <PieChart size={16} color={colors.text} />
          <Text style={[styles.btnTargetText, { color: colors.text }]}>Percentuais Ideais</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.topCards, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass, flex: isLargeScreen ? 1 : undefined }]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Patrimônio Atual</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{formatCurrency(totalInvested)}</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass, flex: isLargeScreen ? 1 : undefined }]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Minha Reserva</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>{formatCurrency(totalSavings)}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass, flex: isLargeScreen ? 1 : undefined }]}>
          <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Quanto vou aportar hoje?</Text>
          <View style={styles.inputRow}>
            <Text style={[styles.currencySymbol, { color: colors.textMuted }]}>R$</Text>
            <TextInput 
              style={[styles.inputAporte, { color: colors.text }]}
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={contributionInput}
              onChangeText={t => setContributionInput(formatCurrencyInput(t))}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 12, lineHeight: 16 }}>
            Insira o valor que deseja investir hoje para o app sugerir onde comprar e manter sua carteira equilibrada.
          </Text>
        </View>
      </View>


      {/* Rebalancing Table */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass, marginTop: 24 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rebalanceamento Inteligente</Text>
        </View>
        
        <View style={[styles.tableHeader, { borderBottomColor: colors.borderGlass }]}>
          <Text style={[styles.colHeader, { flex: 2, color: colors.textMuted }]}>Classe</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center', color: colors.textMuted }]}>Atual</Text>
          <Text style={[styles.colHeader, { flex: 1, textAlign: 'center', color: colors.textMuted }]}>Ideal</Text>
          <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right', color: colors.textMuted }]}>
            {parseCurrencyInput(contributionInput) > 0 ? 'Aporte Sugerido' : 'Falta p/ Ideal'}
          </Text>
        </View>

        {rebalancingPlan.map(plan => {
          const classColor = renderClassColor(plan.assetClass);
          return (
            <View key={plan.assetClass} style={[styles.tableRow, { borderBottomColor: colors.borderGlass }]}>
              <View style={[styles.colClass, { flex: 2 }]}>
                <View style={[styles.colorDot, { backgroundColor: classColor }]} />
                <Text style={[styles.cellText, { color: colors.text, fontWeight: '600' }]}>{plan.assetClass}</Text>
              </View>
              <Text style={[styles.cellText, { flex: 1, textAlign: 'center', color: colors.text }]}>
                {plan.currentPercentage.toFixed(1)}%
              </Text>
              <Text style={[styles.cellText, { flex: 1, textAlign: 'center', color: colors.text }]}>
                {plan.idealPercentage.toFixed(1)}%
              </Text>
              <Text style={[
                styles.cellText, 
                { flex: 1.5, textAlign: 'right', fontWeight: 'bold' },
                plan.suggestedContribution > 0 ? { color: '#10B981' } : { color: colors.textMuted }
              ]}>
                {plan.suggestedContribution > 0 ? `+ ${formatCurrency(plan.suggestedContribution)}` : '-'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Assets List */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass, marginTop: 24 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Meus Ativos</Text>
          <TouchableOpacity 
            style={styles.btnAddAsset}
            onPress={() => setAddAssetModalVisible(true)}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.btnAddAssetText}>Adicionar Ativo</Text>
          </TouchableOpacity>
        </View>

        {portfolio.assets.length === 0 ? (
          <View style={styles.emptyState}>
            <TrendingUp size={48} color={colors.borderGlassActive} />
            <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>Nenhum ativo cadastrado.</Text>
          </View>
        ) : (
          <View>
             {[...portfolio.assets].reverse().slice(0, 5).map(asset => (
                <View key={asset.id} style={[styles.assetRow, { borderBottomColor: colors.borderGlass }]}>
                  <View style={styles.assetInfo}>
                    <Text style={[styles.assetTicker, { color: colors.text }]}>{asset.ticker}</Text>
                    <View style={[styles.badgeClass, { backgroundColor: `${renderClassColor(asset.assetClass)}15` }]}>
                      <Text style={[styles.badgeClassText, { color: renderClassColor(asset.assetClass) }]}>{asset.assetClass}</Text>
                    </View>
                  </View>
                  <View style={styles.assetActions}>
                    <Text style={[styles.assetValue, { color: colors.text }]}>{formatCurrency(asset.currentValue)}</Text>
                    <TouchableOpacity onPress={() => deleteAsset(asset.id)} style={styles.btnDelete}>
                      <X size={16} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                </View>
             ))}
              {portfolio.assets.length > 5 && (
                <TouchableOpacity 
                  style={{ marginTop: 16, padding: 12, alignItems: 'center', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8F9FA', borderRadius: 8, borderWidth: 1, borderColor: colors.borderGlass }}
                  onPress={() => router.push('/all-assets')}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>Mostrar todos</Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </View>

      {/* CARD DE POUPANÇA E RESERVA DE EMERGÊNCIA */}
      <GlassCard style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderGlass, marginTop: 24 }]}>
        <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', alignItems: isLargeScreen ? 'center' : 'stretch', gap: 16, justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colorScheme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
            </View>
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Poupança & Reserva de Emergência</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>Guarde dinheiro e acompanhe sua meta de segurança</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E8F5E9', gap: 8 }}
              onPress={() => {
                setNewGoalValue(savingsGoal.toString());
                setGoalModalVisible(true);
              }}
            >
              <Edit size={14} color={colorScheme === 'dark' ? colors.text : "#0F5132"} />
              <Text style={{ fontWeight: '600', color: colorScheme === 'dark' ? colors.text : "#0F5132" }}>Meta</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#10B981', gap: 8 }}
              onPress={() => {
                setSavingsDesc('');
                setSavingsAmount('');
                setSavingsType('poupança');
                setSavingsBank(creditCards[0]?.id || 'nubank');
                setSavingsModalVisible(true);
              }}
            >
              <Plus size={14} color="#FFFFFF" />
              <Text style={{ fontWeight: '600', color: '#FFFFFF' }}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8F9FA', padding: 24, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' }}>Poupado Acumulado</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                {formatCurrency(totalSavings)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' }}>Sua Meta</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981' }}>
                {formatCurrency(savingsGoal)}
              </Text>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <View style={{ height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E9ECEF', marginBottom: 8 }}>
              <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#10B981', borderRadius: 6 }} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted }}>{progressPercent.toFixed(1)}% atingido</Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.borderGlass, marginVertical: 8 }} />
          <View style={{ flexDirection: isLargeScreen ? 'row' : 'column', gap: 24 }}>
            <View style={{ flex: 1 }}>{renderSavingsList(poupancaItems, '💰 Poupança Tradicional')}</View>
            <View style={{ flex: 1 }}>{renderSavingsList(caixinhaItems, '📦 Caixinhas / Metas')}</View>
          </View>
        </View>
      </GlassCard>

      {/* Modals here... */}
      <Modal visible={addAssetModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Ativo</Text>
            
            <Text style={[styles.label, { color: colors.textMuted }]}>Classe</Text>
            <View style={styles.classSelector}>
              {ASSET_CLASSES.map(c => (
                <TouchableOpacity 
                  key={c}
                  style={[
                    styles.classChip, 
                    { borderColor: colors.borderGlass, backgroundColor: assetClassTarget === c ? `${renderClassColor(c)}20` : 'transparent' }
                  ]}
                  onPress={() => setAssetClassTarget(c)}
                >
                  <Text style={{ color: assetClassTarget === c ? renderClassColor(c) : colors.textMuted, fontSize: 13, fontWeight: assetClassTarget === c ? 'bold' : 'normal' }}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.textMuted, marginTop: 16 }]}>Ativo (Ex: ITSA3, Nubank, IVV)</Text>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.borderGlass }]}
              value={assetTicker}
              onChangeText={setAssetTicker}
              placeholder="Nome ou Ticker"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textMuted, marginTop: 16 }]}>Valor Total Investido (R$)</Text>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.borderGlass }]}
              value={assetValue}
              onChangeText={t => setAssetValue(formatCurrencyInput(t))}
              placeholder="0,00"
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setAddAssetModalVisible(false)}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleAddAsset}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={targetsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Definir Alocação Ideal (%)</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted, marginBottom: 16 }]}>
              A soma deve fechar em 100% para o cálculo ser exato.
            </Text>

            <View style={{ gap: 12 }}>
              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.text }]}>Ações</Text>
                <TextInput style={[styles.targetInput, { color: colors.text, borderColor: colors.borderGlass }]} value={String(tempTargets.targetStocks)} onChangeText={v => setTempTargets({...tempTargets, targetStocks: Number(v)})} keyboardType="numeric" />
              </View>
              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.text }]}>Exterior</Text>
                <TextInput style={[styles.targetInput, { color: colors.text, borderColor: colors.borderGlass }]} value={String(tempTargets.targetForeign)} onChangeText={v => setTempTargets({...tempTargets, targetForeign: Number(v)})} keyboardType="numeric" />
              </View>
              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.text }]}>ETFs</Text>
                <TextInput style={[styles.targetInput, { color: colors.text, borderColor: colors.borderGlass }]} value={String(tempTargets.targetETFs)} onChangeText={v => setTempTargets({...tempTargets, targetETFs: Number(v)})} keyboardType="numeric" />
              </View>
              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.text }]}>FIIs</Text>
                <TextInput style={[styles.targetInput, { color: colors.text, borderColor: colors.borderGlass }]} value={String(tempTargets.targetREITs)} onChangeText={v => setTempTargets({...tempTargets, targetREITs: Number(v)})} keyboardType="numeric" />
              </View>
              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.text }]}>Renda Fixa</Text>
                <TextInput style={[styles.targetInput, { color: colors.text, borderColor: colors.borderGlass }]} value={String(tempTargets.targetFixed)} onChangeText={v => setTempTargets({...tempTargets, targetFixed: Number(v)})} keyboardType="numeric" />
              </View>
              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.text }]}>Criptomoedas</Text>
                <TextInput style={[styles.targetInput, { color: colors.text, borderColor: colors.borderGlass }]} value={String(tempTargets.targetCrypto)} onChangeText={v => setTempTargets({...tempTargets, targetCrypto: Number(v)})} keyboardType="numeric" />
              </View>
            </View>

            <View style={[styles.modalActions, { marginTop: 24 }]}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setTargetsModalVisible(false)}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveTargets}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar Metas</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* METAS MODAL */}
      <Modal visible={goalModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Definir Meta da Poupança</Text>
            
            <Text style={[styles.label, { color: colors.textMuted, marginTop: 16 }]}>Valor da Meta (R$)</Text>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.borderGlass }]}
              value={newGoalValue}
              onChangeText={t => setNewGoalValue(formatCurrencyInput(t))}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setGoalModalVisible(false)}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={saveNewGoal}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar Meta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SAVINGS LOG MODAL */}
      <Modal visible={savingsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.borderGlass }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Guardar Dinheiro</Text>
            
            <Text style={[styles.label, { color: colors.textMuted }]}>O que você está guardando?</Text>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.borderGlass }]}
              value={savingsDesc}
              onChangeText={setSavingsDesc}
              placeholder="Ex: Reserva emergência, Viagem..."
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textMuted, marginTop: 16 }]}>Valor (R$)</Text>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.borderGlass }]}
              value={savingsAmount}
              onChangeText={t => setSavingsAmount(formatCurrencyInput(t))}
              keyboardType="numeric"
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.textMuted, marginTop: 16 }]}>Tipo</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setSavingsType('poupança')} style={[{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 8, alignItems: 'center' }, savingsType === 'poupança' ? { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' } : { borderColor: colors.borderGlass }]}>
                <Text style={{ color: savingsType === 'poupança' ? '#10B981' : colors.textMuted, fontWeight: 'bold' }}>Poupança</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSavingsType('caixinha')} style={[{ flex: 1, padding: 12, borderWidth: 1, borderRadius: 8, alignItems: 'center' }, savingsType === 'caixinha' ? { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' } : { borderColor: colors.borderGlass }]}>
                <Text style={{ color: savingsType === 'caixinha' ? '#10B981' : colors.textMuted, fontWeight: 'bold' }}>Caixinha</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.textMuted }]}>Onde vai ficar?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {creditCards.map(card => (
                <TouchableOpacity 
                  key={card.id}
                  onPress={() => setSavingsBank(card.id)}
                  style={[{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 }, savingsBank === card.id ? { borderColor: card.color, backgroundColor: `${card.color}20` } : { borderColor: colors.borderGlass }]}
                >
                  <Text style={{ color: savingsBank === card.id ? card.color : colors.textMuted, fontWeight: savingsBank === card.id ? 'bold' : 'normal' }}>{card.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setSavingsModalVisible(false)}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveSavings}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
    </PremiumGate>
  );
}

// Emulate Sparkles as lucide might not have it in this older version exported exactly
const Sparkles = ({ size, color, style }: any) => <Star size={size} color={color} style={style} />;
import { Star } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },
  paywallContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  paywallContent: {
    maxWidth: 400,
    alignItems: 'center',
    textAlign: 'center',
  },
  paywallIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  paywallSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F5132',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  btnTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  btnTargetText: {
    fontWeight: '600',
    fontSize: 14,
  },
  topCards: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  inputAporte: {
    fontSize: 32,
    fontWeight: 'bold',
    flex: 1,
    height: 40,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  colClass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cellText: {
    fontSize: 15,
  },
  btnAddAsset: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  btnAddAssetText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 15,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assetTicker: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeClass: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeClassText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  assetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnDelete: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  classSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  btnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  btnSave: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  targetInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: 80,
    padding: 8,
    textAlign: 'center',
    fontSize: 16,
  }
});
