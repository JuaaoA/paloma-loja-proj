import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../services/supabase';
import { CreditCard, MapPin } from 'lucide-react';
import './Style/CheckoutPage.css';

const CheckoutPage = () => {
  const { cart, total } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DO FORMULÁRIO ---
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');

  const [addressData, setAddressData] = useState({
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: ''
  });

  // CONTROLE DE CAMPOS BLOQUEADOS (Smart Lock)
  // True = Campo travado (vem da API)
  // False = Campo livre (usuário digita)
  const [isLocked, setIsLocked] = useState({
    street: false,
    neighborhood: false,
    city: true, // Cidade geralmente vem certa
    state: true // Estado geralmente vem certo
  });

  // 1. Verifica Acesso (Login + Role)
  useEffect(() => {
    const checkUserAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        showToast('Faça login para finalizar a compra', 'info');
        navigate('/login?redirect=/checkout');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile && profile.role === 'admin') {
        showToast('Administradores não podem realizar compras.', 'error');
        navigate('/admin/dashboard');
        return;
      }

      setSession(session);
      setLoading(false);
    };
    checkUserAccess();
  }, [navigate, showToast]);

  // 2. Manipula CEP
  const handleCepChange = async (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    
    setAddressData(prev => ({ ...prev, cep: value }));

    if (value.length === 9) {
      fetchAddress(value);
    } else if (value.length < 9) {
        // Se o usuário apagar o CEP, libera os campos para ele não ficar travado
        setShippingPrice(0);
        setIsLocked({ street: false, neighborhood: false, city: false, state: false });
    }
  };

  // 3. Busca ViaCEP (Lógica de CEP Genérico)
  const fetchAddress = async (cepTyped) => {
    const cleanCep = cepTyped.replace(/\D/g, '');
    setCepLoading(true);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      
      if (!data.erro) {
        // Atualiza os dados
        setAddressData(prev => ({
          ...prev,
          street: data.logradouro || '', // Se vier vazio, fica vazio
          neighborhood: data.bairro || '',
          city: data.localidade,
          state: data.uf,
        }));

        // --- A MÁGICA ACONTECE AQUI ---
        // Se data.logradouro existe (CEP Específico) -> Bloqueia (True)
        // Se data.logradouro é vazio (CEP Genérico) -> Libera (False)
        setIsLocked({
            street: !!data.logradouro, 
            neighborhood: !!data.bairro,
            city: true, // Cidade sempre bloqueia pois vem da API
            state: true
        });
        
        // Mock Frete
        const simulacaoFrete = data.uf === 'ES' ? 12.00 : (data.uf === 'SP' || data.uf === 'RJ' ? 25.00 : 35.00);
        setShippingPrice(simulacaoFrete);
        showToast('Endereço localizado!', 'success');

      } else {
        showToast('CEP não encontrado.', 'error');
        setShippingPrice(0);
        // Se deu erro, libera tudo pro coitado digitar na mão
        setIsLocked({ street: false, neighborhood: false, city: false, state: false });
      }
    } catch (error) {
      console.error(error);
      showToast('Erro ao buscar CEP.', 'error');
      setIsLocked({ street: false, neighborhood: false, city: false, state: false });
    } finally {
      setCepLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  // 4. Finalizar
  const handleFinishOrder = async () => {
    if (!addressData.street || !addressData.number || !addressData.city) {
      showToast('Preencha o endereço completo (Rua e Número).', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: session.user.id,
          total_amount: total,
          shipping_cost: shippingPrice,
          shipping_address: addressData,
          payment_method: paymentMethod,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsToInsert = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: 1,
        price_at_purchase: item.price,
        selected_size: item.selectedSize,
        selected_color: item.selectedColor
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      showToast('Pedido criado com sucesso!', 'success');
      navigate(`/pedido-confirmado/${orderData.id}`);
      
    } catch (error) {
      showToast('Erro ao criar pedido: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Carregando...</div>;
  if (cart.length === 0) return <div style={{padding:'50px', textAlign:'center'}}>Seu carrinho está vazio.</div>;

  return (
    <div className="container page-enter" style={{marginTop: '40px', marginBottom: '60px'}}>
      <h1>Finalizar Compra</h1>
      
      <div className="checkout-grid">
        
        {/* ESQUERDA */}
        <div className="checkout-form">
          <div className="checkout-section">
            <h3><MapPin size={20} /> Endereço de Entrega</h3>
            
            <div className="form-group">
                <label>CEP</label>
                <input 
                  type="text" 
                  value={addressData.cep} 
                  onChange={handleCepChange} 
                  placeholder="00000-000"
                  maxLength={9}
                  className="checkout-input"
                />
                {cepLoading && <span className="cep-loading">Buscando...</span>}
            </div>
            
            <div className="form-row col-70">
                <div className="form-group">
                    <label>Rua / Avenida</label>
                    <input 
                        name="street"
                        type="text" 
                        value={addressData.street}
                        onChange={handleInputChange} // Agora permite edição se isLocked for false
                        className="checkout-input"
                        readOnly={isLocked.street} // <--- TRAVA INTELIGENTE
                        placeholder="Rua..."
                    />
                </div>
                <div className="form-group">
                    <label>Número</label>
                    <input 
                        name="number"
                        type="text" 
                        value={addressData.number}
                        onChange={handleInputChange} 
                        className="checkout-input"
                        placeholder="Nº"
                    />
                </div>
            </div>

            <div className="form-row col-30">
                 <div className="form-group">
                    <label>Bairro</label>
                    <input 
                        name="neighborhood"
                        type="text" 
                        value={addressData.neighborhood} 
                        onChange={handleInputChange} // Permite edição
                        className="checkout-input"
                        readOnly={isLocked.neighborhood} // <--- TRAVA INTELIGENTE
                        placeholder="Bairro..."
                    />
                </div>
                <div className="form-group">
                    <label>Complemento (Opcional)</label>
                    <input 
                        name="complement"
                        type="text" 
                        value={addressData.complement}
                        onChange={handleInputChange} 
                        className="checkout-input"
                        placeholder="Apto, Bloco..."
                    />
                </div>
            </div>

            <div className="form-row col-70">
                <div className="form-group">
                    <label>Cidade</label>
                    <input 
                        name="city"
                        type="text" 
                        value={addressData.city} 
                        className="checkout-input"
                        readOnly={isLocked.city}
                    />
                </div>
                <div className="form-group">
                    <label>Estado</label>
                    <input 
                        name="state"
                        type="text" 
                        value={addressData.state} 
                        className="checkout-input"
                        readOnly={isLocked.state}
                    />
                </div>
            </div>

          </div>

          <div className="checkout-section">
            <h3><CreditCard size={20} /> Forma de Pagamento</h3>
            <div className="payment-options">
               <button 
                 className={`payment-btn ${paymentMethod === 'pix' ? 'active' : ''}`}
                 onClick={() => setPaymentMethod('pix')}
               >
                 <img src="https://logospng.org/download/pix/logo-pix-icone-512.png" width="24" alt="Pix" /> Pix
               </button>
               
               <button 
                 className={`payment-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                 onClick={() => setPaymentMethod('credit_card')}
               >
                 <CreditCard size={24} /> Cartão de Crédito
               </button>
            </div>
          </div>
        </div>

        {/* DIREITA (Resumo) mantido igual */}
        <div className="checkout-summary">
           <h3>Resumo do Pedido</h3>
           <div className="summary-items">
              {cart.map(item => (
                <div key={item.cartId} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'0.9rem'}}>
                    <span>{item.name} ({item.selectedSize})</span>
                    <span>R$ {item.price.toFixed(2)}</span>
                </div>
              ))}
           </div>
           
           <hr style={{margin:'20px 0', borderColor:'#eee'}} />
           
           <div className="summary-row">
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
           </div>
           <div className="summary-row">
              <span>Frete:</span>
              <span>{shippingPrice > 0 ? `R$ ${shippingPrice.toFixed(2)}` : (addressData.cep.length >= 8 ? 'Grátis/Fixo' : 'Digite o CEP')}</span>
           </div>
           
           <div className="summary-total">
              <span>Total:</span>
              <span>R$ {(total + shippingPrice).toFixed(2)}</span>
           </div>

           <button className="finish-btn" onClick={handleFinishOrder} disabled={loading || !addressData.street || !addressData.number}>
              {loading ? 'Processando...' : 'Confirmar e Pagar'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;