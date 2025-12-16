import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { CheckCircle, Copy, ShoppingBag, ExternalLink } from 'lucide-react';
import Loading from '../components/Loading';
import { useToast } from '../contexts/ToastContext';
import './Style/OrderSuccessPage.css'; // <--- IMPORTA O NOVO CSS

const OrderSuccessPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // CHAVE PIX DA LOJA
  const PIX_KEY = "sua-chave-pix@email.com"; 

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    showToast('Chave Pix copiada!', 'success');
  };

  if (loading) return <Loading />;
  if (!order) return <div style={{padding:50, textAlign:'center'}}>Pedido não encontrado.</div>;

  const fullTotal = order.total_amount + order.shipping_cost;

  // Link para o WhatsApp
  const whatsappMessage = `Olá! Acabei de fazer o pedido #${order.id.slice(0,8)} no site. O valor total é R$ ${fullTotal.toFixed(2)}. Segue o comprovante do Pix!`;
  const whatsappLink = `https://wa.me/5527999836947?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="success-container page-enter">
      
      {/* Ícone de Sucesso */}
      <div className="success-icon-wrapper">
        <CheckCircle size={48} color="#16a34a" strokeWidth={2.5} />
      </div>

      <h1 className="success-title">Pedido Recebido!</h1>
      <p className="success-message">Obrigado pela sua compra. Seu pedido foi registrado com sucesso.</p>

      {/* Caixa de Resumo */}
      <div className="order-summary-box">
        <div className="summary-row">
            <span className="summary-label">Número do Pedido:</span>
            <strong>#{order.id.slice(0, 8)}</strong>
        </div>
        <div className="summary-row">
            <span className="summary-label">Status:</span>
            <span className="status-badge">Aguardando Pagamento</span>
        </div>
        <div className="total-row">
            <span>Total a Pagar:</span>
            <span className="total-value">R$ {fullTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Área do Pix */}
      <div className="pix-container">
        <h3 className="pix-title">Pagamento via Pix</h3>
        <p className="pix-desc">Copie a chave abaixo, faça o pagamento no app do seu banco e envie o comprovante.</p>
        
        <div className="pix-input-group">
            <input type="text" value={PIX_KEY} readOnly className="pix-input" />
            <button onClick={copyPix} className="copy-btn">
                <Copy size={16} /> Copiar
            </button>
        </div>

        <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noreferrer"
            className="whatsapp-btn"
        >
            <ExternalLink size={20} /> Enviar Comprovante no WhatsApp
        </a>
      </div>

      <Link to="/" className="back-link">
        <ShoppingBag size={18} /> Continuar Comprando
      </Link>
    </div>
  );
};

export default OrderSuccessPage;