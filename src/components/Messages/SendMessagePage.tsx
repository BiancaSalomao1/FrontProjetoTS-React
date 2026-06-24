import React, { useState, useEffect } from 'react';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

interface User {
  id: number;
  name: string;
  phone: string;
}

interface VisitRoute {
  id: number;
  date: string;
  status: string;
  stops: { user: User; status: string }[];
}

const formatPhone = (phone: string) => {
  if (!phone) return '';
  // Remove tudo que não for número
  let cleaned = phone.replace(/\D/g, '');
  // Se não tiver DDI, adiciona 55 (Brasil)
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
};

const sendWhatsApp = (phone: string, text: string) => {
  const formattedPhone = formatPhone(phone);
  if (!formattedPhone) {
    alert('Telefone inválido ou não cadastrado para este assistido.');
    return;
  }
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

const SendMessagePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'individual' | 'route'>('individual');
  
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<VisitRoute[]>([]);
  const [loading, setLoading] = useState(false);

  // Individual Tab State
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [messageText, setMessageText] = useState('');

  // Route Tab State
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [routeMessage, setRouteMessage] = useState('Olá! Nossa equipe tentará passar na sua residência hoje. Estaremos na sua área nas próximas horas. Confirme se haverá alguém no local.');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      const usersRes = await fetch(`${API_BASE_URL}/api/users`, { headers });
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }

      const routesRes = await fetch(`${API_BASE_URL}/api/visit-routes`, { headers });
      if (routesRes.ok) {
        const allRoutes: VisitRoute[] = await routesRes.json();
        // Filtra apenas rotas que não estão completas
        setRoutes(allRoutes.filter(r => r.status !== 'COMPLETED'));
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendIndividual = () => {
    const user = users.find(u => u.id.toString() === selectedUserId);
    if (!user) {
      alert('Selecione um assistido.');
      return;
    }
    if (!messageText) {
      alert('Digite uma mensagem.');
      return;
    }
    sendWhatsApp(user.phone, messageText);
  };

  const handleSendRouteUser = (user: User) => {
    if (!routeMessage) {
      alert('Digite a mensagem da rota.');
      return;
    }
    sendWhatsApp(user.phone, routeMessage);
  };

  const getSelectedRoute = () => {
    return routes.find(r => r.id.toString() === selectedRouteId);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>💬 Envio de Mensagens</h2>
        <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Utilize o WhatsApp para notificar os assistidos rapidamente.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('individual')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'individual' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'individual' ? '#4f46e5' : '#64748b',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Mensagem Individual
        </button>
        <button
          onClick={() => setActiveTab('route')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'route' ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === 'route' ? '#4f46e5' : '#64748b',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Mensagem para Rota
        </button>
      </div>

      {loading && <div style={{ color: '#64748b' }}>Carregando dados...</div>}

      {!loading && activeTab === 'individual' && (
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#0f172a' }}>Mensagem Direta</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
              Selecionar Assistido
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            >
              <option value="">-- Selecione --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} (Tel: {u.phone || 'Não informado'})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
              Mensagem
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Digite a mensagem que deseja enviar..."
              rows={5}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <button
            onClick={handleSendIndividual}
            style={{ padding: '12px 24px', background: '#25d366', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}
          >
            <span>📱</span> Abrir no WhatsApp
          </button>
        </div>
      )}

      {!loading && activeTab === 'route' && (
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', flex: '1 1 300px', minWidth: '300px', alignSelf: 'flex-start' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#0f172a' }}>Configuração do Disparo</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
                Selecionar Rota Ativa
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
              >
                <option value="">-- Selecione uma rota --</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>Rota do dia {new Date(r.date).toLocaleDateString()} (ID: {r.id})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
                Modelo de Mensagem (Para todos da rota)
              </label>
              <textarea
                value={routeMessage}
                onChange={(e) => setRouteMessage(e.target.value)}
                rows={5}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={{ flex: '2 1 400px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px 0', color: '#0f172a' }}>Destinatários da Rota</h3>
            
            {!selectedRouteId ? (
              <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                Selecione uma rota para carregar os contatos.
              </div>
            ) : getSelectedRoute()?.stops.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                Esta rota não possui paradas agendadas.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getSelectedRoute()?.stops.map((stop, index) => (
                  <div key={index} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#1e293b' }}>{stop.user?.name || 'Assistido Desconhecido'}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tel: {stop.user?.phone || 'Não informado'}</span>
                    </div>
                    <button
                      onClick={() => handleSendRouteUser(stop.user)}
                      disabled={!stop.user?.phone}
                      style={{ 
                        padding: '8px 16px', 
                        background: stop.user?.phone ? '#25d366' : '#e2e8f0', 
                        color: stop.user?.phone ? 'white' : '#94a3b8', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: stop.user?.phone ? 'pointer' : 'not-allowed', 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                      }}
                    >
                      <span>📱</span> Enviar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMessagePage;
