import { useState, useEffect } from 'react';
import UserSearch from './components/UserSearch/UserSearchPage';
import ClientForm from './components/ClientForm/ClientForm';
import VisitHistoryPage from './components/VisitHistory/VisitHistoryPage';
import MapRoutesPage from './components/MapRoutes/MapRoutesPage';
import SkillsPage from './components/UserSearch/SkillsPage';
import LoginPage from './components/Login/LoginPage';
import SystemUsersPage from './components/SystemUsers/SystemUsersPage';
import SendMessagePage from './components/Messages/SendMessagePage';
import SupportTicketPage from './components/Support/SupportTicketPage';
import { getAuthToken, clearAuthToken, getAuthHeaders, getLoggedInUsername, isAdminUser } from './utils/auth';

export interface Address {
  id?: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export interface Dependent {
  id?: number;
  name: string;
  birthDate?: string;
  age?: number;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  phone: string;
  addressEntity: Address;
  income: number;
  dependents: Dependent[];
  status: string;
  observations: string;
  photoPath?: string;
}

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'form' | 'search' | 'history' | 'routes' | 'skills' | 'system-users' | 'messages' | 'support'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const username = getLoggedInUsername() || 'Assistente';
  const userInitials = username.substring(0, 2).toUpperCase();
  const isAdmin = isAdminUser();

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotificationText, setNewNotificationText] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Bem-vindo ao novo sistema de Gestão Unificação Kardecista RP.', author: 'Sistema', time: '1h atrás' }
  ]);

  // Dashboard Stats & Data
  const [stats, setStats] = useState({
    totalUsers: 0,
    visitsToday: 0,
    newRegistrations: 0,
    pendingVisits: 0
  });
  const [mapStats, setMapStats] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0
  });
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  const loadDashboardData = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    try {
      const headers = getAuthHeaders();
      
      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/api/users`, { headers });
      let usersList: any[] = [];
      if (usersRes.ok) {
        usersList = await usersRes.json();
      }

      // Fetch visits
      const visitsRes = await fetch(`${API_BASE_URL}/api/visit-history`, { headers });
      let visitsList: any[] = [];
      if (visitsRes.ok) {
        visitsList = await visitsRes.json();
      }

      // Fetch routes
      const routesRes = await fetch(`${API_BASE_URL}/api/visit-routes`, { headers });
      let routesList: any[] = [];
      if (routesRes.ok) {
        routesList = await routesRes.json();
      }

      // Calculate stats
      const todayStr = new Date().toISOString().split('T')[0];
      const todayVisits = visitsList.filter((v: any) => v.visitDate === todayStr).length;
      
      let pendingVisitsCount = 0;
      let mapCompleted = 0;
      let mapInProgress = 0;
      let mapPending = 0;

      routesList.forEach((r: any) => {
        if (r.status === 'COMPLETED') {
          mapCompleted += r.stops?.length || 0;
        } else {
          r.stops?.forEach((s: any) => {
            if (s.status === 'PENDING') {
              pendingVisitsCount++;
              mapPending++;
            } else if (s.status === 'COMPLETED') {
              mapCompleted++;
            } else {
              mapInProgress++;
            }
          });
        }
      });

      setMapStats({ completed: mapCompleted, inProgress: mapInProgress, pending: mapPending });

      setStats({
        totalUsers: usersList.length || 0,
        visitsToday: todayVisits || 0,
        newRegistrations: Math.round(usersList.length * 0.1) || 0,
        pendingVisits: pendingVisitsCount || 0
      });

      // Calculate upcoming visits
      const activeStops: any[] = [];
      routesList.forEach((r: any) => {
        if (r.status !== 'COMPLETED') {
          r.stops.forEach((s: any) => {
            if (s.status === 'PENDING' && s.user) {
              activeStops.push({
                time: s.stopOrder === 1 ? '09:00' : s.stopOrder === 2 ? '10:30' : s.stopOrder === 3 ? '14:00' : '15:30',
                userName: s.user.name,
                address: s.user.addressEntity ? `${s.user.addressEntity.street}, ${s.user.addressEntity.number} - ${s.user.addressEntity.neighborhood}` : 'Endereço não informado',
                status: 'Hoje'
              });
            }
          });
        }
      });

      if (activeStops.length > 0) {
        setUpcomingVisits(activeStops.slice(0, 5));
      } else {
        setUpcomingVisits([]);
      }

      // Calculate recent activities
      const activities: any[] = [];
      const latestUsers = [...usersList].reverse().slice(0, 2);
      latestUsers.forEach(u => {
        activities.push({
          title: 'Novo assistido cadastrado',
          description: `O cadastro de ${u.name} foi realizado no sistema.`,
          time: 'Hoje',
          icon: '👤'
        });
      });
      const latestVisits = [...visitsList].reverse().slice(0, 2);
      latestVisits.forEach(v => {
        activities.push({
          title: 'Visita concluída',
          description: `Visita realizada para ${v.user?.name || 'Assistido'}.`,
          time: 'Hoje',
          icon: '✅'
        });
      });

      if (activities.length > 0) {
        setRecentActivities(activities.slice(0, 4));
      } else {
        setRecentActivities([]);
      }

    } catch (e) {
      console.error('Erro ao carregar dados do dashboard:', e);
      setUpcomingVisits([]);
      setRecentActivities([]);
      setStats({
        totalUsers: 0,
        visitsToday: 0,
        newRegistrations: 0,
        pendingVisits: 0
      });
      setMapStats({ completed: 0, inProgress: 0, pending: 0 });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, currentPage]);

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Helper formatting for date
  const todayDateStr = () => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
    const date = new Date().toLocaleDateString('pt-BR', options);
    return date.charAt(0).toUpperCase() + date.slice(1);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 1. Sidebar (Barra Lateral Esquerda) */}
      <aside className="no-print" style={{
        width: '280px',
        background: '#1e1b4b',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
        zIndex: 10
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            background: '#4f46e5',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>ERP Social</h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assistência Social</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{
          flex: 1,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto'
        }}>
          {/* Main Dashboard Link */}
          <div>
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: currentPage === 'home' ? '#4f46e5' : 'transparent',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: '600',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              📊 Dashboard
            </button>
          </div>

          {/* Group: CADASTROS */}
          <div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px', paddingLeft: '16px' }}>
              Cadastros
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => { setSelectedUser(null); setCurrentPage('form'); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === 'form' && !selectedUser ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: currentPage === 'form' && !selectedUser ? 'white' : '#cbd5e1',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                👥 Nova Família
              </button>
              <button
                onClick={() => setCurrentPage('search')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === 'search' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: currentPage === 'search' ? 'white' : '#cbd5e1',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                👤 Assistidos
              </button>
              <button
                onClick={() => setCurrentPage('routes')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === 'routes' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: currentPage === 'routes' ? 'white' : '#cbd5e1',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                🗺️ Rotas e Mapas
              </button>
              <button
                onClick={() => setCurrentPage('skills')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === 'skills' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: currentPage === 'skills' ? 'white' : '#cbd5e1',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                💡 Habilidades
              </button>
            </div>
          </div>

          {/* Group: ATENDIMENTOS */}
          <div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px', paddingLeft: '16px' }}>
              Atendimentos
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage('history')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === 'history' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: currentPage === 'history' ? 'white' : '#cbd5e1',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                📝 Histórico de Visitas
              </button>
              <button
                onClick={() => setCurrentPage('messages')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: currentPage === 'messages' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: currentPage === 'messages' ? 'white' : '#cbd5e1',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                💬 Enviar Mensagem
              </button>
            </div>
          </div>

          {/* Group: CONFIGURAÇÕES */}
          <div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px', paddingLeft: '16px' }}>
              Configurações
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {isAdmin && (
                <button
                  onClick={() => setCurrentPage('system-users')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: currentPage === 'system-users' ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: currentPage === 'system-users' ? 'white' : '#cbd5e1',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  ⚙️ Usuários do Sistema
                </button>
              )}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#fca5a5',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                🚪 Sair do Sistema
              </button>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer Help Box */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: '8px' }}>👩‍💻</span>
            <strong style={{ fontSize: '0.85rem', display: 'block', color: 'white' }}>Precisa de ajuda?</strong>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '12px' }}>Nossa equipe está pronta para te atender.</span>
            <button 
              onClick={() => setCurrentPage('support')}
              style={{
              background: '#4f46e5',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%'
            }}>
              Abrir chamado
            </button>
          </div>
          <div style={{
            marginTop: '15px',
            textAlign: 'center',
            fontSize: '0.7rem',
            color: '#64748b'
          }}>
            Versão 2.1.0 | 100% Seguro
          </div>
        </div>
      </aside>

      {/* 2. Main Area (Direita) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Top Header */}
        <header className="no-print" style={{
          height: '70px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          flexShrink: 0
        }}>
          {/* Top Header Search */}
          <div style={{
            position: 'relative',
            width: '350px'
          }}>
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar usuários, famílias, visitas..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage('search');
                }
              }}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>

          {/* Top Header Profile & Notifications */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span style={{ fontSize: '1.3rem' }}>🔔</span>
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.65rem',
                    borderRadius: '50%',
                    width: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>{notifications.length}</span>
                )}
              </div>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: '-10px',
                  width: '320px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0',
                  zIndex: 50,
                  overflow: 'hidden'
                }}>
                  <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem' }}>Avisos do Sistema</h4>
                    {notifications.length > 0 && (
                      <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>Limpar</button>
                    )}
                  </div>
                  
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
                          <button 
                            onClick={() => setNotifications(notifications.filter(n => n.id !== notif.id))}
                            style={{ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.8rem', padding: '4px' }}
                            title="Apagar aviso"
                          >
                            ✖
                          </button>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#334155', paddingRight: '16px' }}>{notif.text}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                            <span>Por: {notif.author}</span>
                            <span>{notif.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {isAdmin && (
                    <div style={{ background: '#f1f5f9', padding: '12px', borderTop: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>Disparar Aviso Global</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          value={newNotificationText}
                          onChange={(e) => setNewNotificationText(e.target.value)}
                          placeholder="Digite a mensagem..." 
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none' }}
                        />
                        <button 
                          onClick={() => {
                            if (!newNotificationText.trim()) return;
                            setNotifications([{ id: Date.now(), text: newNotificationText, author: username, time: 'Agora' }, ...notifications]);
                            setNewNotificationText('');
                          }}
                          style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Help Question mark */}
            <div 
              style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}
              onClick={() => setCurrentPage('support')}
              title="Abrir Chamado / Ajuda"
            >
              ❓
            </div>

            {/* Vertical Separator */}
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

            {/* Profile Dropdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#6366f1',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                textTransform: 'uppercase'
              }}>
                {userInitials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', textTransform: 'capitalize' }}>{username}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{isAdmin ? 'Administrador' : 'Assistente Social'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Container */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          minWidth: 0
        }}>
          {currentPage === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Dashboard Banner Greeting */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 4px 0', textTransform: 'capitalize' }}>
                    Olá, {username}! 👋
                  </h2>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Veja o que está acontecendo hoje.</p>
                </div>
                
                {/* Date display card */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🗓️</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1e293b' }}>{todayDateStr()}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Fuso Horário Local</span>
                  </div>
                </div>
              </div>

              {/* Grid: 4 Stat Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                {/* Stat 1 */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.5rem', background: '#e0e7ff', padding: '8px', borderRadius: '10px' }}>👥</span>
                  </div>
                  <strong style={{ fontSize: '2rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    {stats.totalUsers.toLocaleString('pt-BR')}
                  </strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Famílias cadastradas</span>
                </div>

                {/* Stat 2 */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.5rem', background: '#dcfce7', padding: '8px', borderRadius: '10px' }}>🗓️</span>
                  </div>
                  <strong style={{ fontSize: '2rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    {stats.visitsToday}
                  </strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Visitas hoje</span>
                </div>

                {/* Stat 3 */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.5rem', background: '#fee2e2', padding: '8px', borderRadius: '10px' }}>📋</span>
                  </div>
                  <strong style={{ fontSize: '2rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    {stats.newRegistrations}
                  </strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Cadastros novos</span>
                </div>

                {/* Stat 4 */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.5rem', background: '#fef3c7', padding: '8px', borderRadius: '10px' }}>🕒</span>
                    <span onClick={() => setCurrentPage('routes')} style={{ color: '#4f46e5', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>Ver agenda →</span>
                  </div>
                  <strong style={{ fontSize: '2rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                    {stats.pendingVisits}
                  </strong>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Visitas pendentes</span>
                </div>
              </div>

              {/* Ações Rápidas Section */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 20px 0' }}>Ações rápidas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
                  {/* Ação 1 */}
                  <div 
                    onClick={() => { setSelectedUser(null); setCurrentPage('form'); }}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', background: '#f8fafc' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>➕</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Novo Cadastro</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Adicionar família ou usuário</span>
                  </div>

                  {/* Ação 2 */}
                  <div 
                    onClick={() => setCurrentPage('search')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', background: '#f8fafc' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>🔍</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Buscar Assistidos</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Localizar cadastros rapidamente</span>
                  </div>

                  {/* Ação 3 */}
                  <div 
                    onClick={() => setCurrentPage('routes')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', background: '#f8fafc' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>🗺️</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Rotas e Mapas</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Visualizar rotas e áreas</span>
                  </div>

                  {/* Ação 4 */}
                  <div 
                    onClick={() => setCurrentPage('history')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', background: '#f8fafc' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>📋</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Histórico de Visitas</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Consultar visitas realizadas</span>
                  </div>

                  {/* Ação 5 */}
                  <div 
                    onClick={() => setCurrentPage('skills')}
                    style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', background: '#f8fafc' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>💡</span>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Habilidades</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Gerenciar competências</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Upcoming Visits vs Map */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '32px'
              }}>
                {/* Left: Próximas visitas */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Próximas visitas</h3>
                    <span onClick={() => setCurrentPage('routes')} style={{ fontSize: '0.85rem', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}>Ver todas</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    {upcomingVisits.length === 0 ? (
                      <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>
                        Nenhuma visita programada.
                      </div>
                    ) : (
                      upcomingVisits.map((v, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: i === upcomingVisits.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                          <span style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: '0.9rem', width: '50px' }}>{v.time}</span>
                          <div style={{ flex: 1 }}>
                            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1e293b' }}>{v.userName}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{v.address}</span>
                          </div>
                          <span style={{
                            background: v.status === 'Hoje' ? '#e0e7ff' : '#f1f5f9',
                            color: v.status === 'Hoje' ? '#4f46e5' : '#64748b',
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            alignSelf: 'center'
                          }}>{v.status}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button 
                    onClick={() => setCurrentPage('routes')}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '12px',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '20px',
                      width: '100%'
                    }}
                  >
                    🗓️ Ver agenda completa
                  </button>
                </div>

                {/* Right: Mapa de Atendimentos */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Mapa de atendimentos</h3>
                    <span onClick={() => setCurrentPage('routes')} style={{ fontSize: '0.85rem', color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}>Ver mapa completo</span>
                  </div>

                  {/* Stylized SVG Map showing roads and route stops */}
                  <div style={{
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    height: '240px',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0'
                  }}>
                    <svg width="100%" height="100%" viewBox="0 0 400 240" fill="none">
                      {/* Grid background */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Map lines (Roads) */}
                      <path d="M 0 50 Q 200 40 400 120" stroke="#cbd5e1" strokeWidth="8" fill="none" />
                      <path d="M 120 0 L 220 240" stroke="#cbd5e1" strokeWidth="6" fill="none" />
                      <path d="M 0 180 C 150 150 250 220 400 160" stroke="#cbd5e1" strokeWidth="8" fill="none" />

                      {/* Route Path (Blue connect line) */}
                      <path d="M 150 60 L 230 110 L 280 80 L 330 50" stroke="#6366f1" strokeWidth="3" strokeDasharray="5" fill="none" />
                    </svg>

                    {/* Floating Info */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(255,255,255,0.95)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      display: 'flex',
                      gap: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span> {mapStats.completed} Realizadas
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span> {mapStats.inProgress} Em andamento
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span> {mapStats.pending} Pendentes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Atividades Recentes Row */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Atividades recentes</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Ver todas</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recentActivities.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>
                      Nenhuma atividade recente registrada.
                    </div>
                  ) : (
                    recentActivities.map((act, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          flexShrink: 0
                        }}>
                          {act.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>{act.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{act.description}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{act.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Render individual screens dynamically */}
          {currentPage === 'search' && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}
                >
                  ← Voltar ao Início
                </button>
              </div>
              <UserSearch
                onUserSelect={(user) => {
                  setSelectedUser(user);
                  setCurrentPage('form');
                }}
                showActions={true}
                maxResults={100}
              />
            </div>
          )}

          {currentPage === 'form' && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569', marginRight: '10px' }}
                >
                  ← Voltar ao Início
                </button>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>
                  {selectedUser ? `Editar Assistido: ${selectedUser.name}` : 'Cadastrar Nova Família'}
                </span>
              </div>
              <ClientForm
                user={selectedUser || undefined}
                onSave={() => setCurrentPage('home')}
                onCancel={() => setCurrentPage('home')}
              />
            </div>
          )}

          {currentPage === 'history' && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}
                >
                  ← Voltar ao Início
                </button>
              </div>
              <VisitHistoryPage />
            </div>
          )}

          {currentPage === 'routes' && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}
                >
                  ← Voltar ao Início
                </button>
              </div>
              <MapRoutesPage />
            </div>
          )}

          {currentPage === 'skills' && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}
                >
                  ← Voltar ao Início
                </button>
              </div>
              <SkillsPage />
            </div>
          )}

          {currentPage === 'system-users' && isAdmin && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}
                >
                  ← Voltar ao Início
                </button>
              </div>
              <SystemUsersPage />
            </div>
          )}

          {currentPage === 'messages' && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}
                >
                  ← Voltar ao Início
                </button>
              </div>
              <SendMessagePage />
            </div>
          )}

          {currentPage === 'support' && (
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setCurrentPage('home')}
                  style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}
                >
                  ← Voltar ao Início
                </button>
              </div>
              <SupportTicketPage />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;