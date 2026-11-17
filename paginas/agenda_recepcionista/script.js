// Grade de horarios da recepcao: uma coluna por medico, um horario por linha.
// - Check-in direto no card
// - Clique num espaco livre abre o novo agendamento ja preenchido
// - Arrastar um card para um espaco livre remarca a consulta (mesma especialidade)
// - Clique no card abre os detalhes com as demais acoes

var PAGINA_NOVO = "../novo_agendamento_recepcionista/index.html";
var diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

var dataAtual = Recepcao.hoje();
var filtroEspecialidade = "";
var e = Recepcao.escapar;

// status da consulta -> aparencia do card na grade
var visual = {
  "pendente": "agendado",
  "confirmada": "agendado",
  "aguardando": "aguardando",
  "em-atendimento": "atendimento",
  "realizada": "realizada",
  "falta": "falta"
};

var rotulosGrade = {
  "agendado": "Agendado", "aguardando": "Aguardando", "atendimento": "Em atendimento", "realizada": "Realizada", "falta": "Faltou"
};


function horaAtual() {
  var d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function dataISO() {
  return Recepcao.iso(dataAtual);
}

// espaco livre so pode ser agendado se ainda nao passou
function horarioJaPassou(hora) {
  var hoje = Recepcao.iso(Recepcao.hoje());
  return dataISO() < hoje || (dataISO() === hoje && hora < horaAtual());
}

function medicosVisiveis() {
  return Recepcao.medicos().filter(function (m) {
    return !filtroEspecialidade || m.especialidade === filtroEspecialidade;
  });
}

function atualizarTopo() {
  var d = dataAtual;
  var texto = diasSemana[d.getDay()] + ", " + d.getDate() + " de " + meses[d.getMonth()] + " de " + d.getFullYear();
  var feriado = window.obterFeriado ? obterFeriado(d) : null;
  if (feriado) texto += " · " + descreverFeriado(feriado);
  document.getElementById("subtituloPagina").textContent = texto;
  var ehHoje = dataISO() === Recepcao.iso(Recepcao.hoje());
  document.getElementById("btnHoje").classList.toggle("ativo", ehHoje);
}

function renderizarChips() {
  var chips = [""].concat(Recepcao.especialidades());
  document.getElementById("chipsEspecialidade").innerHTML = chips.map(function (esp) {
    return '<button type="button" class="chip-esp' + (esp === filtroEspecialidade ? " ativo" : "") + '" data-esp="' + esp + '">' + (esp || "Todos") + "</button>";
  }).join("");
}

function renderizarGrade() {
  var medicos = medicosVisiveis();
  var doDia = Recepcao.agendamentos().filter(function (a) {
    return a.data === dataISO() && a.status !== "cancelada";
  });

  // contadores do topo (dia inteiro, todas as especialidades)
  var aguardando = doDia.filter(function (a) { return a.status === "aguardando"; }).length;
  var atendimento = doDia.filter(function (a) { return a.status === "em-atendimento"; }).length;
  document.getElementById("contAguardando").innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' + aguardando + " Aguardando";
  document.getElementById("contAtendimento").innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.6A2 2 0 1 0 3 6h3a2 2 0 1 0-1.8-3.4"/><path d="M4.5 6v5a5.5 5.5 0 0 0 11 0V6"/><path d="M19.5 13a2.5 2.5 0 1 0 0 5"/><path d="M22 15.5v2A4.5 4.5 0 0 1 17.5 22h-1A4.5 4.5 0 0 1 12 17.5"/></svg> ' + atendimento + " Em Atendimento";

  var grade = document.getElementById("grade");
  grade.style.gridTemplateColumns = "64px repeat(" + medicos.length + ", minmax(210px, 1fr))";

  var html = '<div class="celula-canto"></div>';
  medicos.forEach(function (m) {
    html += `<div class="cabeca-medico" role="columnheader">
      <span class="avatar-pessoa" style="background:${m.cor}">${Recepcao.iniciais(m.nome)}</span>
      <div><p class="pessoa-nome">${e(m.nome)}</p><p class="pessoa-sub">${e(m.especialidade)}</p></div>
    </div>`;
  });

  var ehHoje = dataISO() === Recepcao.iso(Recepcao.hoje());
  Recepcao.horarios().forEach(function (hora, i) {
    if (hora === "14:00") {
      html += '<div class="linha-intervalo" style="grid-column: 1 / -1">Intervalo · 12:00 às 14:00</div>';
    }
    var zebra = i % 2 ? " zebra" : "";
    html += '<div class="celula-hora' + zebra + '">' + hora + "</div>";

    medicos.forEach(function (m) {
      var a = doDia.find(function (x) { return x.medicoId === m.id && x.hora === hora; });
      if (!a) {
        var passou = horarioJaPassou(hora);
        html += `<div class="celula${zebra}${passou ? " passou" : " livre"}" data-medico="${m.id}" data-hora="${hora}" ${passou ? "" : 'tabindex="0" role="button" aria-label="Agendar ' + hora + " com " + e(m.nome) + '"'}>
          ${passou ? "" : '<span class="mais-livre">+ Agendar</span>'}
        </div>`;
        return;
      }
      var tipoVisual = visual[a.status];
      var arrastavel = (a.status === "pendente" || a.status === "confirmada") && !horarioJaPassou(hora) ? 'draggable="true"' : "";
      var checkin = tipoVisual === "agendado" && ehHoje
        ? `<button type="button" class="btn-checkin" data-checkin="${a.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            Check-in
          </button>`
        : "";
      html += `<div class="celula${zebra}">
        <div class="card-consulta card-${tipoVisual}" data-id="${a.id}" ${arrastavel} tabindex="0" role="button" aria-label="${e(a.paciente.nome)}, ${rotulosGrade[tipoVisual]}">
          <div class="card-topo">
            <span class="card-nome">${e(a.paciente.nome)}</span>
            <i class="card-ponto" title="${rotulosGrade[tipoVisual]}${a.status === "pendente" ? " · aguardando confirmação" : ""}"></i>
          </div>
          <p class="card-tipo">${e(a.tipo)}${a.status === "pendente" ? " · não confirmada" : ""}${a.encaixe ? " · encaixe" : ""}</p>
          ${checkin}
        </div>
      </div>`;
    });
  });

  grade.innerHTML = html;
}

function renderizarTudo() {
  atualizarTopo();
  renderizarChips();
  renderizarGrade();
}

function mudarDia(dias) {
  dataAtual = Recepcao.somarDias(dataAtual, dias);
  renderizarTudo();
}

function abrirNovo(medicoId, hora) {
  window.location.href = PAGINA_NOVO + "?medico=" + medicoId + "&data=" + dataISO() + "&hora=" + hora;
}


// ---------- arrastar para remarcar ----------
var arrastandoId = null;

function configurarArraste(grade) {
  grade.addEventListener("dragstart", function (ev) {
    var card = ev.target.closest(".card-consulta[draggable]");
    if (!card) return;
    arrastandoId = card.dataset.id;
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.setData("text/plain", arrastandoId);
    setTimeout(function () { card.classList.add("arrastando"); }, 0);
  });

  grade.addEventListener("dragend", function () {
    arrastandoId = null;
    grade.querySelectorAll(".arrastando, .alvo").forEach(function (x) { x.classList.remove("arrastando", "alvo"); });
  });

  grade.addEventListener("dragover", function (ev) {
    var celula = ev.target.closest(".celula.livre");
    if (!celula || !arrastandoId) return;
    ev.preventDefault();
    grade.querySelectorAll(".alvo").forEach(function (x) { if (x !== celula) x.classList.remove("alvo"); });
    celula.classList.add("alvo");
  });

  grade.addEventListener("drop", function (ev) {
    var celula = ev.target.closest(".celula.livre");
    if (!celula || !arrastandoId) return;
    ev.preventDefault();
    var a = Recepcao.agendamento(arrastandoId);
    var destino = Recepcao.medico(celula.dataset.medico);
    if (destino.especialidade !== a.medico.especialidade) {
      RecepcaoUI.toast("Não foi possível remarcar", destino.nome + " atende " + destino.especialidade + ", e a consulta é de " + a.medico.especialidade + ".", "erro");
      return;
    }
    Recepcao.atualizarAgendamento(a.id, { medicoId: destino.id, hora: celula.dataset.hora, data: dataISO() });
    RecepcaoUI.toast("Consulta remarcada", a.paciente.nome + " · " + celula.dataset.hora + " com " + destino.nome);
    renderizarGrade();
  });
}


document.addEventListener("DOMContentLoaded", function () {
  // ?data=AAAA-MM-DD abre direto num dia (usado depois de agendar)
  var dataUrl = new URLSearchParams(window.location.search).get("data");
  if (dataUrl && /^\d{4}-\d{2}-\d{2}$/.test(dataUrl)) dataAtual = Recepcao.lerISO(dataUrl);

  renderizarTudo();

  document.getElementById("btnDiaAnterior").addEventListener("click", function () { mudarDia(-1); });
  document.getElementById("btnDiaProximo").addEventListener("click", function () { mudarDia(1); });
  document.getElementById("btnHoje").addEventListener("click", function () {
    dataAtual = Recepcao.hoje();
    renderizarTudo();
  });

  document.getElementById("chipsEspecialidade").addEventListener("click", function (ev) {
    var chip = ev.target.closest("[data-esp]");
    if (!chip) return;
    filtroEspecialidade = chip.dataset.esp;
    renderizarChips();
    renderizarGrade();
  });

  var grade = document.getElementById("grade");
  grade.addEventListener("click", function (ev) {
    var checkin = ev.target.closest("[data-checkin]");
    if (checkin) {
      var a = Recepcao.agendamento(checkin.dataset.checkin);
      Recepcao.atualizarAgendamento(a.id, { status: "aguardando", checkin: new Date().toISOString() });
      RecepcaoUI.toast("Check-in realizado", a.paciente.nome + " está na sala de espera.");
      return renderizarGrade();
    }
    var card = ev.target.closest(".card-consulta");
    if (card) return AgendamentoAcoes.abrir(card.dataset.id, renderizarGrade);
    var livre = ev.target.closest(".celula.livre");
    if (livre) abrirNovo(livre.dataset.medico, livre.dataset.hora);
  });

  // teclado: Enter/espaco abre card ou espaco livre
  grade.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    var alvo = ev.target;
    if (alvo.matches(".card-consulta")) {
      ev.preventDefault();
      AgendamentoAcoes.abrir(alvo.dataset.id, renderizarGrade);
    } else if (alvo.matches(".celula.livre")) {
      ev.preventDefault();
      abrirNovo(alvo.dataset.medico, alvo.dataset.hora);
    }
  });

  configurarArraste(grade);
});
