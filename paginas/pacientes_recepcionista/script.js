// Gestao de pacientes da recepcao: lista, busca, filtro de cadastro completo/pendente,
// novo paciente e edicao (modal compartilhado paciente_cadastro_modal.js).

var e = Recepcao.escapar;
var filtroAtual = "todos";
var termoBusca = "";
var pacienteDoMenu = null;

var icone = {
  telefone: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  email: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  calendario: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  medico: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.6A2 2 0 1 0 3 6h3a2 2 0 1 0-1.8-3.4"/><path d="M4.5 6v5a5.5 5.5 0 0 0 11 0V6"/><path d="M19.5 13a2.5 2.5 0 1 0 0 5"/><path d="M22 15.5v2A4.5 4.5 0 0 1 17.5 22h-1A4.5 4.5 0 0 1 12 17.5"/></svg>',
  ok: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg>',
  alerta: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
};

// ultima consulta que aconteceu (realizada ou em andamento hoje)
function ultimasConsultas() {
  var mapa = {};
  var hoje = Recepcao.iso(Recepcao.hoje());
  Recepcao.agendamentos().forEach(function (a) {
    if (a.data > hoje) return;
    if (["realizada", "em-atendimento", "aguardando"].indexOf(a.status) === -1) return;
    var atual = mapa[a.pacienteId];
    if (!atual || (a.data + a.hora) > (atual.data + atual.hora)) mapa[a.pacienteId] = a;
  });
  return mapa;
}

// telefone e e-mail ausentes ja aparecem como "Nao informado" no contato;
// aqui so o que nao tem coluna propria (convenio e nascimento)
function faltaSemColuna(p) {
  var lista = [];
  if (!p.convenio) lista.push("convênio");
  if (!p.nascimento) lista.push("data de nascimento");
  return lista;
}

var NAO_INFORMADO = '<span class="falta-dado">Não informado</span>';

function renderizar() {
  var pacientes = Recepcao.pacientes();
  var completos = pacientes.filter(function (p) { return p.completo; }).length;

  document.getElementById("numTotal").textContent = pacientes.length;
  document.getElementById("numCompletos").textContent = completos;
  document.getElementById("numPendentes").textContent = pacientes.length - completos;
  document.getElementById("contTodos").textContent = pacientes.length;
  document.getElementById("contCompleto").textContent = completos;
  document.getElementById("contPendente").textContent = pacientes.length - completos;
  document.getElementById("subtituloPagina").innerHTML = "<strong>" + pacientes.length + "</strong> pacientes cadastrados nesta organização";

  var termo = termoBusca;
  var numeros = termo.replace(/\D/g, "");
  var ultimas = ultimasConsultas();

  var lista = pacientes.filter(function (p) {
    var bateFiltro = filtroAtual === "todos" || (filtroAtual === "completo" ? p.completo : !p.completo);
    var bateBusca = !termo || p.nome.toLowerCase().includes(termo) ||
      (numeros && (p.cpf.replace(/\D/g, "").includes(numeros) || (p.telefone || "").replace(/\D/g, "").includes(numeros)));
    return bateFiltro && bateBusca;
  }).sort(function (a, b) {
    var ua = ultimas[a.id], ub = ultimas[b.id];
    return ((ub ? ub.data + ub.hora : "") + "").localeCompare((ua ? ua.data + ua.hora : "") + "") || a.nome.localeCompare(b.nome);
  });

  document.getElementById("corpoTabela").innerHTML = lista.map(function (p) {
    var u = ultimas[p.id];
    var falta = faltaSemColuna(p);
    return `<tr>
      <td><div class="celula-pessoa">
        <span class="avatar-pessoa" style="background:${p.cor}">${Recepcao.iniciais(p.nome)}</span>
        <div>
          <p class="pessoa-nome">${e(p.nome)}</p>
          <p class="pessoa-sub">CPF: ${e(p.cpf)}</p>
          ${falta.length ? '<p class="falta-dado">Falta ' + falta.join(" e ") + "</p>" : ""}
        </div>
      </div></td>
      <td>
        <p class="linha-icone">${icone.telefone} ${p.telefone ? e(p.telefone) : NAO_INFORMADO}</p>
        <p class="linha-icone suave">${icone.email} ${p.email ? e(p.email) : NAO_INFORMADO}</p>
      </td>
      <td>${u
        ? `<p class="linha-icone">${icone.calendario} ${Recepcao.formatarData(u.data)}</p><p class="linha-icone suave">${icone.medico} ${e(u.medico.nome)}</p>`
        : '<span class="sem-consulta">Sem consultas</span>'}</td>
      <td><button type="button" class="btn-mais" data-mais="${p.id}" title="Ações de ${e(p.nome)}" aria-label="Ações de ${e(p.nome)}" aria-haspopup="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button></td>
    </tr>`;
  }).join("") || '<tr><td colspan="4" class="tabela-vazia">Nenhum paciente encontrado.</td></tr>';

  document.getElementById("txtContagem").textContent = lista.length + (lista.length === 1 ? " resultado" : " resultados");
}

function fecharMenu() {
  document.getElementById("menuAcoes").classList.remove("aberto");
}

// novo paciente ou edicao salva -> redesenha
window.aoCadastrarPaciente = function () { renderizar(); };

document.addEventListener("DOMContentLoaded", function () {
  var q = new URLSearchParams(window.location.search);
  if (q.get("busca")) {
    document.getElementById("inputBusca").value = q.get("busca");
    termoBusca = q.get("busca").toLowerCase().trim();
  }
  renderizar();
  if (q.get("foco") === "busca") document.getElementById("inputBusca").focus();

  document.getElementById("inputBusca").addEventListener("input", function (ev) {
    termoBusca = ev.target.value.toLowerCase().trim();
    renderizar();
  });

  document.getElementById("filtros").addEventListener("click", function (ev) {
    var b = ev.target.closest(".filtro");
    if (!b) return;
    document.querySelectorAll(".filtro").forEach(function (x) { x.classList.toggle("ativo", x === b); });
    filtroAtual = b.dataset.filtro;
    renderizar();
  });

  document.getElementById("corpoTabela").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-mais]");
    if (!b) return;
    ev.stopPropagation();
    pacienteDoMenu = b.dataset.mais;
    var menu = document.getElementById("menuAcoes");
    var r = b.getBoundingClientRect();
    menu.classList.add("aberto");
    menu.style.top = Math.min(r.bottom + 6, window.innerHeight - menu.offsetHeight - 8) + "px";
    menu.style.left = Math.max(8, r.right - menu.offsetWidth) + "px";
  });

  document.getElementById("menuAcoes").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-acao]");
    if (!b) return;
    var p = Recepcao.paciente(pacienteDoMenu);
    fecharMenu();
    if (b.dataset.acao === "editar") CadastroPaciente.abrir({ paciente: p, aoSalvar: renderizar });
    if (b.dataset.acao === "agendar") window.location.href = "../novo_agendamento_recepcionista/index.html?paciente=" + encodeURIComponent(p.id);
    if (b.dataset.acao === "consultas") window.location.href = "../consultas_recepcionista/index.html?busca=" + encodeURIComponent(p.nome);
  });

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".menu-acoes")) fecharMenu();
  });
  document.querySelector(".area-pagina").addEventListener("scroll", fecharMenu);
});
