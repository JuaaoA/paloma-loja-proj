import { Sparkles, Layers, Tag } from "lucide-react";

// --- 1. MOCK DATA ATUALIZADO (Múltiplas imagens) ---
export const PRODUCTS = [
  { 
    id: 1, 
    name: "Vestido Midi Envelope", 
    price: 249.90,
    oldPrice: 299.90,
    onSale: true,
    // Agora usamos um array de imagens
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80", // Foto extra ex
    ],
    description: "Um vestido elegante perfeito para ocasiões noturnas. Tecido leve que se adapta ao corpo.",
    category: "Vestidos",
    colors: ["#001f5b", "#d4af37"],
    sizes: ["P", "G", "GG"],
    featured: true,
    stock: 5 
  },
  { 
    id: 2, 
    name: "Conjunto Alfaiataria Blazer", 
    price: 399.90, 
    oldPrice: 399.90,
    onSale: false,
    images: [
      "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800&q=80",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80"
    ],
    description: "Conjunto moderno para o ambiente de trabalho. Conforto e sofisticação em uma única peça.",
    category: "Conjuntos",
    colors: ["#f5f5dc", "#000000"],
    sizes: ["G", "GG"],
    featured: true,
    stock: 2
  },
  { 
    id: 3, 
    name: "Blusa de Seda Fluida", 
    price: 129.00,
    oldPrice: 169.90,
    onSale: true,
    images: [
      "https://sp-ao.shortpixel.ai/client/to_auto,q_glossy,ret_img,w_74,h_100/https://corporeum.com.br/wp-content/uploads/2019/11/106.jpg"
    ],
    description: "Seda pura com toque macio. Ideal para o verão brasileiro.",
    category: "Blusas",
    colors: ["#ffffff", "#ffb6c1"],
    sizes: ["P", "M", "G"],
    featured: false,
    stock: 10
  },
  { 
    id: 4, 
    name: "Calça Pantalona Cintura Alta", 
    price: 189.90,
    oldPrice: 259.90,
    onSale: true,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80"
    ],
    description: "A calça queridinha do momento. Cintura alta que valoriza a silhueta.",
    category: "Calças",
    colors: ["#001f5b"],
    sizes: ["P", "M", "G", "GG"],
    featured: false,
    stock: 8
  },
  { 
    id: 5, 
    name: "Saia Plissada Midi", 
    price: 159.90,
    oldPrice: 199.90,
    onSale: true,
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80"
    ],
    description: "Movimento e leveza. Combina com tênis ou salto alto.",
    category: "Saias",
    colors: ["#c0c0c0", "#001f5b"],
    sizes: ["P", "M"],
    featured: true,
    stock: 0 // Sem estoque teste
  },
  { 
    id: 6, 
    name: "Macacão Longo Decote V", 
    price: 279.00,
    oldPrice: 279.90,
    onSale: false,
    images: [
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600&q=80"
    ],
    description: "Peça única poderosa. Decote V que alonga e traz sensualidade na medida certa.",
    category: "Macacões",
    colors: ["#000000"],
    sizes: ["P", "GG"],
    featured: false,
    stock: 3
  },
  { 
    id: 7, 
    name: "Macacão Longo Decote V 2", 
    price: 279.00,
    oldPrice: 279.90,
    onSale: false,
    images: [
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600&q=80"
    ],
    description: "Peça única poderosa. Decote V.",
    category: "Macacões",
    colors: ["#000000"],
    sizes: ["P", "GG"],
    featured: false,
    stock: 3
  },
  { 
    id: 8, 
    name: "Macacão Longo Decote V 3", 
    price: 279.00,
    oldPrice: 279.90,
    onSale: false,
    images: [
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=600&q=80"
    ],
    description: "Peça única poderosa. Decote V que alonga e traz sensualidade na medida certa.",
    category: "Macacões",
    colors: ["#000000"],
    sizes: ["P", "GG"],
    featured: false,
    stock: 3
  },
];

export const categories = [
  {
    id: 1,
    title: "Vestidos",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80",
    link: "/catalogo?category=Vestidos",
    icon: <Sparkles size={20} color="white" />
  },
  {
    id: 2,
    title: "Conjuntos",
    image: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=500&q=80",
    link: "/catalogo?category=Conjuntos",
    icon: <Layers size={20} color="white" />
  },
  {
    id: 3,
    title: "Ofertas Especiais", // Promoção
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80",
    link: "/catalogo?sale=true", // Link especial
    icon: <Tag size={20} color="white" />,
    isPromo: true
  }
];