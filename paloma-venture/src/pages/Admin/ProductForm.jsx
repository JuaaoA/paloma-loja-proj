import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import Loading from '../../components/Loading';

import './Style/AdminDashboard.css';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // --- ESTADO DO FORMULÁRIO ---
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',    // Agora é string para aceitar vírgula
    oldPrice: '', // Agora é string para aceitar vírgula
    stock: '',
    category: '',
    images: [],
    colors: [],
    sizes: [],
    featured: false
    // onSale removido: será calculado automaticamente
  });

  const [tempSize, setTempSize] = useState('');
  const [tempColor, setTempColor] = useState('#000000');
  const [uploading, setUploading] = useState(false);

  // --- FUNÇÕES AUXILIARES DE PREÇO (MÁSCARA BRASIL) ---
  const formatMoneyInput = (value) => {
    // Remove tudo que não é número ou vírgula
    return value.replace(/[^0-9,]/g, '');
  };

  const parseMoney = (value) => {
    if (!value) return null;
    // Troca vírgula por ponto para o banco de dados (199,90 -> 199.90)
    return parseFloat(value.replace('.', '').replace(',', '.'));
  };

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const { data: cats } = await supabase.from('categories').select('title');
        setCategories(cats || []);

        if (isEditing) {
          const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (product) {
            setFormData({
              ...product,
              // Converte ponto do banco para vírgula no input (199.90 -> "199,90")
              price: product.price ? product.price.toString().replace('.', ',') : '',
              oldPrice: product.oldPrice ? product.oldPrice.toString().replace('.', ',') : '',
              stock: product.stock || 0
            });
          }
        }
      } catch (error) {
        alert('Erro ao carregar dados: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, isEditing]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Se for preço, aplica a máscara de vírgula
    if (name === 'price' || name === 'oldPrice') {
        setFormData(prev => ({ ...prev, [name]: formatMoneyInput(value) }));
    } else {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }
  };

  // --- ARRAYS (Tamanhos e Cores) ---
  const addSize = () => {
    if (tempSize && !formData.sizes.includes(tempSize)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, tempSize] }));
      setTempSize('');
    }
  };
  const removeSize = (s) => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(item => item !== s) }));
  
  const addColor = () => {
    if (tempColor && !formData.colors.includes(tempColor)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, tempColor] }));
    }
  };
  const removeColor = (c) => setFormData(prev => ({ ...prev, colors: prev.colors.filter(item => item !== c) }));

  // --- UPLOAD IMAGENS ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newImageUrls = [];

    try {
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  // --- SALVAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Converter preços de "199,90" para 199.90
      const numericPrice = parseMoney(formData.price);
      const numericOldPrice = parseMoney(formData.oldPrice);

      // 2. Validação Lógica de Promoção
      // Regra: Preço Antigo DEVE ser maior que Preço Atual
      if (numericOldPrice && numericOldPrice <= numericPrice) {
        alert("Erro: Para ser uma promoção, o 'Preço Antigo' deve ser MAIOR que o 'Preço Atual'.\n\nSe não for promoção, deixe o campo 'Preço Antigo' vazio.");
        setIsLoading(false);
        return;
      }

      // 3. Define onSale automaticamente
      const isOnSale = !!(numericOldPrice && numericOldPrice > numericPrice);

      const payload = {
        ...formData,
        price: numericPrice,
        oldPrice: numericOldPrice || null, // Se vazio, manda null
        onSale: isOnSale,
        stock: parseInt(formData.stock),
      };

      let error;
      if (isEditing) {
        const { error: updateError } = await supabase.from('products').update(payload).eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('products').insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      alert('Produto salvo com sucesso!');
      navigate('/admin/dashboard');

    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing && !formData.name) return <Loading />;

  return (
    <div className="admin-container page-enter">
      <div className="admin-header">
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <button onClick={() => navigate('/admin/dashboard')} className="back-btn" style={{margin:0}}>
                <ArrowLeft size={18} />
            </button>
            <h1 style={{margin: 0, fontSize: '1.5rem', color: 'var(--primary)'}}>
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
            
            {/* --- COLUNA ESQUERDA --- */}
            <div>
                <div className="form-group">
                    <label className="form-label">Nome do Produto</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label className="form-label">Descrição</label>
                    <textarea name="description" className="form-textarea" value={formData.description} onChange={handleChange} required />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Preço Atual (R$)</label>
                        <input 
                            type="text" 
                            name="price" 
                            className="form-input" 
                            placeholder="0,00"
                            value={formData.price} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Preço Antigo (Para Ofertas)</label>
                        <input 
                            type="text" 
                            name="oldPrice" 
                            className="form-input" 
                            placeholder="0,00"
                            value={formData.oldPrice} 
                            onChange={handleChange} 
                        />
                        <small style={{color:'#64748b', fontSize:'0.8rem'}}>
                            Preencha apenas se for promoção. Deve ser maior que o preço atual.
                        </small>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Estoque</label>
                        <input type="number" name="stock" className="form-input" value={formData.stock} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Categoria</label>
                        <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                            <option value="">Selecione...</option>
                            {/* Prioridade: Categorias do Banco. Fallback: Lista completa da imagem */}
                            {categories.length > 0 ? (
                                categories.map((c, i) => <option key={i} value={c.title}>{c.title}</option>)
                            ) : (
                                <>
                                    <option value="Vestidos">Vestidos</option>
                                    <option value="Conjuntos">Conjuntos</option>
                                    <option value="Blusas">Blusas</option>
                                    <option value="Saias">Saias</option>
                                    <option value="Calças">Calças</option>
                                    <option value="Macacões">Macacões</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                <div style={{marginTop:'20px'}}>
                    <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', background:'#f8fafc', padding:'15px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                        <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} style={{width:'20px', height:'20px'}} />
                        <span style={{fontWeight:'600'}}>Exibir nos Destaques (Carrossel da Home)</span>
                    </label>
                </div>
            </div>

            {/* --- COLUNA DIREITA --- */}
            <div>
                {/* UPLOAD */}
                <div className="form-group">
                    <label className="form-label">Imagens do Produto</label>
                    <label className="image-upload-area">
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                        <Upload size={40} color="#94a3b8" />
                        <span style={{color:'#64748b', fontWeight:'500'}}>
                            {uploading ? 'Enviando...' : 'Clique para enviar fotos'}
                        </span>
                    </label>

                    <div className="preview-grid">
                        {formData.images.map((img, index) => (
                            <div key={index} className="preview-item">
                                <img src={img} alt="Preview" className="preview-img" />
                                <button type="button" onClick={() => removeImage(index)} className="remove-img-btn"><X size={12}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TAMANHOS */}
                <div className="form-group">
                    <label className="form-label">Tamanhos</label>
                    <div className="array-input-group">
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ex: P, M, 38..." 
                            value={tempSize} 
                            onChange={e => setTempSize(e.target.value)}
                        />
                        <button type="button" onClick={addSize} className="add-btn" style={{marginTop:0, width:'auto'}}><Plus size={18}/></button>
                    </div>
                    <div className="tags-container">
                        {formData.sizes.map(s => (
                            <span key={s} className="tag-item">
                                {s} <span className="tag-remove" onClick={() => removeSize(s)}>×</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* CORES */}
                <div className="form-group">
                    <label className="form-label">Cores</label>
                    <div className="array-input-group">
                        <input 
                            type="color" 
                            className="form-input" 
                            style={{height:'45px', padding:'2px', width:'60px', cursor:'pointer'}}
                            value={tempColor} 
                            onChange={e => setTempColor(e.target.value)}
                        />
                        <button type="button" onClick={addColor} className="add-btn" style={{marginTop:0, width:'auto'}}>Adicionar Cor</button>
                    </div>
                    <div className="tags-container">
                        {formData.colors.map(c => (
                            <span key={c} className="tag-item">
                                <span style={{width:12, height:12, borderRadius:'50%', background:c, border:'1px solid #999'}}></span>
                                {c} <span className="tag-remove" onClick={() => removeColor(c)}>×</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div style={{borderTop:'1px solid #eee', paddingTop:'20px', marginTop:'30px', display:'flex', justifyContent:'flex-end'}}>
            <button type="submit" className="add-btn" style={{width: '250px', fontSize:'1.1rem'}} disabled={isLoading || uploading}>
                {isLoading ? 'Salvando...' : <><Save size={20} /> Salvar Produto</>}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;