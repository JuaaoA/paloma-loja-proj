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

  // --- 2. NOVO: VALIDAÇÃO DE ITENS DELETADOS ---
  useEffect(() => {
    const validateCartItems = async () => {
      // Se o carrinho estiver vazio, não precisa checar nada
      if (cart.length === 0) return;

      // Pega todos os IDs únicos dos produtos que estão no carrinho
      const productIds = [...new Set(cart.map(item => item.id))];

      try {
        // Pergunta ao Supabase quais desses IDs ainda existem no banco
        const { data: validProducts, error } = await supabase
          .from('products')
          .select('id, price, oldPrice, onSale, stock, name, images') // Trazemos dados frescos
          .in('id', productIds);

        if (error) throw error;

        // Se o banco não retornou nada, ou retornou menos itens...
        if (validProducts) {
          
          // Filtra o carrinho: Só mantém o item se o ID dele existir na resposta do banco
          const verifiedCart = cart.filter(cartItem => {
            const productStillExists = validProducts.find(p => p.id === cartItem.id);
            // Também podemos checar se ainda tem estoque!
            const hasStock = productStillExists ? productStillExists.stock > 0 : false;
            
            return productStillExists && hasStock;
          });

          // Opcional: Atualizar preços se mudaram no banco (Sincronização)
          const updatedCart = verifiedCart.map(cartItem => {
             const freshData = validProducts.find(p => p.id === cartItem.id);
             return {
                 ...cartItem,
                 price: freshData.price,
                 oldPrice: freshData.oldPrice,
                 onSale: freshData.onSale,
                 name: freshData.name, // Caso tenha mudado o nome
                 images: freshData.images
             };
          });

          // Se a quantidade de itens mudou (algum foi deletado) ou preço mudou
          if (JSON.stringify(updatedCart) !== JSON.stringify(cart)) {
            console.log("Carrinho atualizado: Itens removidos ou atualizados pelo servidor.");
            setCart(updatedCart);
          }
        }
      } catch (err) {
        console.error("Erro ao validar carrinho:", err);
      }
    };

    validateCartItems();
    
    // Essa validação roda uma vez ao montar o site. 
    // Se quiser que rode toda vez que abre o modal, precisaria mover a lógica.
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