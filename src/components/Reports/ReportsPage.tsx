import React, { useState, useEffect } from 'react';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

interface Address {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

interface Dependent {
  id?: number;
  name: string;
  birthDate?: string;
  age?: number;
}

interface User {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  addressEntity?: Address;
  income?: number;
  dependents?: Dependent[];
  status?: string;
  observations?: string;
  startAssistanceDate?: string;
}

interface DependentRow {
  dependentName: string;
  birthDate?: string;
  age: number | null;
  ageFormatted: string;
  responsibleName: string;
  responsiblePhone?: string;
  responsibleStatus?: string;
  neighborhood?: string;
}

interface AssistanceRow {
  userName: string;
  phone?: string;
  neighborhood?: string;
  city?: string;
  startAssistanceDate?: string;
  timeElapsedFormatted: string;
  totalDays: number;
  status: string;
}

const calculateAgeFromBirthDate = (birthDateStr?: string, fallbackAge?: number): number | null => {
  if (fallbackAge !== undefined && fallbackAge !== null && !isNaN(fallbackAge)) {
    return fallbackAge;
  }
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

const calculateAssistanceDuration = (startDateStr?: string): { text: string; totalDays: number } => {
  if (!startDateStr) return { text: 'Não informado', totalDays: -1 };
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return { text: 'Data inválida', totalDays: -1 };

  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays < 0) return { text: 'Início futuro', totalDays: 0 };

  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mês' : 'meses'}`);
  if (parts.length === 0 || (years === 0 && months === 0)) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`);

  return { text: parts.join(' e '), totalDays };
};

const formatDateBR = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'dependents' | 'assistance'>('dependents');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros de Dependentes
  const [ageFilter, setAgeFilter] = useState<string>('all'); // 'all', '3-5', '6-8', '9-11', '12-14', '15+'

  // Filtros de Tempo de Assistência
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = mais antigo / menor para maior, 'desc' = mais recente
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
        const data = await response.json();
        setUsers(data);
      } else {
        handleAuthError(response);
      }
    } catch (error) {
      console.error('Erro ao carregar dados para relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gerar Linhas do Relatório de Dependentes
  const allDependents: DependentRow[] = [];
  users.forEach((user) => {
    if (user.dependents && user.dependents.length > 0) {
      user.dependents.forEach((dep) => {
        const age = calculateAgeFromBirthDate(dep.birthDate, dep.age);
        allDependents.push({
          dependentName: dep.name,
          birthDate: dep.birthDate,
          age: age,
          ageFormatted: age !== null ? `${age} ${age === 1 ? 'ano' : 'anos'}` : 'Não informada',
          responsibleName: user.name,
          responsiblePhone: user.phone,
          responsibleStatus: user.status || 'ATIVO',
          neighborhood: user.addressEntity?.neighborhood || '-'
        });
      });
    }
  });

  // Filtrar Dependentes
  const filteredDependents = allDependents.filter((item) => {
    // Filtro por faixa etária
    if (ageFilter !== 'all') {
      if (item.age === null) return false;
      if (ageFilter === '3-5' && (item.age < 3 || item.age > 5)) return false;
      if (ageFilter === '6-8' && (item.age < 6 || item.age > 8)) return false;
      if (ageFilter === '9-11' && (item.age < 9 || item.age > 11)) return false;
      if (ageFilter === '12-14' && (item.age < 12 || item.age > 14)) return false;
      if (ageFilter === '15+' && item.age < 15) return false;
    }

    // Filtro de busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDep = item.dependentName.toLowerCase().includes(term);
      const matchResp = item.responsibleName.toLowerCase().includes(term);
      const matchBairro = item.neighborhood?.toLowerCase().includes(term);
      if (!matchDep && !matchResp && !matchBairro) return false;
    }

    return true;
  });

  // Gerar Linhas do Relatório de Tempo de Assistência
  const allAssistanceUsers: AssistanceRow[] = users.map((user) => {
    const duration = calculateAssistanceDuration(user.startAssistanceDate);
    return {
      userName: user.name,
      phone: user.phone,
      neighborhood: user.addressEntity?.neighborhood || '-',
      city: user.addressEntity?.city || '-',
      startAssistanceDate: user.startAssistanceDate,
      timeElapsedFormatted: duration.text,
      totalDays: duration.totalDays,
      status: user.status || 'ATIVO'
    };
  });

  // Filtrar e Ordenar Tempo de Assistência
  const filteredAssistance = allAssistanceUsers
    .filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.userName.toLowerCase().includes(term);
        const matchNeighborhood = item.neighborhood?.toLowerCase().includes(term);
        if (!matchName && !matchNeighborhood) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Ordenação por tempo / data
      const dateA = a.startAssistanceDate ? new Date(a.startAssistanceDate).getTime() : 0;
      const dateB = b.startAssistanceDate ? new Date(b.startAssistanceDate).getTime() : 0;

      if (sortOrder === 'asc') {
        // Mais antigo primeiro (data menor / mais tempo de assistência)
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA - dateB;
      } else {
        // Mais recente primeiro (data maior / menos tempo)
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB - dateA;
      }
    });

  const handlePrint = () => {
    window.print();
  };

  const getAgeFilterLabel = (filterKey: string) => {
    switch (filterKey) {
      case '3-5': return '3 a 5 anos';
      case '6-8': return '6 a 8 anos';
      case '9-11': return '9 a 11 anos';
      case '12-14': return '12 a 14 anos';
      case '15+': return 'Maiores de 15 anos';
      default: return 'Todas as Idades';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Cabeçalho impresso exclusivo para print */}
      <div className="print-header" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', textAlign: 'center' }}>
          ERP Social - Relatórios de Atendimento
        </h1>
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#555', margin: '0 0 16px 0' }}>
          Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </p>
      </div>

      {/* Top Banner & Ações */}
      <div className="no-print" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
              📊 Central de Relatórios
            </h2>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              Consulte dados consolidados, filtre por faixas de idade ou tempo de assistência e imprima relatórios oficiais.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(14,165,233,0.2)',
                transition: 'background 0.2s'
              }}
            >
              🖨️ Imprimir Relatório
            </button>
            <button
              onClick={loadUsers}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '10px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              🔄 {loading ? 'Atualizando...' : 'Atualizar Dados'}
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveReport('dependents')}
            style={{
              background: activeReport === 'dependents' ? '#4f46e5' : 'transparent',
              color: activeReport === 'dependents' ? 'white' : '#64748b',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            👶 Dependentes por Faixa Etária ({allDependents.length})
          </button>
          <button
            onClick={() => setActiveReport('assistance')}
            style={{
              background: activeReport === 'assistance' ? '#4f46e5' : 'transparent',
              color: activeReport === 'assistance' ? 'white' : '#64748b',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            ⏳ Tempo de Assistência ({users.length})
          </button>
        </div>
      </div>

      {/* Relatório 1: Dependentes por Faixa Etária */}
      {activeReport === 'dependents' && (
        <div>
          {/* Barra de Filtros */}
          <div className="no-print" style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  🎯 Filtrar por Faixa Etária
                </label>
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="all">Todas as Faixas ({allDependents.length})</option>
                  <option value="3-5">3 a 5 anos</option>
                  <option value="6-8">6 a 8 anos</option>
                  <option value="9-11">9 a 11 anos</option>
                  <option value="12-14">12 a 14 anos</option>
                  <option value="15+">Maiores de 15 anos</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  🔍 Buscar por Nome / Bairro
                </label>
                <input
                  type="text"
                  placeholder="Nome do dependente ou responsável..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ alignSelf: 'flex-end' }}>
                <div style={{
                  background: '#e0e7ff',
                  color: '#3730a3',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  Exibindo {filteredDependents.length} de {allDependents.length} dependentes
                </div>
              </div>
            </div>

            {/* Atalhos Rápidos para Faixas Etárias */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid #e2e8f0'
            }}>
              {[
                { key: 'all', label: 'Todos' },
                { key: '3-5', label: '3 a 5 anos' },
                { key: '6-8', label: '6 a 8 anos' },
                { key: '9-11', label: '9 a 11 anos' },
                { key: '12-14', label: '12 a 14 anos' },
                { key: '15+', label: '15+ anos' }
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setAgeFilter(pill.key)}
                  style={{
                    background: ageFilter === pill.key ? '#4f46e5' : 'white',
                    color: ageFilter === pill.key ? 'white' : '#475569',
                    border: '1px solid ' + (ageFilter === pill.key ? '#4f46e5' : '#cbd5e1'),
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título do Relatório Impresso / Visível */}
          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold' }}>
              Relatório: Dependentes - Faixa Etária ({getAgeFilterLabel(ageFilter)})
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total: <strong>{filteredDependents.length}</strong> registro(s)
            </span>
          </div>

          {/* Tabela de Dados */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflowX: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Nome do Dependente</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Idade</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Data de Nasc.</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Assistido Responsável</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Telefone / Bairro</th>
                </tr>
              </thead>
              <tbody>
                {filteredDependents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      Nenhum dependente encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredDependents.map((dep, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                        👶 {dep.dependentName}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: dep.age !== null && dep.age <= 5 ? '#fef3c7' : dep.age !== null && dep.age <= 11 ? '#dbeafe' : '#f1f5f9',
                          color: dep.age !== null && dep.age <= 5 ? '#92400e' : dep.age !== null && dep.age <= 11 ? '#1e40af' : '#475569',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {dep.ageFormatted}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {formatDateBR(dep.birthDate)}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1e293b' }}>
                        👤 {dep.responsibleName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {dep.responsiblePhone ? `📞 ${dep.responsiblePhone}` : ''}
                        {dep.responsiblePhone && dep.neighborhood ? ' | ' : ''}
                        {dep.neighborhood ? `📍 ${dep.neighborhood}` : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Relatório 2: Tempo de Assistência */}
      {activeReport === 'assistance' && (
        <div>
          {/* Barra de Filtros */}
          <div className="no-print" style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  ⏳ Ordenação por Tempo de Assistência
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="asc">Mais Antigo → Mais Recente (Maior Tempo de Atendimento)</option>
                  <option value="desc">Mais Recente → Mais Antigo (Menor Tempo de Atendimento)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  📋 Status do Cadastro
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                  🔍 Buscar por Assistido
                </label>
                <input
                  type="text"
                  placeholder="Nome ou bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Título do Relatório */}
          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 'bold' }}>
              Relatório: Tempo de Assistência ({sortOrder === 'asc' ? 'Ordem Crescente de Tempo' : 'Ordem Decrescente de Tempo'})
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total: <strong>{filteredAssistance.length}</strong> assistido(s)
            </span>
          </div>

          {/* Tabela de Dados */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflowX: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Nome do Assistido</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Data de Início da Assistência</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Tempo de Assistência</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>Contato e Localização</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssistance.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredAssistance.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>
                        👤 {row.userName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '500' }}>
                        📅 {formatDateBR(row.startAssistanceDate)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: row.totalDays > 365 ? '#dcfce7' : row.totalDays > 0 ? '#e0e7ff' : '#f1f5f9',
                          color: row.totalDays > 365 ? '#166534' : row.totalDays > 0 ? '#3730a3' : '#64748b',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {row.timeElapsedFormatted}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: row.status === 'ATIVO' ? '#dcfce7' : '#fee2e2',
                          color: row.status === 'ATIVO' ? '#166534' : '#991b1b',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {row.phone ? `📞 ${row.phone}` : ''}
                        {row.phone && row.neighborhood ? ' | ' : ''}
                        {row.neighborhood ? `📍 ${row.neighborhood} - ${row.city}` : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
