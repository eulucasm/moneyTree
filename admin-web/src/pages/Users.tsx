import { useState, useEffect } from 'react';
import { Search, Crown, ShieldAlert, Trash2, Users as UsersIcon, Clock } from 'lucide-react';
import apiClient from '../api/client';
import { motion } from 'framer-motion';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const promoteUser = async (id: string) => {
    if (!confirm('Deseja promover este usuário para Premium temporariamente?')) return;
    try {
      await apiClient.put(`/api/admin/users/${id}/plan`, { plan: 'premium' });
      fetchUsers();
    } catch (error) {
      alert('Erro ao atualizar plano.');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('ATENÇÃO: Deseja apagar todos os dados deste usuário? Esta ação é irreversível.')) return;
    try {
      await apiClient.delete(`/api/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert('Erro ao deletar usuário.');
    }
  };

  const filteredUsers = users.filter(u => {
    const email = u?.email || '';
    const firstName = u?.userProfile?.firstName || '';
    const searchLower = search.toLowerCase();
    
    return email.toLowerCase().includes(searchLower) || 
           firstName.toLowerCase().includes(searchLower);
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <header className="admin-header">
        <div>
          <h1>Gestão de Usuários</h1>
          <p>Gerencie permissões, planos e dados dos usuários</p>
        </div>
      </header>

      <div className="glass-panel">
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 16, top: 15 }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar por nome ou e-mail..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>
          <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>
            Atualizar
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <div className="user-list">
            {filteredUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 24 }}>
                Nenhum usuário encontrado.
              </p>
            ) : (
              filteredUsers.map((u) => (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  key={u.id} 
                  className="list-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ 
                      width: 48, height: 48, borderRadius: '50%', 
                      background: u.userProfile?.activePlan === 'premium' ? 'rgba(255,165,2,0.1)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${u.userProfile?.activePlan === 'premium' ? 'rgba(255,165,2,0.3)' : 'rgba(255,255,255,0.1)'}`
                    }}>
                      {u.userProfile?.activePlan === 'premium' ? <Crown size={20} color="var(--color-warning)" /> : <UsersIcon size={20} color="var(--color-text-muted)" />}
                    </div>
                    
                    <div className="user-info">
                      <h4>{u.userProfile?.firstName ? `${u.userProfile.firstName} ${u.userProfile.lastName || ''}` : 'Usuário Novo'}</h4>
                      <p>{u.email}</p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {u.userProfile?.activePlan === 'premium' ? (
                          <span className="badge badge-premium">Premium</span>
                        ) : (
                          <span className="badge badge-free">Basic</span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {u.userProfile?.createdAt ? `Desde ${u.userProfile.createdAt}` : 'Recente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="user-actions">
                    {u.userProfile?.activePlan !== 'premium' && (
                      <button 
                        className="btn btn-outline" 
                        onClick={() => promoteUser(u.id)}
                        title="Promover para Premium"
                        style={{ padding: '8px 12px' }}
                      >
                        <Crown size={16} /> Dar Premium
                      </button>
                    )}
                    {u.userProfile?.role === 'admin' ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldAlert size={14} /> Admin
                      </span>
                    ) : (
                      <button 
                        className="btn btn-danger" 
                        onClick={() => deleteUser(u.id)}
                        title="Apagar dados do usuário"
                        style={{ padding: '8px 12px' }}
                      >
                        <Trash2 size={16} /> Apagar
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
