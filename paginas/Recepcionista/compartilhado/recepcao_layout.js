// Partes comuns das telas da recepcao (e do paciente):
// - menu do usuario na barra lateral (com "Sair da conta")
// - aviso rapido (toast) com titulo e texto: RecepcaoUI.toast("Titulo", "Texto")
// Nas telas do paciente (<body data-perfil="paciente">) o menu ganha o item "Minha conta";
// nas do profissional e da recepcao, o item "Meu perfil" (no profissional leva para a tela
// meu_perfil_profissional; na recepcao abre a janela de perfil_recepcao.js).

(function () {
  // enderecos montados a partir deste arquivo: funcionam em telas de qualquer pasta
  var BASE = document.currentScript ? document.currentScript.src : location.href;
  var PAGINA_LOGIN = new URL("../tela_login/fluxconnect_login_enxuto/index.html", BASE).href;
  var PAGINA_CONTA = new URL("../../Paciente/tela_conta_paciente/index.html", BASE).href;
  var PAGINA_PERFIL_PROFISSIONAL = new URL("../meu_perfil_profissional/index.html", BASE).href;
  var PAGINA_PERFIL_ENFERMEIRO = new URL("../meu_perfil_enfermeiro/index.html", BASE).href;

  var estilos = `
    .rui-toast { position: fixed; top: 18px; right: 18px; z-index: 3000; display: flex; gap: 10px; max-width: 340px;
      background: #ecfdf3; border: 1px solid #86efac; color: #166534; border-radius: 8px; padding: 12px 16px;
      box-shadow: 0 10px 30px rgba(15, 25, 35, 0.12); font-family: "Inter", sans-serif; opacity: 0; transform: translateY(-8px);
      pointer-events: none; transition: opacity 0.25s ease, transform 0.25s ease; }
    .rui-toast.visivel { opacity: 1; transform: none; }
    .rui-toast.erro { background: #fdf2f2; border-color: #f8b4b4; color: #991b1b; }
    .rui-toast svg { flex-shrink: 0; margin-top: 1px; }
    .rui-toast-titulo { font-size: 13px; font-weight: 600; margin: 0; }
    .rui-toast-texto { font-size: 12.5px; margin: 2px 0 0; opacity: 0.9; }
    .rui-menu { position: fixed; z-index: 2500; display: none; min-width: 200px; background: #fff; border: 1px solid #e3e8ef;
      border-radius: 10px; box-shadow: 0 12px 30px rgba(15, 25, 35, 0.14); padding: 6px; font-family: "Inter", sans-serif; }
    .rui-menu.aberto { display: block; }
    .rui-menu button { width: 100%; display: flex; align-items: center; gap: 8px; border: none; background: transparent; text-align: left;
      padding: 9px 10px; border-radius: 7px; font-size: 13px; color: #0f1923; cursor: pointer; font-family: inherit; }
    .rui-menu button:hover { background: #f3f5f8; }
    .rui-menu .rui-sair { color: #dc2626; }
    .rui-menu .rui-sair:hover { background: #fdf2f2; }
    .btn-conta-celular { display: none !important; }
    @media (max-width: 900px) { .btn-conta-celular { display: flex !important; } .rui-menu button { padding: 13px 12px; font-size: 15px; } }
  `;

  var toastEl, menuEl, timer;

  function toast(titulo, texto, tipo) {
    toastEl.className = "rui-toast" + (tipo === "erro" ? " erro" : "");
    toastEl.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      (tipo === "erro"
        ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
        : '<circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/>') +
      "</svg><div><p class=\"rui-toast-titulo\"></p><p class=\"rui-toast-texto\"></p></div>";
    toastEl.querySelector(".rui-toast-titulo").textContent = titulo;
    toastEl.querySelector(".rui-toast-texto").textContent = texto || "";
    toastEl.querySelector(".rui-toast-texto").hidden = !texto;
    requestAnimationFrame(function () { toastEl.classList.add("visivel"); });
    clearTimeout(timer);
    timer = setTimeout(function () { toastEl.classList.remove("visivel"); }, 3200);
  }

  function abrirMenu(botao) {
    var r = botao.getBoundingClientRect();
    menuEl.classList.add("aberto");
    var acima = r.top - menuEl.offsetHeight - 6;
    menuEl.style.left = Math.max(8, Math.min(r.left + 8, window.innerWidth - menuEl.offsetWidth - 8)) + "px";
    menuEl.style.top = (acima >= 8 ? acima : r.bottom + 6) + "px";
  }

  function iniciar() {
    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);

    toastEl = document.createElement("div");
    toastEl.className = "rui-toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);

    var ehPaciente = document.body.dataset.perfil === "paciente";
    var temPerfil = !!(window.PerfilProfissional || window.PerfilEnfermeiro || window.PerfilRecepcao);

    menuEl = document.createElement("div");
    menuEl.className = "rui-menu";
    menuEl.innerHTML =
      (ehPaciente || temPerfil
        ? '<button type="button" data-conta>' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
          (temPerfil ? "Meu perfil" : "Minha conta") + "</button>"
        : "") +
      '<button type="button" class="rui-sair" data-sair>' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
      "Sair da conta</button>";
    document.body.appendChild(menuEl);

    // No celular o menu lateral vira barra de abas e o botao do usuario some dela:
    // entra um botao de conta no topo, que abre o mesmo menu ("Meu perfil" / "Sair da conta").
    var iconesTopo = document.querySelector(".icones-topo");
    if (iconesTopo && document.querySelector(".container-user[data-menu-usuario]")) {
      var botaoConta = document.createElement("button");
      botaoConta.type = "button";
      botaoConta.className = "btn-topo btn-conta-celular";
      botaoConta.setAttribute("data-menu-usuario", "");
      botaoConta.setAttribute("aria-label", "Opções da conta");
      botaoConta.title = "Opções da conta";
      botaoConta.innerHTML = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      iconesTopo.appendChild(botaoConta);
    }

    document.querySelectorAll("[data-menu-usuario]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        if (menuEl.classList.contains("aberto")) menuEl.classList.remove("aberto");
        else abrirMenu(b);
      });
    });
    var itemConta = menuEl.querySelector("[data-conta]");
    if (itemConta) itemConta.addEventListener("click", function () {
      menuEl.classList.remove("aberto");
      // paciente e profissional tem uma tela propria; a recepcao edita o perfil numa janela
      if (window.PerfilProfissional) window.location.href = PAGINA_PERFIL_PROFISSIONAL;
      else if (window.PerfilEnfermeiro) window.location.href = PAGINA_PERFIL_ENFERMEIRO;
      else if (window.PerfilRecepcao) PerfilRecepcao.abrir();
      else window.location.href = PAGINA_CONTA;
    });
    menuEl.querySelector("[data-sair]").addEventListener("click", function () {
      ["perfil", "nomeUsuario", "emailUsuario"].forEach(function (k) { sessionStorage.removeItem(k); });
      window.location.href = PAGINA_LOGIN;
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".rui-menu")) menuEl.classList.remove("aberto");
    });
  }

  window.RecepcaoUI = { toast: function (t, x, tipo) { toast(t, x, tipo); } };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
