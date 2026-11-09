// Resultados de exames que o profissional solicitou (mock).
// Abrir um laudo marca o resultado como lido; isso fica salvo no navegador.

var CHAVE_LIDOS = "fluxconnect_resultados_lidos";

var resultados = [
  {
    id: "r1", data: "24/06/2026", hora: "14:32", paciente: "Maria Luiza Fernandes", cpf: "012.345.678-90", cor: "#1e5bb8",
    exame: "Hemograma Completo", categoria: "Hematologia", lab: "Lab FluxLab", novo: false,
    parametros: [["Hemoglobina", "13,8 g/dL", "12,0 – 16,0"], ["Leucócitos", "6.900 /mm³", "4.000 – 11.000"], ["Plaquetas", "245.000 /mm³", "150.000 – 450.000"]],
    conclusao: "Hemograma dentro dos valores de referência."
  },
  {
    id: "r2", data: "24/06/2026", hora: "11:15", paciente: "Carlos Eduardo Silva", cpf: "123.456.789-01", cor: "#7c3aed",
    exame: "Eletrocardiograma", categoria: "Cardiologia", lab: "Centro de Imagem FluxScan", novo: true,
    parametros: [["Ritmo", "Sinusal", "Sinusal"], ["Frequência cardíaca", "92 bpm", "60 – 100"], ["Intervalo PR", "0,16 s", "0,12 – 0,20"]],
    conclusao: "ECG com ritmo sinusal. Discreta alteração de repolarização ventricular; correlacionar com a clínica."
  },
  {
    id: "r3", data: "23/06/2026", hora: "16:48", paciente: "Fernanda Costa", cpf: "234.567.890-12", cor: "#0f766e",
    exame: "TSH / T4 Livre", categoria: "Endocrinologia", lab: "FluxDiagnósticos", novo: true,
    parametros: [["TSH", "6,2 µUI/mL", "0,4 – 4,0", true], ["T4 livre", "0,9 ng/dL", "0,8 – 1,8"]],
    conclusao: "TSH acima do valor de referência com T4 livre normal. Sugere hipotireoidismo subclínico."
  },
  {
    id: "r4", data: "23/06/2026", hora: "09:20", paciente: "João Paulo Ramos", cpf: "345.678.901-23", cor: "#b45309",
    exame: "Raio-X de Tórax", categoria: "Radiologia", lab: "Centro de Imagem FluxScan", novo: false,
    parametros: [["Campos pulmonares", "Sem alterações", "—"], ["Área cardíaca", "Normal", "—"]],
    conclusao: "Exame radiológico do tórax sem alterações significativas."
  },
  {
    id: "r5", data: "22/06/2026", hora: "15:00", paciente: "Beatriz Oliveira", cpf: "456.789.012-34", cor: "#be185d",
    exame: "Colesterol Total e Frações", categoria: "Bioquímica", lab: "Lab FluxLab", novo: false,
    parametros: [["Colesterol total", "212 mg/dL", "< 190", true], ["HDL", "52 mg/dL", "> 40"], ["LDL", "138 mg/dL", "< 130", true], ["Triglicerídeos", "110 mg/dL", "< 150"]],
    conclusao: "Colesterol total e LDL levemente elevados."
  },
  {
    id: "r6", data: "22/06/2026", hora: "10:30", paciente: "Ricardo Souza", cpf: "567.890.123-45", cor: "#4338ca",
    exame: "Urina Tipo 1 + Urocultura", categoria: "Microbiologia", lab: "FluxDiagnósticos", novo: false,
    parametros: [["Leucócitos", "3 /campo", "até 5"], ["Nitrito", "Negativo", "Negativo"], ["Urocultura", "Sem crescimento", "Negativa"]],
    conclusao: "Exame de urina sem alterações. Urocultura negativa."
  },
  {
    id: "r7", data: "21/06/2026", hora: "13:45", paciente: "Patrícia Alves", cpf: "678.901.234-56", cor: "#047857",
    exame: "Glicemia em Jejum + HbA1c", categoria: "Endocrinologia", lab: "Lab FluxLab", novo: false,
    parametros: [["Glicemia em jejum", "104 mg/dL", "70 – 99", true], ["HbA1c", "5,9 %", "< 5,7", true]],
    conclusao: "Valores compatíveis com pré-diabetes."
  },
  {
    id: "r8", data: "20/06/2026", hora: "08:55", paciente: "Marcos Teixeira", cpf: "789.012.345-67", cor: "#b91c1c",
    exame: "Creatinina e Ureia", categoria: "Nefrologia", lab: "FluxDiagnósticos", novo: false,
    parametros: [["Creatinina", "1,0 mg/dL", "0,7 – 1,3"], ["Ureia", "34 mg/dL", "15 – 45"]],
    conclusao: "Função renal preservada."
  }
];

var filtroAtual = "todos";
var termoBusca = "";

var icones = {
  relogio: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  olho: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
};


function iniciais(nome) {
  var p = nome.split(" ");
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

// aplica o que ja foi lido em visitas anteriores
function carregarLidos() {
  try {
    var lidos = JSON.parse(localStorage.getItem(CHAVE_LIDOS) || "[]");
    resultados.forEach(function (r) { if (lidos.indexOf(r.id) !== -1) r.novo = false; });
  } catch (e) {}
}

function marcarLido(r) {
  if (!r.novo) return;
  r.novo = false;
  try {
    var lidos = JSON.parse(localStorage.getItem(CHAVE_LIDOS) || "[]");
    lidos.push(r.id);
    localStorage.setItem(CHAVE_LIDOS, JSON.stringify(lidos));
  } catch (e) {}
}


function renderizarContadores() {
  var novos = resultados.filter(function (r) { return r.novo; }).length;
  var total = resultados.length;

  document.getElementById("numNovos").textContent = novos;
  document.getElementById("numLidos").textContent = total - novos;
  document.getElementById("numTotal").textContent = total;
  document.getElementById("contTodos").textContent = total;
  document.getElementById("contNaoLidos").textContent = novos;
  document.getElementById("contLidos").textContent = total - novos;
  document.getElementById("txtTotalTopo").textContent = total;

  var badge = document.getElementById("badgeNovos");
  badge.textContent = novos + (novos === 1 ? " novo" : " novos");
  badge.hidden = novos === 0;
}

function renderizarTabela() {
  var lista = resultados.filter(function (r) {
    var bateFiltro = filtroAtual === "todos" || (filtroAtual === "nao-lidos" ? r.novo : !r.novo);
    var bateBusca = !termoBusca ||
      r.paciente.toLowerCase().includes(termoBusca) ||
      r.exame.toLowerCase().includes(termoBusca) ||
      r.categoria.toLowerCase().includes(termoBusca);
    return bateFiltro && bateBusca;
  });

  var html = lista.map(function (r) {
    var acao = r.novo
      ? `<button type="button" class="btn-laudo btn-laudo-novo" data-id="${r.id}">${icones.olho} Ver laudo</button>`
      : `<button type="button" class="btn-laudo" data-id="${r.id}">${icones.olho} Visualizar</button>`;
    return `
      <tr class="${r.novo ? "linha-nova" : ""}">
        <td class="col-ponto">${r.novo ? '<i class="ponto-novo" title="Novo resultado"></i>' : ""}</td>
        <td><p class="data-lib">${r.data}</p><p class="hora-lib">${icones.relogio} ${r.hora}</p></td>
        <td>
          <div class="paciente-celula">
            <span class="avatar-tabela" style="background:${r.cor}">${iniciais(r.paciente)}</span>
            <div><p class="paciente-nome">${r.paciente}</p><p class="paciente-cpf">CPF: ${r.cpf}</p></div>
          </div>
        </td>
        <td class="exame-nome">${r.exame}</td>
        <td><span class="tag-categoria">${r.categoria}</span></td>
        <td>${acao}</td>
      </tr>`;
  }).join("");

  document.getElementById("corpoTabela").innerHTML =
    html || '<tr><td colspan="6" class="tabela-vazia">Nenhum resultado encontrado.</td></tr>';
  document.getElementById("txtContagem").textContent = lista.length + (lista.length === 1 ? " resultado" : " resultados");
  document.getElementById("txtExibindo").textContent = "Exibindo " + lista.length + " de " + resultados.length + " resultados";
}

function renderizar() {
  renderizarContadores();
  renderizarTabela();
}


function abrirLaudo(id) {
  var r = resultados.find(function (x) { return x.id === id; });
  if (!r) return;

  document.getElementById("laudoExame").textContent = r.exame;
  document.getElementById("laudoPaciente").textContent = r.paciente + " · CPF " + r.cpf;
  document.getElementById("laudoData").textContent = r.data + " às " + r.hora;
  document.getElementById("laudoCategoria").textContent = r.categoria;
  document.getElementById("laudoLab").textContent = r.lab;
  document.getElementById("laudoConclusao").textContent = r.conclusao;
  document.getElementById("laudoParametros").innerHTML = r.parametros.map(function (p) {
    // p[3] = true quando o valor esta fora da referencia
    return `<tr class="${p[3] ? "fora-referencia" : ""}"><td>${p[0]}</td><td>${p[1]}${p[3] ? " ▲" : ""}</td><td>${p[2]}</td></tr>`;
  }).join("");

  marcarLido(r);
  renderizar();
  document.getElementById("modalLaudo").classList.add("visivel");
}

function fecharLaudo() {
  document.getElementById("modalLaudo").classList.remove("visivel");
}


document.addEventListener("DOMContentLoaded", function () {
  carregarLidos();

  // vindo do prontuario: ?busca=<nome do paciente> ja filtra a tabela
  var busca = new URLSearchParams(window.location.search).get("busca");
  if (busca) {
    document.getElementById("inputBusca").value = busca;
    termoBusca = busca.toLowerCase().trim();
  }

  renderizar();

  document.getElementById("filtros").addEventListener("click", function (e) {
    var botao = e.target.closest(".filtro");
    if (!botao) return;
    document.querySelectorAll(".filtro").forEach(function (b) { b.classList.toggle("ativo", b === botao); });
    filtroAtual = botao.getAttribute("data-filtro");
    renderizarTabela();
  });

  document.getElementById("inputBusca").addEventListener("input", function (e) {
    termoBusca = e.target.value.toLowerCase().trim();
    renderizarTabela();
  });

  document.getElementById("corpoTabela").addEventListener("click", function (e) {
    var botao = e.target.closest(".btn-laudo");
    if (botao) abrirLaudo(botao.getAttribute("data-id"));
  });

  var modal = document.getElementById("modalLaudo");
  modal.querySelectorAll("[data-fechar-laudo]").forEach(function (b) { b.addEventListener("click", fecharLaudo); });
  modal.addEventListener("click", function (e) { if (e.target === modal) fecharLaudo(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharLaudo(); });
  document.getElementById("btnImprimir").addEventListener("click", function () { window.print(); });
});
