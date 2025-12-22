import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ArrowLeft, Clock, CheckCircle, Truck, Package, X, MapPin, User, FileText, Mail, Phone, MessageCircle } from 'lucide-react';
import Loading from '../../components/Loading';
import { useToast } from '../../contexts/ToastContext';

import './Style/AdminOrderDetails.css';

const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [customer, setCustomer] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Busca inicial
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) throw itemsError;

        if (orderData.user_id) {
            const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', orderData.user_id)
            .maybeSingle(); 

            if (!profileError && profileData) {
                setCustomer(profileData);
            }
        }

        setOrder(orderData);
        setOrderItems(itemsData);
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setOrder({ ...order, status: newStatus });
      showToast('Status atualizado com sucesso!', 'success');
    } catch (error) {
      showToast("Erro ao atualizar status." + error, 'error');
    }
  };

  const statusConfig = {
    'pending': { label: 'Pendente', color: '#d97706', bg: '#fef3c7', icon: <Clock size={18}/> },
    'paid': { label: 'Pago', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={18}/> },
    'shipped': { label: 'Enviado', color: '#2563eb', bg: '#dbeafe', icon: <Truck size={18}/> },
    'delivered': { label: 'Entregue', color: '#475569', bg: '#f1f5f9', icon: <Package size={18}/> },
    'cancelled': { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2', icon: <X size={18}/> },
  };

  if (loading) return <Loading />;
  if (!order) return null;

  const currentStatus = statusConfig[order.status] || statusConfig['pending'];

  const customerPhone = customer?.phone || order.shipping_address?.phone || order.shipping_address?.celular;
  
  const getWhatsappLink = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, ''); 
    return `https://wa.me/55${cleanPhone}`;
  };

  return (
    <div className="details-page-container page-enter">
      
      {/* Header */}
      <div className="details-header">
        <Link to="/admin/dashboard" className="back-link">
            <ArrowLeft size={20}/> Voltar
        </Link>
        <h1 className="order-title">Pedido #{order.id.slice(0,6)}</h1>
        <span 
          className="status-badge"
          style={{ background: currentStatus.bg, color: currentStatus.color }}
        >
            {currentStatus.icon} {currentStatus.label}
        </span>
      </div>

      <div className="details-layout">
        
        {/* Coluna Esquerda: Itens + Status */}
        <div className="details-column">
            
            <div className="info-card">
                <h3 className="card-title">
                    <FileText size={20} color="var(--primary)"/> Atualizar Status
                </h3>
                <div className="status-select-wrapper">
                    <select 
                        className="status-dropdown"
                        value={order.status} 
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        <option value="pending">🟡 Pendente (Aguardando Pagamento)</option>
                        <option value="paid">🟢 Pago (Separar Pedido)</option>
                        <option value="shipped">🔵 Enviado (Saiu para Entrega)</option>
                        <option value="delivered">⚫ Entregue (Finalizado)</option>
                        <option value="cancelled">🔴 Cancelado</option>
                    </select>
                </div>
            </div>

            <div className="info-card">
                <h3 className="card-title">Itens do Pedido ({orderItems.length})</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    {orderItems.map(item => (
                        <div key={item.id} className="item-row">
                            <div>
                                <strong style={{fontSize:'1.05rem', color:'#334155'}}>{item.product_name}</strong>
                                
                                {/* --- Cor Visual --- */}
                                <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                    Cor:
                                    {/* Bolinha da Cor */}
                                    <div 
                                        style={{
                                            width: '24px', 
                                            height: '24px', 
                                            borderRadius: '50%', 
                                            backgroundColor: item.selected_color,
                                            border: '1px solid #cbd5e1', // Borda para cores claras
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}
                                        title={item.selected_color} // Tooltip com o código se passar o mouse
                                    />
                                    
                                    {/* Tamanho */}
                                    <span style={{ fontSize: '0.95rem', fontWeight: '500', color: '#334155' }}>
                                        Tamanho: <strong>{item.selected_size}</strong>
                                    </span>
                                </div>

                            </div>
                            <div className="item-text-right">
                                <div className="text-bold">
                                    {item.quantity}x R$ {item.price_at_purchase.toFixed(2)}
                                </div>
                                <div className="text-muted">
                                    Total: R$ {(item.quantity * item.price_at_purchase).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="details-total-row">
                    <span>Total Pedido:</span>
                    <span style={{color:'var(--primary)'}}>R$ {(order.total_amount + order.shipping_cost).toFixed(2)}</span>
                </div>
            </div>

        </div>

        {/* Coluna Direita: Endereço + Cliente */}
        <div className="details-column">
            
            <div className="info-card">
                <h3 className="card-title">
                    <MapPin size={20} color="#64748b"/> Entrega
                </h3>
                <p className="text-muted" style={{fontSize: '1rem', color: '#334155'}}>
                    {order.shipping_address.street}, {order.shipping_address.number}
                </p>
                {order.shipping_address.complement && (
                    <p className="text-muted">{order.shipping_address.complement}</p>
                )}
                <p className="text-muted">
                    {order.shipping_address.neighborhood}
                </p>
                <p className="text-muted">
                    {order.shipping_address.city} - {order.shipping_address.state}
                </p>
                <p style={{marginTop:'15px', fontWeight:'bold', color:'#334155'}}>CEP: {order.shipping_address.cep}</p>
            </div>

            <div className="info-card">
                <h3 className="card-title">
                    <User size={20} color="#64748b"/> Dados do Cliente
                </h3>
                
                {customer ? (
                    <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                        <div>
                            <span className="text-muted" style={{fontSize: '0.85rem'}}>Nome Completo</span>
                            <div style={{fontWeight: 'bold', color: '#333', fontSize: '1.05rem'}}>
                                {customer.full_name || order.shipping_address?.name || 'Nome não informado'}
                            </div>
                        </div>

                        <div>
                            <span className="text-muted" style={{fontSize: '0.85rem'}}>E-mail</span>
                            <div style={{display:'flex', alignItems:'center', gap:'8px', color: '#333'}}>
                                <Mail size={16} color="#64748b"/> 
                                {customer.email}
                            </div>
                        </div>

                        {customerPhone ? (
                            <div>
                                <span className="text-muted" style={{fontSize: '0.85rem'}}>Telefone / WhatsApp</span>
                                <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop: '4px'}}>
                                    <Phone size={16} color="#64748b"/> 
                                    <span>{customerPhone}</span>
                                </div>
                                <a 
                                    href={getWhatsappLink(customerPhone)} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        marginTop: '12px', padding: '10px', borderRadius: '6px',
                                        background: '#25D366', color: 'white', textDecoration: 'none', 
                                        fontWeight: 'bold', fontSize: '0.9rem', transition: 'background 0.2s'
                                    }}
                                >
                                    <MessageCircle size={18} /> Chamar no WhatsApp
                                </a>
                            </div>
                        ) : (
                             <div style={{marginTop: '10px', padding: '10px', background: '#fef2f2', borderRadius: '6px', border: '1px dashed #f87171', color: '#991b1b', fontSize: '0.9rem'}}>
                                <Phone size={16} style={{marginBottom: '-3px', marginRight: '5px'}}/>
                                Telefone não informado no cadastro.
                             </div>
                        )}

                        <div style={{marginTop: '10px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px'}}>
                             <span className="text-muted" style={{fontSize: '0.75rem', fontFamily: 'monospace'}}>ID: {customer.id}</span>
                        </div>
                    </div>
                ) : (
                    <div style={{color: '#64748b', fontStyle: 'italic', padding: '10px', background: '#f8fafc', borderRadius: '8px'}}>
                        <p style={{marginBottom:'10px'}}>Não foi possível carregar o perfil.</p>
                        <code style={{background:'#e2e8f0', padding:'2px 4px'}}>{order.user_id}</code>
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;