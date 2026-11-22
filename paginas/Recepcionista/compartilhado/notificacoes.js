// Modal de notificacoes usado por todas as telas que tem o sininho.
// Basta incluir este arquivo: ele liga qualquer botao com title="Notificações".
// Quem tem lista de notificacoes marca o <body> com data-notificacoes="<perfil>"
// (ex.: "recepcao"). Sem lista, aparece o estado "Nenhuma notificacao no momento".
// O que ja foi lido fica salvo no navegador.

(function () {
  var listas = {
    recepcao: [
      // fixas (exemplo). Os alertas da agenda (cancelamento, falta, horario vago)
      // sao calculados pela recepcao_dados.js e entram por FluxNotificacoesDinamicas.
      { id: "rec-1", tipo: "agendamento", titulo: "Novo agendamento", texto: "Paciente Lucas Ferreira realizou agendamento online para amanhã às 09h.", minutos: 3 },
      { id: "rec-3", tipo: "checkin", titulo: "Check-in realizado", texto: "Paciente Beatriz Oliveira realizou check-in via app e aguarda na recepção.", minutos: 22, urgente: true },
      { id: "rec-4", tipo: "laudo", titulo: "Laudo anexado", texto: "Raio-X de tórax de Carlos Eduardo Silva já está disponível para o médico.", minutos: 75, lida: true },
      { id: "rec-6", tipo: "agendamento", titulo: "Lembretes enviados", texto: "Os pacientes de amanhã receberam o lembrete de consulta por SMS.", minutos: 1100, lida: true }
    ]
  };

  var icones = {
    agendamento: ['#e0ecfd', '#1d4ed8', '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>'],
    alerta: ['#fef3c7', '#b45309', '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'],
    checkin: ['#dcfce7', '#15803d', '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'],
    laudo: ['#ede9fe', '#6d28d9', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/>'],
    falta: ['#fde8e8', '#c81e1e', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/>'],
    vago: ['#dcfce7', '#15803d', '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/>']
  };

  var estilos = `
    .notif-overlay {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(15, 25, 35, 0.45); backdrop-filter: blur(2px);
      display: none; align-items: center; justify-content: center; padding: 16px;
    }
    .notif-overlay.visivel { display: flex; }
    .notif-caixa {
      width: 100%; max-width: 560px; max-height: 88vh; display: flex; flex-direction: column; background: #fff; border-radius: 22px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); overflow: hidden;
      font-family: "Inter", sans-serif; text-align: left;
      animation: notifAparecer 0.2s ease;
    }
    @keyframes notifAparecer { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .notif-topo {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 26px 28px 20px; border-bottom: 1px solid rgba(15, 25, 35, 0.07);
    }
    .notif-titulo { display: flex; align-items: center; gap: 10px; font-size: 19px; font-weight: 700; color: #1e2a3b; margin: 0; }
    .notif-contador { min-width: 24px; height: 24px; padding: 0 7px; border-radius: 12px; background: #1d64f2; color: #fff;
      font-size: 12.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
    .notif-subtitulo { font-size: 13.5px; color: #8a94a6; margin: 4px 0 0; }
    .notif-marcar { margin-left: auto; border: none; background: transparent; color: #1d64f2; font-size: 13.5px; font-weight: 500;
      cursor: pointer; padding: 4px 6px; font-family: inherit; white-space: nowrap; }
    .notif-marcar:hover { text-decoration: underline; }
    .notif-fechar {
      width: 34px; height: 34px; border: none; background: transparent; border-radius: 50%; flex-shrink: 0;
      color: #8a94a6; display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .notif-fechar:hover { background: #f0f4f8; }
    .notif-corpo { flex: 1; min-height: 0; overflow-y: auto; }
    .notif-secao { font-size: 11.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #8a94a6;
      padding: 18px 28px 10px; margin: 0; }
    .notif-lista { list-style: none; margin: 0; padding: 0; }
    .notif-item { position: relative; display: flex; gap: 14px; width: 100%; padding: 16px 44px 16px 28px; border: none; background: #fff;
      text-align: left; cursor: pointer; font-family: inherit; }
    .notif-item.nao-lida { background: #f7f9fe; }
    .notif-item:hover { background: #eef3fc; }
    .notif-icone { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .notif-textos { min-width: 0; flex: 1; }
    .notif-item-titulo { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #1e2a3b; margin: 0; }
    .notif-urgente { margin-left: auto; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: #dc2626; background: #fde8e8;
      border: 1px solid #fbc4c4; padding: 2px 8px; border-radius: 10px; }
    .notif-item-texto { font-size: 14px; color: #4b5563; line-height: 1.5; margin: 4px 0 0; }
    .notif-tempo { font-size: 12.5px; color: #6b7585; margin: 8px 0 0; }
    .notif-acao { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: #1d64f2; margin-top: 6px; }
    .notif-ponto { position: absolute; right: 22px; top: 22px; width: 8px; height: 8px; border-radius: 50%; background: #1d64f2; }
    .notif-rodape { border-top: 1px solid rgba(15, 25, 35, 0.07); padding: 14px; text-align: center; }
    .notif-ver { border: none; background: transparent; color: #1d64f2; font-size: 14px; font-weight: 500; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px; font-family: inherit; }
    .notif-ver:hover { text-decoration: underline; }
    .notif-vazio { padding: 70px 28px 76px; text-align: center; }
    .notif-vazio-icone {
      width: 74px; height: 74px; margin: 0 auto 22px; border-radius: 50%;
      background: #eef1f6; display: flex; align-items: center; justify-content: center;
    }
    .notif-vazio-titulo { font-size: 17px; font-weight: 600; color: #1e2a3b; margin: 0; }
    .notif-vazio-texto { font-size: 14.5px; color: #8a94a6; margin: 12px auto 0; max-width: 260px; line-height: 1.55; }
    @media (max-width: 520px) { .notif-topo { flex-wrap: wrap; } .notif-marcar { margin-left: 0; order: 3; } }
  `;

  var htmlVazio = `
    <div class="notif-vazio">
      <div class="notif-vazio-icone">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7a8599" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/>
          <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          <path d="m2 2 20 20"/>
        </svg>
      </div>
      <p class="notif-vazio-titulo">Nenhuma notificação no momento</p>
      <p class="notif-vazio-texto">Você está em dia com todas as atualizações da plataforma.</p>
    </div>
  `;

  var perfil, chaveLidas, lista = [], lidas = [], mostrarTodas = false;
  var overlay, botoes;

  function escapar(texto) {
    return String(texto).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // fixas + as calculadas na hora pela tela (ex.: alertas da agenda da recepcao)
  function montarLista() {
    var fixas = listas[perfil] || [];
    var gerador = window.FluxNotificacoesDinamicas && window.FluxNotificacoesDinamicas[perfil];
    var dinamicas = [];
    try { dinamicas = gerador ? gerador() || [] : []; } catch (e) { dinamicas = []; }
    return dinamicas.concat(fixas);
  }

  function tempo(minutos, quando) {
    if (quando) return quando;
    if (minutos < 60) return "Há " + minutos + " min";
    if (minutos < 1440) return "Há " + Math.round(minutos / 60) + " h";
    return "Ontem";
  }

  function ehLida(n) {
    return n.lida || lidas.indexOf(n.id) !== -1;
  }

  function salvarLidas() {
    try { localStorage.setItem(chaveLidas, JSON.stringify(lidas)); } catch (e) {}
  }

  function itemHtml(n) {
    var ic = icones[n.tipo] || icones.agendamento;
    var naoLida = !ehLida(n);
    return `<li><button type="button" class="notif-item${naoLida ? " nao-lida" : ""}" data-notif="${n.id}">
      <span class="notif-icone" style="background:${ic[0]}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${ic[1]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic[2]}</svg></span>
      <span class="notif-textos">
        <span class="notif-item-titulo">${escapar(n.titulo)}${n.urgente && naoLida ? '<span class="notif-urgente">URGENTE</span>' : ""}</span>
        <span class="notif-item-texto" style="display:block">${escapar(n.texto)}</span>
        <span class="notif-tempo" style="display:block">${tempo(n.minutos, n.quando)}</span>
        ${n.link && n.acao ? `<span class="notif-acao">${escapar(n.acao)} →</span>` : ""}
      </span>
      ${naoLida ? '<span class="notif-ponto" aria-label="Não lida"></span>' : ""}
    </button></li>`;
  }

  function desenhar() {
    lista = montarLista();
    var naoLidas = lista.filter(function (n) { return !ehLida(n); });
    var jaLidas = lista.filter(ehLida);

    var corpo;
    if (!lista.length || (!naoLidas.length && !mostrarTodas)) {
      corpo = htmlVazio;
    } else {
      corpo = "";
      if (naoLidas.length) corpo += '<p class="notif-secao">Não lidas</p><ul class="notif-lista">' + naoLidas.map(itemHtml).join("") + "</ul>";
      if (mostrarTodas && jaLidas.length) corpo += '<p class="notif-secao">Anteriores</p><ul class="notif-lista">' + jaLidas.map(itemHtml).join("") + "</ul>";
    }

    var temLista = lista.length > 0;
    overlay.querySelector(".notif-caixa").innerHTML = `
      <div class="notif-topo">
        <div>
          <h2 class="notif-titulo" id="notifTitulo">Notificações ${naoLidas.length ? `<span class="notif-contador">${naoLidas.length}</span>` : ""}</h2>
          <p class="notif-subtitulo">Atualizações recentes da plataforma</p>
        </div>
        ${naoLidas.length ? '<button type="button" class="notif-marcar" data-marcar-todas>Marcar todas como lidas</button>' : ""}
        <button type="button" class="notif-fechar" data-fechar-notif title="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="notif-corpo">${corpo}</div>
      ${temLista && jaLidas.length ? `<div class="notif-rodape">
        <button type="button" class="notif-ver" data-ver-todas>${mostrarTodas ? "Mostrar só as não lidas" : "Ver todas as notificações"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="${mostrarTodas ? "18 15 12 9 6 15" : "9 18 15 12 9 6"}"/></svg>
        </button>
      </div>` : ""}
    `;

    atualizarPontos(naoLidas.length);
  }

  // pontinho azul do sininho so aparece se houver nao lidas
  function atualizarPontos(qtd) {
    botoes.forEach(function (b) {
      var ponto = b.querySelector("[class*='ponto']");
      if (ponto) ponto.style.display = qtd ? "" : "none";
    });
  }

  function abrir() {
    mostrarTodas = false;
    desenhar();
    overlay.classList.add("visivel");
  }

  function fechar() {
    overlay.classList.remove("visivel");
  }

  function iniciar() {
    botoes = document.querySelectorAll('[title="Notificações"]');
    if (!botoes.length) return;

    perfil = document.body.dataset.notificacoes || "";
    lista = montarLista();
    chaveLidas = "fluxconnect_notificacoes_lidas_" + (perfil || "geral");
    try { lidas = JSON.parse(localStorage.getItem(chaveLidas) || "[]"); } catch (e) { lidas = []; }

    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);

    overlay = document.createElement("div");
    overlay.className = "notif-overlay";
    overlay.innerHTML = '<div class="notif-caixa" role="dialog" aria-modal="true" aria-labelledby="notifTitulo"></div>';
    document.body.appendChild(overlay);

    botoes.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        abrir();
      });
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-fechar-notif]")) return fechar();
      if (e.target.closest("[data-marcar-todas]")) {
        lista.forEach(function (n) { if (lidas.indexOf(n.id) === -1) lidas.push(n.id); });
        salvarLidas();
        return desenhar();
      }
      if (e.target.closest("[data-ver-todas]")) {
        mostrarTodas = !mostrarTodas;
        return desenhar();
      }
      var item = e.target.closest("[data-notif]");
      if (!item) return;
      var notificacao = lista.find(function (n) { return n.id === item.dataset.notif; });
      if (lidas.indexOf(item.dataset.notif) === -1) {
        lidas.push(item.dataset.notif);
        salvarLidas();
      }
      // alerta com acao (ex.: "Agendar neste horario") leva direto para a tela certa
      if (notificacao && notificacao.link) {
        window.location.href = notificacao.link;
        return;
      }
      mostrarTodas = true; // continua vendo o item que acabou de ler
      desenhar();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fechar();
    });

    // estado inicial do pontinho
    atualizarPontos(lista.filter(function (n) { return !ehLida(n); }).length);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
