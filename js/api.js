// js/api.js

// Mock API endpoints

export const fetchMenu = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "BEM-TE-VI",
          description:
            "Pão brioche, burger 180g, queijo cheddar, alface, tomate e maionese da casa.",
          price: 28.9,
          image: "assets/bem-te-vi-img.jpg",
        },
        {
          id: 2,
          name: "Bacon Supremo",
          description:
            "Pão australiano, burger 180g, muito bacon crocante, cheddar inglês e cebola caramelizada.",
          price: 34.9,
          image: "assets/burger_bacon.png",
        },
        {
          id: 3,
          name: "Frango Crocante",
          description:
            "Pão de gergelim, sobrecoxa desossada empanada, cream cheese, alface americana e picles.",
          price: 26.5,
          image: "assets/burger_chicken.png",
        },
        {
          id: 4,
          name: "Veggie Power",
          description:
            "Pão integral, burger de grão de bico, cogumelos salteados, rúcula e tomate seco.",
          price: 30.0,
          image: "assets/burger_veggie.png",
        },
      ]);
    }, 800); // Simulate network delay
  });
};

export const fetchCombos = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 101,
          name: "Combo Casal",
          description:
            "2 Cegonha Clássicos + 2 Batatas Fritas + 2 Refrigerantes.",
          price: 85.0,
          image: "assets/burger_classic.png",
        },
        {
          id: 102,
          name: "Combo Família",
          description: "4 Burgers (à escolha) + 4 Batatas + 1 Refrigerante 2L.",
          price: 140.0,
          image: "assets/burger_classic.png",
        },
      ]);
    }, 1000);
  });
};

// --- NOVA LÓGICA DE ENVIO ---
export async function submitOrder(data) {
  // Configurações
  const telefoneRestaurante = "5534984057228"; // SUBSTITUA PELO SEU NÚMERO

  // Formata a mensagem para o WhatsApp
  // Usamos \n para quebra de linha visual, o encodeURIComponent tratará isso para a URL
  const texto =
    `*NOVO PEDIDO - SITE*\n\n` +
    `👤 *Nome:* ${data.name}\n` +
    `📱 *WhatsApp:* ${data.phone}\n` +
    `📍 *Endereço:* ${data.address}\n` +
    `🔢 *Número:* ${data.number}\n` +
    `----------------------------------\n` +
    `🛒 *PEDIDO:*\n${data.resumoCarrinho}\n` +
    `----------------------------------\n` +
    `💰 *TOTAL ESTIMADO:* R$ ${data.total.toFixed(2)}\n\n` +
    `📝 *Observações:* ${data.message}`;

  // Codifica o texto para URL (transforma espaços e quebras de linha em códigos)
  const textoCodificado = encodeURIComponent(texto);
  // 1. Detecta se é Celular (Android, iPhone, etc)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  let linkWhatsApp;

  if (isMobile) {
    // No celular, usamos a API padrão que abre o App
    linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefoneRestaurante}&text=${textoCodificado}`;
  } else {
    // No computador, forçamos o WEB.WHATSAPP.COM
    // Isso evita o bug do aplicativo de Windows que perde o texto
    linkWhatsApp = `https://web.whatsapp.com/send?phone=${telefoneRestaurante}&text=${textoCodificado}`;
  }

  window.open(linkWhatsApp, "_blank");

  return { success: true };
}
