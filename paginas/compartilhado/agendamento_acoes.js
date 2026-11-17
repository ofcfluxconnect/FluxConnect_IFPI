// Janela de detalhes de um agendamento, com as acoes da recepcao:
// confirmar, check-in, desfazer check-in, marcar falta, cancelar (com motivo) e remarcar.
// Usa as classes de modal do CSS das telas da recepcao.
// Precisa de recepcao_dados.js e recepcao_layout.js.
// Uso: AgendamentoAcoes.abrir(id, function aoMudar() { ...redesenhar... })

(function () {
  var PAGINA_NOVO = "../novo_agendamento_recepcionista/index.html";

  var estilos = `
    .aa-avatar { width: 44px; height: 44px; border-radius: 50%; color: #fff; font-size: 14px; font-weight: 600;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .aa-lista { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 0; }
    .aa-lista div { background: #f3f5f8; border-radius: 8px; padding: 9px 11px; min-width: 0; }
    .aa-lista dt { font-size: 10.5px; color: #6b7585; }
    .aa-lista dd { font-size: 13px; font-weight: 500; margin: 3px 0 0; overflow-wrap: anywhere; }
    .aa-largo { grid-column: 1 / -1; }
    .aa-acoes { flex-wrap: wrap; justify-content: flex-start !important; }
    .aa-cancelar { margin-top: 14px; padding-top: 14px; border-top: 1px dashed #e3e8ef; }
    .aa-botoes-cancelar { display: flex; justify-content: flex-end; gap: 8px; }
    .btn-perigo { display: inline-flex; align-items: center; gap: 7px; height: 36px; padding: 0 16px; border: none; border-radius: 9px;
      background: #dc2626; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn-perigo:hover { background: #b91c1c; }
    .btn-perigo-claro { border: 1px solid #f8c4c4; background: #fff; color: #dc2626; }
    .btn-perigo-claro:hover { background: #fdf2f2; }
    .btn-verde { border: none; background: #15803d; color: #fff; }
    .btn-verde:hover { background: #116a32; }
  `;

  var overlay, atual = null, callback = null;

  function el(id) { return document.getElementById(id); }

  function hojeISO() { return Recepcao.iso(Recepcao.hoje()); }

  function abrir(id, aoMudar) {
    var a = Recepcao.agendamento(id);
    if (!a) return;
    atual = a;
    callback = aoMudar || null;
    var e = Recepcao.escapar;
    var p = a.paciente;

    el("aaAvatar").textContent = Recepcao.iniciais(p.nome);
    el("aaAvatar").style.background = p.cor;
    el("aaNome").textContent = p.nome;
    el("aaSub").innerHTML = '<span class="badge badge-' + a.status + '">' + Recepcao.rotulosStatus[a.status] + "</span>" +
      (a.encaixe ? ' <span class="badge badge-confirmada">Encaixe</span>' : "");

    el("aaLista").innerHTML = `
      <div><dt>Data e hora</dt><dd>${Recepcao.formatarData(a.data)} às ${a.hora}</dd></div>
      <div><dt>Tipo</dt><dd>${e(a.tipo)}</dd></div>
      <div><dt>Profissional</dt><dd>${e(a.medico.nome)}</dd></div>
      <div><dt>Especialidade</dt><dd>${e(a.medico.especialidade)}</dd></div>
      <div><dt>CPF</dt><dd>${e(p.cpf || "—")}</dd></div>
      <div><dt>Telefone</dt><dd>${e(p.telefone || "Não informado")}</dd></div>
      <div class="aa-largo"><dt>Convênio</dt><dd>${e(p.convenio || "Não informado")}</dd></div>
      ${a.motivo ? `<div class="aa-largo"><dt>Motivo do cancelamento</dt><dd>${e(a.motivo)}</dd></div>` : ""}
    `;

    var ehHoje = a.data === hojeISO();
    var ativo = a.status === "pendente" || a.status === "confirmada";
    var podeRemarcar = ativo || a.status === "cancelada" || a.status === "falta";
    var botoes = [];
    if (a.status === "pendente") botoes.push(['confirmar', "Confirmar presença", "btn-primario"]);
    if (ativo && ehHoje) botoes.push(['checkin', "Fazer check-in", "btn-primario btn-verde"]);
    if (a.status === "aguardando") botoes.push(['desfazer', "Desfazer check-in", "btn-secundario"]);
    if (podeRemarcar) botoes.push(['remarcar', "Remarcar", "btn-secundario"]);
    if (ativo && ehHoje) botoes.push(['falta', "Marcar falta", "btn-secundario"]);
    if (ativo || a.status === "aguardando") botoes.push(['cancelar', "Cancelar consulta", "btn-secundario btn-perigo-claro"]);

    el("aaAcoes").innerHTML = botoes.map(function (b) {
      return '<button type="button" class="' + b[2] + '" data-aa="' + b[0] + '">' + b[1] + "</button>";
    }).join("") || '<span class="modal-sub">Nenhuma ação disponível para esta consulta.</span>';

    el("aaCancelar").hidden = true;
    el("aaAcoes").hidden = false;
    overlay.classList.add("visivel");
  }

  function fechar() {
    overlay.classList.remove("visivel");
  }

  function aplicar(campos, titulo, texto) {
    Recepcao.atualizarAgendamento(atual.id, campos);
    fechar();
    RecepcaoUI.toast(titulo, texto);
    if (callback) callback();
  }

  function acao(tipo) {
    var nome = atual.paciente.nome;
    if (tipo === "confirmar") aplicar({ status: "confirmada" }, "Presença confirmada", nome + " · " + atual.hora);
    else if (tipo === "checkin") aplicar({ status: "aguardando", checkin: new Date().toISOString() }, "Check-in realizado", nome + " está na sala de espera.");
    else if (tipo === "desfazer") aplicar({ status: "confirmada", checkin: null }, "Check-in desfeito", nome);
    else if (tipo === "falta") aplicar({ status: "falta" }, "Falta registrada", nome + " não compareceu às " + atual.hora + ".");
    else if (tipo === "remarcar") window.location.href = PAGINA_NOVO + "?reagendar=" + encodeURIComponent(atual.id);
    else if (tipo === "cancelar") {
      el("aaCancelar").hidden = false;
      el("aaAcoes").hidden = true;
      el("aaMotivo").focus();
    }
  }

  function iniciar() {
    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);

    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-caixa" role="dialog" aria-modal="true" aria-labelledby="aaNome">
        <div class="modal-topo">
          <span class="aa-avatar" id="aaAvatar"></span>
          <div>
            <h2 class="modal-titulo" id="aaNome"></h2>
            <p class="modal-sub" id="aaSub"></p>
          </div>
          <button type="button" class="modal-x" data-aa-fechar title="Fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-corpo">
          <dl class="aa-lista" id="aaLista"></dl>
          <div class="aa-cancelar" id="aaCancelar" hidden>
            <label class="campo-form">
              <span>Motivo do cancelamento</span>
              <select id="aaMotivo">
                <option>Imprevisto pessoal</option>
                <option>Reagendamento</option>
                <option>Problema de transporte</option>
                <option>Problema de saúde</option>
                <option>Solicitação da clínica</option>
              </select>
            </label>
            <div class="aa-botoes-cancelar">
              <button type="button" class="btn-secundario" data-aa-voltar>Voltar</button>
              <button type="button" class="btn-perigo" data-aa-confirmar-cancelar>Confirmar cancelamento</button>
            </div>
          </div>
        </div>
        <div class="modal-rodape aa-acoes" id="aaAcoes"></div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (ev) {
      if (ev.target === overlay || ev.target.closest("[data-aa-fechar]")) return fechar();
      var b = ev.target.closest("[data-aa]");
      if (b) return acao(b.dataset.aa);
      if (ev.target.closest("[data-aa-voltar]")) {
        el("aaCancelar").hidden = true;
        el("aaAcoes").hidden = false;
        return;
      }
      if (ev.target.closest("[data-aa-confirmar-cancelar]")) {
        aplicar({ status: "cancelada", motivo: el("aaMotivo").value }, "Consulta cancelada",
          "O horário das " + atual.hora + " com " + atual.medico.nome + " foi liberado.");
      }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && overlay.classList.contains("visivel")) fechar();
    });
  }

  window.AgendamentoAcoes = { abrir: abrir, fechar: fechar };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
