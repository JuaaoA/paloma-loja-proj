import React, { useEffect } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';

const PolicyPage = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="container page-enter">
      <Breadcrumbs />
      
      <div className="institutional-content">
        <h1 className="section-title">Políticas de Troca e Devolução</h1>
        
        <p>
          Queremos que você ame sua compra! Mas caso precise trocar ou devolver, fique tranquila. Seguimos rigorosamente o Código de Defesa do Consumidor.
        </p>

        <h2>1. Prazo para Devolução (Arrependimento)</h2>
        <p>
          Conforme o artigo 49 do CDC, você tem até <strong>7 (sete) dias corridos</strong>, contados a partir do recebimento do produto, para desistir da compra e solicitar a devolução do dinheiro. O produto deve estar sem uso, com a etiqueta fixada.
        </p>

        <h2>2. Trocas por Tamanho ou Cor</h2>
        <p>
          Se a peça não serviu, você pode solicitar a troca em até <strong>30 dias corridos</strong>. A primeira troca é por nossa conta (frete de envio)! Nas demais, o frete fica por conta do cliente.
        </p>

        <h2>3. Defeito de Fabricação</h2>
        <p>
          Caso identifique algum defeito na peça, entre em contato imediatamente. Você tem até <strong>90 dias</strong> para reclamar de defeitos aparentes ou de fácil constatação.
        </p>

        <h2>Como Solicitar</h2>
        <p>
          Envie uma mensagem para nosso WhatsApp (27) 99983-6947 informando o número do pedido e o motivo da troca/devolução. Nossa equipe irá te orientar sobre o envio.
        </p>
      </div>
    </div>
  );
};

export default PolicyPage;