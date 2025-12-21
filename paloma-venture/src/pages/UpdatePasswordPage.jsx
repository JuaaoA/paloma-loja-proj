import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Lock, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import Loading from '../components/Loading';

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // 1. Novo Estado
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Verifica se o usuário chegou aqui realmente logado (via link do email)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Link inválido ou expirado. Tente solicitar novamente.', 'error');
        navigate('/recuperar-senha');
      }
    };
    checkSession();
  }, [navigate, showToast]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 2. Validação de Senhas Iguais
    if (password !== confirmPassword) {
        showToast('As senhas não coincidem. Tente novamente.', 'error');
        setLoading(false);
        return;
    }

    if (password.length < 6) {
        showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
        setLoading(false);
        return;
    }

    try {
      // Atualiza a senha do usuário logado
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) throw error;

      showToast('Senha alterada com sucesso! Você já está logado.', 'success');
      navigate('/'); 
      
    } catch (error) {
      showToast('Erro ao atualizar senha: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container page-enter" style={{maxWidth: '400px', margin: '60px auto', textAlign: 'center'}}>
      
      <div style={{background: '#dcfce7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto'}}>
        <Lock size={30} color="#16a34a" />
      </div>

      <h1 style={{fontSize: '1.8rem', marginBottom: '10px'}}>Nova Senha</h1>
      <p style={{color: '#64748b', marginBottom: '30px'}}>
        Crie uma nova senha segura para sua conta.
      </p>

      <form onSubmit={handleUpdatePassword} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        
        {/* CAMPO 1: SENHA */}
        <div style={{textAlign: 'left'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Nova Senha</label>
            <div style={{position: 'relative'}}>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{
                        width: '100%', padding: '12px 12px 12px 40px', 
                        borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'
                    }}
                />
                <Lock size={20} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}} />
            </div>
        </div>

        {/* CAMPO 2: CONFIRMAR SENHA */}
        <div style={{textAlign: 'left'}}>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Confirmar Nova Senha</label>
            <div style={{position: 'relative'}}>
                <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    style={{
                        width: '100%', padding: '12px 12px 12px 40px', 
                        borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box'
                    }}
                />
                <Lock size={20} color="#94a3b8" style={{position: 'absolute', left: '12px', top: '12px'}} />
            </div>
        </div>

        <button 
            type="submit" 
            className="add-btn" 
            style={{width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '12px', background: '#16a34a'}}
        >
            <CheckCircle size={18} /> Salvar Nova Senha
        </button>

      </form>
    </div>
  );
};

export default UpdatePasswordPage;