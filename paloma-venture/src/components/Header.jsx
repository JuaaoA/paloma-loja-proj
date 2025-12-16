import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronRight, Home, Grid, User, LogOut, Package } from 'lucide-react'; 
import { useCart } from '../contexts/CartContext';
import { supabase } from '../services/supabase';
import './Style/Header.css';

const Header = () => {
  const { cart, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleMobileClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Cliente';

  return (
    <>
      <header>
        {/* --- 1. ESQUERDA (Menu Mobile + Logo) --- */}
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <button 
                className="mobile-menu-btn" 
                onClick={() => setIsMobileMenuOpen(true)}
            >
                <Menu size={28} />
            </button>

            <Link to="/" style={{textDecoration: 'none', color: 'inherit'}}>
                <div className="logo" style={{ fontFamily: 'Times New Roman, serif', whiteSpace: 'nowrap' }}>
                    By Paloma Venture
                </div>
            </Link>
        </div>
        
        {/* --- 2. CENTRO (Nav Desktop) --- */}
        <nav className="desktop-nav">
          <Link to="/" style={{textDecoration: 'none', color: 'white', fontWeight: 500}}>Início</Link>
          <Link to="/catalogo" style={{textDecoration: 'none', color: 'white', fontWeight: 500}}>Catálogo</Link>
        </nav>

        {/* --- 3. DIREITA (Auth + Carrinho) --- */}
        <div style={{display: 'flex', alignItems: 'center'}}>
            
            {/* LÓGICA DE LOGIN DESKTOP */}
            <div className="desktop-auth">
                {user ? (
                    <div className="user-greeting">
                        {/* NOVO LINK: MEUS PEDIDOS */}
                        <Link to="/meus-pedidos" className="header-icon-link" title="Meus Pedidos">
                            <Package size={20} />
                        </Link>
                        
                        <span style={{margin:'0 8px'}}>|</span>

                        <span>Olá, {firstName}</span>
                        <button onClick={handleLogout} className="logout-btn" title="Sair">
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="auth-link">
                        <User size={20} /> Entrar
                    </Link>
                )}
            </div>

            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                <ShoppingBag size={24} />
                {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
        </div>
      </header>


      {/* --- MENU GAVETA MOBILE --- */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div className="mobile-menu-content" onClick={e => e.stopPropagation()}>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <span style={{fontFamily: 'Times New Roman, serif', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold'}}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{background:'none', border:'none', color:'#666'}}>
                    <X size={28} />
                </button>
            </div>

            {/* --- CARTÃO DE USUÁRIO MOBILE --- */}
            <div className="mobile-user-card">
                {user ? (
                    <>
                        <div className="mobile-user-info">
                            <div style={{background: 'var(--primary)', padding: '8px', borderRadius: '50%', color: 'white'}}>
                                <User size={20} />
                            </div>
                            <div>
                                <strong style={{display: 'block', color: '#333'}}>Olá, {firstName}</strong>
                                <span style={{fontSize: '0.8rem', color: '#666'}}>{user.email}</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="mobile-logout-btn">
                            Sair da conta
                        </button>
                    </>
                ) : (
                    <>
                        <p style={{margin: '0 0 10px 0', fontSize: '0.9rem', color: '#666'}}>Entre para ver seus pedidos.</p>
                        <button onClick={() => handleMobileClick('/login')} className="mobile-login-btn">
                            Entrar ou Cadastrar
                        </button>
                    </>
                )}
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

                {/* NOVO LINK MOBILE: MEUS PEDIDOS (Só aparece se logado) */}
                {user && (
                    <div className="mobile-nav-link" onClick={() => handleMobileClick('/meus-pedidos')}>
                        <div style={{display:'flex', gap:'10px', alignItems:'center', color:'var(--primary)'}}>
                            <Package size={20} /> Meus Pedidos
                        </div>
                        <ChevronRight size={16} color="#ccc" />
                    </div>
                )}
            </nav>

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