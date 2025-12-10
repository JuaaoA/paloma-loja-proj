import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, MessageCircle, MapPin } from 'lucide-react';
import './Style/Footer.css'; // Importa o CSS específico do Footer

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>By Paloma Venture</h3>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
              Moda feminina com elegância e estilo.
            </p>
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
              <MapPin size={18} /> <span>Domingos Martins - ES</span>
            </div>

            <h3>Institucional</h3>
            <ul className="footer-links">
              <li><Link to="/quem-somos">Quem Somos</Link></li>
              <li><Link to="/politicas">Política de Trocas</Link></li>
              <li><Link to="/contato">Fale Conosco</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Fale Conosco</h3>
            <a href="https://wa.me/5527999836947" target="_blank" rel="noreferrer" className="contact-btn">
                <MessageCircle size={20} color="#25D366" /> <div><small>WhatsApp</small>(27) 99983-6947</div>
            </a>
            <a href="https://instagram.com/bypalomaventure" target="_blank" rel="noreferrer" className="contact-btn">
                <Instagram size={20} color="#E1306C" /> <div><small>Instagram</small>@bypalomaventure</div>
            </a>
            <a href="mailto:palomaventure@icloud.com" className="contact-btn">
                <Mail size={20} /> <div><small>E-mail</small>palomaventure@icloud.com</div>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} By Paloma Venture. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;