import React, { useState, useEffect } from 'react';
import { User } from './UserSearchPage';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

const SkillsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal form states
  const [skillsText, setSkillsText] = useState('');
  const [observations, setObservations] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data: User[] = await response.json();
        // Filtrar apenas usuários ativos inicialmente
        setUsers(data.filter(u => u.status === 'ATIVO'));
      } else {
        handleAuthError(response);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUserFicha = (user: User) => {
    setSelectedUser(user);
    // Recupera as habilidades que vieram do back (se houver, mas como set, pode vir vazio no MVP)
    setSkillsText(''); 
    
    // Observação padrão solicitada
    const defaultObs = "Digite se houve encaminhamento ou indicação de formação e comprometimento do assistido";
    setObservations(user.observations && user.observations.trim().length > 0 ? user.observations : defaultObs);
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Converte o texto de habilidades (ex: "Cozinha, Limpeza") para um array de objetos se for enviar pro back
    // const habilitySet = skillsText.split(',').map(s => ({ name: s.trim() })).filter(s => s.name.length > 0);

    // O payload inclui o resto das informações do usuário para não perder nada.
    const payload = {
      ...selectedUser,
      observations: observations,
      // Descomente a linha abaixo QUANDO ADICIONAR CASCADE.PERSIST NO BACKEND
      // habilitySet: habilitySet 
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeaders() 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Ficha atualizada com sucesso!');
        loadUsers();
        closeModal();
      } else {
        handleAuthError(response);
        alert('Erro ao atualizar. (Se adicionou habilidades, certifique-se de que o backend suporta cascade).');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>💡 Habilidades</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>Listagem de usuários ATIVOS para cadastro de habilidades e avaliações.</p>

      {loading ? (
        <p>Carregando usuários...</p>
      ) : users.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#666' }}>
          Nenhum usuário ativo encontrado.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>ID</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Nome do Assistido</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}>{user.id}</td>
                  <td style={{ padding: '15px', fontWeight: 'bold' }}>{user.name}</td>
                  <td style={{ padding: '15px' }}>{user.email}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <button 
                      onClick={() => openUserFicha(user)}
                      style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Abrir Ficha 📋
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal / Ficha do Usuário */}
      {isModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              Ficha do Assistido: {selectedUser.name}
            </h3>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  🎯 Habilidades a Cadastrar
                </label>
                <input 
                  type="text" 
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="Ex: Culinária, Costura, Informática Básica..."
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                  Separe as habilidades por vírgula. (Atenção: A integração destas habilidades ao backend requer ajuste no JPA Cascade).
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                  📝 Observação / Encaminhamento
                </label>
                <textarea 
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={5}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#64748b', color: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  Salvar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
