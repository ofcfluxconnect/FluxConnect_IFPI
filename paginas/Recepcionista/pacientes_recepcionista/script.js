// Gestao de pacientes da recepcao: lista paginada, busca, filtros (cadastro completo/pendente
// e convenio), painel de pendencias, novo paciente e edicao (modal compartilhado
// paciente_cadastro_modal.js).

var POR_PAGINA = 5;
var MAX_PENDENCIAS = 4; // quantas aparecem no painel lateral
var e = Recepcao.escapar;

var filtroAtual = "todos";
var filtroConvenio = "";
var termoBusca = "";
var pagina = 1;
var pacienteDoMenu = null;

function svg(desenho, tamanho) {
  return '<svg width="' + tamanho + '" height="' + tamanho + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + desenho + "</svg>";
}

var icone = {
  telefone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>', 16),
  email: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>', 16),
  calendario: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 16),
  medico: svg('<path d="M4.8 2.6A2 2 0 1 0 3 6h3a2 2 0 1 0-1.8-3.4"/><path d="M4.5 6v5a5.5 5.5 0 0 0 11 0V6"/><path d="M19.5 13a2.5 2.5 0 1 0 0 5"/><path d="M22 15.5v2A4.5 4.5 0 0 1 17.5 22h-1A4.5 4.5 0 0 1 12 17.5"/>', 16),
  ok: svg('<circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/>', 14),
  alerta: svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', 14),
  alertaGrande: svg('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', 24),
  seta: svg('<polyline points="9 6 15 12 9 18"/>', 20)
};

var NAO_INFORMADO = '<span class="falta-dado">Não informado</span>';

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

// o que falta no cadastro do paciente (para a tabela e o painel de pendencias)
function dadosFaltando(p) {
  var lista = [];
  if (!p.telefone) lista.push("telefone");
  if (!p.email) lista.push("e-mail");
  if (!p.convenio) lista.push("convênio");
  if (!p.nascimento) lista.push("data de nascimento");
  return lista;
}

function motivoPendencia(p) {
  var falta = dadosFaltando(p);
  if (falta.length > 1) return "Falta " + falta.join(" e ");
  var textos = {
    "telefone": "Telefone ausente",
    "e-mail": "E-mail não informado",
    "convênio": "Convênio não informado",
    "data de nascimento": "Data de nascimento ausente"
  };
  return textos[falta[0]] || "Dados incompletos";
}

// Graficos dos cards: evolucao do cadastro nos ultimos 6 meses (linha).
// Cada ponto e quantos pacientes ja estavam cadastrados ate o fim daquele mes;
// o ultimo ponto (hoje) e sempre o numero mostrado no card.
function desenharGraficos(pacientes) {
  var nomesMes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  var hoje = Recepcao.hoje();
  var pontos = [];
  for (var m = 5; m >= 1; m--) {
    var fimDoMes = new Date(hoje.getFullYear(), hoje.getMonth() - m + 1, 0); // ultimo dia do mes
    pontos.push({ ate: Recepcao.iso(fimDoMes), rotulo: "Até " + nomesMes[fimDoMes.getMonth()] + "/" + String(fimDoMes.getFullYear()).slice(2) });
  }
  pontos.push({ ate: Recepcao.iso(hoje), rotulo: "Hoje" });

  function serie(filtro) {
    return pontos.map(function (ponto) {
      return pacientes.filter(function (p) { return p.cadastradoEm <= ponto.ate && filtro(p); }).length;
    });
  }
  var opcoes = { rotulos: pontos.map(function (x) { return x.rotulo; }), unidade: ["paciente", "pacientes"] };
  RecepcaoComp.grafico(document.getElementById("grafTotal"), serie(function () { return true; }), opcoes);
  RecepcaoComp.grafico(document.getElementById("grafCompletos"), serie(function (p) { return p.completo; }), opcoes);
  RecepcaoComp.grafico(document.getElementById("grafPendentes"), serie(function (p) { return !p.completo; }), opcoes);
}

function renderizarPendencias(pacientes) {
  var pendentes = pacientes.filter(function (p) { return !p.completo; })
    .sort(function (a, b) { return a.nome.localeCompare(b.nome); });

  document.getElementById("pendTotal").textContent = pendentes.length;
  document.getElementById("listaPendencias").innerHTML = pendentes.slice(0, MAX_PENDENCIAS).map(function (p) {
    return `<li><button type="button" class="pend-item" data-pendencia="${p.id}" title="Completar cadastro de ${e(p.nome)}">
      ${icone.alertaGrande}
      <span><span class="pend-nome">${e(p.nome)}</span><span class="pend-motivo">${e(motivoPendencia(p))}</span></span>
      ${icone.seta}
    </button></li>`;
  }).join("") || '<li class="pend-vazio">Nenhum cadastro pendente. Tudo em dia!</li>';
  document.getElementById("btnVerPendencias").disabled = !pendentes.length;
}

function renderizar() {
  var pacientes = Recepcao.pacientes();
  var completos = pacientes.filter(function (p) { return p.completo; }).length;
  var pendentes = pacientes.length - completos;

  document.getElementById("numTotal").textContent = pacientes.length;
  document.getElementById("numCompletos").textContent = completos;
  document.getElementById("numPendentes").textContent = String(pendentes).padStart(2, "0");
  document.getElementById("subCompletos").textContent = pacientes.length
    ? (completos / pacientes.length * 100).toFixed(1).replace(".", ",") + "% do total"
    : "";
  document.getElementById("contTodos").textContent = pacientes.length;
  document.getElementById("contCompleto").textContent = completos;
  document.getElementById("contPendente").textContent = pendentes;

  var termo = termoBusca;
  var numeros = termo.replace(/\D/g, "");
  var ultimas = ultimasConsultas();

  var lista = pacientes.filter(function (p) {
    var bateFiltro = filtroAtual === "todos" || (filtroAtual === "completo" ? p.completo : !p.completo);
    var bateConvenio = !filtroConvenio || (filtroConvenio === "sem" ? !p.convenio : p.convenio === filtroConvenio);
    var bateBusca = !termo || p.nome.toLowerCase().includes(termo) ||
      (numeros && (p.cpf.replace(/\D/g, "").includes(numeros) || (p.telefone || "").replace(/\D/g, "").includes(numeros)));
    return bateFiltro && bateConvenio && bateBusca;
  }).sort(function (a, b) {
    var ua = ultimas[a.id], ub = ultimas[b.id];
    return ((ub ? ub.data + ub.hora : "") + "").localeCompare((ua ? ua.data + ua.hora : "") + "") || a.nome.localeCompare(b.nome);
  });

  var totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  pagina = Math.min(pagina, totalPaginas);
  var inicio = (pagina - 1) * POR_PAGINA;
  var visiveis = lista.slice(inicio, inicio + POR_PAGINA);

  document.getElementById("corpoTabela").innerHTML = visiveis.map(function (p) {
    var u = ultimas[p.id];
    return `<tr>
      <td><div class="celula-pessoa">
        <span class="avatar-pessoa" style="background:${p.cor}">${Recepcao.iniciais(p.nome)}</span>
        <div>
          <p class="pessoa-nome">${e(p.nome)}</p>
          ${p.convenio ? '<p class="pessoa-sub">' + e(p.convenio) + "</p>" : '<p class="falta-dado">Sem convênio informado</p>'}
        </div>
      </div></td>
      <td><span class="cpf-mascarado">${e(RecepcaoComp.mascararCpf(p.cpf))}</span></td>
      <td>
        <p class="linha-icone">${icone.telefone} ${p.telefone ? e(p.telefone) : NAO_INFORMADO}</p>
        <p class="linha-icone suave">${icone.email} ${p.email ? e(p.email) : NAO_INFORMADO}</p>
      </td>
      <td>${u
        ? `<p class="linha-icone">${icone.calendario} ${Recepcao.formatarData(u.data)}</p><p class="linha-icone suave">${icone.medico} ${e(u.medico.nome)}</p>`
        : '<span class="sem-consulta">Sem consultas</span>'}</td>
      <td>${p.completo
        ? '<span class="badge badge-completo">' + icone.ok + " Completo</span>"
        : '<span class="badge badge-incompleto" title="' + e(motivoPendencia(p)) + '">' + icone.alerta + " Pendente</span>"}</td>
      <td class="col-acoes"><button type="button" class="btn-mais" data-mais="${p.id}" title="Ações de ${e(p.nome)}" aria-label="Ações de ${e(p.nome)}" aria-haspopup="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
      </button></td>
    </tr>`;
  }).join("") || '<tr><td colspan="6" class="tabela-vazia">Nenhum paciente encontrado.</td></tr>';

  document.getElementById("txtContagem").textContent = lista.length + (lista.length === 1 ? " registro" : " registros");
  document.getElementById("txtExibindo").innerHTML = lista.length
    ? "Mostrando <strong>" + (inicio + 1) + "–" + (inicio + visiveis.length) + "</strong> de <strong>" + lista.length + "</strong> pacientes"
    : "";
  RecepcaoComp.paginacao(document.getElementById("paginacao"), pagina, totalPaginas);

  renderizarPendencias(pacientes);
  desenharGraficos(pacientes);
}

function mudou() {
  pagina = 1;
  renderizar();
}

function escolherFiltro(nome) {
  filtroAtual = nome;
  document.querySelectorAll("#filtros .filtro").forEach(function (x) { x.classList.toggle("ativo", x.dataset.filtro === nome); });
  mudou();
}

function fecharMenu() {
  document.getElementById("menuAcoes").classList.remove("aberto");
}

function editar(id) {
  CadastroPaciente.abrir({ paciente: Recepcao.paciente(id), aoSalvar: renderizar });
}

// ---------- excluir paciente ----------
var pacienteParaExcluir = null;

function abrirExcluir(id) {
  var p = Recepcao.paciente(id);
  if (!p) return;
  pacienteParaExcluir = id;
  var hoje = Recepcao.iso(Recepcao.hoje());
  var futuras = Recepcao.agendamentos().filter(function (a) {
    return a.pacienteId === id && a.data >= hoje && (a.status === "pendente" || a.status === "confirmada");
  }).length;

  document.getElementById("excluirSub").textContent = p.nome + " · CPF " + RecepcaoComp.mascararCpf(p.cpf);
  document.getElementById("excluirTexto").textContent =
    "O paciente sai da lista e da busca. As consultas e os exames que já existem continuam no histórico, sem o nome do paciente.";
  var aviso = document.getElementById("excluirAviso");
  aviso.hidden = !futuras;
  aviso.textContent = futuras
    ? "Atenção: este paciente tem " + futuras + (futuras === 1 ? " consulta marcada" : " consultas marcadas") +
      (futuras === 1 ? ". Ela continua" : ". Elas continuam") + " na agenda como \"Paciente removido\" — cancele antes, se for o caso."
    : "";
  document.getElementById("modalExcluir").classList.add("visivel");
  document.getElementById("btnConfirmarExcluir").focus();
}

function fecharExcluir() {
  document.getElementById("modalExcluir").classList.remove("visivel");
  pacienteParaExcluir = null;
}

function confirmarExcluir() {
  var id = pacienteParaExcluir;
  var p = Recepcao.paciente(id);
  if (!p) return fecharExcluir();
  if (!Recepcao.excluirPaciente(id)) {
    return RecepcaoUI.toast("Não foi possível excluir", "O armazenamento do navegador está cheio.", "erro");
  }
  fecharExcluir();
  renderizar();
  mostrarDesfazer(id, p.nome);
}

// aviso com "Desfazer" por alguns segundos depois de excluir
var timerDesfazer = null;

function mostrarDesfazer(id, nome) {
  var barra = document.getElementById("barraDesfazer");
  if (!barra) {
    barra = document.createElement("div");
    barra.id = "barraDesfazer";
    barra.className = "barra-desfazer";
    barra.setAttribute("role", "status");
    document.body.appendChild(barra);
  }
  barra.innerHTML = '<span></span><button type="button">Desfazer</button>';
  barra.querySelector("span").textContent = "Paciente excluído: " + nome + ".";
  barra.querySelector("button").onclick = function () {
    Recepcao.restaurarPaciente(id);
    barra.classList.remove("visivel");
    renderizar();
    RecepcaoUI.toast("Exclusão desfeita", nome + " voltou para a lista.");
  };
  barra.classList.add("visivel");
  clearTimeout(timerDesfazer);
  timerDesfazer = setTimeout(function () { barra.classList.remove("visivel"); }, 8000);
}

// novo paciente ou edicao salva -> redesenha
window.aoCadastrarPaciente = function () { renderizar(); };

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("filtroConvenio").innerHTML = '<option value="">Todos os convênios</option>' +
    Recepcao.convenios().map(function (c) { return "<option>" + e(c) + "</option>"; }).join("") +
    '<option value="sem">Sem convênio informado</option>';

  var q = new URLSearchParams(window.location.search);
  if (q.get("busca")) {
    document.getElementById("inputBusca").value = q.get("busca");
    termoBusca = q.get("busca").toLowerCase().trim();
  }
  renderizar();
  if (q.get("foco") === "busca") document.getElementById("inputBusca").focus();

  document.getElementById("inputBusca").addEventListener("input", function (ev) {
    termoBusca = ev.target.value.toLowerCase().trim();
    mudou();
  });

  document.getElementById("filtroConvenio").addEventListener("change", function (ev) {
    filtroConvenio = ev.target.value;
    mudou();
  });

  document.getElementById("filtros").addEventListener("click", function (ev) {
    var b = ev.target.closest(".filtro");
    if (b) escolherFiltro(b.dataset.filtro);
  });

  document.getElementById("paginacao").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-pag]");
    if (!b || b.disabled) return;
    pagina = +b.dataset.pag;
    renderizar();
  });

  // painel de pendencias: clicar no paciente abre o cadastro para completar
  document.getElementById("listaPendencias").addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-pendencia]");
    if (b) editar(b.dataset.pendencia);
  });
  document.getElementById("btnVerPendencias").addEventListener("click", function () {
    escolherFiltro("pendente");
    document.getElementById("tituloLista").scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    if (b.dataset.acao === "editar") editar(p.id);
    if (b.dataset.acao === "agendar") window.location.href = "../novo_agendamento_recepcionista/index.html?paciente=" + encodeURIComponent(p.id);
    if (b.dataset.acao === "consultas") window.location.href = "../consultas_recepcionista/index.html?busca=" + encodeURIComponent(p.nome);
    if (b.dataset.acao === "excluir") abrirExcluir(p.id);
  });

  var modalExcluir = document.getElementById("modalExcluir");
  modalExcluir.addEventListener("click", function (ev) {
    if (ev.target === modalExcluir || ev.target.closest("[data-fechar-excluir]")) fecharExcluir();
  });
  document.getElementById("btnConfirmarExcluir").addEventListener("click", confirmarExcluir);
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && modalExcluir.classList.contains("visivel")) fecharExcluir();
  });

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".menu-acoes")) fecharMenu();
  });
  document.querySelector(".area-pagina").addEventListener("scroll", fecharMenu);
});
