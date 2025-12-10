import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { PRODUCTS } from '../data/data';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Não mostra breadcrumbs na Home
  if (pathnames.length === 0) {
    return null;
  }

  let crumbs = [];

  // 1. Adiciona sempre o "Início"
  crumbs.push({ name: 'Início', path: '/' });

  // Pega a primeira parte da URL (ex: 'quem-somos', 'catalogo')
  const mainPath = pathnames[0];

  // --- MAPA DE NOMES PARA PÁGINAS SIMPLES ---
  const routeLabels = {
    'quem-somos': 'Quem Somos',
    'politicas': 'Políticas',
    'contato': 'Fale Conosco',
    'login': 'Entrar',
    'cadastro': 'Cadastrar'
  };

  // --- LÓGICA DE MONTAGEM ---
  
  // Cenário 1: Páginas Simples (Institucionais)
  if (routeLabels[mainPath]) {
    crumbs.push({ name: routeLabels[mainPath], path: null });
  }
  
  // Cenário 2: Catálogo
  else if (mainPath === 'catalogo') {
    crumbs.push({ name: 'Catálogo', path: '/catalogo' });
  }
  
  // Cenário 3: Produto
  else if (mainPath === 'produto') {
    crumbs.push({ name: 'Catálogo', path: '/catalogo' });

    const productId = parseInt(pathnames[1]);
    const product = PRODUCTS.find((p) => p.id === productId);

    if (product) {
      crumbs.push({ name: product.name, path: null });
    }
  }

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={index} className="breadcrumb-item">
            {/* Separador */}
            {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}

            {isLast ? (
              <span className="breadcrumb-text active" aria-current="page">
                {crumb.name}
              </span>
            ) : (
              // Link navegável
              <Link to={crumb.path} className="breadcrumb-link">
                {index === 0 ? <Home size={14} style={{marginBottom: -2}} /> : crumb.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;