import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, LogOut, Package, Star, Tag, ShoppingBag, Grid, Truck, Clock, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../services/supabase';
import Loading from '../../components/Loading';

import './Style/AdminDashboard.css';
import './Style/AdminOrders.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]); // Lista de pedidos
  const [isLoading, setIsLoading] = useState(true);
  
  // Define 'orders' como aba inicial para focar nas vendas
  const [activeTab, setActiveTab] = useState('orders');

  // --- BUSCAR DADOS ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Pedidos (Do mais recente para o mais antigo)
      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

      // 2. Produtos
      const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: false });

      // 3. Categorias
      const { data: catData } = await supabase.from('categories').select('*').order('id');

      setOrders(orderData || []);
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

  // --- CONFIGURAÇÃO VISUAL DOS STATUS ---
  const statusConfig = {
    'pending': { label: 'Pendente', color: '#d97706', bg: '#fef3c7', icon: <Clock size={14}/> },
    'paid': { label: 'Pago', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={14}/> },
    'shipped': { label: 'Enviado', color: '#2563eb', bg: '#dbeafe', icon: <Truck size={14}/> },
    'delivered': { label: 'Entregue', color: '#475569', bg: '#f1f5f9', icon: <Package size={14}/> },
    'cancelled': { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2', icon: <X size={14}/> },
  };

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const goToOrderDetails = (orderId) => {
    navigate(`/admin/pedidos/${orderId}`);
  };

  // --- FUNÇÕES ANTIGAS (Produtos/Categorias) ---
  const handleDeleteProduct = async (id) => {
    if (window.confirm("Excluir produto?")) {
        await supabase.from('products').delete().eq('id', id);
        setProducts(products.filter(p => p.id !== id));
    }
  };
  const toggleProductFeatured = async (product) => {
     await supabase.from('products').update({ featured: !product.featured }).eq('id', product.id);
     setProducts(products.map(p => p.id === product.id ? { ...p, featured: !p.featured } : p));
  };
  const toggleCategoryFeatured = async (category) => {
    const currentFeaturedCount = categories.filter(c => c.featured).length;
    if (!category.featured && currentFeaturedCount >= 3) return alert("Limite de 3 destaques atingido.");
    await supabase.from('categories').update({ featured: !category.featured }).eq('id', category.id);
    setCategories(categories.map(c => c.id === category.id ? { ...c, featured: !c.featured } : c));
  };
  const handleDeleteCategory = async (category) => {
    if(category.is_promo) return alert("Categoria protegida.");
    if(products.filter(p => p.category_id === category.id).length > 0) return alert("Categoria tem produtos.");
    if (window.confirm("Excluir categoria?")) {
        await supabase.from('categories').delete().eq('id', category.id);
        setCategories(categories.filter(c => c.id !== category.id));
    }
  };
  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/admin/login'); };
  const getProductCount = (catId) => products.filter(p => p.category_id === catId).length;

  if (isLoading) return <Loading />;

  return (
    <div className="admin-container page-enter">
      
      <div className="admin-header">
        <div>
          <h1 style={{margin: 0, fontSize: '1.5rem', color: 'var(--primary)'}}>Painel Administrativo</h1>
          <p style={{margin: '5px 0 0 0', color: '#64748b'}}>Gerencie o catálogo da sua loja</p>
        </div>
        <button onClick={handleLogout} className="back-btn" style={{border: '1px solid #ef4444', color: '#ef4444'}}>
          <LogOut size={18} /> Sair
        </button>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <Truck size={18} /> Pedidos 
            <span style={{background:'#e2e8f0', padding:'2px 6px', borderRadius:'10px', fontSize:'0.75rem', marginLeft:'6px'}}>
                {orders.length}
            </span>
        </button>
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <ShoppingBag size={18} /> Produtos
        </button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <Grid size={18} /> Categorias Home
        </button>
      </div>

      {/* --- ABA PEDIDOS (LISTA) --- */}
      {activeTab === 'orders' && (
        <>
            {orders.length === 0 ? (
                <div style={{textAlign: 'center', padding: '50px', color: '#999'}}>
                    <Truck size={48} style={{opacity: 0.2}} />
                    <p>Nenhuma venda realizada ainda.</p>
                </div>
            ) : (
                <div className="orders-grid">
                    {/* Cabeçalho da Tabela */}
                    <div className="order-list-header desktop-only">
                        <span>ID</span>
                        <span>Data</span>
                        <span>Cliente</span>
                        <span>Status</span>
                        <span>Total</span>
                        <span>Ação</span>
                    </div>

                    {/* Linhas da Tabela */}
                    {orders.map(order => {
                        const status = statusConfig[order.status] || statusConfig['pending'];
                        return (
                            <div key={order.id} className="order-card-row">
                                <div className="order-col font-mono">
                                    #{order.id.slice(0,6)}
                                </div>
                                <div className="order-col">
                                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="order-col">
                                    {order.shipping_address?.city} / {order.shipping_address?.state}
                                </div>
                                <div className="order-col">
                                    <span style={{
                                        display:'inline-flex', alignItems:'center', gap:'5px',
                                        background: status.bg, color: status.color,
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>
                                        {status.icon} {status.label}
                                    </span>
                                </div>
                                <div className="order-col font-bold">
                                    R$ {(order.total_amount + order.shipping_cost).toFixed(2)}
                                </div>
                                <div className="order-col">
                                    <button 
                                        onClick={() => goToOrderDetails(order.id)} 
                                        className="action-btn" 
                                        style={{background: 'var(--primary)', color:'white', width:'100%'}}
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
      )}

      {/* --- ABA PRODUTOS --- */}
      {activeTab === 'products' && (
         <div style={{overflowX: 'auto'}}>
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'20px'}}>
                <Link to="/admin/produtos/novo" className="add-btn" style={{width: 'auto'}}><Plus size={18} /> Novo Produto</Link>
            </div>
            <table className="admin-table">
            <thead><tr><th>Produto</th><th>Status</th><th>Preço</th><th>Estoque</th><th>Ações</th></tr></thead>
            <tbody>
                {products.map((product) => (
                <tr key={product.id}>
                    <td data-label="Produto">
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <img src={product.images ? product.images[0] : ''} alt="" className="product-thumb"/>
                            <div><strong>{product.name}</strong><span style={{display:'block', fontSize:'0.8rem', color:'#666'}}>{product.category}</span></div>
                        </div>
                    </td>
                    <td data-label="Status">
                         <div style={{display: 'flex', gap: '10px'}}>
                            <button onClick={() => toggleProductFeatured(product)} className="toggle-btn"><Star size={20} fill={product.featured ? "#fbbf24" : "none"} color={product.featured ? "#fbbf24" : "#cbd5e1"} /></button>
                            {product.onSale && <Tag size={20} color="#ef4444" />}
                        </div>
                    </td>
                    <td data-label="Preço">R$ {product.price.toFixed(2)}</td>
                    <td data-label="Estoque">{product.stock} un.</td>
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

      {/* --- ABA CATEGORIAS --- */}
      {activeTab === 'categories' && (
        <div className="categories-admin-grid">
             <div style={{gridColumn:'1/-1', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                 <p style={{margin:0, color:'#666'}}>Categorias visíveis na Home: <strong>{categories.filter(c=>c.featured).length}/3</strong></p>
                 <Link to="/admin/categorias/nova" className="add-btn" style={{width:'auto'}}><Plus size={18}/> Nova Categoria</Link>
             </div>
             {categories.map(cat => (
                 <div key={cat.id} className={`cat-admin-card ${cat.featured ? 'featured' : ''}`}>
                    <div className="cat-header">
                        <strong>{cat.title}</strong>
                        {/* BOTÃO ESTRELA COM CSS CORRIGIDO (OVO FIX) */}
                        <button 
                            onClick={() => toggleCategoryFeatured(cat)}
                            className="cat-star-btn" 
                            style={{ backgroundColor: cat.featured ? '#fef3c7' : '#f1f5f9' }}
                            title="Destacar na Home"
                        >
                            <Star size={18} fill={cat.featured ? "#fbbf24" : "none"} color={cat.featured ? "#fbbf24" : "#94a3b8"} />
                        </button>
                    </div>
                    <div className="cat-bg-preview" style={{backgroundImage: `url(${cat.image_url})`}}></div>
                    <div className="cat-footer">
                        <span>{getProductCount(cat.id)} produtos</span>
                        <div style={{display:'flex', gap:'5px'}}>
                            <Link to={`/admin/categorias/editar/${cat.id}`} className="action-btn btn-edit"><Pencil size={16} /></Link>
                            <button onClick={() => handleDeleteCategory(cat)} className="action-btn btn-delete"><Trash2 size={16} /></button>
                        </div>
                    </div>
                 </div>
             ))}
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;