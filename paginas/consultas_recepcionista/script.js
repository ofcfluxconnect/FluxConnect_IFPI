// Consultas da recepcao: historico completo (passado, hoje e futuro) com filtros,
// paginacao e acoes (janela compartilhada agendamento_acoes.js).

var POR_PAGINA = 10;
var e = Recepcao.escapar;

var filtros = { busca: "", de: "", ate: "", medico: "", especialidade: "", status: "" };
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

function filtrarSemStatus() {
  var termo = filtros.busca;
  var numeros = termo.replace(/\D/g, "");
  return Recepcao.agendamentos().filter(function (a) {
    if (filtros.de && a.data < filtros.de) return false;
    if (filtros.ate && a.data > filtros.ate) return false;
    if (filtros.medico && a.medicoId !== filtros.medico) return false;
    if (filtros.especialidade && a.medico.especialidade !== filtros.especialidade) return false;
    if (termo) {
      var bate = a.paciente.nome.toLowerCase().includes(termo) || a.pacienteId.includes(termo) ||
        (numeros && a.paciente.cpf.replace(/\D/g, "").includes(numeros));
      if (!bate) return false;
    }
    return true;
  });
}

function renderizar() {
  var base = filtrarSemStatus();
  function contar(s) { return base.filter(function (a) { return a.status === s; }).length; }

  document.getElementById("numTotal").textContent = base.length;
  document.getElementById("numConfirmadas").textContent = contar("confirmada");
  document.getElementById("numRealizadas").textContent = contar("realizada");
  document.getElementById("numCanceladas").textContent = contar("cancelada");

  // mais recentes primeiro (futuro no topo)
  var lista = base.filter(function (a) { return !filtros.status || a.status === filtros.status; })
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
      <td class="celula-profissional">${e(a.medico.nome)} <span class="prof-esp">— ${e(a.medico.especialidade)}</span></td>
      <td>
        <span class="badge badge-${a.status}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconesStatus[a.status]}</svg> ${Recepcao.rotulosStatus[a.status]}</span>
        ${a.motivo ? `<p class="motivo">${e(a.motivo)}</p>` : ""}
      </td>
      <td><button type="button" class="btn-mais" data-abrir="${a.id}" title="Ações da consulta de ${e(a.paciente.nome)}" aria-label="Ações da consulta de ${e(a.paciente.nome)}, ${Recepcao.formatarData(a.data)} às ${a.hora}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button></td>
    </tr>`;
  }).join("") || '<tr><td colspan="5" class="tabela-vazia">Nenhuma consulta encontrada com esses filtros.</td></tr>';

  document.getElementById("txtContagem").textContent = lista.length + (lista.length === 1 ? " resultado" : " resultados");
  document.getElementById("txtExibindo").innerHTML = lista.length
    ? "Exibindo <strong>" + (inicio + 1) + "–" + (inicio + visiveis.length) + "</strong> de <strong>" + lista.length + "</strong> consultas"
    : "";
  renderizarPaginacao(totalPaginas);
}

// mostra no maximo 5 numeros de pagina em volta da atual
function renderizarPaginacao(total) {
  var nav = document.getElementById("paginacao");
  if (total <= 1) { nav.innerHTML = ""; return; }
  var ini = Math.max(1, Math.min(pagina - 2, total - 4));
  var fim = Math.min(total, ini + 4);
  var html = '<button type="button" class="pag" data-pag="' + (pagina - 1) + '" ' + (pagina === 1 ? "disabled" : "") + ' aria-label="Página anterior">‹</button>';
  for (var i = ini; i <= fim; i++) {
    html += '<button type="button" class="pag' + (i === pagina ? " ativa" : "") + '" data-pag="' + i + '"' + (i === pagina ? ' aria-current="page"' : "") + ">" + i + "</button>";
  }
  html += '<button type="button" class="pag" data-pag="' + (pagina + 1) + '" ' + (pagina === total ? "disabled" : "") + ' aria-label="Próxima página">›</button>';
  nav.innerHTML = html;
}

function preencherSelects() {
  document.getElementById("filtroMedico").innerHTML = '<option value="">Todos os profissionais</option>' +
    Recepcao.medicos().map(function (m) { return '<option value="' + m.id + '">' + e(m.nome) + "</option>"; }).join("");
  document.getElementById("filtroEspecialidade").innerHTML = '<option value="">Todas as especialidades</option>' +
    Recepcao.especialidades().map(function (s) { return "<option>" + s + "</option>"; }).join("");
}

function mudou() {
  pagina = 1;
  renderizar();
}

document.addEventListener("DOMContentLoaded", function () {
  preencherSelects();

  // periodo padrao: ultima semana ate as proximas duas semanas
  var hoje = Recepcao.hoje();
  filtros.de = Recepcao.iso(Recepcao.somarDias(hoje, -7));
  filtros.ate = Recepcao.iso(Recepcao.somarDias(hoje, 14));

  var q = new URLSearchParams(window.location.search);
  if (q.get("busca")) {
    filtros.busca = q.get("busca").toLowerCase().trim();
    document.getElementById("inputBusca").value = q.get("busca");
    filtros.de = ""; // buscando um paciente: mostra todo o historico dele
    filtros.ate = "";
  }
  document.getElementById("dataDe").value = filtros.de;
  document.getElementById("dataAte").value = filtros.ate;
  renderizar();

  document.getElementById("inputBusca").addEventListener("input", function (ev) {
    filtros.busca = ev.target.value.toLowerCase().trim();
    mudou();
  });
  document.getElementById("dataDe").addEventListener("change", function (ev) { filtros.de = ev.target.value; mudou(); });
  document.getElementById("dataAte").addEventListener("change", function (ev) { filtros.ate = ev.target.value; mudou(); });
  document.getElementById("btnLimparPeriodo").addEventListener("click", function () {
    filtros.de = filtros.ate = "";
    document.getElementById("dataDe").value = "";
    document.getElementById("dataAte").value = "";
    mudou();
  });
  document.getElementById("filtroMedico").addEventListener("change", function (ev) { filtros.medico = ev.target.value; mudou(); });
  document.getElementById("filtroEspecialidade").addEventListener("change", function (ev) { filtros.especialidade = ev.target.value; mudou(); });

  document.getElementById("filtrosStatus").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-status]");
    if (!b) return;
    document.querySelectorAll("#filtrosStatus .filtro").forEach(function (x) { x.classList.toggle("ativo", x === b); });
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
