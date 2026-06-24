import React, { useState } from 'react';
import UserSearch from './components/UserSearch/UserSearchPage';
import ClientForm from './components/ClientForm/ClientForm';
import VisitHistoryPage from './components/VisitHistory/VisitHistoryPage';
import MapRoutesPage from './components/MapRoutes/MapRoutesPage';
import SkillsPage from './components/UserSearch/SkillsPage';
import LoginPage from './components/Login/LoginPage';
import { getAuthToken, clearAuthToken } from './utils/auth';

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
  const [currentPage, setCurrentPage] = useState<'home' | 'form' | 'search' | 'history' | 'routes' | 'skills'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {/* Página inicial com botões de navegação */}
      {currentPage === 'home' && (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: 'relative'
        }}>
          {/* Botão de Logout no canto superior direito */}
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            Sair 🚪
          </button>

          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🏢</div>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#333',
              marginBottom: '10px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Sistema de Usuários
            </h1>
            
            <p style={{
              color: '#666',
              fontSize: '1.1rem',
              marginBottom: '40px'
            }}>
              Gerencie usuários e cadastros de forma eficiente
            </p>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'flex-start',
              flexWrap: 'wrap',
              flexDirection: 'column',
              maxWidth: '300px'
            }}>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setCurrentPage('form');
                }}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ➕ Novo Cadastro
              </button>
              
              <button
                onClick={() => setCurrentPage('search')}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔍 Buscar Usuários
              </button>

              <button
                onClick={() => setCurrentPage('routes')}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🗺️ Rotas e Mapas
              </button>

              <button
                onClick={() => setCurrentPage('history')}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                📝 Histórico de Visitas
              </button>

              <button
                onClick={() => setCurrentPage('skills')}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#2563eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                💡 Habilidades
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Página de busca */}
      {currentPage === 'search' && (
        <div>
          {/* Botão de voltar */}
          <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ← Voltar ao Início
            </button>
          </div>
          
          <UserSearch
            onUserSelect={(user) => {
              setSelectedUser(user);
              setCurrentPage('form'); // muda para o form de edição
            }}
            showActions={true}
            maxResults={100}
          />
        </div>
      )}

      {/* Página de formulário/cadastro */}
      {currentPage === 'form' && (
        <div>
          {/* Botão de voltar */}
          <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                marginRight: '10px'
              }}
            >
              ← Voltar ao Início
            </button>
            
            <span style={{ color: '#666', fontSize: '14px' }}>
              {selectedUser ? `Editando: ${selectedUser.name}` : 'Novo Cadastro'}
            </span>
          </div>
          
          <ClientForm
            user={selectedUser}
            onSave={() => setCurrentPage('home')} // após salvar, volta ao início
            onCancel={() => setCurrentPage('home')} // ao cancelar, volta ao início
          />
        </div>
      )}

      {/* Página de Histórico */}
      {currentPage === 'history' && (
        <div>
          <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              ← Voltar ao Início
            </button>
          </div>
          <VisitHistoryPage />
        </div>
      )}

      {/* Página de Rotas e Mapas */}
      {currentPage === 'routes' && (
        <div>
          <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              ← Voltar ao Início
            </button>
          </div>
          <MapRoutesPage />
        </div>
      )}

      {/* Página de Habilidades */}
      {currentPage === 'skills' && (
        <div>
          <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{ background: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              ← Voltar ao Início
            </button>
          </div>
          <SkillsPage />
        </div>
      )}
    </>
  );
}

export default App;