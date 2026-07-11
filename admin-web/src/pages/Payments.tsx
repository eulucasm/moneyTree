import { CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for UI demonstration since backend isn't ready
const mockPayments = [
  { id: 'pay_123', user: 'joao.silva@email.com', amount: 'R$ 39,90', plan: 'Premium Anual', status: 'success', date: 'Hoje, 14:30' },
  { id: 'pay_124', user: 'maria.souza@email.com', amount: 'R$ 39,90', plan: 'Premium Anual', status: 'success', date: 'Hoje, 10:15' },
  { id: 'pay_125', user: 'pedro.santos@email.com', amount: 'R$ 39,90', plan: 'Premium Anual', status: 'failed', date: 'Ontem, 18:45' },
  { id: 'pay_126', user: 'ana.costa@email.com', amount: 'R$ 39,90', plan: 'Premium Anual', status: 'pending', date: 'Ontem, 16:20' },
];

export default function Payments() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <header className="admin-header">
        <div>
          <h1>Integração Abacate Pay</h1>
          <p>Monitoramento de transações, assinaturas e webhooks</p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }}></div>
            <span style={{ fontWeight: 600 }}>Webhook Ativo</span>
          </div>
        </div>
      </header>

      <div className="glass-panel">
        <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard color="var(--color-primary)" /> Últimas Transações
        </h3>
        
        <div className="user-list">
          {mockPayments.map((p) => (
            <div key={p.id} className="list-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: '10px', 
                  background: p.status === 'success' ? 'rgba(32, 201, 151, 0.1)' : p.status === 'failed' ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255, 165, 2, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {p.status === 'success' ? <CheckCircle2 color="var(--color-primary)" size={20} /> :
                   p.status === 'failed' ? <XCircle color="var(--color-danger)" size={20} /> :
                   <Clock color="var(--color-warning)" size={20} />}
                </div>
                
                <div className="user-info">
                  <h4>{p.user}</h4>
                  <p>{p.plan} • {p.date}</p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '1.1rem' }}>{p.amount}</h4>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 600,
                  color: p.status === 'success' ? 'var(--color-primary)' : p.status === 'failed' ? 'var(--color-danger)' : 'var(--color-warning)'
                }}>
                  {p.status === 'success' ? 'Aprovado' : p.status === 'failed' ? 'Recusado' : 'Processando'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
