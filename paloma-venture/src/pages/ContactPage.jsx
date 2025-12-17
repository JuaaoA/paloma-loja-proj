import React, { useEffect } from 'react';
import { Mail, MapPin, Instagram, MessageCircle, ExternalLink } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import './Style/Institucional.css';

const ContactPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="container page-enter">
      <Breadcrumbs />
      
      <div className="contact-hero">
        <h1 className="section-title">Fale Conosco</h1>
        <p className="section-subtitle">
            Estamos prontos para te atender! Escolha o canal de sua preferência para tirar dúvidas sobre pedidos, tamanhos ou entregas.
        </p>
      </div>

      <div className="contact-hub-grid">
        
        {/* CARTÃO WHATSAPP (Destaque) */}
        <a href="https://wa.me/5527999836947" target="_blank" rel="noreferrer" className="hub-card whatsapp">
            <div className="icon-wrapper">
                <MessageCircle size={32} />
            </div>
            <div className="card-content">
                <h3>WhatsApp</h3>
                <p>Atendimento rápido e personalizado.</p>
                <span className="action-link">(27) 99983-6947 <ExternalLink size={14}/></span>
            </div>
        </a>

        {/* CARTÃO INSTAGRAM */}
        <a href="https://instagram.com/bypalomaventure" target="_blank" rel="noreferrer" className="hub-card instagram">
            <div className="icon-wrapper">
                <Instagram size={32} />
            </div>
            <div className="card-content">
                <h3>Instagram</h3>
                <p>Siga nossas novidades e looks.</p>
                <span className="action-link">@bypalomaventure <ExternalLink size={14}/></span>
            </div>
        </a>

        {/* CARTÃO E-MAIL */}
        <a href="mailto:palomaventure@icloud.com" className="hub-card email">
            <div className="icon-wrapper">
                <Mail size={32} />
            </div>
            <div className="card-content">
                <h3>E-mail</h3>
                <p>Para assuntos administrativos.</p>
                <span className="action-link">palomaventure@icloud.com</span>
            </div>
        </a>

      </div>

      {/* CARTÃO DE LOCALIZAÇÃO */}
      <div className="location-box">
        <MapPin size={24} color="var(--primary)" />
        <div>
            <strong>Domingos Martins - Espírito Santo</strong>
            <p>Enviamos para todo o Brasil com carinho.</p>
        </div>
      </div>

    </div>
  );
};

export default ContactPage;