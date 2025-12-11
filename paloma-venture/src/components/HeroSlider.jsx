import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { supabase } from '../services/supabase'; // <--- CONEXÃO COM O BANCO

const HeroSlider = () => {
  // Agora é um estado, pois os dados vêm do banco
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // --- 1. BUSCAR PRODUTOS DESTAQUE DO SUPABASE ---
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Busca produtos onde a coluna 'featured' é TRUE
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('featured', true); // <--- FILTRO SQL

        if (error) throw error;
        if (data) setFeaturedProducts(data);
        
      } catch (error) {
        console.error("Erro ao carregar destaques:", error.message);
      }
    };

    fetchFeatured();
  }, []);

  // --- 2. LÓGICA DE SCROLL ---
  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Pequena tolerância de 1px para evitar bugs de arredondamento
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      // Pequeno delay para garantir que as imagens renderizaram e ocuparam espaço
      setTimeout(checkScrollButtons, 100);
      slider.addEventListener('scroll', checkScrollButtons);
      return () => slider.removeEventListener('scroll', checkScrollButtons);
    }
  }, [featuredProducts]); // Recalcula quando os produtos chegarem do banco

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = current.clientWidth; 
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Se não tiver destaques carregados ainda, mostra um Placeholder do mesmo tamanho
  if (featuredProducts.length === 0) {
    return (
      <section className="hero-section">
        <h2 className="section-title">Destaques da Coleção</h2>
        <div className="slider-wrapper">
          {/* Usamos classes parecidas para manter a mesma largura/altura */}
          <div 
            className="hero-banner" 
            style={{
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f1f5f9', // Um cinza clarinho
              boxShadow: 'none', // Remove sombra para parecer um placeholder
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Reutiliza a classe .spinner que já temos no App.css */}
            <div className="spinner" style={{width: '30px', height: '30px', borderWidth: '3px'}}></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      <h2 className="section-title">Destaques da Coleção</h2>
      <div className="slider-wrapper">
        {canScrollLeft && (
          <button className="slider-btn prev-btn" onClick={() => scroll('left')}>
            <ChevronLeft size={24} />
          </button>
        )}
        
        <div className="slider-container" ref={sliderRef}>
          {featuredProducts.map(product => (
            <div key={product.id} className="hero-banner">
              {/* Verifica se existe imagem antes de renderizar para não quebrar */}
              <div 
                className="hero-bg" 
                style={{backgroundImage: `url(${product.images ? product.images[0] : ''})`}}
              ></div>
              
              <div className="hero-content">
                <Link to={`/produto/${product.id}`} style={{textDecoration: 'none', color: 'white'}}>
                  <span style={{textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem'}}>
                    {product.category}
                  </span>
                  <h2>{product.name}</h2>
                  <p>R$ {product.price.toFixed(2)}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button className="slider-btn next-btn" onClick={() => scroll('right')}>
            <ChevronRight size={24} />
          </button>
        )}
      </div>
      <p style={{textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: '10px'}}>
         Explore nossos lançamentos
       </p>
    </section>
  );
};

export default HeroSlider;