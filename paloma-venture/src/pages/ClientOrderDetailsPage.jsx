import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { ArrowLeft, MapPin, Package, Clock, CheckCircle, Truck, X, Copy, ExternalLink, FileText } from 'lucide-react';
import Loading from '../components/Loading';
import { useToast } from '../contexts/ToastContext';
import './Style/ClientOrders.css'; // reutilizar e expandir o CSS existente

const ClientOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // CHAVE PIX DA LOJA
  const PIX_KEY = "sua-chave-pix@email.com"; 

  useEffect(() => {
    const fetchDetails = async () => {
      // Verifica sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/login'); return; }

      try {
        // 1. Busca Pedido (Garante que é do usuário logado)
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .eq('user_id', session.user.id) // Segurança extra
          .single();

        if (orderError) throw orderError;

        // 2. Busca Itens
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) throw itemsError;

        setOrder(orderData);
        setOrderItems(itemsData);
      } catch (error) {
        console.error(error);
        navigate('/meus-pedidos');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    showToast('Chave Pix copiada!', 'success');
  };

  const statusConfig = {
    'pending': { label: 'Aguardando Pagamento', color: '#d97706', bg: '#fffbeb', icon: <Clock size={20}/> },
    'paid': { label: 'Pagamento Confirmado', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={20}/> },
    'shipped': { label: 'Enviado / Em Trânsito', color: '#2563eb', bg: '#dbeafe', icon: <Truck size={20}/> },
    'delivered': { label: 'Entregue', color: '#475569', bg: '#f1f5f9', icon: <Package size={20}/> },
    'cancelled': { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2', icon: <X size={20}/> },
  };

  if (loading) return <Loading />;
  if (!order) return null;

  const currentStatus = statusConfig[order.status] || statusConfig['pending'];
  const fullTotal = order.total_amount + order.shipping_cost;

  // Link WhatsApp para enviar comprovante
  const whatsappMessage = `Olá! Segue o comprovante do pedido #${order.id.slice(0,8)}. Valor: R$ ${fullTotal.toFixed(2)}`;
  const whatsappLink = `https://wa.me/5527999836947?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="client-orders-container page-enter">
      
      {/* Header com Botão Voltar */}
      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'25px'}}>
        <Link to="/meus-pedidos" style={{color:'#64748b', display:'flex', alignItems:'center', gap:'5px', textDecoration:'none', fontWeight:'500'}}>
            <ArrowLeft size={20}/> Voltar
        </Link>
        <h1 style={{margin:0, fontSize:'1.5rem', color:'#1e293b'}}>Detalhes do Pedido</h1>
      </div>

      <div className="order-details-grid">
        
        {/* COLUNA ESQUERDA: Status e Itens */}
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            
            {/* Banner de Status */}
            <div style={{
                background: currentStatus.bg, 
                color: currentStatus.color, 
                padding: '20px', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                border: `1px solid ${currentStatus.color}30`
            }}>
                {currentStatus.icon}
                <div>
                    <strong style={{display:'block', fontSize:'1.1rem'}}>{currentStatus.label}</strong>
                    <span style={{fontSize:'0.9rem', opacity: 0.8}}>Pedido #{order.id.slice(0,8)} • {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            {/* --- SEÇÃO DE PAGAMENTO (Só aparece se estiver Pendente) --- */}
            {order.status === 'pending' && (
                <div className="payment-box-alert">
                    <h3><FileText size={20}/> Finalize seu Pagamento</h3>
                    <p>Copie a chave Pix abaixo e envie o comprovante para processarmos seu envio.</p>
                    
                    <div className="pix-copy-row">
                        <input type="text" value={PIX_KEY} readOnly />
                        <button onClick={copyPix}><Copy size={16}/> Copiar</button>
                    </div>

                    <a href={whatsappLink} target="_blank" rel="noreferrer" className="whatsapp-action-btn">
                        <ExternalLink size={18}/> Enviar Comprovante no WhatsApp
                    </a>
                </div>
            )}

            {/* Lista de Itens */}
            <div className="details-card">
                <h3>Itens Comprados</h3>
                {orderItems.map(item => (
                    <div key={item.id} className="detail-item-row">
                        <div>
                            <strong>{item.product_name}</strong>
                            <span>{item.selected_color} | {item.selected_size}</span>
                        </div>
                        <div className="item-price">
                           {item.quantity}x R$ {item.price_at_purchase.toFixed(2)}
                        </div>
                    </div>
                ))}
                <div className="detail-total-row">
                    <span>Subtotal</span>
                    <span>R$ {order.total_amount.toFixed(2)}</span>
                </div>
                <div className="detail-total-row">
                    <span>Frete</span>
                    <span>R$ {order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="detail-total-row final">
                    <span>Total</span>
                    <span>R$ {fullTotal.toFixed(2)}</span>
                </div>
            </div>

        </div>

        {/* COLUNA DIREITA: Endereço */}
        <div>
            <div className="details-card sticky-card">
                <h3><MapPin size={20}/> Endereço de Entrega</h3>
                <p style={{marginTop:'15px', fontSize:'1.1rem', color:'#334155'}}>
                    {order.shipping_address.street}, {order.shipping_address.number}
                </p>
                {order.shipping_address.complement && <p style={{color:'#64748b'}}>{order.shipping_address.complement}</p>}
                <p>{order.shipping_address.neighborhood}</p>
                <p>{order.shipping_address.city} - {order.shipping_address.state}</p>
                <p style={{marginTop:'10px', fontWeight:'bold'}}>CEP: {order.shipping_address.cep}</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ClientOrderDetailsPage;