

interface Props {
  months: string[];
  growth: Record<string, number>;
}

export default function GrowthCard({ months, growth }: Props) {
  if (months.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Nenhum dado disponível.</p>;
  }

  const maxUsers = Math.max(...Object.values(growth));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Usuários registrados por mês.
      </p>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150, marginTop: 16, borderBottom: '1px solid var(--color-border-light)', paddingBottom: 8 }}>
        {months.map(m => {
          const count = growth[m];
          const heightPct = maxUsers > 0 ? (count / maxUsers) * 100 : 0;
          
          return (
            <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{count}</span>
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: 40,
                  height: `${heightPct}%`, 
                  background: 'linear-gradient(to top, var(--color-primary-light), var(--color-accent))',
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.8
                }} 
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m.split('-')[1]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
