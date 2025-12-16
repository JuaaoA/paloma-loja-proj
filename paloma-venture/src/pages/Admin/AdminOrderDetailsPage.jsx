import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { ArrowLeft, Clock, CheckCircle, Truck, Package, X, MapPin, User, FileText } from 'lucide-react';
import Loading from '../../components/Loading';
import { useToast } from '../../contexts/ToastContext';

import './Style/AdminOrderDetails.css';

const AdminOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca inicial
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Pedido
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;

        // 2. Itens
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) throw itemsError;

        setOrder(orderData);
        setOrderItems(itemsData);
      } catch (error) {
        // Evita alert blocking, apenas loga e redireciona se critico
        console.error("Erro ao buscar pedido:", error);
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  // Atualizar Status
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
      showToast("Erro ao atualizar status.", error);
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

      {/* Grid Principal (Responsivo via CSS) */}
      <div className="details-layout">
        
        {/* Coluna Esquerda: Itens + Status */}
        <div className="details-column">
            
            {/* Box de Ação (Mudar Status) */}
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

            {/* Lista de Itens */}
            <div className="info-card">
                <h3 className="card-title">Itens do Pedido ({orderItems.length})</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    {orderItems.map(item => (
                        <div key={item.id} className="item-row">
                            <div>
                                <strong style={{fontSize:'1.05rem', color:'#334155'}}>{item.product_name}</strong>
                                <div className="text-muted">
                                    Cor: {item.selected_color} | Tamanho: {item.selected_size}
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
            
            {/* Endereço */}
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

            {/* Info Cliente (Básico) */}
            <div className="info-card">
                <h3 className="card-title">
                    <User size={20} color="#64748b"/> Cliente
                </h3>
                <p className="text-muted">ID do Usuário:</p>
                <code style={{background:'#f1f5f9', padding:'4px', borderRadius:'4px', fontSize:'0.8rem', wordBreak: 'break-all'}}>
                    {order.user_id}
                </code>
            </div>

        </div>

      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;