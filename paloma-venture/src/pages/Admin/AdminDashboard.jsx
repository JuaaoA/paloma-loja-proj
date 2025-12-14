import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, LogOut, Package, Star, Tag, ShoppingBag, Grid, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import Loading from '../../components/Loading';

import './Style/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  // --- BUSCAR DADOS ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (prodError) throw prodError;

      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('id');

      if (catError) throw catError;

      setProducts(prodData || []);
      setCategories(catData || []);

    } catch (error) {
      alert('Erro ao carregar dados: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- AÇÕES DE PRODUTOS ---
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const toggleProductFeatured = async (product) => {
    try {
      const { error } = await supabase.from('products').update({ featured: !product.featured }).eq('id', product.id);
      if (error) throw error;
      setProducts(products.map(p => p.id === product.id ? { ...p, featured: !p.featured } : p));
    } catch (error) {
      alert("Erro ao atualizar status." + error.message);
    }
  };

  // --- AÇÕES DE CATEGORIAS (NOVAS) ---
  
  // 1. Alternar Destaque (Mantivemos igual)
  const toggleCategoryFeatured = async (category) => {
    const currentFeaturedCount = categories.filter(c => c.featured).length;
    if (!category.featured && currentFeaturedCount >= 3) {
      alert("⚠️ Limite Atingido!\n\nApenas 3 categorias podem aparecer na Home.");
      return;
    }
    try {
      const { error } = await supabase.from('categories').update({ featured: !category.featured }).eq('id', category.id);
      if (error) throw error;
      setCategories(categories.map(c => c.id === category.id ? { ...c, featured: !c.featured } : c));
    } catch (error) {
      alert("Erro ao atualizar categoria." + error.message);
    }
  };

  // 2. Excluir Categoria (COM TRAVAS DE SEGURANÇA)
  const handleDeleteCategory = async (category) => {
    // Trava 1: Ofertas Especiais
    if (category.is_promo) {
        alert("🚫 Ação Bloqueada\n\nA categoria 'Ofertas Especiais' é vital para o sistema e não pode ser excluída.");
        return;
    }

    // Trava 2: Produtos Associados
    // Calculamos quantos produtos usam esse category_id
    const associatedProducts = products.filter(p => p.category_id === category.id);
    
    if (associatedProducts.length > 0) {
        alert(`🚫 Não é possível excluir!\n\nExistem ${associatedProducts.length} produtos nesta categoria (Ex: ${associatedProducts[0].name}).\n\nRemova ou mude a categoria desses produtos antes de excluir.`);
        return;
    }

    // Se passou, confirma e exclui
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.title}"?`)) {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', category.id);
            if (error) throw error;
            setCategories(categories.filter(c => c.id !== category.id));
        } catch (error) {
            alert("Erro ao excluir: " + error.message);
        }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Função auxiliar para contar produtos por categoria ID
  const getProductCount = (catId) => products.filter(p => p.category_id === catId).length;

  if (isLoading) return <Loading />;

  return (
    <div className="admin-container page-enter">
      
      <div className="admin-header">
        <div>
          <h1 style={{margin: 0, fontSize: '1.5rem', color: 'var(--primary)'}}>Painel Administrativo</h1>
          <p style={{margin: '5px 0 0 0', color: '#64748b'}}>Gerencie o catálogo da sua loja</p>
        </div>
        
        <button onClick={handleLogout} className="back-btn" style={{marginTop: 0, marginBottom: 0, border: '1px solid #ef4444', color: '#ef4444'}}>
          <LogOut size={18} /> Sair
        </button>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <ShoppingBag size={18} /> Produtos
        </button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <Grid size={18} /> Categorias Home
        </button>
      </div>

      {/* --- ABA PRODUTOS --- */}
      {activeTab === 'products' && (
        <>
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'20px'}}>
                <Link to="/admin/produtos/novo" className="add-btn" style={{marginTop: 0, width: 'auto', textDecoration: 'none'}}>
                    <Plus size={18} /> Novo Produto
                </Link>
            </div>

            {products.length === 0 ? (
                <div style={{textAlign: 'center', padding: '50px', color: '#999'}}>
                    <Package size={48} style={{opacity: 0.2}} />
                    <p>Nenhum produto cadastrado.</p>
                </div>
            ) : (
                <div style={{overflowX: 'auto'}}>
                    <table className="admin-table">
                    <thead>
                        <tr>
                        <th>Produto</th>
                        <th>Status</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                        <tr key={product.id}>
                            <td data-label="Produto">
                                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                    <img src={product.images ? product.images[0] : ''} alt={product.name} className="product-thumb"/>
                                    <div>
                                        <strong style={{display: 'block', color: 'var(--primary)'}}>{product.name}</strong>
                                        <span style={{fontSize: '0.8rem', color: '#666'}}>{product.category}</span>
                                    </div>
                                </div>
                            </td>
                            <td data-label="Status">
                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button onClick={() => toggleProductFeatured(product)} className="toggle-btn" title="Destaque na Home">
                                        <Star size={20} fill={product.featured ? "#fbbf24" : "none"} color={product.featured ? "#fbbf24" : "#cbd5e1"} />
                                    </button>
                                    {product.onSale && (
                                        <span title="Em Promoção"><Tag size={20} color="#ef4444" fill="#ef4444" fillOpacity={0.2} /></span>
                                    )}
                                </div>
                            </td>
                            <td data-label="Preço">
                                <div style={{display:'flex', flexDirection: 'column'}}>
                                    <span style={{fontWeight: 'bold'}}>R$ {product.price.toFixed(2)}</span>
                                    {product.onSale && product.oldPrice && (
                                        <span style={{textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.8rem'}}>R$ {product.oldPrice.toFixed(2)}</span>
                                    )}
                                </div>
                            </td>
                            <td data-label="Estoque">
                                {product.stock === 0 ? <span className="stock-alert">Esgotado</span> : 
                                <span className={product.stock < 5 ? "stock-alert" : "stock-ok"}>{product.stock} un.</span>}
                            </td>
                            <td data-label="Ações" className="actions-cell">
                                <Link to={`/admin/produtos/editar/${product.id}`} className="action-btn btn-edit"><Pencil size={18} /></Link>
                                <button onClick={() => handleDeleteProduct(product.id)} className="action-btn btn-delete"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            )}
        </>
      )}

      {/* --- ABA CATEGORIAS (ATUALIZADA) --- */}
      {activeTab === 'categories' && (
        <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <p style={{color:'#64748b', margin:0}}>
                    <span style={{color:'var(--primary)', fontWeight:'bold'}}>{categories.filter(c=>c.featured).length}/3</span> destacados na home
                </p>
                <Link to="/admin/categorias/nova" className="add-btn" style={{marginTop: 0, width: 'auto', textDecoration: 'none'}}>
                    <Plus size={18} /> Nova Categoria
                </Link>
            </div>

            <div className="categories-admin-grid">
                {categories.map(cat => {
                    const count = getProductCount(cat.id);
                    return (
                        <div key={cat.id} className={`cat-admin-card ${cat.featured ? 'featured' : ''}`}>
                            <div className="cat-header">
                                <strong style={{fontSize: '1.1rem'}}>{cat.title}</strong>
                                <button 
                                    onClick={() => toggleCategoryFeatured(cat)}
                                    className="toggle-btn"
                                    style={{background: cat.featured ? '#fef3c7' : '#f1f5f9', borderRadius: '50%', padding: '8px'}}
                                    title="Destacar na Home"
                                >
                                    <Star size={20} fill={cat.featured ? "#fbbf24" : "none"} color={cat.featured ? "#fbbf24" : "#94a3b8"} />
                                </button>
                            </div>

                            <div className="cat-bg-preview" style={{backgroundImage: `url(${cat.image_url})`}}>
                                {cat.is_promo && (
                                    <div style={{background:'rgba(239, 68, 68, 0.9)', color:'white', fontSize:'0.7rem', padding:'2px 6px', position:'absolute', top:'10px', left:'10px', borderRadius:'4px', fontWeight:'bold'}}>
                                        PROTEGIDO
                                    </div>
                                )}
                            </div>

                            <div className="cat-footer">
                                <span style={{display:'flex', alignItems:'center', gap:'5px', color: count > 0 ? 'var(--primary)' : '#999'}}>
                                    <ShoppingBag size={14}/> {count} produtos
                                </span>
                                
                                <div style={{display:'flex', gap:'5px'}}>
                                    <Link to={`/admin/categorias/editar/${cat.id}`} className="action-btn btn-edit" style={{padding:'6px'}}>
                                        <Pencil size={16} />
                                    </Link>
                                    
                                    {/* Botão de Excluir: Desabilitado visualmente se tiver produtos ou for promo */}
                                    <button 
                                        onClick={() => handleDeleteCategory(cat)} 
                                        className="action-btn btn-delete" 
                                        style={{
                                            padding:'6px', 
                                            opacity: (cat.is_promo || count > 0) ? 0.3 : 1,
                                            cursor: (cat.is_promo || count > 0) ? 'not-allowed' : 'pointer'
                                        }}
                                        title={count > 0 ? "Não é possível excluir categorias com produtos" : "Excluir Categoria"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
      )}

    </div>
  );
};

export default AdminDashboard;