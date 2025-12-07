//import { useState } from 'react'
import './App.css'

function App() {
  // 1. Simulação do Banco de Dados (Depois podemos mover para um JSON externo)
  const produtos = [
    {
      id: 1,
      nome: 'Camiseta Básica Preta',
      preco: 49.90,
      imagem: 'https://placehold.co/300x300/1a1a1a/white?text=Camiseta', // Imagem temporária
      descricao: 'Algodão 100%, super confortável.'
    },
    {
      id: 2,
      nome: 'Vestido Floral Verão',
      preco: 129.90,
      imagem: 'https://placehold.co/300x300/ff99cc/white?text=Vestido',
      descricao: 'Perfeito para dias quentes.'
    },
    {
      id: 3,
      nome: 'Calça Jeans Skinny',
      preco: 89.90,
      imagem: 'https://placehold.co/300x300/003366/white?text=Jeans',
      descricao: 'Modelagem que valoriza o corpo.'
    },
    {
      id: 4,
      nome: 'Jaqueta Denim',
      preco: 199.90,
      imagem: 'https://placehold.co/300x300/333/white?text=Jaqueta',
      descricao: 'Estilo clássico e durável.'
    }
  ]

  // 2. Número do WhatsApp da sua amiga (Coloque o número real aqui)
  const telefoneLoja = '5511999999999' 

  // 3. Função que cria o link do WhatsApp
  const gerarLinkZap = (produto) => {
    const mensagem = `Olá! Vi o *${produto.nome}* no site por R$ ${produto.preco} e gostaria de comprar.`
    const textoCodificado = encodeURIComponent(mensagem)
    return `https://wa.me/${telefoneLoja}?text=${textoCodificado}`
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Loja da Paloma</h1>
        <p>As melhores roupas, escolhidas com carinho.</p>
      </header>

      <main className="vitrine">
        {produtos.map((produto) => (
          <div key={produto.id} className="card-produto">
            <img src={produto.imagem} alt={produto.nome} />
            <div className="info">
              <h3>{produto.nome}</h3>
              <p className="descricao">{produto.descricao}</p>
              <p className="preco">
                {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <a 
                href={gerarLinkZap(produto)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-comprar"
              >
                Comprar no WhatsApp
              </a>
            </div>
          </div>
        ))}
      </main>

      <footer className="footer">
        <p>© 2025 Loja da Paloma - Feito com carinho</p>
      </footer>
    </div>
  )
}

export default App