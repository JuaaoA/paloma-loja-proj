import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react'; 
import HeroSlider from '../components/HeroSlider';
import CategoryGrid from '../components/CategoryGrid'; // O seu Grid novo
import Loading from '../components/Loading';
import SEO from '../components/SEO';

import { supabase } from '../services/supabase';

import './Style/HomePage.css'; // Importa o CSS específico da HomePage

const HomePage = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função assíncrona para buscar dados
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;

        // Se deu certo, salva no estado
        if (data) setProducts(data);
        
      } catch (error) {
        console.error("Erro ao buscar produtos:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts(); // Chama a função
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="page-enter">
      <SEO 
        title="Início" 
        description="Confira as novidades em moda feminina, vestidos, conjuntos e muito mais." 
      />
      {/* --------------------------------------- */}
      
      <HeroSlider />
      
      <CategoryGrid />
      
      <h2 className="section-title" style={{marginTop: '60px'}}>Todas as Peças</h2>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <Link to={`/produto/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
              <div className="product-image-container">
                <img src={product.images[0]} alt={product.name} className="product-image" />
                
                {/* Badge de Esgotado */}
                {product.stock === 0 && (
                    <span style={{position: 'absolute', top: 10, right: 10, background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>
                        Esgotado
                    </span>
                )}

                {/* --- Badge de Promoção na Home --- */}
                {product.onSale && product.stock > 0 && (
                    <span style={{position: 'absolute', top: 10, left: 10, background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>
                        OFERTA
                    </span>
                )}
              </div>
              
              <div className="product-info">
                <div className="product-meta">
                    {product.colors && product.colors.map((color, index) => (
                        <span key={index} className="color-dot" style={{backgroundColor: color}}></span>
                    ))}
                </div>
                <h3>{product.name}</h3>

                {/* --- Lógica de Preço (Antigo vs Novo) --- */}
                {product.onSale && product.oldPrice ? (
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <span style={{textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem'}}>
                            R$ {product.oldPrice.toFixed(2)}
                        </span>
                        <span className="price" style={{color: '#ef4444'}}>
                            R$ {product.price.toFixed(2)}
                        </span>
                    </div>
                ) : (
                    <p className="price">R$ {product.price.toFixed(2)}</p>
                )}
                
              </div>
            </Link>
            
            <div style={{padding: '0 1.5rem 1.5rem 1.5rem'}}>
               <button 
                 className="add-btn" 
                 onClick={() => product.stock > 0 && navigate(`/produto/${product.id}`)}
                 disabled={product.stock === 0}
                 style={{
                    opacity: product.stock === 0 ? 0.6 : 1,
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                    backgroundColor: product.stock === 0 ? '#ccc' : 'var(--primary)'
                 }}
               >
                 {product.stock === 0 ? (
                    'Esgotado' 
                 ) : (
                    <>
                        <Eye size={18} /> Ver Detalhes
                    </>
                 )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;