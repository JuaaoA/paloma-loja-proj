import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronRight, Home, Grid, Tag } from 'lucide-react'; // Ícones novos
import { useCart } from '../contexts/CartContext';
import './Style/Header.css'; // Importa o CSS específico do Header

const Header = () => {
  const { cart, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Função para navegar e fechar o menu ao mesmo tempo
  const handleMobileClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header>
        {/* --- 1. ESQUERDA --- */}
        {/* No Desktop: Logo fica aqui*/}
        {/* No Mobile: Botão Hambúrguer fica aqui */}
        
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            {/* Botão Mobile (Só aparece < 768px via CSS) */}
            <button 
                className="mobile-menu-btn" 
                onClick={() => setIsMobileMenuOpen(true)}
            >
                <Menu size={28} />
            </button>

            {/* Logo (No Desktop aparece aqui. No mobile também, mas empurrado pelo botão) */}
            <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="logo" style={{ fontFamily: 'Times New Roman, serif', whiteSpace: 'nowrap' }}>
                    By Paloma Venture
                </div>
            </Link>
        </div>
        
        {/* --- 2. CENTRO (Menu Desktop) --- */}
        {/* Essa nav some no mobile via classe .desktop-nav */}
        <nav className="desktop-nav">
          <Link to="/" style={{textDecoration: 'none', color: 'white', fontWeight: 500}}>Início</Link>
          <Link to="/catalogo" style={{textDecoration: 'none', color: 'white', fontWeight: 500}}>Catálogo</Link>
        </nav>

        {/* --- 3. DIREITA (Carrinho) --- */}
        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          <ShoppingBag size={24} />
          {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
        </button>
      </header>


      {/* --- MENU GAVETA MOBILE (Fica fora do header) --- */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)} // Fecha ao clicar fora
      >
        <div className="mobile-menu-content" onClick={e => e.stopPropagation()}>
            {/* Cabeçalho do Menu */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
                <span style={{fontFamily: 'Times New Roman, serif', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold'}}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{background:'none', border:'none', color:'#666'}}>
                    <X size={28} />
                </button>
            </div>

            {/* Links do Mobile */}
            <nav style={{display: 'flex', flexDirection: 'column'}}>
                <div className="mobile-nav-link" onClick={() => handleMobileClick('/')}>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}><Home size={20} /> Início</div>
                    <ChevronRight size={16} color="#ccc" />
                </div>

                <div className="mobile-nav-link" onClick={() => handleMobileClick('/catalogo')}>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}><Grid size={20} /> Catálogo</div>
                    <ChevronRight size={16} color="#ccc" />
                </div>
            </nav>

            {/* Rodapé do Menu Mobile */}
            <div style={{marginTop: 'auto', borderTop: '1px solid #f0f0f0', paddingTop: '20px', color: '#999', fontSize: '0.8rem'}}>
                <p>Siga-nos @bypalomaventure</p>
                <p>Contato: (27) 99983-6947</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default Header;