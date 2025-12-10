import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '../data/data.jsx'; // Importa os dados

const HeroSlider = () => {
  const featuredProducts = PRODUCTS.filter(p => p.featured);
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      checkScrollButtons();
      slider.addEventListener('scroll', checkScrollButtons);
      return () => slider.removeEventListener('scroll', checkScrollButtons);
    }
  }, [featuredProducts]);

  if (featuredProducts.length === 0) return null;

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { current } = sliderRef;
      const scrollAmount = current.clientWidth; 
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
              <div className="hero-bg" style={{backgroundImage: `url(${product.images[0]})`}}></div>
              <div className="hero-content">
                <Link to={`/produto/${product.id}`} style={{textDecoration: 'none', color: 'white'}}>
                  <span style={{textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem'}}>{product.category}</span>
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