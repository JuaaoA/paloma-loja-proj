import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Loading from './Loading'; // Reutilizando seu loading

const ProtectedRoute = () => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = carregando, false = bloqueado, true = autorizado

  useEffect(() => {
    const checkUserRole = async () => {
      // 1. Pega o usuário logado
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAuthorized(false);
        return;
      }

      // 2. Vai no banco consultar qual é o cargo (role) desse usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        console.error("Erro ao verificar permissão:", error);
        setIsAuthorized(false);
        return;
      }

      // 3. Verifica se é admin
      if (profile.role === 'admin') {
        setIsAuthorized(true);
      } else {
        // É usuário logado, mas é CLIENTE (intruso tentando entrar no admin)
        setIsAuthorized(false);
      }
    };

    checkUserRole();
  }, []);

  if (isAuthorized === null) return <Loading />;

  // Se não for autorizado, chuta para o login de admin
  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se passou, libera o acesso
  return <Outlet />;
};

export default ProtectedRoute;