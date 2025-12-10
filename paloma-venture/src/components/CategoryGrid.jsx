import React from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Layers } from 'lucide-react'; // Ícones ilustrativos
import { categories } from '../data/data';

const CategoryGrid = () => {
  return (
    <section className="category-grid-section" style={{marginTop: '40px', marginBottom: '40px'}}>
      <h2 className="section-title">Navegue por Categoria</h2>
      
      <div className="category-grid">
        {categories.map((cat) => (
          <Link to={cat.link} key={cat.id} className="category-card">
            <div className="category-bg" style={{backgroundImage: `url(${cat.image})`}}></div>
            <div className="category-overlay"></div>
            
            <div className="category-content">
              <div className="category-icon-bg" style={{background: cat.isPromo ? '#ef4444' : 'rgba(255,255,255,0.2)'}}>
                {cat.icon}
              </div>
              <h3>{cat.title}</h3>
              <span className="shop-link">Ver peças</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;