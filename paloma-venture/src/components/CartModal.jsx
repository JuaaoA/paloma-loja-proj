import React, { useEffect } from 'react';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartModal = () => {
  const { cart, removeFromCart, updateCartItem, isCartOpen, setIsCartOpen, total } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

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
                    <div style={{color: 'var(--primary)', fontWeight: 'bold', margin: '5px 0'}}>
                        R$ {item.price.toFixed(2)}
                    </div>

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
            
            <div className="cart-total">
              <span style={{fontSize: '1rem', color: '#64748b'}}>Total:</span> R$ {total.toFixed(2)}
            </div>
            
            <button className="add-btn" style={{ marginTop: 20, padding: '15px' }}>
              Finalizar Compra via WhatsApp
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;