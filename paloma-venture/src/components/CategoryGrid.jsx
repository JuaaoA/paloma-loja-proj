import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Layers, ShoppingBag } from 'lucide-react'; // Importe os ícones que pretende usar
import { supabase } from '../services/supabase'; // Conexão com o banco

import './Style/CategoryGrid.css';

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);

  // --- MAPA DE ÍCONES ---
  // Traduz o texto do banco para o componente visual
  const iconMap = {
    'sparkles': <Sparkles size={20} color="white" />,
    'layers': <Layers size={20} color="white" />, 
    'tag': <Tag size={20} color="white" />,
    'bag': <ShoppingBag size={20} color="white" /> // Exemplo extra
  };

  // Busca as categorias do Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('featured', true) // <--- MUDANÇA: Filtra apenas os destaques
          .order('id')
          .limit(3); // Garante que só mostre 3

        if (error) throw error;
        if (data) setCategories(data);

      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    fetchCategories();
  }, []);

  // Se não carregou ainda, mostra o ESQUELETO
  if (categories.length === 0) {
    return (
      <section className="category-grid-section" style={{marginTop: '40px', marginBottom: '40px'}}>
        <h2 className="section-title">Navegue por Categoria</h2>
        
        <div className="category-grid">
          {/* array falso [1, 2, 3] para renderizar 3 caixas vazias */}
          {[1, 2, 3].map((placeholder) => (
            <div 
              key={placeholder} 
              className="category-card" 
              style={{
                backgroundColor: '#f1f5f9', // Fundo cinza claro
                border: '1px solid #e2e8f0',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Spinner centralizado */}
              <div className="spinner" style={{width: '30px', height: '30px', borderWidth: '3px'}}></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="category-grid-section" style={{marginTop: '40px', marginBottom: '40px'}}>
      <h2 className="section-title">Navegue por Categoria</h2>
      
      <div className="category-grid">
        {categories.map((cat) => (
          <Link to={cat.link_url} key={cat.id} className="category-card">
            <div className="category-bg" style={{backgroundImage: `url(${cat.image_url})`}}></div>
            <div className="category-overlay"></div>
            
            <div className="category-content">
              {/* Lógica do Ícone e Cor de Fundo */}
              <div 
                className="category-icon-bg" 
                style={{background: cat.is_promo ? '#ef4444' : 'rgba(255,255,255,0.2)'}}
              >
                {/* Pega o ícone do mapa, ou usa um padrão se não achar */}
                {iconMap[cat.icon_name] || <Sparkles size={20} color="white" />}
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