import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Search, Filter, RotateCcw, Eye } from 'lucide-react'; 
import { PRODUCTS as MOCK_PRODUCTS } from '../data/data';
import Loading from '../components/Loading';
import Breadcrumbs from '../components/Breadcrumbs';

const CatalogPage = () => {
  const navigate = useNavigate();
  
  // Hook para ler a URL (ex: ?sale=true)
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de Dados e Loading
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS DOS FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]); // <--- NOVO ESTADO
  const [sortOption, setSortOption] = useState('newest');

  // Filtro de Promoção
  const [filterSale, setFilterSale] = useState(false);

  // --- EFEITO INICIAL (Carregamento + Leitura de URL) ---
  useEffect(() => {
    window.scrollTo(0,0);
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setIsLoading(false);
      
      // LER A URL DEPOIS QUE CARREGAR OS DADOS (ou simultaneamente)
      const categoryParam = searchParams.get('category');
      const saleParam = searchParams.get('sale');

      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
      if (saleParam === 'true') {
        setFilterSale(true);
      }

    }, 1000);
    return () => clearTimeout(timer);
  }, []); // Array vazio = roda só ao montar a página

  // --- EXTRAÇÃO DE DADOS PARA OS FILTROS ---
  const categories = ['Todas', ...new Set(products.map(p => p.category))];
  const allColors = [...new Set(products.flatMap(p => p.colors || []))];
  
  // Extrai todos os tamanhos únicos disponíveis na loja
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))].sort(); 

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todas');
    setPriceRange({ min: 0, max: 1000 });
    setSelectedColors([]);
    setSelectedSizes([]); // <--- LIMPA TAMANHOS
    setSortOption('newest');
	setFilterSale(false); // Limpa promoção
	setSearchParams({}); // Limpa a URL também para ficar visualmente limpo
  };

  const normalizeString = (str) => {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  };

  // --- LÓGICA DE FILTRAGEM ---
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = normalizeString(product.name).includes(normalizeString(searchTerm));
      const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const matchesColor = selectedColors.length === 0 || (product.colors && product.colors.some(c => selectedColors.includes(c)));
      const matchesSize = selectedSizes.length === 0 || (product.sizes && product.sizes.some(s => selectedSizes.includes(s)));
      
      // Filtro de Promoção
      // Se filterSale for true, o produto OBRIGATORIAMENTE tem que ter onSale: true
      const matchesSale = filterSale ? product.onSale === true : true;

      return matchesSearch && matchesCategory && matchesPrice && matchesColor && matchesSize && matchesSale;
    }).sort((a, b) => {
      if (sortOption === 'low-price') return a.price - b.price;
      if (sortOption === 'high-price') return b.price - a.price;
      return b.id - a.id; 
    });
  }, [products, searchTerm, selectedCategory, priceRange, selectedColors, selectedSizes, filterSale, sortOption]);

  // Função auxiliar para Cores
  const toggleColor = (color) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Função auxiliar para Tamanhos
  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  if (isLoading) return <Loading />;

  return (
    <div className="container page-enter">

	  <Breadcrumbs />

      <div className="catalog-header">
        <h1 style={{fontSize: '1.5rem', fontFamily: 'Times New Roman, serif'}}>Catálogo Completo</h1>
        <span style={{color: '#666'}}>{filteredProducts.length} produtos encontrados</span>
      </div>

      <div className="catalog-container">
        
        {/* --- SIDEBAR --- */}
        <aside className="filters-sidebar">
          
          <button onClick={clearFilters} className="clear-btn" style={{marginBottom: '20px'}}>
             <RotateCcw size={16} /> Limpar Filtros
          </button>

		  {/* CHECKBOX DE PROMOÇÃO */}
          <div className="filter-group">
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: filterSale ? '#ef4444' : 'inherit', fontWeight: filterSale ? 'bold' : 'normal'}}>
                <input 
                    type="checkbox" 
                    checked={filterSale} 
                    onChange={(e) => setFilterSale(e.target.checked)}
                    style={{width: '18px', height: '18px', accentColor: '#ef4444'}}
                />
                Apenas Promoções
            </label>
          </div>

          {/* Busca */}
          <div className="filter-group">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Buscar peça..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={20} className="search-icon" />
            </div>
          </div>

          {/* Tamanhos */}
          <div className="filter-group">
            <span className="filter-title">Tamanhos</span>
            <div className="size-filter-options">
              {allSizes.map(size => (
                <button 
                  key={size}
                  className={`size-filter-btn ${selectedSizes.includes(size) ? 'selected' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-title">Categorias</span>
            {categories.map(cat => (
              <label key={cat} className="category-option">
                <input 
                  type="radio" 
                  name="category" 
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-title">Faixa de Preço</span>
            <div className="price-range-inputs">
              <input 
                type="number" 
                className="price-input" 
                placeholder="Min" 
                value={priceRange.min}
                onChange={e => setPriceRange({...priceRange, min: Number(e.target.value)})}
              />
              <span>até</span>
              <input 
                type="number" 
                className="price-input" 
                placeholder="Max" 
                value={priceRange.max}
                onChange={e => setPriceRange({...priceRange, max: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-title">Cores</span>
            <div className="color-filter-options">
              {allColors.map(color => (
                <div 
                  key={color}
                  className={`color-check ${selectedColors.includes(color) ? 'selected' : ''}`}
                  style={{backgroundColor: color}}
                  onClick={() => toggleColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        </aside>

        <main>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
             <select 
               className="sort-select"
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value)}
             >
               <option value="newest">Mais Recentes</option>
               <option value="low-price">Menor Preço</option>
               <option value="high-price">Maior Preço</option>
             </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                <h3>Nenhum produto encontrado.</h3>
                <button onClick={clearFilters} className="add-btn" style={{maxWidth: '200px', margin: '20px auto'}}>Limpar Filtros</button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <Link to={`/produto/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                    <div className="product-image-container">
                      <img src={product.images[0]} alt={product.name} className="product-image" />
                      
                      {/* BADGE DE ESGOTADO */}
                      {product.stock === 0 && (
                        <span style={{position: 'absolute', top: 10, right: 10, background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>Esgotado</span>
                      )}
                      
                      {/* BADGE DE PROMOÇÃO */}
                      {product.onSale && product.stock > 0 && (
                        <span style={{position: 'absolute', top: 10, left: 10, background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'}}>
                            OFERTA
                        </span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      
                      {/* PREÇO COM DESCONTO */}
                      {product.onSale && product.oldPrice ? (
                          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                              <span style={{textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem'}}>R$ {product.oldPrice.toFixed(2)}</span>
                              <span className="price" style={{color: '#ef4444'}}>R$ {product.price.toFixed(2)}</span>
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
                      {product.stock === 0 ? 'Indisponível' : <><Eye size={18} /> Ver Detalhes</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;