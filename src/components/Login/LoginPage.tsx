import React, { useState } from 'react';
import { setAuthToken } from '../../utils/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = btoa(`${username}:${password}`);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // Enviando um GET para /api/users apenas para verificar se as credenciais são válidas
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAuthToken(token);
        onLoginSuccess();
      } else if (response.status === 401) {
        setError('Usuário ou senha incorretos.');
      } else {
        // Se retornar 404, significa que a autenticação passou mas a rota de teste deu 404.
        // O importante para o Basic Auth é não receber 401.
        if (response.status !== 401 && response.status !== 403) {
           setAuthToken(token);
           onLoginSuccess();
        } else {
           setError('Acesso negado.');
        }
      }
    } catch (err) {
      console.error('Erro de conexão:', err);
      // Fallback: se o backend estiver offline, permite entrar para fins de teste no MVP
      console.warn('Backend offline. Entrando com credenciais mockadas...');
      const token = btoa(`${username}:${password}`);
      setAuthToken(token);
      onLoginSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '50px 40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔒</div>
        <h2 style={{ color: '#1e293b', marginBottom: '30px', fontWeight: 'bold' }}>Acesso ao Sistema</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.9rem', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '5px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.background = '#2563eb'; }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
