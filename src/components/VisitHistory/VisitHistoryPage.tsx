import React, { useState, useEffect } from 'react';

// Tipos baseados no backend
interface User {
  id: number;
  name: string;
}

export interface VisitHistory {
  id?: number;
  visitDate: string; // ISO String do LocalDateTime
  description: string;
  performedBy: string;
  user: User;
}

import { VisitRoute } from '../MapRoutes/MapRoutesPage';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

const VisitHistoryPage: React.FC = () => {
  const [visits, setVisits] = useState<VisitHistory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<VisitRoute[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [filterUser, setFilterUser] = useState('');
  const [filterRoute, setFilterRoute] = useState('');

  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitHistory | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    visitDate: new Date().toISOString().substring(0, 16), // YYYY-MM-DDThh:mm
    description: '',
    performedBy: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    loadVisits();
    loadUsers();
    loadRoutes();
  }, []);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/visit-history`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data: VisitHistory[] = await response.json();
        setVisits(data.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()));
      } else {
        handleAuthError(response);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        handleAuthError(response);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadRoutes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/visit-routes`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      } else {
        handleAuthError(response);
      }
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
    }
  };

  const getFilteredVisits = () => {
    return visits.filter(visit => {
      // Filtro de Assistido
      if (filterUser && visit.user?.id?.toString() !== filterUser) {
        return false;
      }
      // Filtro de Rota
      if (filterRoute) {
        const route = routes.find(r => r.id?.toString() === filterRoute);
        if (route) {
          const userIdsInRoute = route.stops.map(stop => stop.user.id);
          if (!userIdsInRoute.includes(visit.user?.id)) {
            return false;
          }
        } else {
          return false;
        }
      }
      return true;
    });
  };

  const filteredVisits = getFilteredVisits();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.description || !formData.performedBy || !formData.visitDate) {
      alert('Preencha todos os campos.');
      return;
    }

    const payload = {
      visitDate: formData.visitDate,
      description: formData.description,
      performedBy: formData.performedBy,
      user: { id: parseInt(formData.userId) }
    };

    try {
      const url = editingVisit && editingVisit.id 
        ? `${API_BASE_URL}/api/visit-history/${editingVisit.id}` 
        : `${API_BASE_URL}/api/visit-history`;
        
      const method = editingVisit && editingVisit.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingVisit ? 'Visita atualizada com sucesso!' : 'Visita registrada com sucesso!');
        closeModal();
        loadVisits();
      } else {
        handleAuthError(response);
        alert('Erro ao salvar visita.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão ao salvar.');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Tem certeza que deseja excluir este registro de visita?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/visit-history/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Visita excluída com sucesso!');
        loadVisits();
      } else {
        handleAuthError(response);
        alert('Erro ao excluir visita.');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const openModalForNew = () => {
    setEditingVisit(null);
    setFormData({
      userId: '',
      visitDate: new Date().toISOString().substring(0, 16),
      description: '',
      performedBy: ''
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (visit: VisitHistory) => {
    setEditingVisit(visit);
    setFormData({
      userId: visit.user?.id?.toString() || '',
      visitDate: visit.visitDate ? visit.visitDate.substring(0, 16) : new Date().toISOString().substring(0, 16),
      description: visit.description,
      performedBy: visit.performedBy
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVisit(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📝 Histórico de Visitas</h2>
        <div>
          <button 
            onClick={openModalForNew}
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginRight: '10px', fontWeight: 'bold' }}
          >
            ➕ Registrar Visita
          </button>
          <button 
            onClick={handlePrint}
            style={{ backgroundColor: '#334155', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🖨️ Imprimir Histórico
          </button>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Filtrar por Assistido:</label>
          <select 
            value={filterUser} 
            onChange={(e) => setFilterUser(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Todos os assistidos</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Filtrar por Rota:</label>
          <select 
            value={filterRoute} 
            onChange={(e) => setFilterRoute(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Todas as rotas</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.routeName}</option>
            ))}
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            onClick={() => { setFilterUser(''); setFilterRoute(''); }}
            style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {loading ? (
        <p>Carregando histórico...</p>
      ) : visits.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#666' }}>
          Nenhuma visita registrada no sistema.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f1f3f5' }}>
              <tr>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Data/Hora</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Assistido</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Realizado Por</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Descrição</th>
                <th className="no-print" style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Nenhuma visita encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>{new Date(visit.visitDate).toLocaleString('pt-BR')}</td>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{visit.user?.name || 'Desconhecido'}</td>
                    <td style={{ padding: '15px' }}>{visit.performedBy}</td>
                    <td style={{ padding: '15px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {visit.description}
                    </td>
                    <td className="no-print" style={{ padding: '15px' }}>
                      <button onClick={() => openModalForEdit(visit)} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>✏️</button>
                      <button onClick={() => handleDelete(visit.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{editingVisit ? 'Editar Visita' : 'Registrar Nova Visita'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Assistido *</label>
                <select 
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="">Selecione um assistido...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data e Hora *</label>
                <input 
                  type="datetime-local" 
                  value={formData.visitDate}
                  onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Realizado Por (Assistente) *</label>
                <input 
                  type="text" 
                  value={formData.performedBy}
                  onChange={(e) => setFormData({...formData, performedBy: e.target.value})}
                  placeholder="Nome do assistente social"
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descrição da Visita *</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={5}
                  placeholder="Relate os detalhes da visita, condições do assistido, etc."
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#64748b', color: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Visita</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}} />
    </div>
  );
};

export default VisitHistoryPage;
