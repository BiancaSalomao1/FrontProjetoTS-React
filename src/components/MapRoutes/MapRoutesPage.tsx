import React, { useState, useEffect } from 'react';
import { User } from '../UserSearch/UserSearchPage';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

interface RouteStop {
  id?: number;
  stopOrder: number;
  status: string;
  user: User;
}

export interface VisitRoute {
  id?: number;
  routeName: string;
  creationDate: string;
  status: string;
  stops: RouteStop[];
}

const MapRoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<VisitRoute[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<VisitRoute | null>(null);
  
  const [routeName, setRouteName] = useState('');
  const [routeStatus, setRouteStatus] = useState('PENDING');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    loadRoutes();
    loadUsers();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName) {
      alert('Dê um nome para a rota.');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('Selecione pelo menos um assistido para a rota.');
      return;
    }

    const payload = {
      routeName,
      creationDate: editingRoute ? editingRoute.creationDate : new Date().toISOString().split('T')[0],
      status: routeStatus,
      stops: selectedUsers.map((user, index) => ({
        stopOrder: index + 1,
        status: 'PENDING',
        user: { id: user.id }
      }))
    };

    try {
      const url = editingRoute && editingRoute.id 
        ? `${API_BASE_URL}/api/visit-routes/${editingRoute.id}` 
        : `${API_BASE_URL}/api/visit-routes`;
        
      const method = editingRoute && editingRoute.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingRoute ? 'Rota atualizada com sucesso!' : 'Rota salva com sucesso!');
        closeModal();
        loadRoutes();
      } else {
        handleAuthError(response);
        alert('Erro ao salvar rota.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro de conexão ao salvar.');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Tem certeza que deseja excluir esta rota?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/visit-routes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Rota excluída com sucesso!');
        loadRoutes();
      } else {
        handleAuthError(response);
        alert('Erro ao excluir rota.');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const openModalForNew = () => {
    setEditingRoute(null);
    setRouteName('');
    setRouteStatus('PENDING');
    setSelectedUsers([]);
    setIsModalOpen(true);
  };

  const openModalForEdit = (route: VisitRoute) => {
    setEditingRoute(route);
    setRouteName(route.routeName);
    setRouteStatus(route.status);
    setSelectedUsers(route.stops.sort((a,b) => a.stopOrder - b.stopOrder).map(s => s.user));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoute(null);
  };

  const toggleUserInRoute = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Montar URL do Google Maps Directions
  const getGoogleMapsUrl = (stops: RouteStop[]) => {
    if (stops.length === 0) return '';
    
    // Sort stops by order
    const sortedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
    
    // Helper para formatar o endereço em URL encoded
    const formatAddress = (u: User) => {
      if (!u || !u.addressEntity) return '';
      return encodeURIComponent(`${u.addressEntity.street}, ${u.addressEntity.number}, ${u.addressEntity.city}, ${u.addressEntity.state}`);
    };

    const origin = formatAddress(sortedStops[0].user);
    
    if (sortedStops.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${origin}`;
    }

    const destination = formatAddress(sortedStops[sortedStops.length - 1].user);
    
    let waypoints = '';
    if (sortedStops.length > 2) {
      const midStops = sortedStops.slice(1, -1);
      waypoints = '&waypoints=' + midStops.map(s => formatAddress(s.user)).join('|');
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}`;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🗺️ Gerenciamento de Rotas</h2>
        <button 
          onClick={openModalForNew}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📍 Planejar Nova Rota
        </button>
      </div>

      {loading ? (
        <p>Carregando rotas...</p>
      ) : routes.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', color: '#666' }}>
          Nenhuma rota planejada.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {routes.map((route) => (
            <div key={route.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderTop: `4px solid ${route.status === 'COMPLETED' ? '#28a745' : route.status === 'IN_PROGRESS' ? '#007bff' : '#ffc107'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{route.routeName}</h3>
                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', backgroundColor: '#eee', fontWeight: 'bold' }}>
                  {route.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                <strong>Criada em:</strong> {new Date(route.creationDate).toLocaleDateString('pt-BR')} <br/>
                <strong>Paradas:</strong> {route.stops.length}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong style={{ fontSize: '14px' }}>Roteiro:</strong>
                <ul style={{ paddingLeft: '20px', margin: '5px 0', fontSize: '13px', color: '#555' }}>
                  {route.stops.sort((a,b) => a.stopOrder - b.stopOrder).slice(0, 3).map((stop, idx) => (
                    <li key={idx}>{stop.user.name}</li>
                  ))}
                  {route.stops.length > 3 && <li><em>...e mais {route.stops.length - 3}</em></li>}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href={getGoogleMapsUrl(route.stops)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ flex: 1, textAlign: 'center', backgroundColor: '#334155', color: 'white', textDecoration: 'none', padding: '8px', borderRadius: '5px', fontSize: '14px', fontWeight: 'bold' }}
                >
                  🗺️ Abrir no Maps
                </a>
                <button onClick={() => openModalForEdit(route)} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>✏️</button>
                <button onClick={() => handleDelete(route.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0 }}>{editingRoute ? 'Editar Rota' : 'Planejar Nova Rota'}</h3>
            
            <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome da Rota *</label>
                  <input 
                    type="text" 
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    placeholder="Ex: Rota Zona Sul"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
                  <select 
                    value={routeStatus}
                    onChange={(e) => setRouteStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="COMPLETED">Concluída</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '300px' }}>
                {/* Seleção de Assistidos */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#fafafa' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Selecionar Assistidos</h4>
                  <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #eee', backgroundColor: 'white' }}>
                    {users.map(user => {
                      const isSelected = selectedUsers.find(u => u.id === user.id);
                      return (
                        <div 
                          key={user.id} 
                          onClick={() => toggleUserInRoute(user)}
                          style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: isSelected ? '#e8f4fd' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <div>
                            <strong>{user.name}</strong>
                            <div style={{ fontSize: '11px', color: '#666' }}>{user.addressEntity?.neighborhood || 'Bairro N/A'}</div>
                          </div>
                          {isSelected && <span style={{ color: '#007bff', fontWeight: 'bold' }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Roteiro Formado */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: '#f0f8ff' }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>Ordem da Rota ({selectedUsers.length} paradas)</h4>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: 0 }}>Clique nas setas para reordenar a visita.</p>
                  
                  {selectedUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>Nenhum assistido selecionado.</div>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      {selectedUsers.map((user, idx) => (
                        <div key={user.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '10px', marginBottom: '8px', borderRadius: '5px', border: '1px solid #cce5ff' }}>
                          <div style={{ fontWeight: 'bold', marginRight: '15px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                            {idx + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user.name}</div>
                            <div style={{ fontSize: '11px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.addressEntity?.street}, {user.addressEntity?.number} - {user.addressEntity?.city}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '10px' }}>
                            <button type="button" disabled={idx === 0} onClick={() => {
                              const newArr = [...selectedUsers];
                              [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                              setSelectedUsers(newArr);
                            }} style={{ border: 'none', background: 'transparent', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>⬆️</button>
                            <button type="button" disabled={idx === selectedUsers.length - 1} onClick={() => {
                              const newArr = [...selectedUsers];
                              [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
                              setSelectedUsers(newArr);
                            }} style={{ border: 'none', background: 'transparent', cursor: idx === selectedUsers.length - 1 ? 'default' : 'pointer', opacity: idx === selectedUsers.length - 1 ? 0.3 : 1 }}>⬇️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <button type="button" onClick={closeModal} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#64748b', color: 'white', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Rota</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapRoutesPage;
