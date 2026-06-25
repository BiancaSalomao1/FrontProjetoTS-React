import React, { useState, useEffect } from 'react';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

interface SystemUser {
  id?: number;
  username: string;
  password?: string;
  role?: string;
}

const SystemUsersPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SystemUser>({ username: '', password: '', role: 'ADMIN' });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/system-users`, {
        headers: getAuthHeaders()
      });
      handleAuthError(response);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 404) {
        // Se a rota ainda não existir no backend, exibe uma mensagem amigável para o desenvolvedor
        setError('O endpoint /api/system-users ainda não foi implementado no backend. Essa tela exibirá os usuários quando a API estiver pronta.');
      } else {
        setError('Erro ao carregar os usuários do sistema.');
      }
    } catch (e: any) {
      if (e.message !== 'Unauthorized') {
        setError('Falha de conexão com o servidor. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) {
      setError('O campo usuário é obrigatório.');
      return;
    }

    try {
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id 
        ? `${API_BASE_URL}/api/system-users/${formData.id}` 
        : `${API_BASE_URL}/api/system-users`;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      
      handleAuthError(response);

      if (response.ok) {
        setSuccessMsg(formData.id ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
        setIsEditing(false);
        setFormData({ username: '', password: '', role: 'ADMIN' });
        loadUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Erro ao salvar o usuário do sistema.');
      }
    } catch (e: any) {
      if (e.message !== 'Unauthorized') {
        setError('Erro de conexão ao tentar salvar.');
      }
    }
  };

  const handleEdit = (user: SystemUser) => {
    setFormData({ id: user.id, username: user.username, role: user.role || 'ADMIN' });
    setIsEditing(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta credencial de acesso?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/system-users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      handleAuthError(response);

      if (response.ok) {
        setSuccessMsg('Usuário removido com sucesso!');
        loadUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Erro ao remover o usuário.');
      }
    } catch (e: any) {
      if (e.message !== 'Unauthorized') {
        setError('Erro de conexão ao tentar remover.');
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Gestão de Credenciais (Admin)</h2>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Gerencie os usuários e senhas que têm acesso de operador ao sistema.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {successMsg}
        </div>
      )}

      {/* Form Section */}
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#0f172a' }}>
          {isEditing ? 'Editar Credencial' : 'Nova Credencial de Acesso'}
        </h3>
        
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
              Nome de Usuário (Login) *
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="ex: admin, assistente1"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
              Nível de Acesso *
            </label>
            <select
              value={formData.role || 'ADMIN'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
            >
              <option value="ADMIN">Administrador</option>
              <option value="USER">Usuário (Assistente)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
              Nova Senha {isEditing && '(Deixe em branco para manter)'}
            </label>
            <input
              type="password"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              required={!isEditing}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ username: '', password: '', role: 'ADMIN' });
                }}
                style={{ padding: '10px 16px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              style={{ padding: '10px 24px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isEditing ? 'Salvar Alterações' : 'Criar Acesso'}
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div>
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#0f172a' }}>Credenciais Ativas</h3>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Carregando...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            {error.includes('não foi implementado') 
              ? 'Aguardando implementação da API /api/system-users.' 
              : 'Nenhuma credencial de acesso encontrada.'}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '0.85rem' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '0.85rem' }}>Login (Username)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '0.85rem' }}>Nível de Acesso</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', color: '#475569', fontSize: '0.85rem' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id || index} style={{ borderBottom: index === users.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.9rem' }}>#{u.id}</td>
                    <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 'bold' }}>{u.username}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {u.role || 'ADMIN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEdit(u)}
                        style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', color: '#475569', cursor: 'pointer', marginRight: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => u.id && handleDelete(u.id)}
                        disabled={u.username === 'admin'} // Evitar deletar a conta admin principal
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', color: '#ef4444', cursor: u.username === 'admin' ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 'bold', opacity: u.username === 'admin' ? 0.5 : 1 }}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemUsersPage;
