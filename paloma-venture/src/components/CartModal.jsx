import React, { useEffect } from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import './Style/CartModal.css'; // Importa o CSS específico do CartModal
import { useNavigate } from 'react-router-dom';

const CartModal = () => {
  const { cart, removeFromCart, updateCartItem, isCartOpen, setIsCartOpen, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  // --- CÁLCULO DO TOTAL SEM DESCONTO ---
  const originalTotal = cart.reduce((acc, item) => {
    // Se o item tem oldPrice e está em oferta, usa o oldPrice. Se não, usa o preço normal.
    const itemOriginalPrice = (item.onSale && item.oldPrice) ? item.oldPrice : item.price;
    return acc + itemOriginalPrice;
  }, 0);

  const savings = originalTotal - total; // Quanto o cliente economizou

  return (
    <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Sua Sacola ({cart.length})</h2>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
            <X size={24} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px 0', color: '#64748b'}}>
            <ShoppingBag size={48} style={{opacity: 0.3, marginBottom: '20px'}} />
            <p>Sua sacola está vazia.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.cartId} className="cart-item" style={{alignItems: 'flex-start'}}>
                   <img 
                     src={item.images ? item.images[0] : ''} 
                     alt={item.name} 
                     style={{width: '70px', height: '90px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px'}} 
                   />
                  <div className="cart-item-info" style={{flex: 1}}>
                    <strong>{item.name}</strong>
                    {item.onSale && item.oldPrice ? (
                        <div style={{ display: 'flex', flexDirection: 'column', margin: '5px 0' }}>
                            <span style={{ 
                                textDecoration: 'line-through', 
                                color: '#94a3b8', 
                                fontSize: '0.85rem' 
                            }}>
                                R$ {item.oldPrice.toFixed(2)}
                            </span>
                            <span style={{ 
                                color: '#ef4444', 
                                fontWeight: 'bold',
                                fontSize: '1rem' 
                            }}>
                                R$ {item.price.toFixed(2)}
                            </span>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--primary)', fontWeight: 'bold', margin: '5px 0' }}>
                            R$ {item.price.toFixed(2)}
                        </div>
                    )}

                    {/* SELETORES NO CARRINHO */}
                    <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                        {/* Seletor de Tamanho */}
                        <select 
                            value={item.selectedSize}
                            onChange={(e) => updateCartItem(item.cartId, 'selectedSize', e.target.value)}
                            style={{padding: '4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem'}}
                        >
                            {item.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Seletor de Cor (texto ou bolinha, aqui usando texto para simplicidade no select) */}
                        <select 
                            value={item.selectedColor}
                            onChange={(e) => updateCartItem(item.cartId, 'selectedColor', e.target.value)}
                            style={{padding: '4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.8rem', maxWidth:'80px'}}
                        >
                            {item.colors?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                         {/* Bolinha visual da cor selecionada */}
                         <div style={{width:'24px', height:'24px', borderRadius:'50%', backgroundColor: item.selectedColor, border:'1px solid #ccc'}}></div>
                    </div>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.cartId)} // Usa cartId
                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '5px' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* --- ÁREA DO TOTAL --- */}
            <div className="cart-total" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px'}}>
              
              {/* Só mostra a comparação se houver alguma economia (> 0.01 para evitar bugs de arredondamento) */}
              {savings > 0.01 && (
                <>
                  <span style={{fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 'normal'}}>
                    De: R$ {originalTotal.toFixed(2)}
                  </span>
                  <span style={{fontSize: '0.9rem', color: '#22c55e', fontWeight: 'bold'}}>
                    Você economizou: R$ {savings.toFixed(2)}
                  </span>
                </>
              )}

              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px'}}>
                  <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 'normal'}}>Total:</span> 
                  <span style={{fontSize: '1.8rem', color: 'var(--primary)'}}>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
                className="add-btn" 
                style={{ marginTop: 20, padding: '15px', backgroundColor: '#22c55e' }}
                onClick={() => {
                    setIsCartOpen(false); // Fecha o modal
                    navigate('/checkout'); // Vai para a página de pagamento
                }}
            >
              Ir para o Pagamento
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;