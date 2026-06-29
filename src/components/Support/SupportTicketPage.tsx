import React, { useState } from 'react';

const SupportTicketPage: React.FC = () => {
  const [replyEmail, setReplyEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');

    try {
      // Usando Web3Forms para enviar o e-mail (com a chave protegida na variável de ambiente Vercel)
      const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      
      if (!WEB3FORMS_KEY) {
        alert("Erro de configuração: Chave do Web3Forms não encontrada no ambiente.");
        setStatus('idle');
        return;
      }

      const formData = new FormData();
      formData.append("access_key", WEB3FORMS_KEY);
      formData.append("subject", "Novo Chamado de Suporte ERP");
      formData.append("from_name", "Sistema ERP");
      formData.append("name", "Usuário do Sistema");
      formData.append("replyto", replyEmail);
      formData.append("email", replyEmail);
      formData.append("message", message);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success === "true" || result.success === true) {
            setStatus('success');
            setMessage('');
            setReplyEmail('');
            setTimeout(() => setStatus('idle'), 5000);
        } else {
            alert("Atenção (FormSubmit): " + result.message);
            setStatus('error');
        }
      } else {
        const errorText = await response.text();
        console.error('Erro detalhado do FormSubmit:', errorText);
        alert('Erro ao processar e-mail: ' + errorText);
        setStatus('error');
      }
    } catch (e) {
      console.error('Erro de rede ou chamada:', e);
      alert('Falha de conexão: ' + (e as Error).message);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Abrir Chamado</h2>
        <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '0.95rem' }}>
          Descreva o problema ou solicitação abaixo. A sua mensagem será encaminhada para a administração.
        </p>
      </div>

      {status === 'success' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' }}>
          ✅ Chamado enviado com sucesso! Nossa equipe entrará em contato em breve.
        </div>
      )}

      {status === 'error' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' }}>
          ❌ Ocorreu um erro ao tentar enviar o chamado. Tente novamente mais tarde.
        </div>
      )}

      <form onSubmit={handleSendTicket} style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="replyEmail" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>
            Seu E-mail para Contato
          </label>
          <input
            id="replyEmail"
            name="replyEmail"
            type="email"
            value={replyEmail}
            onChange={(e) => setReplyEmail(e.target.value)}
            placeholder="Digite o seu e-mail..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '0.95rem'
            }}
            required
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="message" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>
            <span>Sua Mensagem</span>
            <span style={{ fontSize: '0.8rem', color: message.length > 2000 ? 'red' : '#94a3b8', fontWeight: 'normal' }}>
              {message.length} / 2000
            </span>
          </label>
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
            maxLength={2000}
            placeholder="Descreva detalhadamente a sua solicitação..."
            rows={8}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              resize: 'vertical',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending' || !message.trim()}
          style={{
            width: '100%',
            padding: '14px',
            background: status === 'sending' || !message.trim() ? '#94a3b8' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: status === 'sending' || !message.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'background 0.2s'
          }}
        >
          {status === 'sending' ? 'Enviando...' : 'Enviar Chamado'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '16px' }}>
          Esta mensagem será enviada de forma segura. O título e os detalhes técnicos são preenchidos automaticamente.
        </p>
      </form>
    </div>
  );
};

export default SupportTicketPage;
