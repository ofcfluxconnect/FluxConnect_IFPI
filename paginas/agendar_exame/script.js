// exames das sugestoes rapidas, com icone e preparo
var catalogoExames = [
  {
    nome: "Hemograma",
    icone: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    preparo: [
      "Jejum de 8 horas.",
      "Ingerir apenas água.",
      "Não consumir bebidas alcoólicas 24h antes.",
      "Evitar exercícios físicos intensos no dia anterior.",
      "Levar documento oficial com foto."
    ]
  },
  {
    nome: "Ultrassom",
    icone: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    preparo: [
      "Jejum de 8 horas para exames do abdômen.",
      "No dia anterior, evite alimentos gordurosos e bebidas gaseificadas.",
      "Para exames pélvicos, chegue com a bexiga cheia.",
      "Levar documento oficial com foto."
    ]
  },
  {
    nome: "Ressonância",
    icone: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
    preparo: [
      "Jejum de 4 horas.",
      "Retire objetos metálicos (joias, piercings, relógio).",
      "Informe se tiver marca-passo, implantes ou próteses metálicas.",
      "Levar exames anteriores e documento oficial com foto."
    ]
  },
  {
    nome: "Raio-X",
    icone: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
    preparo: [
      "Não é necessário jejum.",
      "Retire objetos metálicos da região do exame.",
      "Informe se houver possibilidade de gravidez.",
      "Levar documento oficial com foto."
    ]
  },
  {
    nome: "Tomografia",
    icone: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
    preparo: [
      "Jejum de 4 horas.",
      "Informe se tiver alergia a contraste.",
      "Informe se houver possibilidade de gravidez.",
      "Levar exames anteriores e documento oficial com foto."
    ]
  },
  {
    nome: "Mamografia",
    icone: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    preparo: [
      "Não use desodorante, talco ou creme nas mamas e axilas no dia do exame.",
      "Prefira agendar fora do período pré-menstrual.",
      "Levar mamografias anteriores, se tiver.",
      "Levar documento oficial com foto."
    ]
  }
];

// preparo usado quando o exame e digitado livremente
var preparoPadrao = [
  "Siga as orientações do seu pedido médico.",
  "O laboratório entrará em contato caso seja necessário algum preparo específico.",
  "Levar documento oficial com foto."
];

var laboratorios = [
  { id: "lab-1", nome: "Laboratório Municipal", rua: "Rua Defala Attem, 822", cidade: "Floriano - PI", distancia: "1,2 km", nota: "4,8" },
  { id: "lab-2", nome: "Posto de coleta — UBS Centro", rua: "Rua Defala Attem, 812", cidade: "Floriano - PI", distancia: "2,5 km", nota: "4,9" },
  { id: "lab-3", nome: "Posto de coleta — UBS Bairro Norte", rua: "Rua Principal, 899", cidade: "Floriano - PI", distancia: "3,8 km", nota: "4,7" },
  { id: "lab-4", nome: "Posto de coleta — UBS Bairro Sul", rua: "Avenida Central, 1234", cidade: "Floriano - PI", distancia: "4,2 km", nota: "4,6" }
];

var horarios = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "15:00", "16:00"];

var meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// data de hoje (sem horas), recalculada a cada uso para o calendario nunca ficar desatualizado
function hoje() {
  var agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

// dados escolhidos pelo paciente
var agendamento = {
  exame: null,       // item do catalogo ou { nome, preparo } digitado
  arquivo: null,
  laboratorio: null,
  data: null,        // objeto Date
  horario: null
};

var passoAtual = 1;
var mesVisivel = new Date(hoje().getFullYear(), hoje().getMonth(), 1);

var iconeCheck = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg>';
var iconeLocal = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';


// "30 de junho de 2026"
function formatarData(data) {
  return data.getDate() + " de " + meses[data.getMonth()].toLowerCase() + " de " + data.getFullYear();
}

function mesmoDia(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}


// ========== NAVEGACAO ENTRE PASSOS ==========
function irParaPasso(numero) {
  passoAtual = numero;

  for (var i = 1; i <= 4; i++) {
    var step = document.getElementById("step" + i);
    var circulo = step.querySelector(".stepper-circulo");
    var linha = document.getElementById("line" + (i - 1));

    step.classList.remove("ativo", "concluido");
    if (i < numero) {
      step.classList.add("concluido");
      circulo.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      if (i === numero) step.classList.add("ativo");
      circulo.textContent = i;
    }
    if (linha) linha.classList.toggle("concluida", i <= numero);

    document.getElementById("passo" + i).classList.toggle("passo-ativo", i === numero);
  }

  var btn = document.getElementById("btnAcao");
  if (numero === 4) {
    btn.innerHTML = iconeCheck + " Confirmar Agendamento de Exame";
  } else {
    btn.textContent = "Avançar";
  }

  if (numero === 2) renderizarLaboratorios();
  if (numero === 3) {
    renderizarCalendario();
    renderizarHorarios();
  }
  if (numero === 4) preencherRevisao();

  atualizarBotao();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// so libera o Avancar quando o passo atual esta completo
function atualizarBotao() {
  var completo = true;
  if (passoAtual === 1) completo = !!agendamento.exame;
  if (passoAtual === 2) completo = !!agendamento.laboratorio;
  if (passoAtual === 3) completo = !!(agendamento.data && agendamento.horario);
  document.getElementById("btnAcao").disabled = !completo;
}

// volta para a tela anterior do site (ou para o inicio)
function sairDoFluxo() {
  if (document.referrer && history.length > 1) {
    history.back();
  } else {
    window.location.href = "../tela_principal_paciente/index.html";
  }
}


// ========== PASSO 1: EXAME ==========
function renderizarSugestoes() {
  var grade = document.getElementById("gradeSugestoes");
  var html = "";

  catalogoExames.forEach(function (exame) {
    var selecionado = agendamento.exame === exame;
    html += `
      <button type="button" class="card-sugestao ${selecionado ? "selecionado" : ""}" data-nome="${exame.nome}">
        <span class="icone-sugestao">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${exame.icone}</svg>
        </span>
        <span class="nome-sugestao">${exame.nome}</span>
        <span class="check-sugestao">${iconeCheck}</span>
      </button>
    `;
  });

  grade.innerHTML = html;
}

function configurarPasso1() {
  var input = document.getElementById("inputBuscaExame");
  var grade = document.getElementById("gradeSugestoes");

  renderizarSugestoes();

  // clicar numa sugestao seleciona o exame e preenche a busca
  grade.addEventListener("click", function (e) {
    var card = e.target.closest(".card-sugestao");
    if (!card) return;
    var nome = card.getAttribute("data-nome");
    agendamento.exame = catalogoExames.find(function (ex) { return ex.nome === nome; });
    input.value = nome;
    filtrarSugestoes("");
    renderizarSugestoes();
    atualizarBotao();
  });

  // digitar filtra as sugestoes; um nome livre tambem vale como exame
  input.addEventListener("input", function () {
    var termo = input.value.trim();
    var termoMin = termo.toLowerCase();

    var encontrado = catalogoExames.find(function (ex) {
      return termoMin && termoMin.indexOf(ex.nome.toLowerCase()) === 0;
    });

    if (encontrado) {
      agendamento.exame = encontrado;
    } else if (termo.length >= 3) {
      agendamento.exame = { nome: termo, preparo: preparoPadrao };
    } else {
      agendamento.exame = agendamento.arquivo ? exameDoPedido() : null;
    }

    renderizarSugestoes();
    filtrarSugestoes(termoMin);
    atualizarBotao();
  });

  // upload do pedido medico (fica so no navegador, sem envio)
  document.getElementById("inputArquivo").addEventListener("change", function (e) {
    var arquivo = e.target.files[0];
    if (!arquivo) return;
    agendamento.arquivo = arquivo.name;

    document.getElementById("areaUpload").classList.add("com-arquivo");
    document.getElementById("uploadTitulo").textContent = "Pedido médico anexado";
    document.getElementById("uploadTexto").textContent = arquivo.name;
    document.getElementById("btnSelecionarArquivo").textContent = "Trocar Arquivo";

    if (!agendamento.exame) agendamento.exame = exameDoPedido();
    atualizarBotao();
  });
}

function exameDoPedido() {
  return { nome: "Conforme pedido médico", preparo: preparoPadrao };
}

// esconde as sugestoes que nao batem com o texto
function filtrarSugestoes(termo) {
  document.querySelectorAll(".card-sugestao").forEach(function (card) {
    var nome = card.getAttribute("data-nome").toLowerCase();
    var bate = !termo || nome.indexOf(termo) !== -1 || termo.indexOf(nome) !== -1;
    card.classList.toggle("oculto", !bate);
  });
}


// ========== PASSO 2: LABORATORIO ==========
function renderizarLaboratorios() {
  var lista = document.getElementById("listaLaboratorios");
  var html = "";

  laboratorios.forEach(function (lab) {
    var selecionado = agendamento.laboratorio === lab;
    html += `
      <button type="button" class="card-laboratorio ${selecionado ? "selecionado" : ""}" data-id="${lab.id}">
        <span class="icone-laboratorio">${iconeLocal}</span>
        <span class="info-laboratorio">
          <span class="nome-laboratorio">${lab.nome}</span>
          <span class="endereco-laboratorio">${lab.rua}</span>
          <span class="endereco-laboratorio">${lab.cidade}</span>
          <span class="meta-laboratorio">
            <span class="meta-item">${iconeLocal} ${lab.distancia}</span>
            <span class="meta-item"><span class="estrela">&#9733;</span> <strong>${lab.nota}</strong></span>
            <span class="badge-disponivel">Disponível</span>
          </span>
        </span>
        <span class="check-laboratorio">${iconeCheck}</span>
      </button>
    `;
  });

  lista.innerHTML = html;
}

function configurarPasso2() {
  document.getElementById("listaLaboratorios").addEventListener("click", function (e) {
    var card = e.target.closest(".card-laboratorio");
    if (!card) return;
    var id = card.getAttribute("data-id");
    agendamento.laboratorio = laboratorios.find(function (l) { return l.id === id; });
    renderizarLaboratorios();
    atualizarBotao();
  });
}


// ========== PASSO 3: DATA E HORARIO ==========
// todos os dias a partir de hoje podem ser escolhidos, sem limite de meses
function renderizarCalendario() {
  var ano = mesVisivel.getFullYear();
  var mes = mesVisivel.getMonth();
  var dataHoje = hoje();

  document.getElementById("txtMesAno").textContent = meses[mes] + " " + ano;
  document.getElementById("btnMesAnterior").disabled = ano === dataHoje.getFullYear() && mes === dataHoje.getMonth();

  // comeca no domingo da primeira semana do mes
  var inicio = new Date(ano, mes, 1 - new Date(ano, mes, 1).getDay());
  var html = "";

  for (var i = 0; i < 42; i++) {
    var dia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);

    // nao mostra a ultima linha se ela for toda do proximo mes
    if (i === 35 && dia.getMonth() !== mes) break;

    var classes = "dia";
    var disponivel = dia >= dataHoje && horariosLivres(dia).length > 0;
    var feriado = obterFeriado(dia);
    var titulo = feriado ? descreverFeriado(feriado) : "";

    if (dia.getMonth() !== mes) classes += " outro-mes";
    if (mesmoDia(dia, dataHoje)) {
      classes += " hoje";
      titulo = titulo ? "Hoje · " + titulo : "Hoje";
    }
    if (feriado) classes += " feriado";
    if (!disponivel) classes += " desabilitado";
    if (mesmoDia(dia, agendamento.data)) classes += " selecionado";

    html += `<button type="button" class="${classes}" ${disponivel ? "" : "disabled"} title="${titulo}" data-data="${dia.getFullYear()}-${dia.getMonth()}-${dia.getDate()}">${dia.getDate()}</button>`;
  }

  document.getElementById("gradeDias").innerHTML = html;
}

// horarios que ainda nao passaram (so muda quando a data e hoje)
function horariosLivres(data) {
  if (!mesmoDia(data, hoje())) return horarios;
  var agora = new Date();
  var minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  return horarios.filter(function (h) {
    var partes = h.split(":");
    return +partes[0] * 60 + +partes[1] > minutosAgora;
  });
}

function renderizarHorarios() {
  var area = document.getElementById("areaHorarios");

  if (!agendamento.data) {
    area.className = "area-horarios vazio";
    area.innerHTML = "<p>Selecione uma data primeiro</p>";
  } else {
    var livres = horariosLivres(agendamento.data);
    if (livres.indexOf(agendamento.horario) === -1) agendamento.horario = null;

    area.className = "area-horarios";
    area.innerHTML = horarios.map(function (h) {
      var sel = h === agendamento.horario ? "selecionado" : "";
      var passou = livres.indexOf(h) === -1 ? "disabled" : "";
      return `<button type="button" class="pill-horario ${sel}" data-horario="${h}" ${passou}>${h}</button>`;
    }).join("");
  }

  // aviso quando a data escolhida e feriado
  var aviso = document.getElementById("avisoFeriado");
  var feriado = agendamento.data ? obterFeriado(agendamento.data) : null;
  if (feriado) {
    document.getElementById("txtAvisoFeriado").textContent =
      descreverFeriado(feriado) + ". Confirme o funcionamento do laboratório antes de ir.";
    aviso.classList.add("visivel");
  } else {
    aviso.classList.remove("visivel");
  }

  // resumo da data/hora escolhida
  var card = document.getElementById("cardSelecionado");
  if (agendamento.data && agendamento.horario) {
    document.getElementById("txtSelecionado").textContent = formatarData(agendamento.data) + " às " + agendamento.horario;
    card.classList.add("visivel");
  } else {
    card.classList.remove("visivel");
  }

  atualizarBotao();
}

function configurarPasso3() {
  document.getElementById("gradeDias").addEventListener("click", function (e) {
    var botao = e.target.closest(".dia");
    if (!botao || botao.disabled) return;
    var partes = botao.getAttribute("data-data").split("-");
    agendamento.data = new Date(+partes[0], +partes[1], +partes[2]);

    // clicar num dia de outro mes leva para aquele mes
    mesVisivel = new Date(agendamento.data.getFullYear(), agendamento.data.getMonth(), 1);
    renderizarCalendario();
    renderizarHorarios();
  });

  document.getElementById("areaHorarios").addEventListener("click", function (e) {
    var pill = e.target.closest(".pill-horario");
    if (!pill || pill.disabled) return;
    agendamento.horario = pill.getAttribute("data-horario");
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
}


// ========== PASSO 4: REVISAO ==========
function preencherRevisao() {
  var lab = agendamento.laboratorio;

  document.getElementById("revExame").textContent = agendamento.exame.nome;
  document.getElementById("revLocal").textContent = lab.nome;
  document.getElementById("revEndereco").textContent = lab.rua + ", " + lab.cidade;
  document.getElementById("revData").textContent = formatarData(agendamento.data);
  document.getElementById("revHorario").textContent = agendamento.horario;
  document.getElementById("revPreparo").innerHTML = agendamento.exame.preparo
    .map(function (p) { return "<li>" + p + "</li>"; })
    .join("");
}


// salva o exame para aparecer em "Meus Exames" e mostra a tela de sucesso
function confirmarAgendamento() {
  var lab = agendamento.laboratorio;
  var d = agendamento.data;
  var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + "T" + agendamento.horario;

  var novoExame = {
    id: "agend-exame-" + Date.now(),
    nome: agendamento.exame.nome,
    data: iso,
    local: lab.nome + " — " + lab.rua,
    status: "agendado",
    preparo: agendamento.exame.preparo
  };

  try {
    var salvos = JSON.parse(localStorage.getItem("fluxconnect_novos_exames") || "[]");
    salvos.unshift(novoExame);
    localStorage.setItem("fluxconnect_novos_exames", JSON.stringify(salvos));
  } catch (e) {}

  document.getElementById("sucExame").textContent = agendamento.exame.nome;
  document.getElementById("sucData").textContent = formatarData(d);
  document.getElementById("sucHorario").textContent = agendamento.horario;
  document.getElementById("sucLocal").textContent = lab.nome;
  document.getElementById("sucEndereco").textContent = lab.rua + ", " + lab.cidade;

  document.getElementById("telaFluxo").classList.add("oculto");
  document.getElementById("telaSucesso").classList.add("visivel");
  window.scrollTo({ top: 0 });
  mostrarToast("Exame agendado com sucesso!");
}


// aviso rapido no topo
var timerToast = null;
function mostrarToast(texto) {
  var toast = document.getElementById("toast");
  document.getElementById("toastTexto").textContent = texto;
  toast.classList.add("visivel");
  clearTimeout(timerToast);
  timerToast = setTimeout(function () {
    toast.classList.remove("visivel");
  }, 3000);
}


// ========== INICIALIZACAO ==========
document.addEventListener("DOMContentLoaded", function () {
  configurarPasso1();
  configurarPasso2();
  configurarPasso3();

  document.getElementById("btnAcao").addEventListener("click", function () {
    if (passoAtual < 4) {
      irParaPasso(passoAtual + 1);
    } else {
      confirmarAgendamento();
    }
  });

  document.getElementById("btnVoltar").addEventListener("click", function () {
    if (passoAtual === 1) sairDoFluxo();
    else irParaPasso(passoAtual - 1);
  });

  document.getElementById("btnFechar").addEventListener("click", sairDoFluxo);
  document.getElementById("btnImprimir").addEventListener("click", function () {
    window.print();
  });

  irParaPasso(1);
});
