import React, { useState } from 'react';

interface ClientData {
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

const ClientRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<ClientData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    income: 0,
    numOfDependents: 0,
    status: '',
    observations: '',
    photo: undefined
  });

  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'income' || name === 'numOfDependents' ? Number(value) : value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData(prev => ({ ...prev, photo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validação básica antes de enviar
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.status) {
      alert('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🚀 Dados a serem enviados:', JSON.stringify(formData, null, 2));
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Status da resposta:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Usuário cadastrado com sucesso:', result);
        alert(`Usuário cadastrado com sucesso! ID: ${result.id}`);
        clearForm();
      } else {
        const errorText = await response.text();
        console.error('❌ Erro do servidor:', errorText);
        
        if (errorText.includes('duplicate key') || errorText.includes('already exists')) {
          alert('Erro: Email já cadastrado! Use um email diferente.');
        } else {
          alert(`Erro do servidor (${response.status}): Por favor, tente novamente.`);
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
      address: '',
      income: 0,
      numOfDependents: 0,
      status: '',
      observations: '',
      photo: undefined
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
                <label style={styles.label}>Selecionar Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={styles.fileInput}
                />
                <p style={styles.hint}>PNG, JPG até 5MB</p>
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
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Endereço *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="Rua, número, complemento, bairro, cidade - CEP"
            />
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

              <div style={styles.inputGroup}>
                <label style={styles.label}>Número de Dependentes *</label>
                <input
                  type="number"
                  name="numOfDependents"
                  value={formData.numOfDependents}
                  onChange={handleInputChange}
                  required
                  min="0"
                  style={styles.input}
                  placeholder="0"
                />
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
          </div>

          {/* Print Summary */}
          <div style={styles.printSummary}>
            <h2>Resumo do Cadastro</h2>
            <div style={styles.summaryGrid}>
              <div><strong>Nome:</strong> {formData.name}</div>
              <div><strong>Email:</strong> {formData.email}</div>
              <div><strong>Telefone:</strong> {formData.phone}</div>
              <div><strong>Endereço:</strong> {formData.address}</div>
              <div><strong>Renda:</strong> R$ {formData.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div><strong>Dependentes:</strong> {formData.numOfDependents}</div>
              <div><strong>Status:</strong> {formData.status}</div>
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