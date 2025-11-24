// js/main.js
import { fetchMenu, fetchCombos, submitOrder } from "./api.js";

// 1. Estado Global (Carrinho)
let carrinho = [];

// 2. Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initCombos();
  initContactForm();
  initMobileMenu();
  initScrollEffects();

  // Expõe a função para o HTML poder acessar
  window.adicionarAoCarrinho = adicionarAoCarrinho;
  window.toggleCart = toggleCart;
  window.removerItem = removerItem;
  window.finalizarPedido = finalizarPedido;
});

// 3. Lógica do Carrinho
function adicionarAoCarrinho(nome, preco) {
  carrinho.push({ nome, preco });
  // Atualiza a tela
  atualizarCarrinhoUI();
  atualizarBotoesMenu();

  // Abre o carrinho automaticamente para o usuário ver
  //toggleCart(false);
}
function removerItem(index) {
  // Remove o item pelo índice
  carrinho.splice(index, 1);
  atualizarCarrinhoUI();
  atualizarBotoesMenu();
}
function atualizarCarrinhoUI() {
  const container = document.getElementById("cart-items");
  const contador = document.getElementById("cart-count");
  const totalSpan = document.getElementById("cart-total-price");

  // 1. Atualiza bolinha vermelha
  contador.innerText = carrinho.length;

  // 2. Calcula Total
  let total = 0;

  // 3. Desenha a lista
  container.innerHTML = ""; // Limpa antes de redesenhar

  if (carrinho.length === 0) {
    container.innerHTML =
      '<p class="empty-msg" style="text-align:center; color:#777; margin-top:20px;">Seu carrinho está vazio 🍔</p>';
  } else {
    carrinho.forEach((item, index) => {
      total += item.price || item.preco; // Garante compatibilidade de nome

      const itemDiv = document.createElement("div");
      itemDiv.classList.add("cart-item-row");
      itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.nome}</h4>
                    <p>R$ ${item.preco.toFixed(2).replace(".", ",")}</p>
                </div>
                <button class="remove-btn" onclick="removerItem(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
      container.appendChild(itemDiv);
    });
  }

  // 4. Atualiza texto do total
  totalSpan.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

// Abre e fecha a sidebar
function toggleCart(forceOpen = false) {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");

  if (forceOpen) {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  } else {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  }
}

// Botão "Fechar Pedido" dentro do carrinho
function finalizarPedido() {
  if (carrinho.length === 0) {
    alert("Adicione itens antes de fechar o pedido!");
    return;
  }

  // Fecha o carrinho
  toggleCart();
  const navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    // Limpa o estilo inline, fazendo ele voltar a ficar escondido pelo CSS
    navLinks.style = "";
  }

  // Rola a tela suavemente até o formulário
  const formSection = document.getElementById("contact");
  formSection.scrollIntoView({ behavior: "smooth" });

  // Foca no campo nome para incentivar o preenchimento
  setTimeout(() => document.getElementById("name").focus(), 800);
}
// 4. Carregamento do Menu
async function initMenu() {
  const menuGrid = document.getElementById("menu-grid");
  if (!menuGrid) return;

  try {
    const menuItems = await fetchMenu();
    menuGrid.innerHTML = menuItems
      .map((item) => createMenuItemCard(item))
      .join("");

    // AQUI ESTÁ A NOVA LINHA (sem pontinhos depois)
    atualizarBotoesMenu();
  } catch (error) {
    // O bloco catch precisa ser completo assim:
    console.error(error);
    menuGrid.innerHTML =
      '<p class="error">Ops! Não conseguimos carregar o cardápio.</p>';
  }
}

async function initCombos() {
  const combosContainer = document.querySelector("#combos .carousel");
  if (!combosContainer) return;

  try {
    const combos = await fetchCombos();
    combosContainer.innerHTML = combos
      .map((combo) => createComboCard(combo))
      .join("");

    // AQUI ESTÁ A NOVA LINHA
    atualizarBotoesMenu();
  } catch (error) {
    // Bloco catch completo
    console.error(error);
    combosContainer.innerHTML =
      '<p class="error">Ops! Não conseguimos carregar os combos.</p>';
  }
}

// 5. Templates HTML
function createMenuItemCard(item) {
  return `
        <div class="menu-item">
            <img src="${item.image || "assets/burger_classic.png"}" alt="${
    item.name
  }" class="menu-img">
            <div class="menu-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="price">R$ ${item.price
                  .toFixed(2)
                  .replace(".", ",")}</span>
                
                <button class="btn-outline btn-add-item" 
                    data-name="${item.name}"
                    style="margin-top: 1rem; width: 100%" 
                    onclick="window.adicionarAoCarrinho('${item.name}', ${
    item.price
  })">
                    Adicionar
                </button>
            </div>
        </div>
    `;
}

function createComboCard(combo) {
  return `
        <div class="menu-item combo-item">
             <img src="${combo.image || "assets/burger_classic.png"}" alt="${
    combo.name
  }" class="menu-img">
            <div class="menu-info">
                <h3 class="text-gold">${combo.name}</h3>
                <p>${combo.description}</p>
                <span class="price">R$ ${combo.price
                  .toFixed(2)
                  .replace(".", ",")}</span>
                
                <button class="btn-primary btn-add-item" 
                    data-name="${combo.name}"
                    style="margin-top: 1rem; width: 100%" 
                    onclick="window.adicionarAoCarrinho('${combo.name}', ${
    combo.price
  })">
                    Eu Quero!
                </button>
            </div>
        </div>
    `;
}
// Função para atualizar os textos dos botões
function atualizarBotoesMenu() {
  // Pega todos os botões que têm a classe que criamos
  const botoes = document.querySelectorAll(".btn-add-item");

  botoes.forEach((btn) => {
    const nomeItem = btn.getAttribute("data-name");

    // Conta quantas vezes esse nome aparece no carrinho
    // O 'filter' cria um novo array só com esse item, e o 'length' conta
    const quantidade = carrinho.filter((item) => item.nome === nomeItem).length;

    if (quantidade > 0) {
      // Se tiver item, muda o texto e o estilo
      btn.innerHTML = `Adicionado (${quantidade})`;
      btn.style.backgroundColor = "var(--color-gold)";
      btn.style.color = "var(--color-black)";
      btn.style.borderColor = "var(--color-gold)";
    } else {
      // Se não tiver, volta ao original
      // Verifica se é botão de combo (Primary) ou normal (Outline) para restaurar texto certo
      if (btn.classList.contains("btn-primary")) {
        btn.innerText = "Eu Quero!";
        btn.style = "margin-top: 1rem; width: 100%"; // Reseta estilos inline se necessário
      } else {
        btn.innerText = "Adicionar";
        // Reseta as cores para o padrão do CSS (remove o inline que colocamos acima)
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }
    }
  });
}
// 6. Formulário e Envio (AQUI ESTAVA O SEGREDO)
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText; // Guarda o texto original (ícone + texto)

    // Validação de carrinho vazio
    if (carrinho.length === 0) {
      if (
        !confirm("Seu carrinho está vazio. Deseja enviar apenas uma mensagem?")
      ) {
        return;
      }
    }

    submitBtn.innerText = "Abrindo WhatsApp...";
    submitBtn.disabled = true;

    // Prepara resumo
    let resumoTexto = "";
    let total = 0;
    if (carrinho.length > 0) {
      resumoTexto = carrinho
        .map((item) => {
          total += item.preco;
          return `- ${item.nome} (R$ ${item.preco
            .toFixed(2)
            .replace(".", ",")})`;
        })
        .join("\n");
    } else {
      resumoTexto = "Nenhum item selecionado.";
    }

    // --- CAPTURA SEGURA DOS DADOS ---
    // Usamos querySelector para garantir que pegamos o campo certo pelo NAME
    const dadosCompletos = {
      // Pega o valor do input onde name="name"
      name: form.querySelector('input[name="name"]').value,
      phone: form.querySelector('input[name="phone"]').value,

      // --- NOVOS DADOS DE ENDEREÇO ADICIONADOS AQUI ---
      address: form.querySelector('input[name="address"]').value,
      number: form.querySelector('input[name="number"]').value,
      bairro: form.querySelector('input[name="bairro"]').value, // <--- NOVO
      comp: form.querySelector('input[name="comp"]').value, // <--- NOVO
      // ------------------------------------------------

      message: form.querySelector('textarea[name="message"]').value,
      resumoCarrinho: resumoTexto,
      total: total,
    };

    try {
      await submitOrder(dadosCompletos);
      // Sucesso
      carrinho = [];
      form.reset();
    } catch (error) {
      alert("Erro ao processar pedido.");
      console.error(error);
    } finally {
      submitBtn.innerText = "Mensagem Enviada!";
      setTimeout(() => {
        submitBtn.innerHTML = originalText; // Volta o ícone e texto originais
        submitBtn.disabled = false;
      }, 5000);
    }
  });
}

// 7. Funções de UI
function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isActive = navLinks.style.display === "flex";
      navLinks.style.display = isActive ? "none" : "flex";
      if (!isActive) {
        navLinks.style.flexDirection = "column";
        navLinks.style.position = "absolute";
        navLinks.style.top = "80px";
        navLinks.style.left = "0";
        navLinks.style.width = "100%";
        navLinks.style.backgroundColor = "rgba(26, 26, 26, 0.98)";
        navLinks.style.padding = "2rem";
        navLinks.style.zIndex = "1000";
      } else {
        navLinks.style = "";
      }
    });
  }
}

function initScrollEffects() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        const navLinks = document.querySelector(".nav-links");
        if (window.innerWidth <= 768 && navLinks) {
          navLinks.style = "";
        }
      }
    });
  });
}
