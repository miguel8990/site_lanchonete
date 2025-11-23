// js/api.js

// Mock API endpoints

export const fetchMenu = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "FALCÃO",
          description:
            "Pão, presunto, mussarela, ovo, requeijão, bacon, milho, alface, tomate.",
          price: 30.0,
          image: "assets/falcao.png",
        },
        {
          id: 2,
          name: "ÁGUIA",
          description:
            "Pão, Hambúrguer da casa, duas fatias de presunto, Mussarela, ovo, Bacon, Cenoura, Milho, Alface, Tomate.",
          price: 35.0,
          image: "assets/aguia.png",
        },
        {
          id: 3,
          name: "CALOPSITA",
          description:
            "Pão, hambúrguer, presunto, mussarela, ovo, salsicha, bacon, creme de leite, milho, alface, tomate.",
          price: 30.0,
          image: "assets/calopsita.png",
        },
        {
          id: 4,
          name: "CANÁRIO",
          description:
            "Pão, hambúrguer, presunto, mussarela, 2 ovos, bacon, requeijão, milho, alface, tomate.",
          price: 30.0,
          image: "assets/canario.png",
        },
        {
          id: 5,
          name: "CEGONHA-TURBO",
          description:
            "Pão, hambúrguer, presunto, mussarela, ovo, requeijão, bacon, lombo, frango, filé, salsicha, milho, tomate, alface.",
          price: 45.0,
          image: "assets/cegonha-turbo.png",
        },
        {
          id: 6,
          name: "BEM-TE-VI",
          description:
            "Pão, hambúrguer, presunto, mussarela, ovo, bacon, milho, alface, tomate.",
          price: 25.0,
          image: "assets/bem-te-vi.png",
        },
        {
          id: 7,
          name: "BEIJA-FLOR",
          description:
            "Pão, hambúrguer, presunto, mussarela, ovo, requeijão, cenoura, milho, ervilha, alface, tomate.",
          price: 26.0,
          image: "assets/beija-flor.png",
        },
        {
          id: 8,
          name: "BEM-TE-VI-ARTESANAL",
          description:
            "Pão, hambúrguer da casa, presunto, mussarela, ovo, bacon, cenoura, milho, alface, tomate.",
          price: 30.0,
          image: "assets/bem-te-vi-artesanal.png",
        },
        {
          id: 9,
          name: "VEGETARIANO",
          description:
            "Pão, 2 mussarelas, ovo, requeijão, cenoura, milho, alface, tomate, batata palha.",
          price: 18.0,
          image: "assets/vegetariano.png",
        },
        {
          id: 10,
          name: "CEGONHA-KIDS",
          description:
            "Pão, hambúrguer, 2 fatias de presunto, mussarela, ovo, bacon, cheddar, milho, alface, tomate, batata palha.",
          price: 20.0,
          image: "assets/kids.png",
        },
        {
          id: 11,
          name: "X-CAIPIRA",
          description:
            "Pão, hambúrguer de linguiça suína, presunto, mussarela, ovo, bacon, cenoura, milho, alface, tomate.",
          price: 30.0,
          image: "assets/no-image.png",
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
          name: "COMBO CALOPSITA + BATATA FRITA",
          description:
            "Pão, Hambúrguer, Presunto, Ovo, Salsicha, Bacon, Creme de Leite, Alface, Tomate, Milho, Batata Palha + 250G de Batata Frita",
          price: 45.0,
          image: "assets/combo-calopsita-fritas.jpg",
        },
        {
          id: 102,
          name: "COMBO-ESPECIAL",
          description:
            "3 BEM-TE-VI: Pão, hambúrguer, presunto, mussarela, ovo, bacon, milho, alface, tomate + 1 Cotuba 2 ",
          price: 80.0,
          image: "assets/combo-especial.png",
        },
      ]);
    }, 1000);
  });
};

// --- NOVA LÓGICA DE ENVIO ---
export async function submitOrder(data) {
  // Configurações
  const telefoneRestaurante = "553434998978760"; // SUBSTITUA PELO SEU NÚMERO

  // Formata a mensagem para o WhatsApp
  // Usamos \n para quebra de linha visual, o encodeURIComponent tratará isso para a URL
  // No js/api.js

  const texto =
    `*NOVO PEDIDO - SITE*\n\n` +
    `👤 *Nome:* ${data.name}\n` +
    `📱 *WhatsApp:* ${data.phone}\n\n` +
    `🛵 *DADOS DE ENTREGA:*\n` +
    `📍 *Endereço:* ${data.address}, ${data.number}\n` +
    `🏘️ *Bairro:* ${data.bairro}\n` + // <--- ADICIONE ISSO
    `📌 *Complemento:* ${data.comp}\n` + // <--- ADICIONE ISSO
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
