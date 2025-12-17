import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';

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

  // --- VALIDAÇÃO DE ITENS (Sincronização com o Banco) ---
  useEffect(() => {
    const validateCartItems = async () => {
      if (cart.length === 0) return;

      const productIds = [...new Set(cart.map(item => item.id))];

      try {
        const { data: validProducts, error } = await supabase
          .from('products')
          .select('id, price, oldPrice, onSale, stock, name, images')
          .in('id', productIds);

        if (error) throw error;

        if (validProducts) {
          const verifiedCart = cart.filter(cartItem => {
            const productStillExists = validProducts.find(p => p.id === cartItem.id);
            // Verifica se o produto existe e se tem PELO MENOS 1 em estoque
            const hasStock = productStillExists ? productStillExists.stock > 0 : false;
            return productStillExists && hasStock;
          });

          const updatedCart = verifiedCart.map(cartItem => {
             const freshData = validProducts.find(p => p.id === cartItem.id);
             return {
                 ...cartItem,
                 price: freshData.price,
                 oldPrice: freshData.oldPrice,
                 onSale: freshData.onSale,
                 name: freshData.name,
                 images: freshData.images,
                 stock: freshData.stock // Importante: Atualizamos o estoque local também
             };
          });

          if (JSON.stringify(updatedCart) !== JSON.stringify(cart)) {
            console.log("Carrinho atualizado: Itens removidos ou atualizados.");
            setCart(updatedCart);
          }
        }
      } catch (err) {
        console.error("Erro ao validar carrinho:", err);
      }
    };

    validateCartItems();
  }, [cart]); // Observação: cuidado com loops infinitos aqui, mas a lógica de comparação JSON ajuda.

  // --- ADICIONAR COM TRAVA DE ESTOQUE ---
  const addToCart = (product, selectedSize, selectedColor) => {
    // 1. Conta quantos desse MESMO produto (ID) já estão no carrinho
    const currentQtyInCart = cart.filter(item => item.id === product.id).length;

    // 2. Verifica se adicionar mais 1 ultrapassa o estoque disponível
    if (currentQtyInCart + 1 > product.stock) {
      // Retorna false para indicar que falhou
      return false;
    }

    // 3. Se passou, cria o item e adiciona
    const newItem = {
      ...product,
      selectedSize,
      selectedColor,
      cartId: `${product.id}-${selectedSize}-${selectedColor}-${Date.now()}`
    };
    
    setCart(prev => [...prev, newItem]);
    return true; // Retorna true para indicar sucesso
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

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