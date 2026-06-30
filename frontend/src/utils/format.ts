/**
 * Formata um valor numérico para a moeda brasileira (R$) com pontos como separadores de milhar
 * e vírgula como separador decimal.
 * Exemplo: 125140.55 -> R$ 125.140,55
 */
export const formatCurrency = (val: number): string => {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  const formatted = val.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${parts.join(',')}`;
};
