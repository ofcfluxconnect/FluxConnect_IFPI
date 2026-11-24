// Novo agendamento da recepcao (5 passos).
// Parametros de URL aceitos:
//   ?paciente=<id>                       -> paciente ja escolhido
//   ?medico=<id>&data=AAAA-MM-DD&hora=HH:MM -> vindo de um espaco livre da grade
//   ?reagendar=<id do agendamento>       -> remarca (move) a consulta; se ela estava
//                                           cancelada ou com falta, cria uma nova
//   &encaixe=1                           -> ja marca como encaixe

var PAGINA_AGENDA = "../agenda_recepcionista/index.html";
var meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
var e = Recepcao.escapar;

var estado = {
  passo: 1,
  paciente: null,
  especialidade: "",
  medico: null,
  data: null,   // AAAA-MM-DD
  hora: "",
  reagendar: null
};
var mesVisivel = new Date(Recepcao.hoje().getFullYear(), Recepcao.hoje().getMonth(), 1);


function hojeISO() {
  return Recepcao.iso(Recepcao.hoje());
}

function horaAtual() {
  var d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function horariosLivres(medicoId, data) {
  return Recepcao.horarios().filter(function (h) {
    if (data === hojeISO() && h <= horaAtual()) return false;
    return !Recepcao.horarioOcupado(medicoId, data, h, estado.reagendar && estado.reagendar.id);
  });
}

function passoCompleto(n) {
  if (n === 1) return !!estado.paciente;
  if (n === 2) return !!estado.especialidade;
  if (n === 3) return !!estado.medico;
  if (n === 4) return !!(estado.data && estado.hora);
  return true;
}


// ========== NAVEGACAO ==========
function irPara(n) {
  estado.passo = n;
  document.querySelectorAll(".passo").forEach(function (p) { p.classList.toggle("ativo", +p.dataset.passo === n); });
  document.querySelectorAll("#stepper li").forEach(function (li) {
    var i = +li.dataset.passo;
    li.classList.toggle("ativo", i === n);
    li.classList.toggle("concluido", i < n);
    li.querySelector(".circulo").innerHTML = i < n
      ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : i;
    if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
  });

  document.getElementById("txtPasso").textContent = "Passo " + n + " de 5";
  document.getElementById("btnVoltar").disabled = n === 1;
  document.getElementById("txtProximo").textContent = n === 5 ? (estado.reagendar && !criaNovoAoRemarcar() ? "Confirmar remarcação" : "Confirmar agendamento") : "Próximo";

  if (n === 1) renderizarPacientes();
  if (n === 2) renderizarEspecialidades();
  if (n === 3) renderizarMedicos();
  if (n === 4) { renderizarCalendario(); renderizarHorarios(); }
  if (n === 5) renderizarResumo();
  atualizarBotao();
}

function atualizarBotao() {
  document.getElementById("btnProximo").disabled = !passoCompleto(estado.passo);
}


// ========== PASSO 1 ==========
function renderizarPacientes() {
  var termo = document.getElementById("buscaPaciente").value.toLowerCase().trim();
  var numeros = termo.replace(/\D/g, "");
  var lista = Recepcao.pacientes().filter(function (p) {
    return !termo || p.nome.toLowerCase().includes(termo) || (numeros && p.cpf.replace(/\D/g, "").includes(numeros));
  }).sort(function (a, b) { return a.nome.localeCompare(b.nome); });

  document.getElementById("listaPacientes").innerHTML = lista.map(function (p) {
    var sel = estado.paciente && estado.paciente.id === p.id;
    return `<li><button type="button" class="opcao${sel ? " selecionada" : ""}" role="option" aria-selected="${sel}" data-paciente="${p.id}">
      <span class="avatar-pessoa avatar-claro">${Recepcao.iniciais(p.nome)}</span>
      <span><span class="pessoa-nome" style="display:block">${e(p.nome)}</span>
      <span class="pessoa-sub" style="display:block">CPF: ${e(p.cpf)} · ${e(p.convenio || "Sem convênio")}</span></span>
      <svg class="check-opcao" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg>
    </button></li>`;
  }).join("") || '<li class="lista-vazia">Nenhum paciente encontrado. Cadastre um novo paciente abaixo.</li>';
}


// ========== PASSO 2 ==========
var iconesEspecialidade = {
  "Clínica Geral": '<path d="M4.8 2.6A2 2 0 1 0 3 6h3a2 2 0 1 0-1.8-3.4"/><path d="M4.5 6v5a5.5 5.5 0 0 0 11 0V6"/><path d="M19.5 13a2.5 2.5 0 1 0 0 5"/><path d="M22 15.5v2A4.5 4.5 0 0 1 17.5 22h-1A4.5 4.5 0 0 1 12 17.5"/>',
  "Cardiologia": '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  "Ortopedia": '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>',
  "Psicologia": '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>'
};

function renderizarEspecialidades() {
  document.getElementById("listaEspecialidades").innerHTML = Recepcao.especialidades().map(function (esp) {
    var qtd = Recepcao.medicos().filter(function (m) { return m.especialidade === esp; }).length;
    var sel = esp === estado.especialidade;
    return `<button type="button" class="opcao-card${sel ? " selecionada" : ""}" role="option" aria-selected="${sel}" data-esp="${esp}">
      <span class="icone-opcao"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconesEspecialidade[esp]}</svg></span>
      <span class="pessoa-nome">${esp}</span>
      <span class="pessoa-sub">${qtd} ${qtd === 1 ? "profissional" : "profissionais"}</span>
    </button>`;
  }).join("");
}


// ========== PASSO 3 ==========
// proximo dia com horario livre para o medico (a partir de hoje)
function proximoLivre(medicoId) {
  for (var i = 0; i < 60; i++) {
    var data = Recepcao.iso(Recepcao.somarDias(Recepcao.hoje(), i));
    var livres = horariosLivres(medicoId, data);
    if (livres.length) return { data: data, hora: livres[0], dias: i };
  }
  return null;
}

function renderizarMedicos() {
  var medicos = Recepcao.medicos().filter(function (m) { return m.especialidade === estado.especialidade; });
  document.getElementById("subProfissional").textContent = "Profissionais de " + estado.especialidade + ".";
  document.getElementById("listaMedicos").innerHTML = medicos.map(function (m) {
    var prox = proximoLivre(m.id);
    var quando = !prox ? "Sem horários nos próximos dias" :
      prox.dias === 0 ? "Hoje às " + prox.hora : prox.dias === 1 ? "Amanhã às " + prox.hora : Recepcao.formatarData(prox.data) + " às " + prox.hora;
    var sel = estado.medico && estado.medico.id === m.id;
    return `<li><button type="button" class="opcao${sel ? " selecionada" : ""}" role="option" aria-selected="${sel}" data-medico="${m.id}">
      <span class="avatar-pessoa" style="background:${m.cor}">${Recepcao.iniciais(m.nome)}</span>
      <span><span class="pessoa-nome" style="display:block">${e(m.nome)}</span>
      <span class="pessoa-sub" style="display:block">${e(m.especialidade)} · Próximo horário livre: ${quando}</span></span>
      <svg class="check-opcao" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg>
    </button></li>`;
  }).join("");
}


// ========== PASSO 4 ==========
function renderizarCalendario() {
  var ano = mesVisivel.getFullYear();
  var mes = mesVisivel.getMonth();
  var hoje = Recepcao.hoje();
  document.getElementById("txtMes").textContent = meses[mes] + " " + ano;
  document.getElementById("btnMesAnterior").disabled = ano === hoje.getFullYear() && mes === hoje.getMonth();
  document.getElementById("subDataHora").textContent = "Agenda de " + estado.medico.nome + ".";

  var html = "";
  var inicioSemana = new Date(ano, mes, 1).getDay();
  for (var v = 0; v < inicioSemana; v++) html += "<span></span>";
  var total = new Date(ano, mes + 1, 0).getDate();
  for (var d = 1; d <= total; d++) {
    var data = new Date(ano, mes, d);
    var dataISO = Recepcao.iso(data);
    var disponivel = data >= hoje && horariosLivres(estado.medico.id, dataISO).length > 0;
    var feriado = window.obterFeriado ? obterFeriado(data) : null;
    var classes = "dia";
    if (!disponivel) classes += " indisponivel";
    if (feriado) classes += " feriado";
    if (dataISO === hojeISO()) classes += " hoje";
    if (dataISO === estado.data) classes += " selecionado";
    var titulo = feriado ? descreverFeriado(feriado) : (data >= hoje && !disponivel ? "Agenda cheia" : "");
    html += `<button type="button" class="${classes}" data-data="${dataISO}" ${disponivel ? "" : "disabled"} title="${titulo}">${d}</button>`;
  }
  document.getElementById("gradeDias").innerHTML = html;
}

function renderizarHorarios() {
  var grade = document.getElementById("gradeHorarios");
  var aviso = document.getElementById("avisoFeriado");
  if (!estado.data) {
    document.getElementById("tituloHorarios").textContent = "Horários";
    grade.innerHTML = '<p class="sem-horario">Escolha um dia no calendário.</p>';
    aviso.hidden = true;
    return;
  }
  var livres = horariosLivres(estado.medico.id, estado.data);
  if (livres.indexOf(estado.hora) === -1) estado.hora = "";
  document.getElementById("tituloHorarios").textContent = "Horários em " + Recepcao.formatarData(estado.data);
  grade.innerHTML = Recepcao.horarios().map(function (h) {
    var livre = livres.indexOf(h) !== -1;
    return `<button type="button" class="pill${h === estado.hora ? " selecionado" : ""}" data-hora="${h}" ${livre ? "" : "disabled"} title="${livre ? "" : "Ocupado ou já passou"}">${h}</button>`;
  }).join("");

  var feriado = window.obterFeriado ? obterFeriado(Recepcao.lerISO(estado.data)) : null;
  aviso.hidden = !feriado;
  if (feriado) aviso.textContent = descreverFeriado(feriado) + ". Confirme o funcionamento da clínica.";
  atualizarBotao();
}


// ========== PASSO 5 ==========
function criaNovoAoRemarcar() {
  return estado.reagendar && (estado.reagendar.status === "cancelada" || estado.reagendar.status === "falta");
}

function renderizarResumo() {
  var p = estado.paciente;
  var linhas = [
    ["Paciente", p.nome + " · CPF " + p.cpf],
    ["Convênio", p.convenio || "Sem convênio"],
    ["Especialidade", estado.especialidade],
    ["Profissional", estado.medico.nome],
    ["Data e hora", Recepcao.formatarData(estado.data) + " às " + estado.hora]
  ];
  if (estado.reagendar) {
    linhas.push(["Antes", Recepcao.formatarData(estado.reagendar.data) + " às " + estado.reagendar.hora + " · " + estado.reagendar.medico.nome]);
  }
  document.getElementById("resumo").innerHTML = linhas.map(function (l) {
    return "<div><dt>" + l[0] + "</dt><dd>" + e(l[1]) + "</dd></div>";
  }).join("");

  // sugere "Retorno" se o paciente ja foi atendido por este medico
  if (!estado.reagendar) {
    var jaFoi = Recepcao.agendamentos().some(function (a) {
      return a.pacienteId === p.id && a.medicoId === estado.medico.id && a.status === "realizada";
    });
    document.getElementById("tipoConsulta").value = jaFoi ? "Retorno" : "Primeira vez";
  }
}

function confirmar() {
  var dados = {
    data: estado.data,
    hora: estado.hora,
    medicoId: estado.medico.id,
    tipo: document.getElementById("tipoConsulta").value,
    status: document.getElementById("statusConsulta").value,
    encaixe: document.getElementById("encaixe").checked
  };

  if (Recepcao.horarioOcupado(dados.medicoId, dados.data, dados.hora, estado.reagendar && estado.reagendar.id)) {
    RecepcaoUI.toast("Horário indisponível", "Esse horário acabou de ser ocupado. Escolha outro.", "erro");
    return irPara(4);
  }

  if (estado.reagendar && !criaNovoAoRemarcar()) {
    Recepcao.atualizarAgendamento(estado.reagendar.id, Object.assign(dados, { motivo: "" }));
    RecepcaoUI.toast("Consulta remarcada", estado.paciente.nome + " · " + Recepcao.formatarData(dados.data) + " às " + dados.hora);
  } else {
    Recepcao.criarAgendamento(Object.assign(dados, { pacienteId: estado.paciente.id }));
    RecepcaoUI.toast("Agendamento confirmado", estado.paciente.nome + " · " + Recepcao.formatarData(dados.data) + " às " + dados.hora);
  }

  document.getElementById("btnProximo").disabled = true;
  setTimeout(function () { window.location.href = PAGINA_AGENDA + "?data=" + dados.data; }, 1500);
}


// ========== INICIALIZACAO ==========
function lerParametros() {
  var q = new URLSearchParams(window.location.search);
  var inicio = 1;

  var reagendar = q.get("reagendar") && Recepcao.agendamento(q.get("reagendar"));
  if (reagendar) {
    estado.reagendar = reagendar;
    estado.paciente = reagendar.paciente;
    estado.especialidade = reagendar.medico.especialidade;
    estado.medico = reagendar.medico;
    document.getElementById("tipoConsulta").value = reagendar.tipo;
    var aviso = document.getElementById("avisoReagendar");
    aviso.hidden = false;
    aviso.textContent = (criaNovoAoRemarcar() ? "Novo agendamento para " : "Remarcando a consulta de ") + reagendar.paciente.nome +
      " (" + Recepcao.formatarData(reagendar.data) + " às " + reagendar.hora + " · " + reagendar.medico.nome + ").";
    document.getElementById("tituloPagina").textContent = "Remarcar Consulta";
    inicio = 4;
  }

  var paciente = q.get("paciente") && Recepcao.paciente(q.get("paciente"));
  if (paciente) {
    estado.paciente = paciente;
    inicio = Math.max(inicio, 2);
  }

  var medico = q.get("medico") && Recepcao.medico(q.get("medico"));
  if (medico) {
    estado.medico = medico;
    estado.especialidade = medico.especialidade;
    var data = q.get("data");
    if (data && /^\d{4}-\d{2}-\d{2}$/.test(data) && data >= hojeISO()) {
      estado.data = data;
      mesVisivel = new Date(+data.slice(0, 4), +data.slice(5, 7) - 1, 1);
      var hora = q.get("hora");
      if (hora && horariosLivres(medico.id, data).indexOf(hora) !== -1) estado.hora = hora;
    }
    // com o horario escolhido na grade, so falta o paciente
    estado.horarioDaGrade = !!estado.hora;
    inicio = estado.paciente ? (estado.hora ? 5 : 4) : 1;
  }

  if (q.get("encaixe") === "1") document.getElementById("encaixe").checked = true;
  return inicio;
}

// depois de cadastrar pelo modal, o paciente novo ja fica escolhido
window.aoCadastrarPaciente = function (p) {
  estado.paciente = p;
  document.getElementById("buscaPaciente").value = "";
  renderizarPacientes();
  atualizarBotao();
};

document.addEventListener("DOMContentLoaded", function () {
  var inicio = lerParametros();
  irPara(inicio);

  document.getElementById("buscaPaciente").addEventListener("input", renderizarPacientes);

  document.getElementById("listaPacientes").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-paciente]");
    if (!b) return;
    estado.paciente = Recepcao.paciente(b.dataset.paciente);
    renderizarPacientes();
    atualizarBotao();
  });
  document.getElementById("listaPacientes").addEventListener("dblclick", function (ev) {
    if (ev.target.closest("[data-paciente]") && passoCompleto(1)) irPara(2);
  });

  document.getElementById("listaEspecialidades").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-esp]");
    if (!b) return;
    if (estado.especialidade !== b.dataset.esp) {
      estado.especialidade = b.dataset.esp;
      estado.medico = null;
      estado.data = null;
      estado.hora = "";
    }
    irPara(3); // escolher a especialidade ja avanca
  });

  document.getElementById("listaMedicos").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-medico]");
    if (!b) return;
    var medico = Recepcao.medico(b.dataset.medico);
    if (!estado.medico || estado.medico.id !== medico.id) {
      estado.medico = medico;
      estado.hora = "";
      // abre o calendario no proximo dia livre
      var prox = proximoLivre(medico.id);
      estado.data = prox ? prox.data : null;
      if (prox) mesVisivel = new Date(+prox.data.slice(0, 4), +prox.data.slice(5, 7) - 1, 1);
    }
    irPara(4);
  });

  document.getElementById("gradeDias").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-data]");
    if (!b || b.disabled) return;
    estado.data = b.dataset.data;
    renderizarCalendario();
    renderizarHorarios();
  });
  document.getElementById("gradeHorarios").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-hora]");
    if (!b || b.disabled) return;
    estado.hora = b.dataset.hora;
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

  document.getElementById("btnVoltar").addEventListener("click", function () {
    if (estado.passo > 1) irPara(estado.passo - 1);
  });
  document.getElementById("btnProximo").addEventListener("click", function () {
    if (!passoCompleto(estado.passo)) return;
    // veio de um espaco livre da grade: depois do paciente vai direto para a confirmacao
    if (estado.passo === 1 && estado.horarioDaGrade && passoCompleto(4)) return irPara(5);
    if (estado.passo < 5) irPara(estado.passo + 1);
    else confirmar();
  });
});
