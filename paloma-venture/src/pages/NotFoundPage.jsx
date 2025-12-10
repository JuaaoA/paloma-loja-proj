import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchX, Home, ShoppingBag } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container page-enter" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh', // Centraliza verticalmente na tela
      textAlign: 'center',
      gap: '20px',
      padding: '40px 20px'
    }}>
      
      {/* Ícone Grande */}
      <div style={{
        background: '#f1f5f9',
        padding: '30px',
        borderRadius: '50%',
        marginBottom: '10px'
      }}>
        <SearchX size={64} color="var(--primary)" />
      </div>

      <h1 style={{
        fontFamily: 'Times New Roman, serif',
        fontSize: '3rem',
        color: 'var(--primary)',
        marginBottom: '0'
      }}>
        404
      </h1>
      
      <h2 style={{fontSize: '1.5rem', margin: '0'}}>Ops! Página não encontrada.</h2>
      
      <p style={{color: '#64748b', maxWidth: '400px', lineHeight: '1.6'}}>
        Parece que a peça que você está procurando não existe ou foi movida.
      </p>

      {/* Botões de Ação */}
      <div style={{display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center'}}>
        <button 
          onClick={() => navigate(-1)}
          className="back-btn" 
          style={{marginBottom: 0}} // Remove margem padrão do back-btn
        >
          Voltar
        </button>

        <Link to="/" className="add-btn" style={{
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          width: 'auto',
          padding: '10px 25px'
        }}>
          <Home size={18} /> Ir para o Início
        </Link>
        
        <Link to="/catalogo" className="add-btn" style={{
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            width: 'auto',
            padding: '10px 25px',
            background: 'white',
            color: 'var(--primary)',
            border: '1px solid var(--primary)'
        }}>
          <ShoppingBag size={18} /> Ver Catálogo
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;