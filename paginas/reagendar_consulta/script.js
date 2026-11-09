// Reagendamento de consulta.
// A tela que chama (Consultas ou Inicio) manda os dados da consulta pela URL:
// ?id=...&medico=...&esp=...&local=...&data=AAAA-MM-DD&hora=HH:MM&volta=../Consultas/index.html

var CHAVE_REAGENDADAS = "fluxconnect_consultas_reagendadas";

var meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
var mesesAbreviados = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

var horarios = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"];

// consulta que esta sendo reagendada (com valores de exemplo se a URL vier vazia)
var parametros = new URLSearchParams(window.location.search);
var consulta = {
  id: parametros.get("id") || "inicio-1",
  medico: parametros.get("medico") || "Dr. Carlos Lima",
  especialidade: parametros.get("esp") || "Clínico Geral",
  local: parametros.get("local") || "UBS Centro",
  data: lerData(parametros.get("data") || "2026-06-14"),
  hora: parametros.get("hora") || "10:30"
};

// so aceita voltar para outra tela do proprio portal
var paginaVolta = parametros.get("volta") || "../Consultas/index.html";
if (!/^\.\.\/[\w\-\/]+\.html$/.test(paginaVolta)) paginaVolta = "../Consultas/index.html";

var nova = { data: null, horario: null };
var mesVisivel;


// ========== DATAS ==========
function lerData(iso) {
  var p = iso.split("-");
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

function hoje() {
  var agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

function mesmoDia(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// "14 de Junho de 2026 · 10:30"
function formatarDataHora(data, hora) {
  return String(data.getDate()).padStart(2, "0") + " de " + meses[data.getMonth()] + " de " + data.getFullYear() + " · " + hora;
}

// horarios que ainda nao passaram (so muda quando a data e hoje)
function horariosLivres(data) {
  if (!mesmoDia(data, hoje())) return horarios;
  var agora = new Date();
  var minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  return horarios.filter(function (h) {
    var p = h.split(":");
    return +p[0] * 60 + +p[1] > minutosAgora;
  });
}

// o horario atual da consulta nao conta como opcao nova
function ehHorarioAtual(data, h) {
  return mesmoDia(data, consulta.data) && h === consulta.hora;
}

function diaTemVaga(data) {
  return data >= hoje() && horariosLivres(data).some(function (h) { return !ehHorarioAtual(data, h); });
}


// ========== CALENDARIO ==========
function renderizarCalendario() {
  var ano = mesVisivel.getFullYear();
  var mes = mesVisivel.getMonth();
  var dataHoje = hoje();

  document.getElementById("txtMesAno").textContent = meses[mes] + " " + ano;
  document.getElementById("btnMesAnterior").disabled = ano === dataHoje.getFullYear() && mes === dataHoje.getMonth();

  var html = "";
  var primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  for (var v = 0; v < primeiroDiaSemana; v++) html += '<span class="dia vazio"></span>';

  var totalDias = new Date(ano, mes + 1, 0).getDate();
  for (var d = 1; d <= totalDias; d++) {
    var data = new Date(ano, mes, d);
    var disponivel = diaTemVaga(data);
    var feriado = obterFeriado(data);
    var atual = mesmoDia(data, consulta.data);
    var titulo = feriado ? descreverFeriado(feriado) : "";

    var classes = "dia";
    classes += disponivel ? " disponivel" : " desabilitado";
    if (feriado) classes += " feriado";
    if (atual) classes += " atual";
    if (mesmoDia(data, dataHoje)) titulo = titulo ? "Hoje · " + titulo : "Hoje";
    if (mesmoDia(data, nova.data)) classes += " selecionado";

    html += `<button type="button" class="${classes}" ${disponivel ? "" : "disabled"} title="${titulo}" data-dia="${d}">
      <span class="dia-numero">${d}</span>
      ${atual ? '<span class="rotulo-atual">Seu horário atual</span>' : ""}
    </button>`;
  }

  document.getElementById("gradeDias").innerHTML = html;
}

function renderizarHorarios() {
  var grade = document.getElementById("gradeHorarios");
  var aviso = document.getElementById("avisoFeriado");

  if (!nova.data) {
    grade.innerHTML = '<p class="horarios-vazio">Selecione uma data para ver os horários.</p>';
    aviso.classList.remove("visivel");
    atualizarBotao();
    return;
  }

  var livres = horariosLivres(nova.data);
  if (nova.horario && (livres.indexOf(nova.horario) === -1 || ehHorarioAtual(nova.data, nova.horario))) {
    nova.horario = null;
  }

  grade.innerHTML = horarios.map(function (h) {
    var atual = ehHorarioAtual(nova.data, h);
    var bloqueado = atual || livres.indexOf(h) === -1;
    var classes = "pill-horario";
    if (atual) classes += " atual";
    if (h === nova.horario) classes += " selecionado";
    return `<button type="button" class="${classes}" data-horario="${h}" ${bloqueado ? "disabled" : ""}>
      ${atual ? '<span class="tag-atual">Atual</span>' : ""}${h}
    </button>`;
  }).join("");

  var feriado = obterFeriado(nova.data);
  if (feriado) {
    aviso.textContent = descreverFeriado(feriado) + ". Confirme o funcionamento da clínica antes de ir.";
    aviso.classList.add("visivel");
  } else {
    aviso.classList.remove("visivel");
  }

  atualizarBotao();
}

function atualizarBotao() {
  document.getElementById("btnAvancar").disabled = !(nova.data && nova.horario);
}


// ========== PASSOS ==========
function irParaPasso(numero) {
  var passo3 = numero === 3;
  document.getElementById("passo3").classList.toggle("passo-ativo", passo3);
  document.getElementById("passo4").classList.toggle("passo-ativo", !passo3);
  document.getElementById("btnVoltar").classList.toggle("oculto", !passo3);

  var step3 = document.getElementById("step3");
  var step4 = document.getElementById("step4");
  step3.className = "stepper-item " + (passo3 ? "ativo" : "concluido");
  step3.querySelector(".stepper-circulo").innerHTML = passo3
    ? "3"
    : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  step4.className = "stepper-item" + (passo3 ? "" : " ativo");
  document.getElementById("line3").classList.toggle("concluida", !passo3);

  if (!passo3) {
    document.getElementById("txtDataAtual").textContent = formatarDataHora(consulta.data, consulta.hora);
    document.getElementById("txtDataNova").textContent = formatarDataHora(nova.data, nova.horario);
    ["Atual", "Nova"].forEach(function (s) {
      document.getElementById("txtMedico" + s).textContent = consulta.medico;
      document.getElementById("txtEsp" + s).textContent = consulta.especialidade;
    });
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function sair() {
  window.location.href = paginaVolta;
}


// grava a nova data para as telas de Inicio e Consultas usarem
function confirmar() {
  var d = nova.data;
  try {
    var salvas = JSON.parse(localStorage.getItem(CHAVE_REAGENDADAS) || "{}");
    salvas[consulta.id] = {
      dia: String(d.getDate()).padStart(2, "0"),
      mes: mesesAbreviados[d.getMonth()],
      ano: String(d.getFullYear()),
      hora: nova.horario
    };
    localStorage.setItem(CHAVE_REAGENDADAS, JSON.stringify(salvas));
  } catch (e) {}

  document.getElementById("btnConfirmar").disabled = true;
  document.getElementById("toast").classList.add("visivel");
  setTimeout(sair, 1800);
}


// ========== INICIALIZACAO ==========
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("txtBanner").textContent =
    "Reagendando consulta com " + consulta.medico + " — " + consulta.especialidade;

  // abre no mes da consulta atual, se ela ainda nao passou; senao no mes de hoje
  var base = consulta.data >= hoje() ? consulta.data : hoje();
  mesVisivel = new Date(base.getFullYear(), base.getMonth(), 1);

  renderizarCalendario();
  renderizarHorarios();

  document.getElementById("gradeDias").addEventListener("click", function (e) {
    var botao = e.target.closest(".dia");
    if (!botao || botao.disabled || botao.classList.contains("vazio")) return;
    nova.data = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth(), +botao.getAttribute("data-dia"));
    renderizarCalendario();
    renderizarHorarios();
  });

  document.getElementById("gradeHorarios").addEventListener("click", function (e) {
    var pill = e.target.closest(".pill-horario");
    if (!pill || pill.disabled) return;
    nova.horario = pill.getAttribute("data-horario");
    renderizarHorarios();
  });

  document.getElementById("btnMesAnterior").addEventListener("click", function () {
    mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() - 1, 1);
    renderizarCalendario();
  });
  document.getElementById("btnMesProximo").addEventListener("click", function () {
    mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 1);
    renderizarCalendario();
  });

  document.getElementById("btnAvancar").addEventListener("click", function () { irParaPasso(4); });
  document.getElementById("btnVoltarPasso").addEventListener("click", function () { irParaPasso(3); });
  document.getElementById("btnVoltar").addEventListener("click", sair);
  document.getElementById("btnFechar").addEventListener("click", sair);
  document.getElementById("btnConfirmar").addEventListener("click", confirmar);
});
