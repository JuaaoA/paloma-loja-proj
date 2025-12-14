import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Tag, Sparkles, Layers, ShoppingBag } from 'lucide-react';
import { supabase } from '../../services/supabase';
import Loading from '../../components/Loading';
import './Style/AdminDashboard.css';

import { compressImage } from '../../utils/ImageOptimizer';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Lista de Ícones disponíveis para a cliente escolher
  const availableIcons = [
    { value: 'sparkles', label: 'Brilho/Destaque', component: <Sparkles size={18} /> },
    { value: 'layers', label: 'Camadas/Básico', component: <Layers size={18} /> },
    { value: 'tag', label: 'Etiqueta/Oferta', component: <Tag size={18} /> },
    { value: 'bag', label: 'Sacola/Compras', component: <ShoppingBag size={18} /> }
  ];

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    icon_name: 'sparkles',
    is_promo: false // Importante para as travas de segurança
  });

  // --- CARREGAR DADOS ---
  useEffect(() => {
    if (isEditing) {
      const loadCategory = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) setFormData(data);
        } catch (error) {
          alert('Erro ao carregar categoria: ' + error.message);
          navigate('/admin/dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      loadCategory();
    }
  }, [id, navigate, isEditing]);

  // --- HANDLERS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- UPLOAD DE IMAGEM (Única) ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. OTIMIZAÇÃO
      const compressedBlob = await compressImage(file);

      // 2. NOME .webp
      const fileName = `cat-${Date.now()}-${file.name.replace(/\.[^/.]+$/, "").replace(/\s/g, '-')}.webp`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedBlob, {
            contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));

    } catch (error) {
      console.error(error);
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- SALVAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação: Imagem é obrigatória
    if (!formData.image_url) {
        alert("⚠️ Por favor, adicione uma imagem para a categoria.");
        return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        image_url: formData.image_url,
        icon_name: formData.icon_name,
        // link_url: Geramos automaticamente baseado no título se não for promo
        link_url: formData.is_promo ? formData.link_url : `/catalogo?category=${formData.title}`
      };

      let error;
      if (isEditing) {
        const { error: updateError } = await supabase.from('categories').update(payload).eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('categories').insert([payload]);
        error = insertError;
      }

      if (error) throw error;
      alert('Categoria salva com sucesso!');
      navigate('/admin/dashboard');

    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="admin-container page-enter">
      <div className="admin-header">
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <button onClick={() => navigate('/admin/dashboard')} className="back-btn" style={{margin:0}}>
                <ArrowLeft size={18} />
            </button>
            <h1 style={{margin: 0, fontSize: '1.5rem', color: 'var(--primary)'}}>
                {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
            </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{maxWidth: '600px', margin: '0 auto'}}>
        
        {/* TRAVA DE SEGURANÇA VISUAL */}
        {formData.is_promo && (
            <div style={{backgroundColor: '#fff7ed', border: '1px solid #fdba74', padding: '15px', borderRadius: '8px', marginBottom: '20px', color: '#c2410c', fontSize: '0.9rem'}}>
                🔒 <strong>Atenção:</strong> Esta é uma categoria especial do sistema. Você pode alterar a imagem, mas não pode mudar o nome para evitar erros na lógica de promoções.
            </div>
        )}

        <div className="form-group">
            <label className="form-label">Nome da Categoria</label>
            <input 
                type="text" 
                name="title" 
                className="form-input" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                disabled={formData.is_promo} // BLOQUEIA SE FOR PROMO
                style={{backgroundColor: formData.is_promo ? '#f1f5f9' : 'white', cursor: formData.is_promo ? 'not-allowed' : 'text'}}
            />
        </div>

        <div className="form-group">
            <label className="form-label">Ícone</label>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                {availableIcons.map(icon => (
                    <div 
                        key={icon.value}
                        onClick={() => setFormData({...formData, icon_name: icon.value})}
                        style={{
                            border: formData.icon_name === icon.value ? '2px solid var(--primary)' : '1px solid #ddd',
                            backgroundColor: formData.icon_name === icon.value ? '#f0f9ff' : 'white',
                            padding: '10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flex: '1 0 40%'
                        }}
                    >
                        {icon.component}
                        <span>{icon.label}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="form-group">
            <label className="form-label">Imagem de Capa (Obrigatória)</label>
            <label className="image-upload-area">
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                <Upload size={30} color="#94a3b8" />
                <span style={{color:'#64748b'}}>
                    {uploading ? 'Enviando...' : 'Clique para alterar capa'}
                </span>
            </label>

            {formData.image_url && (
                <div style={{marginTop: '15px', position: 'relative', display: 'inline-block'}}>
                    <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd'}} 
                    />
                </div>
            )}
        </div>

        <button type="submit" className="add-btn" disabled={isLoading || uploading} style={{marginTop: '20px'}}>
            <Save size={18} /> Salvar Categoria
        </button>

      </form>
    </div>
  );
};

export default CategoryForm;