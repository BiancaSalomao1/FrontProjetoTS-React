import React, { useState } from 'react';
import { useEffect } from 'react';
import { getAuthHeaders, handleAuthError } from '../../utils/auth';

interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Dependent {
  name: string;
  birthDate?: string;
  age?: number;
}

interface ClientData {
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
  startAssistanceDate?: string;
  endAssistanceDate?: string;
}

const theme = {
  colors: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    secondary: '#6c757d',
    secondaryHover: '#5a6268',
    background: '#f5f5f5',
    white: '#ffffff',
    border: '#ddd',
    text: '#333',
    textLight: '#666',
    success: '#28a745',
    photoSection: '#f8f9fa',
    financialSection: '#e3f2fd'
  },
  spacing: {
    xs: '5px',
    sm: '10px',
    md: '15px',
    lg: '20px',
    xl: '30px'
  },
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  } as React.CSSProperties,

  formContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius,
    boxShadow: theme.boxShadow,
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

  printButton: {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.white,
    border: 'none',
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  } as React.CSSProperties,

  photoSection: {
    backgroundColor: theme.colors.photoSection,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius,
    marginBottom: '25px'
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '18px',
    color: '#495057',
    margin: `0 0 ${theme.spacing.md} 0`,
    fontWeight: '600'
  } as React.CSSProperties,

  photoContainer: {
    display: 'flex',
    gap: theme.spacing.lg,
    alignItems: 'flex-start'
  } as React.CSSProperties,

  photoPreview: {
    width: '120px',
    height: '120px',
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: theme.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.white
  } as React.CSSProperties,

  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  } as React.CSSProperties,

  photoPlaceholder: {
    fontSize: '40px',
    color: '#999'
  } as React.CSSProperties,

  photoUpload: {
    flex: 1
  } as React.CSSProperties,

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg
  } as React.CSSProperties,

  inputGroup: {
    marginBottom: theme.spacing.lg
  } as React.CSSProperties,

  label: {
    display: 'block',
    marginBottom: theme.spacing.xs,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontSize: '14px'
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit'
  } as React.CSSProperties,

  select: {
    width: '100%',
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    backgroundColor: theme.colors.white,
    fontFamily: 'inherit'
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    padding: theme.spacing.sm,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    minHeight: '100px'
  } as React.CSSProperties,

  fileInput: {
    width: '100%',
    padding: '8px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '4px',
    backgroundColor: theme.colors.white,
    fontSize: '14px'
  } as React.CSSProperties,

  hint: {
    fontSize: '12px',
    color: theme.colors.textLight,
    margin: `${theme.spacing.xs} 0 0 0`
  } as React.CSSProperties,

  financialSection: {
    backgroundColor: theme.colors.financialSection,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius,
    marginBottom: '25px'
  } as React.CSSProperties,

  buttonContainer: {
    display: 'flex',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTop: `1px solid ${theme.colors.border}`
  } as React.CSSProperties,

  submitButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    padding: `12px 24px`,
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease'
  } as React.CSSProperties,

  clearButton: {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.white,
    border: 'none',
    padding: `12px 24px`,
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s ease'
  } as React.CSSProperties,

  printSummary: {
    display: 'none',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTop: `1px solid ${theme.colors.text}`
  } as React.CSSProperties,

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.sm,
    fontSize: '14px',
    marginBottom: theme.spacing.md
  } as React.CSSProperties,

  observations: {
    marginBottom: theme.spacing.md,
    fontSize: '14px'
  } as React.CSSProperties,

  timestamp: {
    fontSize: '12px',
    color: theme.colors.textLight
  } as React.CSSProperties
};

interface ClientFormProps {
  user?: ClientData; // dados recebidos para edição 
  onSave?: () => void;
  onCancel?: () => void;
}

const ClientRegistrationForm: React.FC<ClientFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ClientData>({
    name: '',
    email: '',
    phone: '',
    addressEntity: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
    income: 0,
    dependents: [],
    status: '',
    observations: '',
    photoPath: undefined,
    startAssistanceDate: undefined,
    endAssistanceDate: undefined
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        income: user.income || 0,
        dependents: user.dependents || [],
        addressEntity: user.addressEntity || { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' }
      });
      if (user.photoPath) {
        setPhotoPreview(user.photoPath);
      }
    }
  }, [user]);

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          addressEntity: {
            ...prev.addressEntity,
            street: data.logradouro || prev.addressEntity.street,
            neighborhood: data.bairro || prev.addressEntity.neighborhood,
            city: data.localidade || prev.addressEntity.city,
            state: data.uf || prev.addressEntity.state,
            zipCode: cleanCep
          }
        }));
      } else {
        alert('CEP não encontrado. Verifique e tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
    } finally {
      setCepLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        addressEntity: {
          ...prev.addressEntity,
          [name]: value
        }
      }));
      // Auto-buscar endereço quando CEP for preenchido com 8 dígitos
      if (name === 'zipCode') {
        const cleanCep = value.replace(/\D/g, '');
        if (cleanCep.length === 8) {
          fetchAddressByCep(cleanCep);
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'income' ? Number(value) : value
      }));
    }
  };


  const handleSubmit = async () => {
    // Validação básica antes de enviar
    if (!formData.name || !formData.email || !formData.phone || !formData.status) {
      alert('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Dados a serem enviados:', JSON.stringify(formData, null, 2));

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = user?.id ? `${API_BASE_URL}/api/users/${user.id}` : `${API_BASE_URL}/api/users`;
      const method = user?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        handleAuthError(response);
      }

      console.log('📡 Status da resposta:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Usuário cadastrado com sucesso:', result);
        alert(`Usuário cadastrado com sucesso! ID: ${result.id}`);
        clearForm();
        onSave?.();
      } else {
        const errorText = await response.text();
        console.error('❌ Erro do servidor:', errorText);

        if (errorText.includes('duplicate key') || errorText.includes('already exists') || errorText.includes('DataIntegrityViolationException') || errorText.includes('23505') || errorText.includes('UK_6DOTKOTT2KJSP8VW4D0M25FB7_INDEX_4')) {
          alert('Erro: Este e-mail já está cadastrado no sistema para outra família! Por favor, use um e-mail diferente.');
        } else {
          alert(`Erro do servidor (${response.status}): Por favor, verifique se todos os dados estão corretos e tente novamente.`);
        }
      }
    } catch (error) {
      console.error('🔥 Erro completo:', error);
      alert('Erro de conexão. Verifique se o backend está funcionando.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      addressEntity: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
      income: 0,
      dependents: [],
      status: '',
      observations: '',
      photoPath: undefined
    });
    setPhotoPreview(null);
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.formContainer}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>📋 Cadastro de Usuário</h1>
            <button onClick={handlePrint} style={styles.printButton}>
              🖨️ Imprimir
            </button>
          </div>

          {/* Assistance Dates Info */}
          {(formData.startAssistanceDate || formData.endAssistanceDate) && (
            <div style={{ padding: '15px', backgroundColor: '#e8f4fd', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #007bff' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0056b3' }}>ℹ️ Informações de Assistência</h3>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
                {formData.startAssistanceDate && (
                  <div>
                    <strong>Início da Assistência: </strong>
                    {new Date(formData.startAssistanceDate).toLocaleDateString('pt-BR')}
                  </div>
                )}
                {formData.endAssistanceDate && (
                  <div>
                    <strong>Final da Assistência: </strong>
                    {new Date(formData.endAssistanceDate).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photo Section */}
          <div style={styles.photoSection}>
            <h2 style={styles.sectionTitle}>Foto do Usuário</h2>
            <div style={styles.photoContainer}>
              <div style={styles.photoPreview}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto do usuário" style={styles.photo} />
                ) : (
                  <div style={styles.photoPlaceholder}>📷</div>
                )}
              </div>
              <div style={styles.photoUpload}>
                <label style={styles.label}>Upload de Foto (máx 2MB)</label>
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
                        setFormData(prev => ({ ...prev, photoPath: base64String }));
                        setPhotoPreview(base64String);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={styles.fileInput}
                />
                <p style={styles.hint}>Formatos aceitos: JPG, PNG, WEBP</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Nome completo do usuário"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="usuario@email.com"
              />
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Telefone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                style={styles.select}
              >
                <option value="">Selecione o status</option>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="PENDENTE">Pendente</option>
              </select>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Início da Assistência</label>
              <input
                type="date"
                name="startAssistanceDate"
                value={formData.startAssistanceDate || ''}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={{ ...styles.inputGroup, position: 'relative' }}>
              <label style={styles.label}>CEP *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.addressEntity.zipCode}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Ex: 00000-000"
              />
              {cepLoading && <span style={{ position: 'absolute', right: '10px', top: '35px', fontSize: '0.8rem', color: '#6366f1' }}>Buscando...</span>}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Rua / Logradouro *</label>
              <input
                type="text"
                name="street"
                value={formData.addressEntity.street}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Ex: Rua das Flores"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Número *</label>
              <input
                type="text"
                name="number"
                value={formData.addressEntity.number}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Ex: 123"
              />
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Bairro *</label>
              <input
                type="text"
                name="neighborhood"
                value={formData.addressEntity.neighborhood}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Ex: Centro"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Cidade *</label>
              <input
                type="text"
                name="city"
                value={formData.addressEntity.city}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Ex: São Paulo"
              />
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Estado *</label>
              <input
                type="text"
                name="state"
                value={formData.addressEntity.state}
                onChange={handleInputChange}
                required
                style={styles.input}
                placeholder="Ex: SP"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div style={styles.financialSection}>
            <h2 style={styles.sectionTitle}>💰 Informações Financeiras</h2>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Renda (R$) *</label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  style={styles.input}
                  placeholder="0,00"
                />
              </div>

              <div style={{ ...styles.financialSection, marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h2 style={styles.sectionTitle}>👨‍👩‍👧‍👦 Dependentes</h2>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, dependents: [...prev.dependents, { name: '', birthDate: '' }] }))}
                    style={{ ...styles.submitButton, padding: '8px 15px', fontSize: '14px', backgroundColor: '#28a745' }}
                  >
                    ➕ Adicionar Dependente
                  </button>
                </div>

                {formData.dependents.length === 0 ? (
                  <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic' }}>Nenhum dependente cadastrado.</p>
                ) : (
                  formData.dependents.map((dependent, index) => {
                    const age = dependent.birthDate ?
                      Math.floor((new Date().getTime() - new Date(dependent.birthDate).getTime()) / 31557600000) :
                      null;

                    return (
                      <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-end', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <div style={{ flex: 2 }}>
                          <label style={styles.label}>Nome do Dependente</label>
                          <input
                            type="text"
                            value={dependent.name}
                            onChange={(e) => {
                              const newDeps = [...formData.dependents];
                              newDeps[index].name = e.target.value;
                              setFormData({ ...formData, dependents: newDeps });
                            }}
                            style={styles.input}
                            placeholder="Nome completo"
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={styles.label}>Data de Nascimento</label>
                          <input
                            type="date"
                            value={dependent.birthDate || ''}
                            onChange={(e) => {
                              const newDeps = [...formData.dependents];
                              newDeps[index].birthDate = e.target.value;
                              setFormData({ ...formData, dependents: newDeps });
                            }}
                            style={styles.input}
                          />
                        </div>
                        <div style={{ width: '80px', textAlign: 'center', paddingBottom: '10px' }}>
                          <span style={{ fontWeight: 'bold', color: '#555' }}>
                            {age !== null && age >= 0 ? `${age} anos` : '-'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newDeps = [...formData.dependents];
                            newDeps.splice(index, 1);
                            setFormData({ ...formData, dependents: newDeps });
                          }}
                          style={{ ...styles.clearButton, padding: '10px', backgroundColor: '#dc3545', width: 'auto' }}
                          title="Remover dependente"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Observações</label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleInputChange}
              rows={4}
              style={styles.textarea}
              placeholder="Informações adicionais sobre o usuário..."
            />
          </div>

          {/* Form Actions */}
          <div style={styles.buttonContainer}>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                ...styles.submitButton,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              💾 {isLoading ? 'Salvando...' : 'Salvar Usuário'}
            </button>

            <button onClick={clearForm} style={styles.clearButton}>
              🗑️ Limpar Formulário
            </button>

            {onCancel && (
              <button onClick={onCancel} style={styles.clearButton}>
                ❌ Cancelar
              </button>
            )}
          </div>

          {/* Print Summary */}
          <div style={styles.printSummary}>
            <h2>Resumo do Cadastro</h2>
            <div style={styles.summaryGrid}>
              <div><strong>Nome:</strong> {formData.name}</div>
              <div><strong>Email:</strong> {formData.email}</div>
              <div><strong>Telefone:</strong> {formData.phone}</div>
              <div><strong>Endereço:</strong> {formData.addressEntity.street}, {formData.addressEntity.number} - {formData.addressEntity.city}/{formData.addressEntity.state}</div>
              <div><strong>Renda:</strong> R$ {formData.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div><strong>Dependentes:</strong> {formData.dependents.length} {formData.dependents.length > 0 ? `(${formData.dependents.map(d => {
                const age = d.birthDate ? Math.floor((new Date().getTime() - new Date(d.birthDate).getTime()) / 31557600000) : null;
                return age !== null && age >= 0 ? `${d.name} [${age} anos]` : d.name;
              }).join(', ')})` : ''}</div>
              <div><strong>Status:</strong> {formData.status}</div>
              <div><strong>Início da Assistência:</strong> {formData.startAssistanceDate ? new Date(formData.startAssistanceDate).toLocaleDateString('pt-BR') : 'Não informado'}</div>
            </div>
            {formData.observations && (
              <div style={styles.observations}>
                <strong>Observações:</strong> {formData.observations}
              </div>
            )}
            <div style={styles.timestamp}>
              Cadastro gerado em: {new Date().toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            button {
              display: none !important;
            }
            .printSummary {
              display: block !important;
            }
            body {
              margin: 0;
              background-color: white !important;
            }
          }
          
          @media (max-width: 768px) {
            .formGrid {
              grid-template-columns: 1fr !important;
            }
            .photoContainer {
              flex-direction: column !important;
              align-items: center !important;
            }
            .buttonContainer {
              flex-direction: column !important;
            }
          }
        `
      }} />
    </>
  );
};

export default ClientRegistrationForm;