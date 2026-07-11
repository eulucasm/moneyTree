import { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import apiClient from '../api/client';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

import AdminKPIs from '../components/AdminKPIs';

export default function Dashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/api/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.userProfile?.activePlan === 'premium').length;
  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0.0';
  const mrr = premiumUsers * 39.90;

  // Prepare data for Recharts
  const growthByMonth: Record<string, { total: number, premium: number }> = {};
  users.forEach(u => {
    const month = u.userProfile?.createdAt || '2025-06';
    if (!growthByMonth[month]) {
      growthByMonth[month] = { total: 0, premium: 0 };
    }
    growthByMonth[month].total += 1;
    if (u.userProfile?.activePlan === 'premium') {
      growthByMonth[month].premium += 1;
    }
  });

  const chartData = Object.keys(growthByMonth).sort().map(month => ({
    name: month,
    Usuários: growthByMonth[month].total,
    Premium: growthByMonth[month].premium,
    MRR: growthByMonth[month].premium * 39.90
  }));

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}
    >
      <header className="admin-header">
        <div>
          <h1>Dashboard Geral</h1>
          <p>Métricas principais do VerdeCo em tempo real</p>
        </div>
      </header>

      <AdminKPIs 
        totalUsers={totalUsers} 
        premiumUsers={premiumUsers} 
        conversionRate={conversionRate} 
        mrr={mrr} 
      />

      <div className="grid-2">
        <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users color="var(--color-primary)" size={20} /> Evolução de Base
          </h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="Usuários" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                <Area type="monotone" dataKey="Premium" stroke="var(--color-warning)" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp color="var(--color-warning)" size={20} /> Evolução de MRR (R$)
          </h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="MRR" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
