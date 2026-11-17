// Lista de prontuarios da clinica. Os dados vem de compartilhado/pacientes_profissional.js
// e o botao "Abrir" usa o modal de historico (compartilhado/prontuario_modal.js).

var PAGINA_ATENDIMENTO = "../atendimento_profissional/index.html";
var PAGINA_RESULTADOS = "../resultados_profissional/index.html";

var pacientes = [];
var filtroAtual = "todos";
var ordemAtual = "visita";
var termoBusca = "";
var pacienteDoMenu = null;

var rotulosOrdem = { visita: "Última visita", nome: "Nome (A-Z)", alertas: "Mais alertas" };
var iconeAlerta = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';


function diasDesdeVisita(p) {
  return p.ultimaVisita ? PacientesProfissional.diasDesde(p.ultimaVisita) : Infinity;
}

// "recente" = atendido hoje ou ontem
function ehRecente(p) {
  return diasDesdeVisita(p) <= 1;
}

function escapar(texto) {
  return String(texto).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}


function renderizarContadores() {
  var comAlertas = pacientes.filter(function (p) { return p.temAlertas; }).length;
  var recentes = pacientes.filter(ehRecente).length;
  var hoje = pacientes.filter(function (p) { return diasDesdeVisita(p) === 0; }).length;

  document.getElementById("numTotal").textContent = pacientes.length;
  document.getElementById("numAlertas").textContent = comAlertas;
  document.getElementById("numHoje").textContent = hoje;
  document.getElementById("contTodos").textContent = pacientes.length;
  document.getElementById("contRecentes").textContent = recentes;
  document.getElementById("contAlertas").textContent = comAlertas;
  document.getElementById("txtTotalTopo").textContent = pacientes.length;
}

function listaFiltrada() {
  var termo = termoBusca;
  var numeros = termo.replace(/\D/g, "");

  var lista = pacientes.filter(function (p) {
    var bateFiltro = filtroAtual === "todos" ||
      (filtroAtual === "recentes" && ehRecente(p)) ||
      (filtroAtual === "alertas" && p.temAlertas);
    var bateBusca = !termo ||
      p.nome.toLowerCase().includes(termo) ||
      (numeros && (p.cpf.replace(/\D/g, "").includes(numeros) || p.id.includes(numeros)));
    return bateFiltro && bateBusca;
  });

  lista.sort(function (a, b) {
    if (ordemAtual === "nome") return a.nome.localeCompare(b.nome);
    if (ordemAtual === "alertas") {
      var diff = (b.alergias.length + b.condicoes.length) - (a.alergias.length + a.condicoes.length);
      return diff || a.nome.localeCompare(b.nome);
    }
    return diasDesdeVisita(a) - diasDesdeVisita(b) || a.nome.localeCompare(b.nome);
  });

  return lista;
}

function renderizarTabela() {
  var lista = listaFiltrada();

  var html = lista.map(function (p) {
    var visita = p.ultimaVisita
      ? `<p class="visita-data">${PacientesProfissional.formatarData(p.ultimaVisita)}</p><p class="visita-rel">${PacientesProfissional.textoRelativo(diasDesdeVisita(p))}</p>`
      : '<p class="visita-rel">Sem visitas</p>';

    var cid = p.ultimaCid
      ? `<p class="cid">${escapar(p.ultimaCid)}</p><p class="especialidade">${escapar(p.ultimaEspecialidade)}</p>`
      : '<p class="especialidade">—</p>';

    var tags = p.alergias.map(function (a) {
      return '<span class="tag tag-alergia">' + iconeAlerta + " " + escapar(a) + "</span>";
    }).concat(p.condicoes.map(function (c) {
      return '<span class="tag">' + escapar(c) + "</span>";
    })).join("") || '<span class="sem-tags">Nenhuma registrada</span>';

    return `
      <tr>
        <td>
          <div class="paciente-celula">
            <span class="avatar-tabela" style="background:${p.cor}">${PacientesProfissional.iniciais(p.nome)}</span>
            <div class="paciente-textos">
              <p class="paciente-nome" title="${escapar(p.nome)}">${escapar(p.nome)}</p>
              <p class="paciente-cpf">CPF: ${p.cpf} · #${p.id}</p>
            </div>
          </div>
        </td>
        <td>${visita}</td>
        <td>${cid}</td>
        <td><div class="tags">${tags}</div></td>
        <td>
          <div class="acoes">
            <button type="button" class="btn-abrir" data-abrir="${p.id}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>
              Abrir
            </button>
            <button type="button" class="btn-mais" data-mais="${p.id}" title="Mais ações" aria-haspopup="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  document.getElementById("corpoTabela").innerHTML =
    html || '<tr><td colspan="5" class="tabela-vazia">Nenhum prontuário encontrado.</td></tr>';
  document.getElementById("txtContagem").textContent = lista.length + (lista.length === 1 ? " resultado" : " resultados");
  document.getElementById("txtExibindo").textContent = "Exibindo " + lista.length + " de " + pacientes.length + " prontuários";
}


// ---------- menus ----------
function fecharMenus() {
  document.getElementById("menuAcoes").classList.remove("aberto");
  document.getElementById("opcoesOrdenar").classList.remove("aberto");
  document.getElementById("btnOrdenar").setAttribute("aria-expanded", "false");
}

function abrirMenuAcoes(botao, id) {
  var menu = document.getElementById("menuAcoes");
  var r = botao.getBoundingClientRect();
  pacienteDoMenu = id;
  menu.classList.add("aberto");
  var largura = menu.offsetWidth;
  menu.style.top = (r.bottom + 6) + "px";
  menu.style.left = Math.max(8, r.right - largura) + "px";
}


document.addEventListener("DOMContentLoaded", function () {
  pacientes = PacientesProfissional.todos();
  renderizarContadores();
  renderizarTabela();

  document.getElementById("filtros").addEventListener("click", function (e) {
    var botao = e.target.closest(".filtro");
    if (!botao) return;
    document.querySelectorAll(".filtro").forEach(function (b) { b.classList.toggle("ativo", b === botao); });
    filtroAtual = botao.dataset.filtro;
    renderizarTabela();
  });

  document.getElementById("inputBusca").addEventListener("input", function (e) {
    termoBusca = e.target.value.toLowerCase().trim();
    renderizarTabela();
  });

  document.getElementById("btnOrdenar").addEventListener("click", function (e) {
    e.stopPropagation();
    var opcoes = document.getElementById("opcoesOrdenar");
    var abrir = !opcoes.classList.contains("aberto");
    fecharMenus();
    opcoes.classList.toggle("aberto", abrir);
    this.setAttribute("aria-expanded", String(abrir));
  });

  document.getElementById("opcoesOrdenar").addEventListener("click", function (e) {
    var opcao = e.target.closest("[data-ordem]");
    if (!opcao) return;
    ordemAtual = opcao.dataset.ordem;
    document.getElementById("txtOrdem").textContent = rotulosOrdem[ordemAtual];
    fecharMenus();
    renderizarTabela();
  });

  document.getElementById("corpoTabela").addEventListener("click", function (e) {
    var abrir = e.target.closest("[data-abrir]");
    if (abrir) return ProntuarioModal.abrir(abrir.dataset.abrir);

    var mais = e.target.closest("[data-mais]");
    if (mais) {
      e.stopPropagation();
      fecharMenus();
      abrirMenuAcoes(mais, mais.dataset.mais);
    }
  });

  document.getElementById("menuAcoes").addEventListener("click", function (e) {
    var acao = e.target.closest("[data-acao]");
    if (!acao || !pacienteDoMenu) return;
    var p = PacientesProfissional.obter(pacienteDoMenu);
    if (acao.dataset.acao === "atender") {
      window.location.href = PAGINA_ATENDIMENTO + "?id=" + encodeURIComponent(p.id);
    } else {
      window.location.href = PAGINA_RESULTADOS + "?busca=" + encodeURIComponent(p.nome);
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".menu-acoes") && !e.target.closest(".menu-ordenar")) fecharMenus();
  });
  document.querySelector(".area-prontuarios").addEventListener("scroll", fecharMenus);
  window.addEventListener("resize", fecharMenus);
});
