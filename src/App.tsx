import React, { useState } from 'react';
import UserSearch from './components/UserSearch/UserSearchPage';
import ClientForm from './components/ClientForm/ClientForm';

// Definir o tipo User ou importar de onde está definido
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  income: number;
  numOfDependents: number;
  status: string;
  observations: string;
  photo?: string;
}

function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'form' | 'search'>('home');

  return (
    <>
      {/* Página inicial com botões de navegação */}
      {currentPage === 'home' && (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              color: '#333',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              🏢 Sistema de Usuários
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
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setCurrentPage('search')}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#0056b3';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#007bff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔍 Buscar Usuários
              </button>
              
              <button
                onClick={() => {
                  setSelectedUser(null); // Limpa usuário selecionado para novo cadastro
                  setCurrentPage('form');
                }}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(40,167,69,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1e7e34';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#28a745';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ➕ Novo Cadastro
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
    </>
  );
}

export default App;