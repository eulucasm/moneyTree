import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Bell, LogOut, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Sidebar() {
  const { logout } = useAuthStore();

  return (
    <aside className="sidebar">
      <div className="brand">
        <ShieldAlert size={28} color="var(--color-primary)" />
        <h2>VerdeCo Admin</h2>
      </div>

      <nav className="nav-menu">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Usuários</span>
        </NavLink>
        
        <NavLink to="/payments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>Pagamentos</span>
        </NavLink>
        
        <NavLink to="/broadcast" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>Avisos</span>
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
        <button onClick={logout} className="nav-item" style={{ width: '100%', background: 'transparent', color: 'var(--color-danger)' }}>
          <LogOut size={20} />
          <span>Sair do Painel</span>
        </button>
      </div>
    </aside>
  );
}
