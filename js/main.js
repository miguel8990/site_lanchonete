// js/main.js
import { fetchMenu, fetchCombos, submitOrder } from "./api.js";

// 1. Estado Global
let carrinho = [];
let menuGlobal = [];
let itemEmPersonalizacao = null;

// 2. Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initCombos();
  initContactForm();
  initMobileMenu();
  initScrollEffects();

  // Fecha o modal se clicar no fundo escuro
  const modalOverlay = document.getElementById("modal-personalizacao");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        fecharModal();
      }
    });
  }
});

// --- EXPOSIÇÃO DE FUNÇÕES GLOBAIS ---
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.toggleCart = toggleCart;
window.removerItem = removerItem;
window.finalizarPedido = finalizarPedido;
window.alterarQuantidade = alterarQuantidade;
window.adicionarComQuantidade = adicionarComQuantidade;
window.alterarQuantidadeCarrinho = alterarQuantidadeCarrinho;
window.verificarOpcoes = verificarOpcoes;
window.fecharModal = fecharModal;
window.adicionarItemDoModal = adicionarItemDoModal;
window.atualizarSelecaoModal = atualizarSelecaoModal;

// 3. Lógica do Carrinho
function adicionarAoCarrinho(nome, preco) {
  const itemExistente = carrinho.find((item) => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantity += 1;
  } else {
    carrinho.push({ nome: nome, preco: preco, quantity: 1 });
  }

  atualizarCarrinhoUI();
  atualizarBotoesMenu();
  animarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinhoUI();
  atualizarBotoesMenu();
}

function atualizarCarrinhoUI() {
  const container = document.getElementById("cart-items");
  const contador = document.getElementById("cart-count");
  const totalSpan = document.getElementById("cart-total-price");

  container.innerHTML = "";
  let total = 0;
  let totalItens = 0;

  if (carrinho.length === 0) {
    container.innerHTML =
      '<p class="empty-msg" style="text-align:center; color:#777; margin-top:20px;">Seu carrinho está vazio 🍔</p>';
  } else {
    carrinho.forEach((item, index) => {
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

  contador.innerText = totalItens;
  totalSpan.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

function toggleCart(forceOpen = false) {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");
  if (!sidebar || !overlay) return;

  if (forceOpen) {
    sidebar.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  } else {
    const isClosing = sidebar.classList.contains("open");
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");

    if (isClosing) document.body.style.overflow = "";
  }
}

function finalizarPedido() {
  if (carrinho.length === 0) {
    alert("Adicione itens antes de fechar o pedido!");
    return;
  }
  toggleCart();

  const navLinks = document.querySelector(".nav-links");
  if (navLinks) navLinks.style.display = "";

  const formSection = document.getElementById("contact");
  if (formSection) {
    formSection.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      const nameInput = document.getElementById("name");
      if (nameInput) nameInput.focus();
    }, 800);
  }
}

// 4. Carregamento do Menu
async function initMenu() {
  const menuGrid = document.getElementById("menu-grid");
  if (!menuGrid) return;

  try {
    const menuItems = await fetchMenu();
    menuItems.forEach((item) => {
      if (!menuGlobal.some((existing) => existing.id === item.id)) {
        menuGlobal.push(item);
      }
    });

    menuGrid.innerHTML = menuItems
      .map((item) => createMenuItemCard(item))
      .join("");
    atualizarBotoesMenu();
  } catch (error) {
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
    combos.forEach((combo) => {
      if (!menuGlobal.some((existing) => existing.id === combo.id)) {
        menuGlobal.push(combo);
      }
    });
    combosContainer.innerHTML = combos
      .map((combo) => createComboCard(combo))
      .join("");
    atualizarBotoesMenu();
  } catch (error) {
    console.error(error);
    combosContainer.innerHTML = '<p class="error">Ops! Erro nos combos.</p>';
  }
}

// Menu Mobile
function initMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links li a");

  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    if (navLinks.style.display === "flex") {
      navLinks.style.display = "none";
    } else {
      navLinks.style.display = "flex";
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        navLinks.style.display = "none";
      }
    });
  });
}

function getSafeId(name) {
  return name.replace(/[^a-zA-Z0-9]/g, "_");
}

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
                    onclick="verificarOpcoes('${combo.id}', '${safeId}')">
                    Eu Quero!
                </button>
            </div>
        </div>
    `;
}

function atualizarBotoesMenu() {
  const botoes = document.querySelectorAll(".btn-add-item");
  botoes.forEach((btn) => {
    const nomeItem = btn.getAttribute("data-name");
    const itemNoCarrinho = carrinho.find((i) => i.nome === nomeItem);

    if (itemNoCarrinho) {
      btn.innerHTML = `Adicionado (${itemNoCarrinho.quantity})`;
      btn.style.backgroundColor = "var(--color-gold)";
      btn.style.color = "var(--color-black)";
      btn.style.borderColor = "var(--color-gold)";
    } else {
      if (btn.classList.contains("btn-primary")) {
        btn.innerText = "Eu Quero!";
        btn.style = "";
      } else {
        btn.innerText = "Adicionar";
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.style.borderColor = "";
      }
    }
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const phoneInput = form.querySelector('input[name="phone"]');

  phoneInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 2)
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    if (value.length > 7)
      value = `${value.substring(0, 10)}-${value.substring(10)}`;
    e.target.value = value;
    e.target.classList.remove("input-error");
  });

  const inputs = form.querySelectorAll("input, textarea");
  inputs.forEach((input) => {
    input.addEventListener("input", () =>
      input.classList.remove("input-error")
    );
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let temErro = false;
    const nameInput = form.querySelector('input[name="name"]');
    if (nameInput.value.trim().length < 3) {
      marcarErro(nameInput);
      alert("Por favor, digite seu nome completo.");
      temErro = true;
    }

    const rawPhone = phoneInput.value.replace(/\D/g, "");
    if (rawPhone.length < 10 || rawPhone.length > 11) {
      marcarErro(phoneInput);
      if (!temErro) alert("O telefone parece incompleto.");
      temErro = true;
    }

    const numberInput = form.querySelector('input[name="number"]');

    if (!numberInput.value.trim()) {
      marcarErro(numberInput);
      if (!temErro) alert("Por favor, preencha o número do endereço.");
      temErro = true;
    }

    if (temErro) return;

    if (carrinho.length === 0) {
      if (
        !confirm("Seu carrinho está vazio. Deseja enviar apenas uma mensagem?")
      )
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Processando...";
    submitBtn.disabled = true;

    let total = carrinho.reduce(
      (acc, item) => acc + item.preco * item.quantity,
      0
    );

    let resumoTexto = "";
    if (carrinho.length > 0) {
      resumoTexto = carrinho
        .map((item) => {
          const subtotal = item.preco * item.quantity;
          return `${item.quantity}x ${item.nome} (R$ ${subtotal
            .toFixed(2)
            .replace(".", ",")})`;
        })
        .join("\n");
    } else {
      resumoTexto = "Nenhum item selecionado (Apenas Contato).";
    }

    const dadosCompletos = {
      name: nameInput.value,
      phone: phoneInput.value,
      address: form.querySelector('input[name="address"]').value,
      number: numberInput.value,
      bairro: form.querySelector('input[name="bairro"]').value,
      comp: form.querySelector('input[name="comp"]').value,
      message: form.querySelector('textarea[name="message"]').value,
      resumoCarrinho: resumoTexto,
      total: total,
    };

    try {
      await submitOrder(dadosCompletos);
      carrinho = [];
      atualizarCarrinhoUI();
      atualizarBotoesMenu();
      form.reset();
    } catch (error) {
      alert("Erro ao abrir o WhatsApp. Tente novamente.");
      console.error(error);
    } finally {
      submitBtn.innerText = "Mensagem Enviada!";
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 3000);
    }
  });
}

function marcarErro(input) {
  input.classList.add("input-error");
  input.focus();
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
          navLinks.style.display = "none";
        }
      }
    });
  });
}

function alterarQuantidade(id, mudanca) {
  const display = document.getElementById(`qty-${id}`);
  if (!display) return;
  let valorAtual = parseInt(display.innerText);
  valorAtual += mudanca;
  if (valorAtual < 1) valorAtual = 1;
  display.innerText = valorAtual;
}

function adicionarComQuantidade(nome, preco, id) {
  const display = document.getElementById(`qty-${id}`);
  const quantidadeInput = parseInt(display.innerText);

  const itemExistente = carrinho.find((item) => item.nome === nome);
  if (itemExistente) {
    itemExistente.quantity += quantidadeInput;
  } else {
    carrinho.push({ nome: nome, preco: preco, quantity: quantidadeInput });
  }

  atualizarCarrinhoUI();
  atualizarBotoesMenu();
  animarCarrinho();
  display.innerText = "1";
}

function animarCarrinho() {
  const btnCarrinho = document.getElementById("cart-btn");
  if (!btnCarrinho) return;
  btnCarrinho.classList.remove("cart-bump");
  void btnCarrinho.offsetWidth;
  btnCarrinho.classList.add("cart-bump");
  setTimeout(() => {
    btnCarrinho.classList.remove("cart-bump");
  }, 1000);
}

function alterarQuantidadeCarrinho(nome, mudanca) {
  const itemExistente = carrinho.find((item) => item.nome === nome);
  if (itemExistente) {
    itemExistente.quantity += mudanca;
    if (itemExistente.quantity <= 0) {
      carrinho = carrinho.filter((item) => item.nome !== nome);
    }
  }
  atualizarCarrinhoUI();
  atualizarBotoesMenu();
}

// --- SISTEMA DE MODAL ---
function verificarOpcoes(itemId, qtdId) {
  if (!menuGlobal || menuGlobal.length === 0) {
    console.error("Menu ainda não carregou ou está vazio");
    return;
  }
  const produto = menuGlobal.find((p) => p.id == itemId);
  if (!produto) return;

  const qtdDisplay = document.getElementById(`qty-${qtdId}`);
  const quantidade = parseInt(qtdDisplay.innerText);

  if (
    (produto.carnes && produto.carnes.length > 0) ||
    (produto.adicionais && produto.adicionais.length > 0) ||
    (produto.acompanhamentos && produto.acompanhamentos.length > 0)
  ) {
    // CORRETO: Passa o ID do card para resetar depois
    abrirModal(produto, quantidade, qtdId);
  } else {
    adicionarComQuantidade(produto.name, produto.price, qtdId);
  }
}

// CORREÇÃO FEITA AQUI: Adicionado 'qtdIdCard' nos parâmetros
function abrirModal(produto, quantidadeInicial, qtdIdCard) {
  const modal = document.getElementById("modal-personalizacao");
  if (!modal) return;

  document.body.style.overflow = "hidden";

  itemEmPersonalizacao = {
    ...produto,
    quantidadeNoModal: quantidadeInicial,
    qtdIdCard: qtdIdCard, // Agora essa variável existe!
    adicionaisSelecionados: [],
    acompanhamentosSelecionados: [],
    carneSelecionada: null,
    precoTotalAtual: produto.price,
  };

  document.getElementById("modal-img").src =
    produto.image || "assets/burger_classic.png";
  document.getElementById("modal-title").innerText = produto.name;
  document.getElementById("modal-desc").innerText = produto.description;
  document.getElementById("modal-obs").value = "";

  const divCarnes = document.getElementById("lista-carnes");
  divCarnes.innerHTML = "";
  const sectionCarnes = document.getElementById("modal-carnes-section");

  if (produto.carnes && produto.carnes.length > 0) {
    sectionCarnes.style.display = "block";
    produto.carnes.forEach((carneObj, index) => {
      const checked = index === 0 ? "checked" : "";
      if (index === 0) itemEmPersonalizacao.carneSelecionada = carneObj;

      const textoPreco =
        carneObj.price > 0
          ? `<span class="option-price">+ R$ ${carneObj.price
              .toFixed(2)
              .replace(".", ",")}</span>`
          : "";

      divCarnes.innerHTML += `
                <label class="option-row">
                    <input type="radio" name="carne" value="${index}" ${checked} onchange="atualizarSelecaoModal()">
                    <div class="option-info">
                        <span>${carneObj.nome}</span>
                        ${textoPreco}
                    </div>
                </label>
            `;
    });
  } else {
    sectionCarnes.style.display = "none";
  }

  gerarListaCheckbox(
    produto.adicionais,
    "lista-adicionais",
    "modal-adicionais-section",
    "add"
  );
  gerarListaCheckbox(
    produto.acompanhamentos,
    "lista-acompanhamentos",
    "modal-acompanhamentos-section",
    "acomp"
  );

  atualizarPrecoModal();
  modal.classList.add("active");
}

function gerarListaCheckbox(lista, divId, sectionId, tipo) {
  const div = document.getElementById(divId);
  const section = document.getElementById(sectionId);
  div.innerHTML = "";

  if (lista && lista.length > 0) {
    section.style.display = "block";
    lista.forEach((item, index) => {
      div.innerHTML += `
                <label class="option-row">
                    <input type="checkbox" data-type="${tipo}" value="${index}" onchange="atualizarSelecaoModal()">
                    <div class="option-info">
                        <span>${item.nome}</span>
                        <span class="option-price">+ R$ ${item.price
                          .toFixed(2)
                          .replace(".", ",")}</span>
                    </div>
                </label>
            `;
    });
  } else {
    section.style.display = "none";
  }
}

function atualizarSelecaoModal() {
  const carneIndex = document.querySelector('input[name="carne"]:checked');
  if (carneIndex) {
    itemEmPersonalizacao.carneSelecionada =
      itemEmPersonalizacao.carnes[carneIndex.value];
  }

  const checksAdd = document.querySelectorAll('input[data-type="add"]:checked');
  itemEmPersonalizacao.adicionaisSelecionados = [];
  checksAdd.forEach((box) => {
    itemEmPersonalizacao.adicionaisSelecionados.push(
      itemEmPersonalizacao.adicionais[box.value]
    );
  });

  const checksAcomp = document.querySelectorAll(
    'input[data-type="acomp"]:checked'
  );
  itemEmPersonalizacao.acompanhamentosSelecionados = [];
  checksAcomp.forEach((box) => {
    itemEmPersonalizacao.acompanhamentosSelecionados.push(
      itemEmPersonalizacao.acompanhamentos[box.value]
    );
  });

  atualizarPrecoModal();
}

function atualizarPrecoModal() {
  let precoBase = itemEmPersonalizacao.price;
  if (itemEmPersonalizacao.carneSelecionada) {
    precoBase += itemEmPersonalizacao.carneSelecionada.price;
  }
  itemEmPersonalizacao.adicionaisSelecionados.forEach(
    (add) => (precoBase += add.price)
  );
  itemEmPersonalizacao.acompanhamentosSelecionados.forEach(
    (acomp) => (precoBase += acomp.price)
  );

  itemEmPersonalizacao.precoTotalAtual = precoBase;
  const totalFinal = precoBase * itemEmPersonalizacao.quantidadeNoModal;

  const modalTotal = document.getElementById("modal-total");
  if (modalTotal)
    modalTotal.innerText = `R$ ${totalFinal.toFixed(2).replace(".", ",")}`;
}

function fecharModal() {
  const modal = document.getElementById("modal-personalizacao");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";

    const obs = document.getElementById("modal-obs");
    if (obs) obs.value = "";
  }
}

function adicionarItemDoModal() {
  if (!itemEmPersonalizacao) return;

  if (
    itemEmPersonalizacao.carnes &&
    itemEmPersonalizacao.carnes.length > 0 &&
    !itemEmPersonalizacao.carneSelecionada
  ) {
    alert("Por favor, escolha uma carne.");
    return;
  }

  const obsElem = document.getElementById("modal-obs");
  const obs = obsElem ? obsElem.value : "";

  let nomeFinal = itemEmPersonalizacao.name;
  if (itemEmPersonalizacao.carneSelecionada) {
    const nomeCarne =
      itemEmPersonalizacao.carneSelecionada.nome ||
      itemEmPersonalizacao.carneSelecionada;
    nomeFinal += ` (${nomeCarne})`;
  }

  const todosExtras = [
    ...itemEmPersonalizacao.adicionaisSelecionados,
    ...itemEmPersonalizacao.acompanhamentosSelecionados,
  ]
    .map((i) => i.nome)
    .join(", ");

  let nomeIdentificador = nomeFinal;
  if (todosExtras) nomeIdentificador += ` + ${todosExtras}`;
  if (obs) nomeIdentificador += ` [Obs: ${obs}]`;

  for (let i = 0; i < itemEmPersonalizacao.quantidadeNoModal; i++) {
    adicionarAoCarrinho(
      nomeIdentificador,
      itemEmPersonalizacao.precoTotalAtual
    );
  }

  // --- Resetar o contador visual do cardápio ---
  if (itemEmPersonalizacao.qtdIdCard) {
    const displayCard = document.getElementById(
      `qty-${itemEmPersonalizacao.qtdIdCard}`
    );
    if (displayCard) {
      displayCard.innerText = "1";
    }
  }

  fecharModal();
  animarCarrinho();
}
