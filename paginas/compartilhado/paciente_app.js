// Portal do paciente funcionando como app (celular e tablet).
// Incluir em todas as telas do paciente (junto com paciente_app.css). Ele:
//   - cria a barra de navegacao embaixo (aparece ate 1024px, no lugar do menu lateral)
//   - mostra um aviso quando o aparelho fica sem internet
//   - registra o service worker (paginas/sw.js): app instalavel e abrindo sem internet
// A barra de baixo so aparece nas telas que tem menu lateral (.sidebar);
// os fluxos de agendar/reagendar tem o proprio "Voltar".

(function () {
  var script = document.currentScript;
  // pasta "paginas/" (o script fica em paginas/compartilhado/)
  var RAIZ = script ? script.src.replace(/compartilhado\/paciente_app\.js.*$/, "") : "../";

  var ICONES = {
    inicio: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    consultas: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    exames: '<path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>',
    historico: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    conta: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
  };

  // chave, texto, pasta da tela
  var MENU = [
    ["inicio", "Início", "Paciente/tela_principal_paciente"],
    ["consultas", "Consultas", "Paciente/Consultas"],
    ["exames", "Exames", "Paciente/tela_principal_paciente/tela_meus_exames"],
    ["historico", "Histórico", "Paciente/historico_medico"],
    ["conta", "Minha conta", "Paciente/tela_conta_paciente"]
  ];

  function pastaAtual() {
    var partes = location.pathname.split("/");
    return decodeURIComponent(partes[partes.length - 2] || "");
  }

  function montarNavegacao() {
    if (!document.querySelector(".sidebar") || document.querySelector(".pa-nav")) return;
    var atual = pastaAtual();
    var nav = document.createElement("nav");
    nav.className = "pa-nav";
    nav.setAttribute("aria-label", "Menu principal");
    nav.innerHTML = MENU.map(function (item) {
      var ativo = item[2] === atual || item[2].endsWith("/" + atual);
      return '<a href="' + RAIZ + item[2] + '/index.html"' + (ativo ? ' aria-current="page"' : "") + ">" +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        ICONES[item[0]] + "</svg><span>" + item[1] + "</span></a>";
    }).join("");
    document.body.appendChild(nav);
    document.body.classList.add("pa-com-nav");
  }

  // ---------- sem internet ----------
  var aviso, timerAviso;

  function mostrarAviso(online) {
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.className = "pa-conexao";
      aviso.setAttribute("role", "status");
      aviso.setAttribute("aria-live", "polite");
      document.body.appendChild(aviso);
    }
    clearTimeout(timerAviso);
    if (online) {
      aviso.className = "pa-conexao pa-conexao-ok visivel";
      aviso.textContent = "Internet de volta. Seus dados estão atualizados.";
      timerAviso = setTimeout(function () { aviso.classList.remove("visivel"); }, 3500);
    } else {
      aviso.className = "pa-conexao visivel";
      aviso.innerHTML = "<strong>Você está sem internet.</strong> " +
        "<span>Dá para ver o que já foi carregado. O que você pedir será enviado quando a internet voltar.</span>";
    }
    document.body.classList.toggle("pa-sem-internet", !online);
  }

  window.addEventListener("offline", function () { mostrarAviso(false); });
  window.addEventListener("online", function () { mostrarAviso(true); });

  // ---------- app instalavel ----------
  function registrarServiceWorker() {
    // service worker so funciona em http(s); abrindo o arquivo direto (file://) nao registra
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    navigator.serviceWorker.register(RAIZ + "sw.js").catch(function () {});
  }

  function iniciar() {
    montarNavegacao();
    if (navigator.onLine === false) mostrarAviso(false);
    registrarServiceWorker();
  }

  window.PacienteApp = { raiz: RAIZ };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
