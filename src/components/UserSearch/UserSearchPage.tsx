import React, { useState, useEffect } from 'react';

// Tipos definidos no próprio arquivo
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

interface SearchFilters {
  name: string;
  email: string;
  status: string;
}

type UserStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'BLOQUEADO';

interface UserSearchProps {
  onUserSelect?: (user: User) => void;
  showActions?: boolean;
  maxResults?: number;
}

const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    background: '#f5f5f5',
    white: '#ffffff',
    border: '#ddd',
    text: '#333',
    textLight: '#666',
    lightGray: '#f8f9fa'
  },
  spacing: {
    xs: '5px',
    sm: '10px',
    md: '15px',
    lg: '20px',
    xl: '30px'
  }
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  } as React.CSSProperties,

  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: theme.colors.white,
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: theme.spacing.xl
  } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    borderBottom: `2px solid ${theme.colors.border}`,
    paddingBottom: theme.spacing.lg
  } as React.CSSProperties,

  title: {
    fontSize: '28px',
    color: theme.colors.text,
    margin: 0,
    fontWeight: 'bold'
  } as React.CSSProperties,

  searchSection: {
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.lg,
    borderRadius: '8px',
    marginBottom: theme.spacing.xl
  } as React.CSSProperties,

  searchGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: theme.spacing.md,
    alignItems: 'end'
  } as React.CSSProperties,

  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const
  } as React.CSSProperties,

  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs
  } as React.CSSProperties,

  input: {
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    fontSize: '14px'
  } as React.CSSProperties,

  select: {
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: theme.colors.white
  } as React.CSSProperties,

  button: {
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s'
  } as React.CSSProperties,

  primaryButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white
  } as React.CSSProperties,

  successButton: {
    backgroundColor: theme.colors.success,
    color: theme.colors.white
  } as React.CSSProperties,

  warningButton: {
    backgroundColor: theme.colors.warning,
    color: theme.colors.text
  } as React.CSSProperties,

  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: theme.spacing.lg
  } as React.CSSProperties,

  th: {
    backgroundColor: theme.colors.lightGray,
    padding: theme.spacing.md,
    textAlign: 'left' as const,
    borderBottom: `2px solid ${theme.colors.border}`,
    fontWeight: 'bold',
    fontSize: '14px'
  } as React.CSSProperties,

  td: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
    fontSize: '14px'
  } as React.CSSProperties,

  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const
  } as React.CSSProperties,

  noResults: {
    textAlign: 'center' as const,
    padding: theme.spacing.xl,
    color: theme.colors.textLight,
    fontSize: '16px'
  } as React.CSSProperties,

  buttonGroup: {
    display: 'flex',
    gap: theme.spacing.sm
  } as React.CSSProperties,

  printSummary: {
    display: 'none',
    marginTop: theme.spacing.xl,
    pageBreakBefore: 'always' as const
  } as React.CSSProperties
};

const UserSearch: React.FC<UserSearchProps> = ({ 
  onUserSelect, 
  showActions = true, 
  maxResults = 100 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    name: '',
    email: '',
    status: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchFilters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
        console.log('✅ Usuários carregados:', userData);
      } else {
        console.error('❌ Erro ao carregar usuários:', response.status);
        alert('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('🔥 Erro:', error);
      alert('Erro de conexão ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchFilters.name) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    if (searchFilters.email) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchFilters.email.toLowerCase())
      );
    }

    if (searchFilters.status) {
      filtered = filtered.filter(user => 
        user.status === searchFilters.status
      );
    }

    // Limitar resultados se especificado
    filtered = filtered.slice(0, maxResults);
    
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      email: '',
      status: ''
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Endereço', 'Renda', 'Dependentes', 'Status', 'Observações'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        `"${user.phone}"`,
        `"${user.address}"`,
        user.income,
        user.numOfDependents,
        user.status,
        `"${user.observations || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = styles.statusBadge;
    switch (status) {
      case 'ATIVO':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'INATIVO':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'PENDENTE':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
      case 'BLOQUEADO':
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
      default:
        return baseStyle;
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.pageContainer}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>👥 Busca e Relatório de Usuários</h1>
            {showActions && (
              <div style={styles.buttonGroup}>
                <button 
                  onClick={loadUsers} 
                  style={{...styles.button, ...styles.primaryButton}}
                  disabled={loading}
                >
                  🔄 {loading ? 'Carregando...' : 'Atualizar'}
                </button>
                <button 
                  onClick={handlePrint} 
                  style={{...styles.button, ...styles.successButton}}
                >
                  🖨️ Imprimir
                </button>
              </div>
            )}
          </div>

          {/* Search Section */}
          <div style={styles.searchSection}>
            <h3 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>🔍 Filtros de Busca</h3>
            <div style={styles.searchGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome</label>
                <input
                  type="text"
                  value={searchFilters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Buscar por nome..."
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={searchFilters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  placeholder="Buscar por email..."
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={searchFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={styles.select}
                >
                  <option value="">Todos os status</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="BLOQUEADO">Bloqueado</option>
                </select>
              </div>

              <button 
                onClick={clearFilters}
                style={{...styles.button, ...styles.warningButton}}
              >
                🗑️ Limpar
              </button>
            </div>
          </div>

          {/* Results Header */}
          <div style={styles.resultsHeader}>
            <h3 style={{ margin: 0, color: theme.colors.text }}>
              📊 Resultados: {filteredUsers.length} usuário(s) encontrado(s)
            </h3>
            {showActions && (
              <button 
                onClick={exportToCSV}
                style={{...styles.button, ...styles.successButton}}
                disabled={filteredUsers.length === 0}
              >
                📥 Exportar CSV
              </button>
            )}
          </div>

          {/* Results Table */}
          {filteredUsers.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Telefone</th>
                  <th style={styles.th}>Renda</th>
                  <th style={styles.th}>Dependentes</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Observações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id}
                    onClick={() => onUserSelect?.(user)}
                    style={{
                      cursor: onUserSelect ? 'pointer' : 'default',
                      backgroundColor: onUserSelect ? 'transparent' : undefined
                    }}
                  >
                    <td style={styles.td}>{user.id}</td>
                    <td style={styles.td}><strong>{user.name}</strong></td>
                    <td style={styles.td}>{user.email}</td>
                    <td style={styles.td}>{user.phone}</td>
                    <td style={styles.td}>
                      R$ {user.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={styles.td}>{user.numOfDependents}</td>
                    <td style={styles.td}>
                      <span style={getStatusBadgeStyle(user.status)}>
                        {user.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.observations ? (
                        user.observations.length > 50 
                          ? `${user.observations.substring(0, 50)}...`
                          : user.observations
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.noResults}>
              {loading ? '⏳ Carregando usuários...' : '📭 Nenhum usuário encontrado com os filtros aplicados'}
            </div>
          )}

          {/* Print Summary */}
          <div style={styles.printSummary}>
            <h2>Relatório de Usuários</h2>
            <p><strong>Total de usuários:</strong> {filteredUsers.length}</p>
            <p><strong>Data do relatório:</strong> {new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Filtros aplicados:</strong></p>
            <ul>
              {searchFilters.name && <li>Nome: {searchFilters.name}</li>}
              {searchFilters.email && <li>Email: {searchFilters.email}</li>}
              {searchFilters.status && <li>Status: {searchFilters.status}</li>}
              {!searchFilters.name && !searchFilters.email && !searchFilters.status && <li>Nenhum filtro aplicado</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              background-color: white !important;
              margin: 0;
            }
            button {
              display: none !important;
            }
            .printSummary {
              display: block !important;
            }
            table {
              font-size: 10px !important;
            }
            th, td {
              padding: 5px !important;
            }
          }
          
          @media (max-width: 768px) {
            .searchGrid {
              grid-template-columns: 1fr !important;
            }
            .resultsHeader {
              flex-direction: column !important;
              gap: 10px !important;
              align-items: flex-start !important;
            }
            table {
              font-size: 12px !important;
            }
            th, td {
              padding: 8px 4px !important;
            }
          }
        `
      }} />
    </>
  );
};

export default UserSearch;