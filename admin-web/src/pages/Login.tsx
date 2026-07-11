import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('Credenciais inválidas ou acesso negado.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError('Falha ao autenticar com Google.');
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--color-primary)" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8, color: 'var(--color-primary)' }}>VerdeCo Admin</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>Acesso restrito ao backoffice</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder="E-mail de administrador"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p style={{ color: 'var(--color-danger)', fontSize: '0.9rem' }}>{error}</p>}
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Autenticando...' : 'Entrar com E-mail'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--color-border-light)' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: '100%', backgroundColor: 'white', color: '#444', borderColor: '#DDD' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    </div>
  );
}
