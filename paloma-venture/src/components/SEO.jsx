import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
  // Nome padrão da loja se não vier título
  const siteTitle = 'Paloma Store'; 
  const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const finalDescription = description || 'A melhor moda feminina você encontra aqui.';
  const finalImage = image || 'URL_DE_UMA_IMAGEM_PADRAO_DA_LOJA.jpg'; // Coloque uma URL de logo aqui depois
  const finalUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Padrão do Navegador */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      {/* Facebook / WhatsApp (Open Graph) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};

export default SEO;