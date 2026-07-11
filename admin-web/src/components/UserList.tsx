import { useState } from 'react';
import { Search, Crown, ShieldAlert } from 'lucide-react';
import apiClient from '../api/client';

interface Props {
  users: any[];
  onUserUpdated: () => void;
}

export default function UserList({ users, onUserUpdated }: Props) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const profile = u.userProfile || {};
    const name = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
    const email = (profile.email || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const togglePlan = async (userId: string, currentPlan: string) => {
    if (!window.confirm(`Deseja alterar o plano do usuário?`)) return;
    setLoadingId(userId);
    try {
      const newPlan = currentPlan === 'premium' ? 'free' : 'premium';
      await apiClient.put(`/api/admin/users/${userId}/plan`, { plan: newPlan });
      onUserUpdated();
    } catch (e) {
      alert('Erro ao alterar plano');
    } finally {
      setLoadingId(null);
    }
  };

  const toggleSuspension = async (userId: string, suspended: boolean) => {
    if (!window.confirm(suspended ? 'Reativar conta?' : 'Suspender conta?')) return;
    setLoadingId(userId);
    try {
      await apiClient.put(`/api/admin/users/${userId}/suspend`, { status: suspended ? 'active' : 'suspended' });
      onUserUpdated();
    } catch (e) {
      alert('Erro ao suspender');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou email..." 
          className="input-field" 
          style={{ paddingLeft: 40 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="user-list">
        {filtered.map(u => {
          const p = u.userProfile || {};
          const isPremium = p.activePlan === 'premium';
          const isSuspended = p.status === 'suspended';

          return (
            <div key={u.id} className="list-item">
              <div className="user-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4>{p.firstName} {p.lastName}</h4>
                  <span className={`badge ${isPremium ? 'badge-premium' : 'badge-free'}`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </span>
                  {isSuspended && <span className="badge" style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}>Suspenso</span>}
                </div>
                <p>{p.email}</p>
              </div>
              
              <div className="user-actions">
                <button 
                  className="btn btn-outline" 
                  disabled={loadingId === u.id}
                  onClick={() => togglePlan(u.id, p.activePlan)}
                  title={isPremium ? "Tornar Free" : "Tornar Premium"}
                >
                  <Crown size={16} />
                </button>
                <button 
                  className="btn btn-outline" 
                  disabled={loadingId === u.id}
                  onClick={() => toggleSuspension(u.id, isSuspended)}
                  style={{ color: isSuspended ? 'var(--color-primary)' : 'var(--color-warning)', borderColor: isSuspended ? 'var(--color-primary)' : 'var(--color-warning)' }}
                  title={isSuspended ? "Reativar" : "Suspender"}
                >
                  <ShieldAlert size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 20 }}>Nenhum usuário encontrado.</p>
        )}
      </div>
    </div>
  );
}
