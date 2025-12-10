import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { PRODUCTS } from '../data/data'; // Importamos para buscar o nome

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Não mostra breadcrumbs na Home
  if (pathnames.length === 0) {
    return null;
  }

  // Lógica Personalizada para o seu Site
  let crumbs = [];

  // Adiciona sempre o "Início"
  crumbs.push({ name: 'Início', path: '/' });

  // Cenário 1: Estamos no Catálogo
  if (pathnames[0] === 'catalogo') {
    crumbs.push({ name: 'Catálogo', path: '/catalogo' });
  }

  // Cenário 2: Estamos num Produto (URL: /produto/1)
  if (pathnames[0] === 'produto') {
    // Adiciona o "Catálogo" como pai lógico
    crumbs.push({ name: 'Catálogo', path: '/catalogo' });

    // Tenta achar o produto pelo ID que está na URL
    const productId = parseInt(pathnames[1]);
    const product = PRODUCTS.find((p) => p.id === productId);

    if (product) {
      // Adiciona o nome do produto (sem link, pois já estamos nele)
      crumbs.push({ name: product.name, path: null });
    }
  }

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={index} className="breadcrumb-item">
            {/* Separador (exceto para o primeiro item) */}
            {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}

            {isLast ? (
              // Último item: Texto cinza (não clicável)
              <span className="breadcrumb-text active" aria-current="page">
                {crumb.name}
              </span>
            ) : (
              // Outros itens: Links
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