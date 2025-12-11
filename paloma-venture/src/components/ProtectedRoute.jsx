import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabase';

const ProtectedRoute = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuta mudanças (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;

  // Se não tem sessão (não logado), redireciona pro Login
  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se tem sessão, deixa passar (Outlet renderiza os filhos)
  return <Outlet />;
};

export default ProtectedRoute;