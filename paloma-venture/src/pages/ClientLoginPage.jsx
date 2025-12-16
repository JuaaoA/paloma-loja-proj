import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useToast } from '../contexts/ToastContext';
import './Style/ClientLoginPage.css';

const ClientLoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  
  // Verifica se tem redirecionamento (ex: ?redirect=checkout)
  const redirectUrl = searchParams.get('redirect') || '/';

  const [isSignUp, setIsSignUp] = useState(false); // Alterna entre Login e Cadastro
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- CADASTRO ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name } // Salva o nome nos metadados
          }
        });
        console.log(data);

        if (error) throw error;
        showToast('Cadastro realizado! Verifique seu e-mail.', 'success');
        // Opcional: Já logar direto ou pedir confirmação de email, depende da config do Supabase
        
      } else {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        console.log(data);

        if (error) throw error;
        
        showToast('Login realizado com sucesso!', 'success');
        navigate(redirectUrl); // Manda para o Checkout ou Home
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter" style={{background: '#f8fafc', minHeight: '80vh', display: 'flex', alignItems: 'center'}}>
      <div className="login-container">
        <h2 style={{color: 'var(--primary)', marginBottom: '20px'}}>
            {isSignUp ? 'Criar Conta' : 'Bem-vindo(a)'}
        </h2>

        <div className="login-toggle">
          <button 
            className={`toggle-btn ${!isSignUp ? 'active' : ''}`} 
            onClick={() => setIsSignUp(false)}
          >
            Já tenho conta
          </button>
          <button 
            className={`toggle-btn ${isSignUp ? 'active' : ''}`} 
            onClick={() => setIsSignUp(true)}
          >
            Quero cadastrar
          </button>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {isSignUp && (
            <input 
              type="text" 
              name="name" 
              placeholder="Seu Nome Completo" 
              className="auth-input" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          )}
          
          <input 
            type="email" 
            name="email" 
            placeholder="Seu E-mail" 
            className="auth-input" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
          
          <input 
            type="password" 
            name="password" 
            placeholder="Sua Senha" 
            className="auth-input" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Carregando...' : (isSignUp ? 'Cadastrar' : 'Entrar')}
          </button>
        </form>

        {!isSignUp && (
            <p style={{fontSize: '0.8rem', marginTop: '15px', color: '#64748b'}}>
                Esqueceu a senha? <Link to="/recuperar-senha">Clique aqui</Link>
            </p>
        )}
      </div>
    </div>
  );
};

export default ClientLoginPage;