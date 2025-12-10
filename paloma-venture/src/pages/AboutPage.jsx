import React, { useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const AboutPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="container page-enter">
      <Breadcrumbs />
      
      <div className="institutional-content">
        <h1 className="section-title">Sobre a Paloma Venture</h1>
        
        <p>
          Bem-vindo à <strong>Paloma Venture</strong>, sua nova referência em moda feminina elegante e contemporânea.
        </p>
        
        <p>
          Nascemos com o propósito de empoderar mulheres através de peças que unem conforto, sofisticação e versatilidade. Acreditamos que a roupa é uma forma de expressão e que cada mulher merece se sentir confiante e bonita em todos os momentos do seu dia.
        </p>

        <h2>Nossa Missão</h2>
        <p>
          Oferecer moda de alta qualidade com preços justos, prezando sempre pelo atendimento humanizado e pela experiência única de cada cliente. Queremos que você abra sua sacola e sinta o carinho em cada detalhe.
        </p>

        <h2>Nossos Valores</h2>
        <ul>
            <li><strong>Qualidade:</strong> Seleção rigorosa de tecidos e acabamentos.</li>
            <li><strong>Transparência:</strong> Fotos reais e descrições honestas dos produtos.</li>
            <li><strong>Atendimento:</strong> Você não fala com robôs, fala com a gente.</li>
        </ul>
      </div>
    </div>
  );
};

export default AboutPage;