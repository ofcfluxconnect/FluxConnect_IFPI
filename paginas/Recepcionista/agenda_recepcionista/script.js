// Grade de horarios da recepcao: uma coluna por medico, um horario por linha.
// - Cards de resumo do dia (com grafico por horario)
// - Escolha do dia (setas, calendario e "Hoje"), filtro por especialidade e busca de paciente
// - Legenda com a contagem de cada situacao; clicar nela destaca so aquela situacao
// - Check-in direto no card
// - Clique num espaco livre abre o novo agendamento ja preenchido
// - Arrastar um card para um espaco livre remarca a consulta (mesma especialidade)
// - Clique no card abre os detalhes com as demais acoes

var PAGINA_NOVO = "../novo_agendamento_recepcionista/index.html";
var diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

var dataAtual = Recepcao.hoje();
var filtroEspecialidade = "";
var filtroSituacao = ""; // "" = todas; senao uma chave de rotulosGrade
var termoBusca = "";
var rolarParaAgora = true; // na primeira vez, leva a grade ate o horario atual
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

var iconeCheckin = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>';


function horaAtual() {
  var d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function dataISO() {
  return Recepcao.iso(dataAtual);
}

function ehHoje() {
  return dataISO() === Recepcao.iso(Recepcao.hoje());
}

// espaco livre so pode ser agendado se ainda nao passou
function horarioJaPassou(hora) {
  var hoje = Recepcao.iso(Recepcao.hoje());
  return dataISO() < hoje || (dataISO() === hoje && hora < horaAtual());
}

// horario da grade em que "agora" cai (cada linha vale 30 minutos)
function horarioDeAgora() {
  if (!ehHoje()) return "";
  var agora = horaAtual();
  var achado = "";
  Recepcao.horarios().forEach(function (h) {
    var p = h.split(":");
    var fim = new Date(2000, 0, 1, +p[0], +p[1] + 30);
    var fimTexto = String(fim.getHours()).padStart(2, "0") + ":" + String(fim.getMinutes()).padStart(2, "0");
    if (agora >= h && agora < fimTexto) achado = h;
  });
  return achado;
}

function medicosVisiveis() {
  return Recepcao.medicos().filter(function (m) {
    return !filtroEspecialidade || m.especialidade === filtroEspecialidade;
  });
}

function consultasDoDia() {
  return Recepcao.agendamentos().filter(function (a) {
    return a.data === dataISO() && a.status !== "cancelada";
  });
}

function atualizarTopo() {
  var d = dataAtual;
  var texto = diasSemana[d.getDay()] + ", " + d.getDate() + " de " + meses[d.getMonth()] + " de " + d.getFullYear();
  var feriado = window.obterFeriado ? obterFeriado(d) : null;
  if (feriado) texto += " · " + descreverFeriado(feriado);
  document.getElementById("subtituloPagina").textContent = texto;
  document.getElementById("btnHoje").classList.toggle("ativo", ehHoje());
  document.getElementById("dataAgenda").value = dataISO();
}

function renderizarChips() {
  var chips = [""].concat(Recepcao.especialidades());
  document.getElementById("chipsEspecialidade").innerHTML = chips.map(function (esp) {
    return '<button type="button" class="chip-esp' + (esp === filtroEspecialidade ? " ativo" : "") + '" data-esp="' + esp + '">' + (esp || "Todas") + "</button>";
  }).join("");
}

// Cards do topo: numeros do dia inteiro (todas as especialidades) e grafico por horario.
// A soma dos pontos de cada grafico e o numero mostrado no card.
function renderizarResumo(doDia) {
  var horarios = Recepcao.horarios();
  var medicos = Recepcao.medicos();

  function contar(filtro) { return doDia.filter(filtro).length; }
  function porHora(filtro) {
    return horarios.map(function (h) {
      return doDia.filter(function (a) { return a.hora === h && filtro(a); }).length;
    });
  }
  var todas = function () { return true; };
  var aguardando = function (a) { return a.status === "aguardando"; };
  var atendimento = function (a) { return a.status === "em-atendimento"; };

  // horarios que ainda podem ser agendados (nao passaram e nao tem consulta)
  var livresPorHora = horarios.map(function (h) {
    if (horarioJaPassou(h)) return 0;
    return medicos.filter(function (m) { return !doDia.some(function (a) { return a.medicoId === m.id && a.hora === h; }); }).length;
  });
  var livres = livresPorHora.reduce(function (a, b) { return a + b; }, 0);

  document.getElementById("numAgendadas").textContent = doDia.length;
  document.getElementById("numAguardando").textContent = contar(aguardando);
  document.getElementById("numAtendimento").textContent = contar(atendimento);
  document.getElementById("numLivres").textContent = livres;
  document.getElementById("subAgendadas").textContent = ehHoje() ? "consultas hoje" : "consultas no dia";

  var consultas = { rotulos: horarios, unidade: ["consulta", "consultas"] };
  var pacientes = { rotulos: horarios, unidade: ["paciente", "pacientes"] };
  RecepcaoComp.grafico(document.getElementById("grafAgendadas"), porHora(todas), consultas);
  RecepcaoComp.grafico(document.getElementById("grafAguardando"), porHora(aguardando), pacientes);
  RecepcaoComp.grafico(document.getElementById("grafAtendimento"), porHora(atendimento), pacientes);
  RecepcaoComp.grafico(document.getElementById("grafLivres"), livresPorHora, { rotulos: horarios, unidade: ["horário livre", "horários livres"] });
}

// Legenda com a contagem de cada situacao (dos medicos visiveis). Clicar destaca so aquela situacao.
function renderizarLegenda(visiveis) {
  var html = Object.keys(rotulosGrade).map(function (chave) {
    var qtd = visiveis.filter(function (a) { return visual[a.status] === chave; }).length;
    return `<button type="button" class="item-legenda${filtroSituacao === chave ? " ativo" : ""}" data-situacao="${chave}" aria-pressed="${filtroSituacao === chave}" title="Destacar: ${rotulosGrade[chave]}">
      <i class="cor-${chave}"></i> ${rotulosGrade[chave]} <b>${qtd}</b>
    </button>`;
  }).join("");
  if (filtroSituacao) html += '<button type="button" class="limpar-legenda" data-situacao="">Mostrar todas</button>';
  document.getElementById("itensLegenda").innerHTML = html;
}

function renderizarGrade() {
  var medicos = medicosVisiveis();
  var doDia = consultasDoDia();
  var idsVisiveis = medicos.map(function (m) { return m.id; });
  var visiveis = doDia.filter(function (a) { return idsVisiveis.indexOf(a.medicoId) !== -1; });

  renderizarResumo(doDia);
  renderizarLegenda(visiveis);

  var grade = document.getElementById("grade");
  grade.style.gridTemplateColumns = "76px repeat(" + medicos.length + ", minmax(168px, 1fr))";

  var html = '<div class="celula-canto">Horário</div>';
  medicos.forEach(function (m) {
    var qtd = doDia.filter(function (a) { return a.medicoId === m.id; }).length;
    html += `<div class="cabeca-medico" role="columnheader">
      <span class="avatar-pessoa" style="background:${m.cor}">${Recepcao.iniciais(m.nome)}</span>
      <div>
        <p class="pessoa-nome">${e(m.nome)}</p>
        <p class="pessoa-sub">${e(m.especialidade)} · ${qtd} ${qtd === 1 ? "consulta" : "consultas"}</p>
      </div>
    </div>`;
  });

  var agora = horarioDeAgora();
  var hoje = ehHoje();
  var encontrados = 0;

  Recepcao.horarios().forEach(function (hora, i) {
    if (hora === "14:00") {
      html += '<div class="linha-intervalo" style="grid-column: 1 / -1">Intervalo · 12:00 às 14:00</div>';
    }
    var zebra = i % 2 ? " zebra" : "";
    var linhaAgora = hora === agora ? " agora" : "";
    html += '<div class="celula-hora' + zebra + linhaAgora + '">' + hora + (linhaAgora ? '<span class="tag-agora">agora</span>' : "") + "</div>";

    medicos.forEach(function (m) {
      var a = doDia.find(function (x) { return x.medicoId === m.id && x.hora === hora; });
      if (!a) {
        var passou = horarioJaPassou(hora);
        html += `<div class="celula${zebra}${linhaAgora}${passou ? " passou" : " livre"}" data-medico="${m.id}" data-hora="${hora}" ${passou ? "" : 'tabindex="0" role="button" aria-label="Agendar ' + hora + " com " + e(m.nome) + '"'}>
          ${passou ? "" : '<span class="mais-livre">+ Agendar</span>'}
        </div>`;
        return;
      }
      var tipoVisual = visual[a.status];
      var bateBusca = !termoBusca || a.paciente.nome.toLowerCase().includes(termoBusca);
      var bateSituacao = !filtroSituacao || tipoVisual === filtroSituacao;
      if (termoBusca && bateBusca) encontrados++;
      var apagado = bateBusca && bateSituacao ? "" : " apagado";
      var achado = termoBusca && bateBusca ? " achado" : "";

      var arrastavel = (a.status === "pendente" || a.status === "confirmada") && !horarioJaPassou(hora) ? 'draggable="true"' : "";
      var rotulo = a.status === "pendente" ? "A confirmar" : rotulosGrade[tipoVisual];
      var checkin = tipoVisual === "agendado" && hoje
        ? `<button type="button" class="btn-checkin" data-checkin="${a.id}">${iconeCheckin} Check-in</button>`
        : "";
      html += `<div class="celula${zebra}${linhaAgora}">
        <div class="card-consulta card-${tipoVisual}${apagado}${achado}" data-id="${a.id}" ${arrastavel} tabindex="0" role="button" aria-label="${e(a.paciente.nome)}, ${hora}, ${rotulo}">
          <p class="card-nome">${e(a.paciente.nome)}</p>
          <p class="card-tipo">${e(a.tipo)}${a.encaixe ? " · encaixe" : ""}</p>
          <span class="card-situacao"><i class="card-ponto"></i> ${rotulo}</span>
          ${checkin}
        </div>
      </div>`;
    });
  });

  grade.innerHTML = html;

  var aviso = document.getElementById("avisoBusca");
  aviso.hidden = !termoBusca;
  if (termoBusca) {
    aviso.textContent = encontrados
      ? encontrados + (encontrados === 1 ? " consulta encontrada" : " consultas encontradas") + " neste dia"
      : "Nenhuma consulta desse paciente neste dia";
    aviso.classList.toggle("vazio", !encontrados);
  }

  // primeira vez no dia de hoje: leva a grade ate o horario atual
  if (rolarParaAgora) {
    rolarParaAgora = false;
    var linha = grade.querySelector(".celula-hora.agora");
    var caixa = document.querySelector(".grade-rolagem");
    if (linha && caixa) caixa.scrollTop = Math.max(0, linha.offsetTop - 90);
  }
}

function renderizarTudo() {
  atualizarTopo();
  renderizarChips();
  renderizarGrade();
}

function irParaDia(data) {
  dataAtual = data;
  rolarParaAgora = true;
  renderizarTudo();
}

function mudarDia(dias) {
  irParaDia(Recepcao.somarDias(dataAtual, dias));
}

function abrirNovo(medicoId, hora) {
  window.location.href = PAGINA_NOVO + "?medico=" + medicoId + "&data=" + dataISO() + "&hora=" + hora;
}


// ---------- imprimir a agenda do dia ----------
// Monta uma folha so para o papel: uma tabela com os horarios nas linhas e os medicos
// nas colunas (respeita o filtro de especialidade). O CSS de impressao mostra so ela.
function montarFolhaImpressao() {
  var medicos = medicosVisiveis();
  var doDia = consultasDoDia();
  var ids = medicos.map(function (m) { return m.id; });
  var visiveis = doDia.filter(function (a) { return ids.indexOf(a.medicoId) !== -1; });
  var d = dataAtual;
  var agora = new Date();

  var resumo = Object.keys(rotulosGrade).map(function (chave) {
    var qtd = visiveis.filter(function (a) { return visual[a.status] === chave; }).length;
    return qtd ? rotulosGrade[chave] + ": " + qtd : "";
  }).filter(Boolean).join(" · ");

  var html = `<header class="imp-topo">
      <img src="../../midias/logo/fluxConnect_2_transparente.svg" alt="" />
      <div>
        <h1>Agenda do dia — ${diasSemana[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}</h1>
        <p>FluxConnect · Recepção${filtroEspecialidade ? " · Especialidade: " + e(filtroEspecialidade) : ""}</p>
      </div>
      <p class="imp-total"><strong>${visiveis.length}</strong> ${visiveis.length === 1 ? "consulta" : "consultas"}${resumo ? "<br>" + resumo : ""}</p>
    </header>
    <table class="imp-tabela">
      <thead><tr><th class="imp-hora">Horário</th>${medicos.map(function (m) {
        return "<th>" + e(m.nome) + "<span>" + e(m.especialidade) + "</span></th>";
      }).join("")}</tr></thead>
      <tbody>`;

  Recepcao.horarios().forEach(function (hora) {
    if (hora === "14:00") html += '<tr class="imp-intervalo"><td colspan="' + (medicos.length + 1) + '">Intervalo · 12:00 às 14:00</td></tr>';
    html += '<tr><th class="imp-hora">' + hora + "</th>";
    medicos.forEach(function (m) {
      var a = doDia.find(function (x) { return x.medicoId === m.id && x.hora === hora; });
      if (!a) { html += '<td class="imp-livre">—</td>'; return; }
      var situacao = a.status === "pendente" ? "A confirmar" : rotulosGrade[visual[a.status]];
      html += "<td><strong>" + e(a.paciente.nome) + "</strong><span>" + e(a.tipo) + (a.encaixe ? " · encaixe" : "") + " · " + situacao + "</span></td>";
    });
    html += "</tr>";
  });

  html += `</tbody></table>
    <p class="imp-rodape">Impresso em ${Recepcao.formatarData(Recepcao.iso(agora))} às ${horaAtual()} · "—" indica horário sem consulta</p>`;
  document.getElementById("folhaImpressao").innerHTML = html;
}

function imprimirAgenda() {
  montarFolhaImpressao();
  window.print();
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
  document.getElementById("btnHoje").addEventListener("click", function () { irParaDia(Recepcao.hoje()); });
  document.getElementById("dataAgenda").addEventListener("change", function (ev) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(ev.target.value)) irParaDia(Recepcao.lerISO(ev.target.value));
    else ev.target.value = dataISO(); // campo apagado: volta para o dia que esta na tela
  });

  document.getElementById("btnImprimir").addEventListener("click", imprimirAgenda);
  // Ctrl+P ou o menu do navegador tambem usam a folha propria
  window.addEventListener("beforeprint", montarFolhaImpressao);

  document.getElementById("buscaAgenda").addEventListener("input", function (ev) {
    termoBusca = ev.target.value.toLowerCase().trim();
    renderizarGrade();
  });

  document.getElementById("chipsEspecialidade").addEventListener("click", function (ev) {
    var chip = ev.target.closest("[data-esp]");
    if (!chip) return;
    filtroEspecialidade = chip.dataset.esp;
    renderizarChips();
    renderizarGrade();
  });

  document.getElementById("itensLegenda").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-situacao]");
    if (!b) return;
    // clicar de novo na mesma situacao tira o destaque
    filtroSituacao = filtroSituacao === b.dataset.situacao ? "" : b.dataset.situacao;
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
