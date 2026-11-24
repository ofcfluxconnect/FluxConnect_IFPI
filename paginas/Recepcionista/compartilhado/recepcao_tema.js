// Preferencias de aparencia das telas da recepcao, guardadas no navegador:
// - tema claro/escuro  -> <html data-tema="escuro">      (cores em recepcao_tema_escuro.css)
// - menu lateral aberto/recolhido -> <html data-menu="recolhido">
// Este arquivo e carregado no <head>, antes do CSS, para a tela ja abrir do jeito escolhido
// (sem piscar no tema claro).

(function () {
  var CHAVE_TEMA = "fluxconnect_recepcao_tema";
  var CHAVE_MENU = "fluxconnect_recepcao_menu";
  var raiz = document.documentElement;

  function ler(chave) {
    try { return localStorage.getItem(chave); } catch (e) { return null; }
  }

  function gravar(chave, valor) {
    try { localStorage.setItem(chave, valor); } catch (e) {}
  }

  // aplica logo ao carregar
  if (ler(CHAVE_TEMA) === "escuro") raiz.dataset.tema = "escuro";
  if (ler(CHAVE_MENU) === "recolhido") raiz.dataset.menu = "recolhido";

  function temaEscuro() {
    return raiz.dataset.tema === "escuro";
  }

  function atualizarBotoesTema() {
    var texto = temaEscuro() ? "Usar tema claro" : "Usar tema escuro";
    document.querySelectorAll("[data-alternar-tema]").forEach(function (b) {
      b.title = texto;
      b.setAttribute("aria-label", texto);
      b.setAttribute("aria-pressed", temaEscuro());
    });
  }

  function alternarTema() {
    if (temaEscuro()) delete raiz.dataset.tema;
    else raiz.dataset.tema = "escuro";
    gravar(CHAVE_TEMA, temaEscuro() ? "escuro" : "claro");
    atualizarBotoesTema();
  }

  function menuRecolhido() {
    return raiz.dataset.menu === "recolhido";
  }

  function atualizarBotaoMenu() {
    var b = document.querySelector(".btn-recolher");
    if (!b) return;
    var texto = menuRecolhido() ? "Expandir menu" : "Recolher menu";
    b.title = texto;
    b.setAttribute("aria-label", texto);
    b.setAttribute("aria-expanded", !menuRecolhido());
  }

  function alternarMenu() {
    if (menuRecolhido()) delete raiz.dataset.menu;
    else raiz.dataset.menu = "recolhido";
    gravar(CHAVE_MENU, menuRecolhido() ? "recolhido" : "aberto");
    atualizarBotaoMenu();
  }

  document.addEventListener("DOMContentLoaded", function () {
    // botao de tema (fica no topo de cada tela)
    document.querySelectorAll("[data-alternar-tema]").forEach(function (b) {
      b.addEventListener("click", alternarTema);
    });
    atualizarBotoesTema();

    // botao que recolhe/expande o menu lateral
    var sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      var botao = document.createElement("button");
      botao.type = "button";
      botao.className = "btn-recolher";
      botao.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      botao.addEventListener("click", alternarMenu);
      sidebar.appendChild(botao);
      atualizarBotaoMenu();

      // com o menu recolhido so aparecem os icones: o nome vira dica ao passar o mouse
      sidebar.querySelectorAll(".nav-links a").forEach(function (a) {
        if (!a.title) a.title = a.textContent.trim();
      });
    }
  });

  // Navegacao mais rapida: ao passar o mouse ou focar um item do menu lateral, o navegador
  // ja comeca a baixar a proxima tela. Quando o clique chega, ela esta pronta (ou quase).
  var adiantados = {};
  function adiantar(ev) {
    var link = ev.target.closest ? ev.target.closest(".nav-links a[href]") : null;
    if (!link || link.classList.contains("link-ativo") || adiantados[link.href]) return;
    adiantados[link.href] = true;
    var dica = document.createElement("link");
    dica.rel = "prefetch";
    dica.href = link.href;
    document.head.appendChild(dica);
  }
  document.addEventListener("mouseover", adiantar, { passive: true });
  document.addEventListener("focusin", adiantar);
  document.addEventListener("touchstart", adiantar, { passive: true });

  // impressao sempre no tema claro (economiza tinta e fica legivel no papel)
  var temaAntesDeImprimir = null;
  window.addEventListener("beforeprint", function () {
    temaAntesDeImprimir = raiz.dataset.tema || "";
    delete raiz.dataset.tema;
  });
  window.addEventListener("afterprint", function () {
    if (temaAntesDeImprimir) raiz.dataset.tema = temaAntesDeImprimir;
    temaAntesDeImprimir = null;
  });

  window.RecepcaoTema = { alternar: alternarTema, escuro: temaEscuro, alternarMenu: alternarMenu };
})();
