import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // ADICIONAR: Recebe agora também o tamanho e cor escolhidos
  const addToCart = (product, selectedSize, selectedColor) => {
    const newItem = {
      ...product,
      selectedSize,
      selectedColor,
      cartId: `${product.id}-${selectedSize}-${selectedColor}-${Date.now()}`
    };
    
    setCart(prev => [...prev, newItem]);
  };

  // REMOVER: Agora usa o cartId, não o ID do produto
  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  // Atualiza atributos do item no carrinho
  const updateCartItem = (cartId, field, value) => {
    setCart(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, [field]: value } : item
    ));
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItem, isCartOpen, setIsCartOpen, total }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
      throw new Error('useCart deve ser usado dentro de um CartProvider');
    }
    return context;
  };