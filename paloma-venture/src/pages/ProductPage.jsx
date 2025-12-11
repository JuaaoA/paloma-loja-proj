import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import ProductGallery from '../components/ProductGallery';
import Loading from '../components/Loading';
import { useToast } from '../contexts/ToastContext.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import NotFoundPage from './NotFoundPage.jsx';

import { supabase } from '../services/supabase.js';

import './Style/ProductPage.css'; // Importa o CSS específico da ProductPage

const ProductPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();
    
    // Inicializa com NULL
    const [product, setProduct] = useState(null);
    
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [error, setError] = useState('');

    // isLoading só é verdade se:
    // 1. product for null (estado inicial)
    const isLoading = product === null;

    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchProductData = async () => {
            try {
                // 1. Buscar o produto principal
                const { data: mainProduct, error: mainError } = await supabase
                    .from('products')
                    .select('*, categories(id, title)') // Traz o ID e Titulo da categoria
                    .eq('id', id)
                    .single();

                if (mainError) throw mainError;

                if (mainProduct) {
                    // Normaliza para facilitar renderização
                    const productFormatted = {
                        ...mainProduct,
                        category: mainProduct.categories?.title || mainProduct.category
                    };
                    setProduct(productFormatted);
                    
                    // 2. Buscar relacionados usando o ID da categoria (MUITO MAIS RÁPIDO E SEGURO)
                    // Se o produto já tem category_id, sera usado ele.
                    if (mainProduct.category_id) {
                        const { data: related, error: relatedError } = await supabase
                            .from('products')
                            .select('*') // Aqui não precisa join se não for exibir o nome da categoria no card
                            .eq('category_id', mainProduct.category_id) // Usa ID
                            .neq('id', mainProduct.id)
                            .limit(4);

                        if (!relatedError && related) setRelatedProducts(related);
                    } 
                    // Fallback: Se for produto antigo sem ID, usa o texto
                    else {
                        const { data: related } = await supabase
                            .from('products')
                            .select('*')
                            .eq('category', mainProduct.category) // Usa Texto Antigo
                            .neq('id', mainProduct.id)
                            .limit(4);
                        if (related) setRelatedProducts(related);
                    }
                }

            } catch (error) {
                console.error("Erro ao buscar produto:", error);
                setProduct(false);
            }
        };

        // Resetar estados antes de buscar
        setProduct(null);
        setSelectedSize('');
        setSelectedColor('');
        setError('');
        
        fetchProductData();

    }, [id]);

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/');
        }
    }

    const handleAddToCart = () => {
        if (!selectedSize) {
            setError('Por favor, selecione um tamanho.');
            return;
        }
        if (!selectedColor) {
            setError('Por favor, selecione uma cor.');
            return;
        }
        
        addToCart(product, selectedSize, selectedColor);
        showToast('Produto adicionado à sacola!', 'success');
        setError('');
    };

    // --- RENDERIZAÇÃO ---
    if (isLoading) return <Loading />;
    
    // Se isLoading é falso e product é false (porque não achou), cai aqui:
    if (!product) return <NotFoundPage />;

    return (
        <div className="container page-enter">
            <Breadcrumbs />

            <button onClick={handleBack} className="back-btn">
                <ArrowLeft size={18} /> Voltar
            </button>

            <div className="product-detail-container">
                <ProductGallery key={product.id} images={product.images} />

                <div className="product-info-detail">
                    <span className="stock-tag">{product.stock > 0 ? "Em Estoque" : "Esgotado"}</span>

                    <h1>{product.name}</h1>

                    {product.onSale && product.oldPrice ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            {/* Preço Antigo (Riscado e Cinza) */}
                            <span style={{ 
                                textDecoration: 'line-through', 
                                color: '#94a3b8', 
                                fontSize: '1.4rem',
                                fontWeight: 'normal' 
                            }}>
                                R$ {product.oldPrice.toFixed(2)}
                            </span>
                            
                            {/* Preço Novo (Vermelho e Grande) */}
                            <span style={{ 
                                fontSize: '2rem', 
                                fontWeight: '800', 
                                color: '#ef4444' // Vermelho de oferta
                            }}>
                                R$ {product.price.toFixed(2)}
                            </span>

                            {/* Badge de Porcentagem */}
                            <span style={{
                                backgroundColor: '#ef4444', 
                                color: 'white', 
                                padding: '4px 8px', 
                                borderRadius: '6px', 
                                fontSize: '0.9rem', 
                                fontWeight: 'bold'
                            }}>
                                -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                            </span>
                        </div>
                    ) : (
                        /* Preço Normal (Azul da marca) */
                        <p className="detail-price">R$ {product.price.toFixed(2)}</p>
                    )}
                    <p className="product-description">{product.description}</p>
                    
                    <div style={{marginBottom: '20px'}}>
                        <strong style={{display:'block', marginBottom:'8px'}}>Cor: <span style={{fontWeight:'normal'}}>{selectedColor || 'Selecione'}</span></strong>
                        <div style={{display: 'flex', gap: '10px'}}>
                        {product.colors.map(c => (
                            <div 
                                key={c} 
                                onClick={() => {setSelectedColor(c); setError('')}}
                                style={{
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    backgroundColor: c, 
                                    border: selectedColor === c ? '3px solid var(--primary)' : '1px solid #ddd',
                                    cursor: 'pointer',
                                    boxShadow: selectedColor === c ? '0 0 0 2px white inset' : 'none'
                                }}
                            ></div>
                        ))}
                        </div>
                    </div>

                    <div style={{marginBottom: '30px'}}>
                        <strong style={{display:'block', marginBottom:'8px'}}>Tamanho:</strong>
                        <div style={{display: 'flex', gap: '10px'}}>
                            {product.sizes?.map(size => (
                                <button
                                    key={size}
                                    onClick={() => {setSelectedSize(size); setError('')}}
                                    style={{
                                        padding: '8px 16px',
                                        border: selectedSize === size ? '2px solid var(--primary)' : '1px solid #ddd',
                                        background: selectedSize === size ? 'var(--primary)' : 'white',
                                        color: selectedSize === size ? 'white' : '#333',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div style={{color: '#ef4444', marginBottom: '15px', display:'flex', alignItems:'center', gap:'5px'}}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button 
                        className="add-btn" 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        style={{opacity: product.stock === 0 ? 0.5 : 1}}
                    >
                        {product.stock > 0 ? "Adicionar à Sacola" : "Indisponível"}
                    </button>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="related-products-section">
                    <h3 className="related-title">Você também pode gostar</h3>
                    
                    <div className="related-grid">
                        {relatedProducts.map(rel => (
                            <div key={rel.id} className="product-card">
                                <Link to={`/produto/${rel.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                                    <div className="product-image-container">
                                        <img src={rel.images[0]} alt={rel.name} className="product-image" />
                                        {rel.onSale && (
                                            <span style={{position: 'absolute', top: 5, left: 5, background: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'}}>
                                                OFERTA
                                            </span>
                                        )}
                                    </div>
                                    <div className="product-info" style={{padding: '10px'}}>

                                        {/* --- BOLINHAS DE CORES --- */}
                                        <div style={{display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '8px'}}>
                                            {rel.colors && rel.colors.map((color, index) => (
                                                <span 
                                                    key={index} 
                                                    style={{
                                                        backgroundColor: color,
                                                        width: '12px',       // Tamanho da bolinha
                                                        height: '12px',
                                                        borderRadius: '50%', // Redonda
                                                        border: '1px solid #ddd',
                                                        display: 'inline-block'
                                                    }}
                                                    title={color} // Mostra o código da cor ao passar o mouse
                                                ></span>
                                            ))}
                                        </div>

                                        <h4 style={{margin: '0 0 5px 0', fontSize: '1rem'}}>{rel.name}</h4>
                                        
                                        {rel.onSale && rel.oldPrice ? (
                                            <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap: 'wrap'}}>
                                                {/* Preço Antigo */}
                                                <span style={{
                                                    textDecoration:'line-through', 
                                                    color:'#94a3b8', 
                                                    fontSize:'0.85rem'
                                                }}>
                                                    R$ {rel.oldPrice.toFixed(2)}
                                                </span>
                                                
                                                {/* Preço Novo */}
                                                <span style={{
                                                    color:'#ef4444', 
                                                    fontWeight:'800', 
                                                    fontSize:'1.1rem'
                                                }}>
                                                    R$ {rel.price.toFixed(2)}
                                                </span>
                                            </div>
                                        ) : (
                                            /* Preço Normal */
                                            <p style={{
                                                margin:0, 
                                                fontWeight:'800', 
                                                color:'var(--primary)',
                                                fontSize:'1.1rem'
                                            }}>
                                                R$ {rel.price.toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;