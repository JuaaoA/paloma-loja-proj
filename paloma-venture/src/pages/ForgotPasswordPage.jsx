import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/Loading';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // O Supabase envia um email com link que redireciona para a página de atualizar
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://paloma-loja-proj.vercel.app/atualizar-senha', 
        // QUANDO FIZER DEPLOY: Mude para 'https://sua-loja.vercel.app/atualizar-senha'
        // MUDAR PARA LOCALHOST DENOVO QUANDO FOR TESTAR LOCAL: 'http://localhost:5173/atualizar-senha'
      });

      if (error) throw error;

      showToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
    } catch (error) {
      showToast('Erro ao enviar e-mail: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container page-enter" style={{maxWidth: '400px', margin: '60px auto', textAlign: 'center'}}>
      
      <h1 style={{fontSize: '1.8rem', marginBottom: '10px'}}>Recuperar Senha</h1>
      <p style={{color: '#64748b', marginBottom: '30px'}}>
        Digite seu e-mail abaixo e enviaremos um link para você redefinir sua senha.
      </p>

      <form onSubmit={handleReset} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        
        <div style={{textAlign: 'left'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>E-mail cadastrado</label>
            <div style={{position: 'relative'}}>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: paloma@email.com"
                    style={{
                        width: '100%', padding: '12px 12px 12px 40px', 
                        borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'
                    }}
                />
                <Mail size={20} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}} />
            </div>
        </div>

        <button 
            type="submit" 
            className="add-btn" 
            style={{width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '12px'}}
        >
            <Send size={18} /> Enviar Link de Recuperação
        </button>

      </form>

      <div style={{marginTop: '30px'}}>
        <Link to="/login" style={{textDecoration: 'none', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
            <ArrowLeft size={16} /> Voltar para o Login
        </Link>
      </div>

    </div>
  );
};

export default ForgotPasswordPage;