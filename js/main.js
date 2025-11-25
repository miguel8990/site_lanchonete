// js/main.js
import { fetchMenu, fetchCombos, submitOrder } from "./api.js";

// 1. Estado Global (Carrinho)
let carrinho = [];
let menuGlobal = []; // Para guardar os dados do cardápio e acessar no modal
let itemEmPersonalizacao = null; // O item que está sendo montado agora

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
  window.alterarQuantidade = alterarQuantidade;
  window.adicionarComQuantidade = adicionarComQuantidade;
});

// 3. Lógica do Carrinho
// 1. Nova função de Adicionar (Agrupa itens iguais)
function adicionarAoCarrinho(nome, preco) {
  // Verifica se já existe um item com esse nome no carrinho
  const itemExistente = carrinho.find((item) => item.nome === nome);

  if (itemExistente) {
    // Se já existe, só aumenta a quantidade
    itemExistente.quantity += 1;
  } else {
    // Se não existe, adiciona com quantidade 1
    carrinho.push({
      nome: nome,
      preco: preco,
      quantity: 1,
    });
  }

  atualizarCarrinhoUI();
  atualizarBotoesMenu();
  animarCarrinho(); // Mantém sua animação
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

  // Limpa o container
  container.innerHTML = "";

  let total = 0;
  let totalItens = 0;

  if (carrinho.length === 0) {
    container.innerHTML =
      '<p class="empty-msg" style="text-align:center; color:#777; margin-top:20px;">Seu carrinho está vazio 🍔</p>';
  } else {
    carrinho.forEach((item) => {
      // Calcula total considerando a quantidade
      total += item.preco * item.quantity;
      totalItens += item.quantity;

      const itemDiv = document.createElement("div");
      itemDiv.classList.add("cart-item-row");
      itemDiv.innerHTML = `
                <div class="cart-item-info" style="flex: 1;">
                    <h4 style="margin:0; color:white;">${item.nome}</h4>
                    <p style="margin:0; color:var(--color-gold); font-size:0.9rem;">
                        R$ ${(item.preco * item.quantity)
                          .toFixed(2)
                          .replace(".", ",")}
                    </p>
                </div>
                
                <div class="cart-qty-controls">
                    <button onclick="alterarQuantidadeCarrinho('${
                      item.nome
                    }', -1)">
                        ${
                          item.quantity === 1
                            ? '<i class="fa-solid fa-trash"></i>'
                            : "-"
                        }
                    </button>
                    
                    <span>${item.quantity}</span>
                    
                    <button onclick="alterarQuantidadeCarrinho('${
                      item.nome
                    }', 1)">+</button>
                </div>
            `;
      container.appendChild(itemDiv);
    });
  }

  // Atualiza totais
  contador.innerText = totalItens;
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
    menuGlobal = menuItems; // SALVA AQUI <---
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
function getSafeId(name) {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}
// 5. Templates HTML
function createMenuItemCard(item) {
  const safeId = getSafeId(item.name);

  return `
        <div class="menu-item">
            <img src="${item.image || "assets/burger_classic.png"}" alt="${
    item.name
  }" class="menu-img" loading="lazy">
            <div class="menu-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="price">R$ ${item.price
                  .toFixed(2)
                  .replace(".", ",")}</span>
                
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="alterarQuantidade('${safeId}', -1)">-</button>
                    <span id="qty-${safeId}" class="qty-display">1</span>
                    <button class="qty-btn" onclick="alterarQuantidade('${safeId}', 1)">+</button>
                </div>

                <button class="btn-outline btn-add-item" 
                  data-name="${item.name}"
                  onclick="verificarOpcoes('${item.id}', '${safeId}')">
                      Adicionar
                </button>
            </div>
        </div>
    `;
}

function createComboCard(combo) {
  const safeId = getSafeId(combo.name);

  return `
        <div class="menu-item combo-item">
             <img src="${combo.image || "assets/burger_classic.png"}" alt="${
    combo.name
  }" class="menu-img" loading="lazy">
            <div class="menu-info">
                <h3 class="text-gold">${combo.name}</h3>
                <p>${combo.description}</p>
                <span class="price">R$ ${combo.price
                  .toFixed(2)
                  .replace(".", ",")}</span>
                
                <div class="quantity-controls">
                    <button class="qty-btn-combo" onclick="alterarQuantidade('${safeId}', -1)">-</button>
                    <span id="qty-${safeId}" class="qty-display">1</span>
                    <button class="qty-btn-combo" onclick="alterarQuantidade('${safeId}', 1)">+</button>
                </div>

                <button class="btn-primary btn-add-item" 
                    data-name="${combo.name}"
                    onclick="adicionarComQuantidade('${combo.name}', ${
    combo.price
  }, '${safeId}')">
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
          // Calcula o subtotal do item (Preço x Quantidade)
          const subtotal = item.preco * item.quantity;

          // Texto: "2x Smash Burger (R$ 40,00)"
          return `${item.quantity}x ${item.nome} (R$ ${subtotal
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

function alterarQuantidade(id, mudanca) {
  const display = document.getElementById(`qty-${id}`);
  let valorAtual = parseInt(display.innerText);

  valorAtual += mudanca;

  // Não deixa baixar de 1
  if (valorAtual < 1) valorAtual = 1;

  display.innerText = valorAtual;
}

// 2. Função que adiciona ao carrinho baseado no número escolhido
function adicionarComQuantidade(nome, preco, id) {
  const display = document.getElementById(`qty-${id}`);
  const quantidadeInput = parseInt(display.innerText);

  const itemExistente = carrinho.find((item) => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantity += quantidadeInput;
  } else {
    carrinho.push({
      nome: nome,
      preco: preco,
      quantity: quantidadeInput,
    });
  }

  atualizarCarrinhoUI();
  atualizarBotoesMenu();
  animarCarrinho();

  display.innerText = "1"; // Reseta o display do menu
}

function animarCarrinho() {
  const btnCarrinho = document.getElementById("cart-btn");

  // Truque para reiniciar a animação se o usuário clicar rápido
  btnCarrinho.classList.remove("cart-bump");
  void btnCarrinho.offsetWidth; // Força o navegador a "recalcular" (magic trick)

  // Adiciona a classe que tem a animação
  btnCarrinho.classList.add("cart-bump");

  // (Opcional) Remove a classe depois que acabar
  setTimeout(() => {
    btnCarrinho.classList.remove("cart-bump");
  }, 1000); // 400ms é o tempo da animação no CSS
}

// 3. NOVA FUNÇÃO: Controla o + e - DENTRO do carrinho
window.alterarQuantidadeCarrinho = function (nome, mudanca) {
  const itemExistente = carrinho.find((item) => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantity += mudanca;

    // Se a quantidade for para 0 ou menos, remove o item
    if (itemExistente.quantity <= 0) {
      // Filtra o array removendo esse item
      carrinho = carrinho.filter((item) => item.nome !== nome);
    }
  }

  atualizarCarrinhoUI();
  atualizarBotoesMenu();
};

// --- SISTEMA DE MODAL DE PERSONALIZAÇÃO ---

window.verificarOpcoes = function (itemId, qtdId) {
  // Acha o produto na lista global pelo ID (converter para número se precisar)
  const produto = menuGlobal.find((p) => p.id == itemId);

  // Pega a quantidade que o usuário marcou no card
  const qtdDisplay = document.getElementById(`qty-${qtdId}`);
  const quantidade = parseInt(qtdDisplay.innerText);

  // Se tiver opções de carnes ou adicionais, ABRE O MODAL
  if (
    (produto.carnes && produto.carnes.length > 0) ||
    (produto.adicionais && produto.adicionais.length > 0)
  ) {
    abrirModal(produto, quantidade);
  } else {
    // Se for lanche simples, manda direto pro carrinho (lógica antiga)
    adicionarComQuantidade(produto.name, produto.price, qtdId);
  }
};

function abrirModal(produto, quantidadeInicial) {
  const modal = document.getElementById("modal-personalizacao");
  itemEmPersonalizacao = {
    ...produto,
    quantidadeNoModal: quantidadeInicial,
    adicionaisSelecionados: [],
    carneSelecionada: null,
    precoTotalAtual: produto.price,
  };

  // Preenche os textos
  document.getElementById("modal-img").src =
    produto.image || "assets/burger_classic.png";
  document.getElementById("modal-title").innerText = produto.name;
  document.getElementById("modal-desc").innerText = produto.description;
  document.getElementById("modal-obs").value = ""; // Limpa obs

  // --- GERA AS CARNES (Radio) ---
  const divCarnes = document.getElementById("lista-carnes");
  divCarnes.innerHTML = "";
  if (produto.carnes && produto.carnes.length > 0) {
    document.getElementById("modal-carnes-section").style.display = "block";
    produto.carnes.forEach((carne, index) => {
      // Seleciona a primeira carne por padrão
      const checked = index === 0 ? "checked" : "";
      if (index === 0) itemEmPersonalizacao.carneSelecionada = carne;

      divCarnes.innerHTML += `
                <label class="option-row">
                    <input type="radio" name="carne" value="${carne}" ${checked} onchange="atualizarSelecaoModal()">
                    <div class="option-info"><span>${carne}</span></div>
                </label>
            `;
    });
  } else {
    document.getElementById("modal-carnes-section").style.display = "none";
  }

  // --- GERA OS ADICIONAIS (Checkbox) ---
  const divAdicionais = document.getElementById("lista-adicionais");
  divAdicionais.innerHTML = "";
  if (produto.adicionais && produto.adicionais.length > 0) {
    document.getElementById("modal-adicionais-section").style.display = "block";
    produto.adicionais.forEach((add, index) => {
      divAdicionais.innerHTML += `
                <label class="option-row">
                    <input type="checkbox" value="${index}" onchange="atualizarSelecaoModal()">
                    <div class="option-info">
                        <span>${add.nome}</span>
                        <span class="option-price">+ R$ ${add.price
                          .toFixed(2)
                          .replace(".", ",")}</span>
                    </div>
                </label>
            `;
    });
  } else {
    document.getElementById("modal-adicionais-section").style.display = "none";
  }

  atualizarPrecoModal();
  modal.classList.add("active");
}

window.fecharModal = function () {
  document.getElementById("modal-personalizacao").classList.remove("active");
};

window.atualizarSelecaoModal = function () {
  // 1. Pega Carne
  const carneInput = document.querySelector('input[name="carne"]:checked');
  if (carneInput) itemEmPersonalizacao.carneSelecionada = carneInput.value;

  // 2. Pega Adicionais
  const checks = document.querySelectorAll("#lista-adicionais input:checked");
  itemEmPersonalizacao.adicionaisSelecionados = []; // Reseta

  checks.forEach((box) => {
    const index = box.value;
    // Busca o objeto original do adicional para pegar nome e preço
    const addObj = itemEmPersonalizacao.adicionais[index];
    itemEmPersonalizacao.adicionaisSelecionados.push(addObj);
  });

  atualizarPrecoModal();
};

function atualizarPrecoModal() {
  let precoBase = itemEmPersonalizacao.price;

  // Soma adicionais
  itemEmPersonalizacao.adicionaisSelecionados.forEach((add) => {
    precoBase += add.price;
  });

  // Atualiza a variável global do item
  itemEmPersonalizacao.precoTotalAtual = precoBase;

  // Atualiza na tela (Multiplicado pela quantidade inicial que ele escolheu no card)
  const totalFinal = precoBase * itemEmPersonalizacao.quantidadeNoModal;
  document.getElementById("modal-total").innerText = `R$ ${totalFinal
    .toFixed(2)
    .replace(".", ",")}`;
}

window.adicionarItemDoModal = function () {
  // Validação (Se carne for obrigatória e não tiver selecionada)
  if (
    itemEmPersonalizacao.carnes &&
    itemEmPersonalizacao.carnes.length > 0 &&
    !itemEmPersonalizacao.carneSelecionada
  ) {
    alert("Por favor, escolha uma carne.");
    return;
  }

  const obs = document.getElementById("modal-obs").value;

  // Constrói o nome composto para o carrinho
  // Ex: "Cegonha Clássico (Bovina) + Bacon + Ovo"
  let nomeFinal = itemEmPersonalizacao.name;
  if (itemEmPersonalizacao.carneSelecionada) {
    nomeFinal += ` (${itemEmPersonalizacao.carneSelecionada})`;
  }

  // Adiciona os extras no nome ou cria uma propriedade separada
  // Vamos criar um "item de carrinho" completo
  const itemParaCarrinho = {
    nome: nomeFinal,
    preco: itemEmPersonalizacao.precoTotalAtual, // Preço unitário já com extras
    obs: obs,
    adicionais: itemEmPersonalizacao.adicionaisSelecionados
      .map((a) => a.nome)
      .join(", "),
  };

  // Adiciona a quantidade selecionada
  for (let i = 0; i < itemEmPersonalizacao.quantidadeNoModal; i++) {
    // Aqui precisamos adaptar sua função adicionarAoCarrinho para aceitar esse objeto customizado
    // Ou simplesmente empurrar direto pro array e chamar a atualização

    // Lógica simplificada para integrar com seu sistema atual:
    // Vamos gerar um nome único para agrupar no carrinho
    let nomeIdentificador = itemParaCarrinho.nome;
    if (itemParaCarrinho.adicionais)
      nomeIdentificador += ` + ${itemParaCarrinho.adicionais}`;
    if (obs) nomeIdentificador += ` [Obs: ${obs}]`;

    adicionarAoCarrinho(nomeIdentificador, itemParaCarrinho.preco);
  }

  fecharModal();

  // Reseta o contador do card lá atrás (opcional, exige achar o ID de novo)
};
