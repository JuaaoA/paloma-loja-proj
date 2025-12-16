import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Package, Clock, CheckCircle, Truck, X, ChevronRight, ShoppingBag, AlertTriangle } from 'lucide-react';
import Loading from '../components/Loading';
import { useToast } from '../contexts/ToastContext';

// Importa o CSS exclusivo
import './Style/ClientOrders.css';

const ClientOrdersPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      // 1. Pega Sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // 2. VERIFICAÇÃO DE SEGURANÇA (ADMIN NÃO ENTRA)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile && profile.role === 'admin') {
        showToast('Administradores gerenciam pedidos pelo Painel.', 'info');
        navigate('/admin/dashboard');
        return;
      }

      // 3. Busca Pedidos do Usuário
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setOrders(data || []);
      }
      setLoading(false);
    };

    checkUserAndFetch();
  }, [navigate, showToast]);

  // Configuração Visual dos Status
  const statusConfig = {
    'pending': { label: 'Pendente (Pagar)', color: '#d97706', bg: '#fef3c7', icon: <Clock size={16}/> },
    'paid': { label: 'Pago', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={16}/> },
    'shipped': { label: 'Enviado', color: '#2563eb', bg: '#dbeafe', icon: <Truck size={16}/> },
    'delivered': { label: 'Entregue', color: '#475569', bg: '#f1f5f9', icon: <Package size={16}/> },
    'cancelled': { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2', icon: <X size={16}/> },
  };

  if (loading) return <Loading />;

  return (
    <div className="client-orders-container page-enter">
      <h1 className="page-title">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={48} color="#cbd5e1" />
          <p className="empty-text">Você ainda não fez nenhum pedido.</p>
          <Link to="/" className="start-shopping-btn">
            Começar a Comprar
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const status = statusConfig[order.status] || statusConfig['pending'];
            
            return (
              <div 
                key={order.id} 
                className={`client-order-card ${order.status}`}
                onClick={() => navigate(`/pedido-confirmado/${order.id}`)}
              >
                {/* Esquerda: Infos */}
                <div className="order-info-group">
                    <span className="order-number">
                        #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <strong className="order-total">
                        R$ {(order.total_amount + order.shipping_cost).toFixed(2)}
                    </strong>
                    {order.status === 'pending' && (
                        <span style={{fontSize:'0.8rem', color:'#d97706', marginTop:'4px'}}>
                            Clique para ver a Chave PIX
                        </span>
                    )}
                </div>

                {/* Direita: Status */}
                <div>
                    <span 
                        className="client-status-badge"
                        style={{ background: status.bg, color: status.color }}
                    >
                        {status.icon} {status.label}
                    </span>
                    <ChevronRight className="chevron-icon desktop-only-icon" style={{marginLeft:'10px'}} size={20} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientOrdersPage;