import React, { useState } from 'react';

interface ClientData {
  email: string;
  phone: string;
  address: string;
  income: number;
  numOfDependents: number;
  status: string;
  observations: string;
  photo?: string;
}

const ClientRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<ClientData>({
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
    setIsLoading(true);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('usuário cadastrado com sucesso!');
        setFormData({
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
      } else {
        throw new Error('Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cadastrar usuário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clearForm = () => {
    setFormData({
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
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Cadastro de usuário</h1>
          <button onClick={handlePrint} style={styles.printButton}>
            🖨️ Imprimir
          </button>
        </div>

        {/* Photo Section */}
        <div style={styles.photoSection}>
          <h2 style={styles.sectionTitle}>Foto do usuário</h2>
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
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={styles.input}
              placeholder="usuário@email.com"
            />
          </div>

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
            style={{...styles.submitButton, opacity: isLoading ? 0.5 : 1}}
          >
            💾 {isLoading ? 'Salvando...' : 'Salvar usuário'}
          </button>
          
          <button onClick={clearForm} style={styles.clearButton}>
            🗑️ Limpar Formulário
          </button>
        </div>

        {/* Print Summary */}
        <div style={styles.printSummary}>
          <h2>Resumo do Cadastro</h2>
          <div style={styles.summaryGrid}>
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
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  formContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '30px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '20px'
  },
  title: {
    fontSize: '28px',
    color: '#333',
    margin: 0
  },
  printButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  photoSection: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#495057',
    marginBottom: '15px',
    margin: '0 0 15px 0'
  },
  photoContainer: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start'
  },
  photoPreview: {
    width: '120px',
    height: '120px',
    border: '2px dashed #ccc',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  photoPlaceholder: {
    fontSize: '40px',
    color: '#999'
  },
  photoUpload: {
    flex: 1
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    backgroundColor: 'white'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white'
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0 0 0'
  },
  financialSection: {
    backgroundColor: '#e3f2fd',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px'
  },
  buttonContainer: {
    display: 'flex',
    gap: '15px',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  clearButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  printSummary: {
    display: 'none',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #333'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    fontSize: '14px',
    marginBottom: '15px'
  },
  observations: {
    marginBottom: '15px',
    fontSize: '14px'
  },
  timestamp: {
    fontSize: '12px',
    color: '#666'
  }
};

// CSS para impressão
const printStyles = `
@media print {
  .container > div:first-child button {
    display: none !important;
  }
  .buttonContainer {
    display: none !important;
  }
  .printSummary {
    display: block !important;
  }
  body {
    margin: 0;
    font-size: 12px;
  }
}
`;

// Adicionar estilos de impressão
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
}

export default ClientRegistrationForm;