import { useState } from 'react';
import { Send, AlertTriangle, Info, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Broadcast() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Mensagem enviada para todos os usuários com sucesso!');
      setTitle('');
      setMessage('');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}
    >
      <header className="admin-header">
        <div>
          <h1>Central de Avisos</h1>
          <p>Envie comunicados globais (Broadcast) para o aplicativo</p>
        </div>
      </header>

      <div className="glass-panel">
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button 
              type="button"
              className={`btn ${type === 'info' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setType('info')}
              style={{ flex: '1 1 140px' }}
            >
              <Info size={18} /> Informativo
            </button>
            <button 
              type="button"
              className={`btn ${type === 'alert' ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => setType('alert')}
              style={{ flex: '1 1 140px', backgroundColor: type === 'alert' ? 'var(--color-danger)' : 'transparent', color: type === 'alert' ? 'white' : 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
            >
              <AlertTriangle size={18} /> Alerta Crítico
            </button>
            <button 
              type="button"
              className={`btn ${type === 'promo' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setType('promo')}
              style={{ flex: '1 1 140px', backgroundColor: type === 'promo' ? 'var(--color-warning)' : 'transparent', color: type === 'promo' ? 'black' : 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
            >
              <Bell size={18} /> Promoção
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-muted)', fontWeight: 500 }}>Título da Mensagem</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Nova atualização disponível!" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--color-text-muted)', fontWeight: 500 }}>Conteúdo</label>
            <textarea 
              className="input-field" 
              placeholder="Digite a mensagem que aparecerá para os usuários..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            <Send size={18} /> {loading ? 'Enviando...' : 'Disparar Broadcast'}
          </button>
        </form>
      </div>
      
      <div className="glass-panel" style={{ opacity: 0.7 }}>
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell color="var(--color-text-muted)" size={18} /> Preview no App
        </h3>
        <div style={{ padding: 16, borderLeft: `4px solid ${type === 'alert' ? 'var(--color-danger)' : type === 'promo' ? 'var(--color-warning)' : 'var(--color-primary)'}`, background: 'rgba(0,0,0,0.2)', borderRadius: '0 8px 8px 0' }}>
          <h4 style={{ marginBottom: 4 }}>{title || 'Título da Mensagem'}</h4>
          <p style={{ color: 'var(--color-text-muted)' }}>{message || 'O conteúdo da sua mensagem aparecerá aqui.'}</p>
        </div>
      </div>
    </motion.div>
  );
}
