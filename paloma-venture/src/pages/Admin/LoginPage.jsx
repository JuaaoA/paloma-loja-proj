import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log(data);
    
    setLoading(false);

    if (error) {
      alert('Erro ao entrar: ' + error.message);
    } else {
      // Login sucesso! Vamos para o painel
      navigate('/admin/dashboard');
    }
  };

  return (
    <div style={{maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
      <h2>Área Administrativa</h2>
      <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} onChange={e => setEmail(e.target.value)} 
          required
          style={{padding: '10px'}}
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} onChange={e => setPassword(e.target.value)} 
          required
          style={{padding: '10px'}}
        />
        <button type="submit" className="add-btn" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;