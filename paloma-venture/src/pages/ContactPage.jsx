import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { useToast } from '../contexts/ToastContext';

const ContactPage = () => {
  const { showToast } = useToast();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui no futuro conectar com o Backend
    showToast('Mensagem enviada com sucesso! Em breve responderemos.', 'success');
  };

  return (
    <div className="container page-enter">
      <Breadcrumbs />
      <h1 className="section-title">Fale Conosco</h1>

      <div className="contact-grid">
        {/* Lado Esquerdo: Infos */}
        <div className="contact-info-box">
          <h2 style={{marginTop: 0, fontFamily: 'Times New Roman, serif', color: 'var(--primary)'}}>Canais de Atendimento</h2>
          <p>Tem alguma dúvida sobre tamanho, entrega ou pagamento? Estamos à disposição!</p>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <div style={{background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    <Phone size={24} color="var(--primary)" />
                </div>
                <div>
                    <strong style={{display:'block'}}>WhatsApp</strong>
                    <span style={{color: '#64748b'}}>(27) 99983-6947</span>
                </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <div style={{background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    <Mail size={24} color="var(--primary)" />
                </div>
                <div>
                    <strong style={{display:'block'}}>E-mail</strong>
                    <span style={{color: '#64748b'}}>contato@palomaventure.com.br</span>
                </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <div style={{background: 'white', padding: '10px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
                    <MapPin size={24} color="var(--primary)" />
                </div>
                <div>
                    <strong style={{display:'block'}}>Localização</strong>
                    <span style={{color: '#64748b'}}>Espírito Santo, Brasil</span>
                </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input type="text" className="form-input" placeholder="Seu nome" required />
            </div>

            <div className="form-group">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-input" placeholder="seu@email.com" required />
            </div>

            <div className="form-group">
                <label className="form-label">Mensagem</label>
                <textarea className="form-textarea" rows="5" placeholder="Como podemos ajudar?" required></textarea>
            </div>

            <button type="submit" className="add-btn" style={{width: '100%', justifyContent: 'center'}}>
                <Send size={18} /> Enviar Mensagem
            </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;