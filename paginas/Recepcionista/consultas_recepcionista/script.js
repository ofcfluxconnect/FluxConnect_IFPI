// Consultas da recepcao: historico completo (passado, hoje e futuro) com busca,
// periodo, situacao, paginacao e acoes (janela compartilhada agendamento_acoes.js).
// A busca acha paciente (nome, codigo ou CPF), profissional e especialidade.

var POR_PAGINA = 8;
var e = Recepcao.escapar;

var filtros = { busca: "", de: "", ate: "", status: "" };
var pagina = 1;

var relogio = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
var iconesStatus = {
  pendente: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  confirmada: '<circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/>',
  realizada: '<circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/>',
  cancelada: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  falta: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  aguardando: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  "em-atendimento": '<path d="M4.8 2.6A2 2 0 1 0 3 6h3a2 2 0 1 0-1.8-3.4"/><path d="M4.5 6v5a5.5 5.5 0 0 0 11 0V6"/>'
};

// "cardiologia" acha "Cardiologia"; "joao" acha "João"
function semAcento(texto) {
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// o filtro "Canceladas e faltas" junta as duas situacoes
function bateStatus(a) {
  if (!filtros.status) return true;
  if (filtros.status === "cancelada") return a.status === "cancelada" || a.status === "falta";
  return a.status === filtros.status;
}

// transforma a opcao do seletor de periodo nas datas "de" e "ate"
function aplicarPeriodo(opcao) {
  var hoje = Recepcao.hoje();
  function dia(n) { return Recepcao.iso(Recepcao.somarDias(hoje, n)); }
  var periodos = {
    recentes: [dia(-7), dia(14)], // ultima semana ate as proximas duas
    hoje: [dia(0), dia(0)],
    futuras: [dia(0), ""],
    "30dias": [dia(-30), dia(0)],
    tudo: ["", ""]
  };
  var p = periodos[opcao] || periodos.recentes;
  filtros.de = p[0];
  filtros.ate = p[1];
}

function filtrarSemStatus() {
  var termo = semAcento(filtros.busca);
  var numeros = termo.replace(/\D/g, "");
  return Recepcao.agendamentos().filter(function (a) {
    if (filtros.de && a.data < filtros.de) return false;
    if (filtros.ate && a.data > filtros.ate) return false;
    if (termo) {
      var bate = semAcento(a.paciente.nome + " " + a.medico.nome + " " + a.medico.especialidade).includes(termo) ||
        a.pacienteId.includes(termo) || (numeros && a.paciente.cpf.replace(/\D/g, "").includes(numeros));
      if (!bate) return false;
    }
    return true;
  });
}

function porcento(parte, total) {
  return total ? (parte / total * 100).toFixed(1).replace(".", ",") + "% do total" : "";
}

// Graficos dos cards: consultas por dia dentro do que esta filtrado
// (total, confirmadas, realizadas e canceladas).
function desenharGraficos(base) {
  var porDia = {};
  base.forEach(function (a) { (porDia[a.data] = porDia[a.data] || []).push(a.status); });
  var dias = Object.keys(porDia).sort();
  function serie(status) {
    return dias.map(function (d) {
      return status ? porDia[d].filter(function (s) { return s === status; }).length : porDia[d].length;
    });
  }
  // a soma dos pontos de cada grafico e o numero mostrado no card
  var porDiaOpcoes = { rotulos: dias.map(RecepcaoComp.diaMes), unidade: ["consulta", "consultas"] };
  RecepcaoComp.grafico(document.getElementById("grafTotal"), serie(""), porDiaOpcoes);
  RecepcaoComp.grafico(document.getElementById("grafConfirmadas"), serie("confirmada"), porDiaOpcoes);
  RecepcaoComp.grafico(document.getElementById("grafRealizadas"), serie("realizada"), porDiaOpcoes);
  RecepcaoComp.grafico(document.getElementById("grafCanceladas"), serie("cancelada"), porDiaOpcoes);
}

function renderizar() {
  var base = filtrarSemStatus();
  function contar(s) { return base.filter(function (a) { return a.status === s; }).length; }

  document.getElementById("numTotal").textContent = base.length;
  ["Confirmadas", "Realizadas", "Canceladas"].forEach(function (nome) {
    var qtd = contar(nome.toLowerCase().slice(0, -1));
    document.getElementById("num" + nome).textContent = qtd;
    document.getElementById("sub" + nome).textContent = porcento(qtd, base.length);
  });
  desenharGraficos(base);

  // mais recentes primeiro (futuro no topo)
  var lista = base.filter(bateStatus)
    .sort(function (a, b) { return (b.data + b.hora).localeCompare(a.data + a.hora); });

  var totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  pagina = Math.min(pagina, totalPaginas);
  var inicio = (pagina - 1) * POR_PAGINA;
  var visiveis = lista.slice(inicio, inicio + POR_PAGINA);

  document.getElementById("corpoTabela").innerHTML = visiveis.map(function (a) {
    var apagada = a.status === "falta" || a.status === "cancelada";
    return `<tr class="${apagada ? "linha-apagada" : ""}">
      <td><p class="texto-forte">${Recepcao.formatarData(a.data)}</p><p class="texto-suave com-icone">${relogio} ${a.hora}</p></td>
      <td><div class="celula-pessoa">
        <span class="avatar-pessoa" style="background:${a.paciente.cor}">${Recepcao.iniciais(a.paciente.nome)}</span>
        <div><p class="pessoa-nome">${e(a.paciente.nome)}</p><p class="pessoa-sub">CPF: ${e(a.paciente.cpf)}</p></div>
      </div></td>
      <td class="celula-profissional">${e(a.medico.nome)}</td>
      <td>${e(a.medico.especialidade)}</td>
      <td>
        <span class="badge badge-${a.status}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconesStatus[a.status]}</svg> ${Recepcao.rotulosStatus[a.status]}</span>
        ${a.motivo ? `<p class="motivo">${e(a.motivo)}</p>` : ""}
      </td>
      <td class="col-acoes"><button type="button" class="btn-mais" data-abrir="${a.id}" title="Ações da consulta de ${e(a.paciente.nome)}" aria-label="Ações da consulta de ${e(a.paciente.nome)}, ${Recepcao.formatarData(a.data)} às ${a.hora}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button></td>
    </tr>`;
  }).join("") || '<tr><td colspan="6" class="tabela-vazia">Nenhuma consulta encontrada com esses filtros.</td></tr>';

  document.getElementById("txtExibindo").innerHTML = lista.length
    ? "Mostrando <strong>" + (inicio + 1) + "–" + (inicio + visiveis.length) + "</strong> de <strong>" + lista.length + "</strong> consultas"
    : "";
  RecepcaoComp.paginacao(document.getElementById("paginacao"), pagina, totalPaginas);
}

function mudou() {
  pagina = 1;
  renderizar();
}

document.addEventListener("DOMContentLoaded", function () {
  var seletorPeriodo = document.getElementById("filtroPeriodo");
  aplicarPeriodo("recentes");

  var q = new URLSearchParams(window.location.search);
  if (q.get("busca")) {
    filtros.busca = q.get("busca").toLowerCase().trim();
    document.getElementById("inputBusca").value = q.get("busca");
    seletorPeriodo.value = "tudo"; // buscando um paciente: mostra todo o historico dele
    aplicarPeriodo("tudo");
  }
  renderizar();

  document.getElementById("inputBusca").addEventListener("input", function (ev) {
    filtros.busca = ev.target.value.toLowerCase().trim();
    mudou();
  });
  seletorPeriodo.addEventListener("change", function (ev) {
    aplicarPeriodo(ev.target.value);
    mudou();
  });

  document.getElementById("filtrosStatus").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-status]");
    if (!b) return;
    document.querySelectorAll("#filtrosStatus .filtro").forEach(function (x) {
      x.classList.toggle("ativo", x === b);
      x.setAttribute("aria-pressed", x === b);
    });
    filtros.status = b.dataset.status;
    mudou();
  });

  document.getElementById("paginacao").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-pag]");
    if (!b || b.disabled) return;
    pagina = +b.dataset.pag;
    renderizar();
  });

  document.getElementById("corpoTabela").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-abrir]");
    if (b) AgendamentoAcoes.abrir(b.dataset.abrir, renderizar);
  });
});
