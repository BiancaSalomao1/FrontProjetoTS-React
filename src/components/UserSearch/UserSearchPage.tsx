import React, { useState, useEffect } from 'react';
import styles from './UserSearch.module.css';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

// Tipos definidos no próprio arquivo
interface Address {
  id?: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Dependent {
  id?: number;
  name: string;
  birthDate?: string;
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
  habilitySet?: { id?: number; name: string }[];
}

interface SearchFilters {
  name: string;
  email: string;
  status: string;
}



interface UserSearchProps {
  onUserSelect?: (user: User) => void;
  showActions?: boolean;
  maxResults?: number;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  showActions = true,
  maxResults = 100
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    name: '',
    email: '',
    status: ''
  });

  // URL base da API - ajuste conforme sua configuração
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchFilters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const userData = await response.json();
        // Converter UserDTO para User se necessário
        const convertedUsers = userData.map((userDto: any) => ({
          id: userDto.id,
          name: userDto.name,
          email: userDto.email,
          phone: userDto.phone || '',
          addressEntity: userDto.addressEntity || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
          income: userDto.income || 0,
          dependents: userDto.dependents || [],
          status: userDto.status || 'ATIVO',
          observations: userDto.observations || '',
          photoPath: userDto.photoPath || null
        }));

        setUsers(convertedUsers);
        console.log('✅ Usuários carregados da API Spring Boot:', convertedUsers);
      } else {
        handleAuthError(response);
        console.error('❌ Erro ao carregar usuários da API:', response.status);
      }
    } catch (error) {
      console.error('🔥 Erro de conexão com a API Spring Boot:', error);
      alert('Erro de conexão com o servidor. Verifique se o backend está rodando em ' + API_BASE_URL);
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

  // FUNÇÃO: Editar usuário
  const handleEditUser = (user: User) => {
    setEditingUser({ ...user }); // Cria uma cópia para edição
  };

  // FUNÇÃO: Salvar usuário editado
  const handleSaveUser = async () => {
    if (!editingUser) return;

    // Validação básica
    if (!editingUser.name.trim()) {
      alert(' Nome é obrigatório!');
      return;
    }
    if (!editingUser.email.trim()) {
      alert(' Email é obrigatório!');
      return;
    }

    try {
      // Converter User para UserDTO para enviar ao Spring Boot
      const userDTO = {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        addressEntity: editingUser.addressEntity,
        income: editingUser.income,
        dependents: editingUser.dependents,
        status: editingUser.status,
        observations: editingUser.observations,
        photoPath: editingUser.photoPath
      };

      const response = await fetch(`${API_BASE_URL}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userDTO),
      });

      if (response.ok) {
        const updatedUserDTO = await response.json();

        // Converter de volta para User
        const updatedUser: User = {
          id: updatedUserDTO.id,
          name: updatedUserDTO.name,
          email: updatedUserDTO.email,
          phone: updatedUserDTO.phone || '',
          addressEntity: updatedUserDTO.addressEntity || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
          income: updatedUserDTO.income || 0,
          dependents: updatedUserDTO.dependents || [],
          status: updatedUserDTO.status || 'ATIVO',
          observations: updatedUserDTO.observations || '',
          photoPath: updatedUserDTO.photoPath || null
        };

        // Atualiza a lista local
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === updatedUser.id ? updatedUser : user
          )
        );

        setEditingUser(null);
        alert('✅ Usuário atualizado com sucesso!');

        // Callback opcional para o componente pai
        if (onUserSelect) {
          // onUserSelect(updatedUser);
        }
      } else {
        handleAuthError(response);
        const errorData = await response.json().catch(() => ({}));
        console.error(' Erro ao salvar usuário:', response.status, errorData);
        alert(`Erro ao salvar usuário: ${errorData.message || errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error(' Erro de conexão:', error);
      alert('Erro de conexão ao salvar usuário. Verifique se o backend Spring Boot está rodando.');
    }
  };

  // FUNÇÃO: Excluir usuário
  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Deseja realmente excluir o usuário "${user.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        // Remove da lista local
        setUsers(prevUsers =>
          prevUsers.filter(u => u.id !== user.id)
        );

        alert('✅ Usuário excluído com sucesso!');
      } else {
        handleAuthError(response);
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro ao excluir usuário:', response.status, errorData);
        alert(`Erro ao excluir usuário: ${errorData.message || errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('🔥 Erro de conexão:', error);
      alert('Erro de conexão ao excluir usuário. Verifique se o backend Spring Boot está rodando.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Endereço', 'Renda', 'Dependentes', 'Status', 'Observações', 'Foto URL'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        `"${user.phone}"`,
        `"${user.addressEntity.street}, ${user.addressEntity.number} - ${user.addressEntity.city}/${user.addressEntity.state}"`,
        user.income,
        user.dependents.length,
        user.status,
        `"${user.observations || ''}"`,
        `"${user.photoPath || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // FUNÇÃO: Imprimir ficha individual do usuário
  const printUserCard = async (user: User) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir a ficha do usuário');
      return;
    }

    printWindow.document.write('<h2>Carregando ficha e histórico de visitas...</h2>');

    let visitsHtml = '<p style="color: #64748b; font-style: italic;">Nenhum histórico de visitas encontrado.</p>';

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/visit-history`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const allVisits = await response.json();
        const userVisits = allVisits.filter((v: any) => v.user?.id === user.id).sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

        if (userVisits.length > 0) {
          visitsHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
              <thead>
                <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 10px; text-align: left;">Data</th>
                  <th style="padding: 10px; text-align: left;">Assistente</th>
                  <th style="padding: 10px; text-align: left;">Descrição</th>
                </tr>
              </thead>
              <tbody>
                ${userVisits.map((v: any) => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px;">${new Date(v.visitDate).toLocaleString('pt-BR')}</td>
                    <td style="padding: 10px; font-weight: bold;">${v.performedBy}</td>
                    <td style="padding: 10px;">${v.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }
    } catch (e) {
      console.error('Erro ao buscar visitas para impressão', e);
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ficha do Usuário - ${user.name}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
          }
          
          .card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          
          .user-photo {
            text-align: center;
            margin-bottom: 25px;
          }
          
          .user-photo img {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #007bff;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          
          .user-photo .no-photo {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: #f0f0f0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 64px;
            color: #ccc;
            border: 4px solid #ddd;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 25px;
          }
          
          .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
          }
          
          .info-item.full-width {
            grid-column: 1 / -1;
          }
          
          .info-label {
            font-weight: bold;
            color: #007bff;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 16px;
            color: #333;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-ativo { background: #d4edda; color: #155724; }
          .status-inativo { background: #f8d7da; color: #721c24; }
          .status-pendente { background: #fff3cd; color: #856404; }
          .status-bloqueado { background: #d1ecf1; color: #0c5460; }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          
          .print-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 10px;
          }
          
          .print-button:hover {
            background: #0056b3;
          }
          
          @media (max-width: 600px) {
            .info-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>📋 Ficha do Usuário</h1>
            <div class="subtitle">Dados Completos do Cliente</div>
          </div>
          
          <div class="user-photo">
            ${user.photoPath ?
        `<img src="${user.photoPath}" alt="Foto de ${user.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
               <div class="no-photo" style="display:none;">👤</div>` :
        `<div class="no-photo">👤</div>`
      }
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">ID do Usuário</div>
              <div class="info-value">#${user.id}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">
                <span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Nome Completo</div>
              <div class="info-value">${user.name}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${user.email}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Telefone</div>
              <div class="info-value">${user.phone || 'Não informado'}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Renda Mensal</div>
              <div class="info-value">R$ ${user.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Número de Dependentes</div>
              <div class="info-value">${user.dependents.length}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">Data de Impressão</div>
              <div class="info-value">${new Date().toLocaleString('pt-BR')}</div>
            </div>
            
            <div class="info-item full-width">
              <div class="info-label">Endereço Completo</div>
              <div class="info-value">${user.addressEntity.street}, ${user.addressEntity.number} - ${user.addressEntity.neighborhood}, ${user.addressEntity.city}/${user.addressEntity.state} - CEP: ${user.addressEntity.zipCode}</div>
            </div>
            
            ${user.observations ? `
            <div class="info-item full-width">
              <div class="info-label">Observações</div>
              <div class="info-value">${user.observations}</div>
            </div>
            ` : ''}
          </div>

          <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <h3 style="color: #007bff; margin-bottom: 10px; font-size: 18px;">Habilidades Cadastradas</h3>
            ${user.habilitySet && user.habilitySet.length > 0 ? `
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${user.habilitySet.map(hab => `<span style="background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: bold;">${hab.name}</span>`).join('')}
              </div>
            ` : '<p style="color: #64748b; font-style: italic;">Nenhuma habilidade cadastrada.</p>'}
          </div>

          <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <h3 style="color: #007bff; margin-bottom: 10px; font-size: 18px;">Histórico de Visitas</h3>
            ${visitsHtml}
          </div>
          
          <div class="footer">
            <p>Este documento foi gerado automaticamente pelo sistema de gerenciamento de usuários.</p>
            <p>Para informações adicionais, entre em contato com o suporte.</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button class="print-button" onclick="window.print()">🖨️ Imprimir</button>
          <button class="print-button" onclick="window.close()" style="background: #6c757d;">❌ Fechar</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  };

  // FUNÇÃO: Imprimir todas as fichas dos usuários filtrados
  const printAllUserCards = () => {
    if (filteredUsers.length === 0) {
      alert('Nenhum usuário para imprimir');
      return;
    }

    if (filteredUsers.length > 10) {
      if (!window.confirm(`Você está prestes a imprimir ${filteredUsers.length} fichas de usuários.\n\nIsso pode demorar um pouco. Deseja continuar?`)) {
        return;
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir as fichas dos usuários');
      return;
    }

    const generateUserCard = (user: User, isLast: boolean = false) => `
      <div class="card" ${!isLast ? 'style="page-break-after: always;"' : ''}>
        <div class="header">
          <h1>📋 Ficha do Usuário</h1>
          <div class="subtitle">Dados Completos do Cliente</div>
        </div>
        
        <div class="user-photo">
          ${user.photoPath ?
        `<img src="${user.photoPath}" alt="Foto de ${user.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
             <div class="no-photo" style="display:none;">👤</div>` :
        `<div class="no-photo">👤</div>`
      }
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">ID do Usuário</div>
            <div class="info-value">#${user.id}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">
              <span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span>
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Nome Completo</div>
            <div class="info-value">${user.name}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${user.email}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Telefone</div>
            <div class="info-value">${user.phone || 'Não informado'}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Renda Mensal</div>
            <div class="info-value">R$ ${user.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Número de Dependentes</div>
            <div class="info-value">${user.dependents.length}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">Data de Impressão</div>
            <div class="info-value">${new Date().toLocaleString('pt-BR')}</div>
          </div>
          
          <div class="info-item full-width">
            <div class="info-label">Endereço Completo</div>
            <div class="info-value">${user.addressEntity.street}, ${user.addressEntity.number} - ${user.addressEntity.neighborhood}, ${user.addressEntity.city}/${user.addressEntity.state} - CEP: ${user.addressEntity.zipCode}</div>
          </div>
          
          ${user.observations ? `
          <div class="info-item full-width">
            <div class="info-label">Observações</div>
            <div class="info-value">${user.observations}</div>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Este documento foi gerado automaticamente pelo sistema de gerenciamento de usuários.</p>
          <p>Para informações adicionais, entre em contato com o suporte.</p>
        </div>
      </div>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fichas dos Usuários (${filteredUsers.length} usuários)</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 10px;
            background: #f5f5f5;
          }
          
          .card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            max-width: 100%;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
          }
          
          .header .subtitle {
            color: #666;
            font-size: 12px;
            margin-top: 5px;
          }
          
          .user-photo {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .user-photo img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #007bff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
          
          .user-photo .no-photo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #f0f0f0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            color: #ccc;
            border: 3px solid #ddd;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .info-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid #007bff;
          }
          
          .info-item.full-width {
            grid-column: 1 / -1;
          }
          
          .info-label {
            font-weight: bold;
            color: #007bff;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 14px;
            color: #333;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 16px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-ativo { background: #d4edda; color: #155724; }
          .status-inativo { background: #f8d7da; color: #721c24; }
          .status-pendente { background: #fff3cd; color: #856404; }
          .status-bloqueado { background: #d1ecf1; color: #0c5460; }
          
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 10px;
          }
          
          .print-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 10px;
          }
          
          .print-button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        ${filteredUsers.map((user, index) => generateUserCard(user, index === filteredUsers.length - 1)).join('')}
        
        <div class="no-print" style="text-align: center; margin-top: 20px; position: fixed; top: 10px; right: 10px; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
          <button class="print-button" onclick="window.print()">🖨️ Imprimir Todas (${filteredUsers.length})</button>
          <button class="print-button" onclick="window.close()" style="background: #6c757d;">❌ Fechar</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return styles.statusAtivo;
      case 'INATIVO':
        return styles.statusInativo;
      case 'PENDENTE':
        return styles.statusPendente;
      default:
        return styles.statusBadge;
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.pageContainer}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>👥 Busca e Relatório de Usuários</h1>
            {showActions && (
              <div className={styles.buttonGroup}>
                <button
                  onClick={loadUsers}
                  className={`${styles.button} ${styles.primaryButton}`}
                  disabled={loading}
                >
                  🔄 {loading ? 'Carregando...' : 'Atualizar'}
                </button>
                <button
                  onClick={handlePrint}
                  className={`${styles.button} ${styles.successButton}`}
                >
                  🖨️ Imprimir
                </button>
              </div>
            )}
          </div>

          {/* Search Section */}
          <div className={styles.searchSection}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 Filtros de Busca</h3>
            <div className={styles.searchGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome</label>
                <input
                  type="text"
                  value={searchFilters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Buscar por nome..."
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={searchFilters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  placeholder="Buscar por email..."
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Status</label>
                <select
                  value={searchFilters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={styles.select}
                >
                  <option value="">Todos os status</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className={`${styles.button} ${styles.warningButton}`}
              >
                🗑️ Limpar
              </button>
            </div>
          </div>

          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <h3 style={{ margin: 0, color: '#333' }}>
              📊 Resultados: {filteredUsers.length} usuário(s) encontrado(s)
            </h3>
            {showActions && (
              <div className={styles.buttonGroup}>
                <button
                  onClick={exportToCSV}
                  className={`${styles.button} ${styles.successButton}`}
                  disabled={filteredUsers.length === 0}
                  title="Exportar dados para CSV incluindo URLs das fotos"
                >
                  📥 Exportar CSV
                </button>

                <button
                  onClick={printAllUserCards}
                  className={`${styles.button} ${styles.primaryButton}`}
                  disabled={filteredUsers.length === 0}
                  title="Imprimir fichas de todos os usuários filtrados"
                >
                  🖨️ Imprimir Fichas ({filteredUsers.length})
                </button>
              </div>
            )}
          </div>

          {/* Results Table */}
          {filteredUsers.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Foto</th>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Nome</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Telefone</th>
                  <th className={styles.th}>Renda</th>
                  <th className={styles.th}>Dependentes</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Observações</th>
                  {showActions && <th className={styles.th}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{ userSelect: 'none' }}>
                    <td className={styles.td}>
                      {user.photoPath ? (
                        <img
                          src={user.photoPath}
                          alt={`Foto de ${user.name}`}
                          className={styles.userPhoto}
                        />
                      ) : (
                        <span className={styles.noPhotoPlaceholder}>—</span>
                      )}
                    </td>
                    <td className={styles.td}>{user.id}</td>
                    <td className={styles.td}><strong>{user.name}</strong></td>
                    <td className={styles.td}>{user.email}</td>
                    <td className={styles.td}>{user.phone}</td>
                    <td className={styles.td}>
                      R$ {user.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={styles.td}>{user.dependents.length}</td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {user.observations ? (
                        user.observations.length > 50
                          ? `${user.observations.substring(0, 50)}...`
                          : user.observations
                      ) : '-'}
                    </td>
                    {showActions && (
                      <td className={styles.td} style={{ whiteSpace: 'nowrap' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                          title="Editar usuário"
                          className={`${styles.actionButton} ${styles.editButton}`}
                          aria-label={`Editar usuário ${user.name}`}
                        >
                          ✏️
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printUserCard(user);
                          }}
                          title="Imprimir ficha do usuário"
                          className={`${styles.actionButton} ${styles.printButton}`}
                          aria-label={`Imprimir ficha de ${user.name}`}
                        >
                          🖨️
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
                          }}
                          title="Excluir usuário"
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          aria-label={`Excluir usuário ${user.name}`}
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noResults}>
              {loading ? '⏳ Carregando usuários...' : '📭 Nenhum usuário encontrado com os filtros aplicados'}
            </div>
          )}

          {/* Print Summary */}
          <div className={styles.printSummary}>
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

      {/* Modal de Edição */}
      {editingUser && (
        <div className={styles.modal} onClick={() => setEditingUser(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditingUser(null)}
              className={styles.closeButton}
              aria-label="Fechar modal"
            >
              ×
            </button>

            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              ✏️ Editar Usuário
            </h2>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Nome *</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Telefone</label>
                <input
                  type="tel"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className={styles.select}
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Renda</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingUser.income}
                  onChange={(e) => setEditingUser({ ...editingUser, income: parseFloat(e.target.value) || 0 })}
                  className={styles.input}
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.formGroupFull}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label className={styles.label} style={{ marginBottom: 0 }}>Dependentes</label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingUser(prev => prev ? { ...prev, dependents: [...prev.dependents, { name: '', birthDate: '' }] } : null);
                    }}
                    style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    + Adicionar
                  </button>
                </div>

                {editingUser.dependents.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic', margin: '5px 0' }}>Sem dependentes.</p>
                ) : (
                  editingUser.dependents.map((dependent, index) => {
                    const age = dependent.birthDate ? Math.floor((new Date().getTime() - new Date(dependent.birthDate).getTime()) / 31557600000) : null;
                    return (
                      <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '8px', borderRadius: '4px', border: '1px solid #eee' }}>
                        <input
                          type="text"
                          value={dependent.name}
                          onChange={(e) => {
                            const newDeps = [...editingUser.dependents];
                            newDeps[index].name = e.target.value;
                            setEditingUser({ ...editingUser, dependents: newDeps });
                          }}
                          className={styles.input}
                          placeholder="Nome"
                          style={{ flex: 2, padding: '6px' }}
                        />
                        <input
                          type="date"
                          value={dependent.birthDate || ''}
                          onChange={(e) => {
                            const newDeps = [...editingUser.dependents];
                            newDeps[index].birthDate = e.target.value;
                            setEditingUser({ ...editingUser, dependents: newDeps });
                          }}
                          className={styles.input}
                          style={{ flex: 1, padding: '6px' }}
                        />
                        <span style={{ fontSize: '12px', width: '40px', textAlign: 'center' }}>
                          {age !== null && age >= 0 ? `${age}a` : '-'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newDeps = [...editingUser.dependents];
                            newDeps.splice(index, 1);
                            setEditingUser({ ...editingUser, dependents: newDeps });
                          }}
                          style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={`${styles.inputGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Rua e Número</label>
                <input
                  type="text"
                  value={`${editingUser.addressEntity.street}, ${editingUser.addressEntity.number}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setEditingUser({
                      ...editingUser,
                      addressEntity: { ...editingUser.addressEntity, street: parts[0] || '', number: parts[1] ? parts[1].trim() : '' }
                    });
                  }}
                  className={styles.input}
                />
              </div>

              <div className={`${styles.inputGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Upload de Nova Foto (máx 2MB)</label>
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('A foto deve ter no máximo 2MB.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64String = reader.result as string;
                        setEditingUser({ ...editingUser, photoPath: base64String });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className={styles.input}
                  style={{ padding: '8px' }}
                />
                {editingUser.photoPath && editingUser.photoPath.startsWith('data:image') && (
                  <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>✓ Nova foto carregada pronta para salvar.</p>
                )}
              </div>

              <div className={`${styles.inputGroup} ${styles.formGroupFull}`}>
                <label className={styles.label}>Observações</label>
                <textarea
                  value={editingUser.observations || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, observations: e.target.value })}
                  className={styles.textarea}
                  placeholder="Observações sobre o usuário..."
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                onClick={handleSaveUser}
                className={`${styles.button} ${styles.successButton}`}
                disabled={!editingUser.name || !editingUser.email}
              >
                💾 Salvar Alterações
              </button>

              <button
                onClick={() => printUserCard(editingUser)}
                className={`${styles.button} ${styles.primaryButton}`}
              >
                🖨️ Imprimir Ficha
              </button>

              <button
                onClick={() => setEditingUser(null)}
                className={`${styles.button} ${styles.warningButton}`}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserSearch;