// Agenda do dia do profissional (mock).
// Os dados de cada paciente vem de compartilhado/pacientes_profissional.js;
// aqui ficam so os horarios. Os status ficam salvos no navegador ate o fim do dia
// (a tela de atendimento tambem atualiza essa mesma chave).

var CHAVE_AGENDA = "fluxconnect_agenda_profissional";
var PAGINA_ATENDIMENTO = "../atendimento_profissional/index.html";

var agenda = [
  { id: "00124", hora: "08:00", tipo: "Consulta geral", duracao: 30, status: "aguardando", sala: "Sala 3", primeira: true, cor: "azul" },
  { id: "00089", hora: "08:30", tipo: "Retorno", duracao: 20, status: "em-atendimento", sala: "Sala 3", primeira: false, cor: "verde" },
  { id: "00201", hora: "09:00", tipo: "Avaliação", duracao: 30, status: "aguardando", sala: "Sala 2", primeira: false, cor: "roxo" },
  { id: "00155", hora: "09:30", tipo: "Consulta geral", duracao: 30, status: "cancelado", sala: "Sala 3", primeira: true, cor: "cinza" },
  { id: "00402", hora: "10:00", tipo: "Retorno", duracao: 20, status: "finalizado", sala: "Sala 3", primeira: false, cor: "laranja" },
  { id: "vago-1030", hora: "10:30", vago: true },
  { id: "00088", hora: "11:00", tipo: "Consulta geral", duracao: 30, status: "aguardando", sala: "Sala 3", primeira: false, cor: "azul" },
  { id: "00317", hora: "11:30", tipo: "Avaliação", duracao: 40, status: "aguardando", sala: "Sala 2", primeira: true, cor: "roxo" },
  { id: "00451", hora: "14:00", tipo: "Retorno", duracao: 20, status: "aguardando", sala: "Sala 3", primeira: false, cor: "verde" }
];

var rotulosStatus = {
  "aguardando": "Aguardando",
  "em-atendimento": "Em atendimento",
  "finalizado": "Finalizado",
  "cancelado": "Cancelado"
};

var diasSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
var mesesCurtos = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

var selecionadoId = null;
var selecaoManual = false;
var termoBusca = "";


// ========== DATA E PERSISTENCIA ==========
function chaveHoje() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

// "quinta-feira, 05 nov 2026"
function dataHojeTexto() {
  var d = new Date();
  return diasSemana[d.getDay()] + ", " + String(d.getDate()).padStart(2, "0") + " " + mesesCurtos[d.getMonth()] + " " + d.getFullYear();
}

function dataCurta(data) {
  return String(data.getDate()).padStart(2, "0") + " " + mesesCurtos[data.getMonth()] + " " + data.getFullYear();
}

function carregarStatus() {
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE_AGENDA) || "null");
    if (!salvo || salvo.dia !== chaveHoje()) return; // novo dia, agenda volta ao inicio
    agenda.forEach(function (item) {
      if (salvo.status[item.id]) item.status = salvo.status[item.id];
    });
  } catch (e) {}
}

function salvarStatus() {
  var status = {};
  agenda.forEach(function (item) { if (!item.vago) status[item.id] = item.status; });
  try {
    localStorage.setItem(CHAVE_AGENDA, JSON.stringify({ dia: chaveHoje(), status: status }));
  } catch (e) {}
}


// ========== AUXILIARES ==========
// junta o horario da agenda com os dados do paciente
function paciente(item) {
  return Object.assign({}, PacientesProfissional.obter(item.id), item);
}

function horarios() {
  return agenda.filter(function (item) { return !item.vago; });
}

function buscarItem(id) {
  return agenda.find(function (item) { return item.id === id; });
}

function proximoAguardando() {
  return horarios().find(function (item) { return item.status === "aguardando"; });
}

var timerToast = null;
// sem clique: o painel mostra o proximo da fila; sem fila, quem esta em atendimento
function itemInicial() {
  var item = proximoAguardando() || horarios().find(function (x) { return x.status === "em-atendimento"; });
  return item ? item.id : null;
}

function selecionar(id) {
  selecionadoId = id;
  selecaoManual = true;
  renderizarAgenda();
  renderizarPainel();
}

function desmarcar() {
  selecionadoId = itemInicial();
  selecaoManual = false;
  renderizarAgenda();
  renderizarPainel();
}

function mostrarToast(texto) {
  var toast = document.getElementById("toast");
  document.getElementById("toastTexto").textContent = texto;
  toast.classList.add("visivel");
  clearTimeout(timerToast);
  timerToast = setTimeout(function () { toast.classList.remove("visivel"); }, 2800);
}


// ========== AGENDA ==========
function renderizarAgenda() {
  var termo = termoBusca;
  var termoNumeros = termo.replace(/\D/g, "");
  var html = "";

  agenda.forEach(function (item) {
    if (item.vago) {
      if (termo) return;
      html += `
        <div class="linha-agenda">
          <span class="hora-agenda">${item.hora}</span>
          <div class="card-agenda card-vago">— horário disponível —</div>
        </div>`;
      return;
    }

    var p = paciente(item);
    var bate = !termo ||
      p.nome.toLowerCase().includes(termo) ||
      (termoNumeros && p.cpf.replace(/\D/g, "").includes(termoNumeros));
    if (!bate) return;

    var classes = "card-agenda status-" + p.status;
    // destaque so quando o medico clicou no cartao (clicar de novo desmarca)
    var marcado = selecaoManual && p.id === selecionadoId;
    if (marcado) classes += " selecionado";

    html += `
      <div class="linha-agenda">
        <span class="hora-agenda">${p.hora}</span>
        <button type="button" class="${classes}" data-id="${p.id}" aria-pressed="${marcado}">
          <span class="avatar-paciente avatar-${p.status === "cancelado" ? "cinza" : p.cor}">${PacientesProfissional.iniciais(p.nome)}</span>
          <span class="info-paciente">
            <span class="nome-paciente">${p.nome}</span>
            <span class="detalhe-paciente">${p.tipo} · ${p.duracao} min · #${p.id}</span>
          </span>
          <span class="badge-status badge-${p.status}">${rotulosStatus[p.status]}</span>
          <svg class="seta-card" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;
  });

  document.getElementById("listaAgenda").innerHTML =
    html || '<p class="lista-vazia">Nenhum paciente encontrado.</p>';
}


// ========== PAINEL DO PACIENTE ==========
function renderizarPainel() {
  var painel = document.getElementById("painelPaciente");
  var item = buscarItem(selecionadoId);

  document.getElementById("txtRotuloPaciente").textContent = selecaoManual ? "Paciente selecionado" : "Próximo paciente";

  if (!item) {
    painel.innerHTML = '<p class="painel-vazio">Nenhum paciente aguardando. Bom trabalho!</p>';
    return;
  }

  var p = paciente(item);

  var botaoPrincipal;
  if (p.status === "aguardando") {
    botaoPrincipal = '<button type="button" class="btn-principal" id="btnAtendimento">Iniciar atendimento</button>';
  } else if (p.status === "em-atendimento") {
    botaoPrincipal = '<button type="button" class="btn-principal btn-continuar" id="btnAtendimento">Continuar atendimento</button>';
  } else if (p.status === "finalizado") {
    botaoPrincipal = '<button type="button" class="btn-principal" disabled>Atendimento finalizado</button>';
  } else {
    botaoPrincipal = '<button type="button" class="btn-principal" disabled>Consulta cancelada</button>';
  }

  var alergias = p.alergias.length ? p.alergias.join(", ") : "Nenhuma";
  var condicoes = p.condicoes.length ? p.condicoes.join(", ") : "Nenhuma";

  painel.innerHTML = `
    <div class="paciente-destaque">
      <span class="avatar-grande">${PacientesProfissional.iniciais(p.nome)}</span>
      <p class="paciente-nome">${p.nome}</p>
      <p class="paciente-info">${p.tipo} · ${p.hora} · ${p.sala}</p>
      <div class="paciente-tags">
        <span class="badge-status badge-${p.status}">${rotulosStatus[p.status]}</span>
        <span class="tag-tipo">${p.primeira ? "1ª consulta" : "Retorno"}</span>
      </div>
    </div>
    <div class="grade-dados">
      <div class="dado"><span>Idade</span><strong>${p.idade} anos</strong></div>
      <div class="dado"><span>Convênio</span><strong>${p.convenio}</strong></div>
      <div class="dado"><span>Última consulta</span><strong>${p.ultimaVisita ? dataCurta(p.ultimaVisita) : "—"}</strong></div>
      <div class="dado"><span>Alergias</span><strong class="${p.alergias.length ? "texto-alerta" : ""}">${alergias}</strong></div>
      <div class="dado dado-largo"><span>Condições</span><strong>${condicoes}</strong></div>
      <div class="dado dado-largo"><span>CPF</span><strong>${p.cpf}</strong></div>
    </div>
    ${botaoPrincipal}
    <button type="button" class="btn-secundario" id="btnHistorico">Visualizar histórico</button>
  `;

  var btnAtendimento = document.getElementById("btnAtendimento");
  if (btnAtendimento) btnAtendimento.addEventListener("click", function () { iniciarAtendimento(item); });
  document.getElementById("btnHistorico").addEventListener("click", function () { ProntuarioModal.abrir(p.id); });
}

function renderizarResumo() {
  var lista = horarios();
  function contar(status) {
    return lista.filter(function (item) { return item.status === status; }).length;
  }
  var total = lista.length;

  document.getElementById("resTotal").textContent = total;
  document.getElementById("resFinalizados").textContent = contar("finalizado");
  document.getElementById("resAguardando").textContent = contar("aguardando");
  document.getElementById("resCancelados").textContent = contar("cancelado");
  document.getElementById("txtTotalHoje").textContent = total + (total === 1 ? " atendimento" : " atendimentos");
}

function renderizarTudo() {
  renderizarAgenda();
  renderizarPainel();
  renderizarResumo();
}


// ========== ACOES ==========
// so um paciente pode estar em atendimento por vez
function iniciarAtendimento(item) {
  if (item.status === "aguardando") {
    var emAndamento = horarios().find(function (x) { return x.status === "em-atendimento"; });
    if (emAndamento) {
      var nome = PacientesProfissional.obter(emAndamento.id).nome;
      mostrarToast("Finalize o atendimento de " + nome + " antes de iniciar outro.");
      selecionadoId = emAndamento.id;
      selecaoManual = true;
      renderizarAgenda();
      renderizarPainel();
      return;
    }
    item.status = "em-atendimento";
    salvarStatus();
  }
  window.location.href = PAGINA_ATENDIMENTO + "?id=" + encodeURIComponent(item.id);
}


// ========== INICIALIZACAO ==========
document.addEventListener("DOMContentLoaded", function () {
  carregarStatus();
  document.getElementById("txtDataHoje").textContent = dataHojeTexto();

  selecionadoId = itemInicial();

  renderizarTudo();

  document.getElementById("listaAgenda").addEventListener("click", function (e) {
    var card = e.target.closest(".card-agenda[data-id]");
    if (!card) return;
    var id = card.getAttribute("data-id");
    if (selecaoManual && id === selecionadoId) desmarcar();
    else selecionar(id);
  });

  // Esc tambem desmarca (se nao houver janela aberta por cima)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !selecaoManual) return;
    if (document.querySelector(".visivel:not(.toast)")) return;
    desmarcar();
  });

  document.getElementById("inputBusca").addEventListener("input", function (e) {
    termoBusca = e.target.value.toLowerCase().trim();
    renderizarAgenda();
  });
});
