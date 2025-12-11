import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, LogOut, Package, Star, Tag } from 'lucide-react'; // Adicionei Star e Tag
import { supabase } from '../../services/supabase';
import Loading from '../../components/Loading';

import './Style/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. BUSCAR PRODUTOS ---
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      alert('Erro ao carregar produtos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- 2. DELETAR PRODUTO ---
  const handleDelete = async (id) => {
    const confirm = window.confirm("Tem certeza que deseja excluir este produto?");
    if (confirm) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  // --- 3. ALTERNAR DESTAQUE (FEATURED) ---
  const toggleFeatured = async (product) => {
    try {
      // 1. Atualiza no Banco (inverte o valor atual)
      const { error } = await supabase
        .from('products')
        .update({ featured: !product.featured })
        .eq('id', product.id);

      if (error) throw error;

      // 2. Atualiza no Estado Local (para o ícone mudar de cor na hora)
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, featured: !p.featured } : p
      ));

    } catch (error) {
      console.error("Erro ao atualizar destaque:", error);
      alert("Erro ao atualizar status.");
    }
  };

  // --- 4. LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isLoading) return <Loading />;

  return (
    <div className="admin-container page-enter">
      
      <div className="admin-header">
        <div>
          <h1 style={{margin: 0, fontSize: '1.5rem', color: 'var(--primary)'}}>Painel Administrativo</h1>
          <p style={{margin: '5px 0 0 0', color: '#64748b'}}>Gerencie o catálogo da sua loja</p>
        </div>
        
        <div style={{display: 'flex', gap: '15px'}}>
           <button 
             onClick={handleLogout} 
             className="back-btn" 
             style={{marginTop: 0, marginBottom: 0, border: '1px solid #ef4444', color: '#ef4444'}}
           >
             <LogOut size={18} /> Sair
           </button>

           <Link to="/admin/produtos/novo" className="add-btn" style={{marginTop: 0, width: 'auto', textDecoration: 'none'}}>
             <Plus size={18} /> Novo Produto
           </Link>
        </div>
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
                            <img 
                                src={product.images ? product.images[0] : ''} 
                                alt={product.name} 
                                className="product-thumb"
                            />
                            <div>
                                <strong style={{display: 'block', color: 'var(--primary)'}}>{product.name}</strong>
                                <span style={{fontSize: '0.8rem', color: '#666'}}>{product.category}</span>
                            </div>
                        </div>
                    </td>

                    <td data-label="Status">
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button 
                                onClick={() => toggleFeatured(product)} 
                                className="toggle-btn"
                                title="Clique para alternar destaque"
                            >
                                <Star 
                                    size={20} 
                                    fill={product.featured ? "#fbbf24" : "none"}
                                    color={product.featured ? "#fbbf24" : "#cbd5e1"} 
                                />
                            </button>

                            {product.onSale && (
                                <span title="Em Promoção">
                                    <Tag size={20} color="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                                </span>
                            )}
                        </div>
                    </td>

                    <td data-label="Preço">
                        <div style={{display:'flex', flexDirection: 'column'}}>
                            <span style={{fontWeight: 'bold'}}>R$ {product.price.toFixed(2)}</span>
                            {product.onSale && product.oldPrice && (
                                <span style={{textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.8rem'}}>
                                    R$ {product.oldPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </td>

                    <td data-label="Estoque">
                        {product.stock === 0 ? (
                            <span className="stock-alert">Esgotado</span>
                        ) : (
                            <span className={product.stock < 5 ? "stock-alert" : "stock-ok"}>
                                {product.stock} un.
                            </span>
                        )}
                    </td>

                    <td data-label="Ações" className="actions-cell">
                        <Link to={`/admin/produtos/editar/${product.id}`} className="action-btn btn-edit" title="Editar">
                            <Pencil size={18} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="action-btn btn-delete" title="Excluir">
                            <Trash2 size={18} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;