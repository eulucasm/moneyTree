import { Users, Crown, Activity, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface Props {
  totalUsers: number;
  premiumUsers: number;
  conversionRate: string;
  mrr: number;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function AdminKPIs({ totalUsers, premiumUsers, conversionRate, mrr }: Props) {
  const cards = [
    {
      title: 'Total de Usuários',
      value: totalUsers,
      icon: <Users size={24} color="var(--color-primary)" />,
      subtitle: '+12% este mês'
    },
    {
      title: 'Assinantes Premium',
      value: premiumUsers,
      icon: <Crown size={24} color="var(--color-warning)" />,
      subtitle: `${conversionRate}% conversão`
    },
    {
      title: 'MRR Estimado',
      value: `R$ ${mrr.toFixed(2)}`,
      icon: <DollarSign size={24} color="var(--color-accent)" />,
      subtitle: 'R$ 39,90 / assinante'
    },
    {
      title: 'Sessões Ativas',
      value: '24',
      icon: <Activity size={24} color="var(--color-text-muted)" />,
      subtitle: 'Neste momento'
    }
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid-4">
      {cards.map((c, i) => (
        <motion.div variants={item} key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{c.title}</span>
            <div style={{ padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
              {c.icon}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: 4 }}>{c.value}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{c.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
