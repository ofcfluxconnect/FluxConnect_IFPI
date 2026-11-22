// base de dados de profissionais organizados por especialidade
var bancoProfissionais = {
  "Clínica Geral": [
    {
      id: "cg-1",
      nome: "Dr. Carlos Souza",
      crm: "CRM-PI 112233",
      avatar: "CS",
      proximaData: "15 de Junho",
      local: "UBS Centro",
      endereco: "Rua Defala Attem, 812 — Floriano-PI"
    },
    {
      id: "cg-2",
      nome: "Dra. Patrícia Neves",
      crm: "CRM-PI 223344",
      avatar: "PN",
      proximaData: "16 de Junho",
      local: "UBS Centro",
      endereco: "Rua Defala Attem, 812 — Floriano-PI"
    },
    {
      id: "cg-3",
      nome: "Dr. Eduardo Farias",
      crm: "CRM-PI 334455",
      avatar: "EF",
      proximaData: "17 de Junho",
      local: "Hospital Regional",
      endereco: "Av. Principal, 1200 — Floriano-PI"
    },
    {
      id: "cg-4",
      nome: "Dra. Camila Torres",
      crm: "CRM-PI 445566",
      avatar: "CT",
      proximaData: "18 de Junho",
      local: "UBS Centro",
      endereco: "Rua Defala Attem, 812 — Floriano-PI"
    },
    {
      id: "cg-5",
      nome: "Dr. Rafael Moura",
      crm: "CRM-PI 556677",
      avatar: "RM",
      proximaData: "19 de Junho",
      local: "UBS Centro",
      endereco: "Rua Defala Attem, 812 — Floriano-PI"
    }
  ],
  "Cardiologia": [
    {
      id: "card-1",
      nome: "Dr. Marcos Vinicius",
      crm: "CRM-PI 889900",
      avatar: "MV",
      proximaData: "16 de Junho",
      local: "UBS Centro",
      endereco: "Rua Defala Attem, 812 — Floriano-PI"
    },
    {
      id: "card-2",
      nome: "Dra. Luciana Borges",
      crm: "CRM-PI 778899",
      avatar: "LB",
      proximaData: "18 de Junho",
      local: "Hospital Regional",
      endereco: "Av. Principal, 1200 — Floriano-PI"
    }
  ],
  "Dermatologia": [
    {
      id: "derm-1",
      nome: "Dra. Silvia Ramos",
      crm: "CRM-PI 991122",
      avatar: "SR",
      proximaData: "17 de Junho",
      local: "UBS Centro",
      endereco: "Rua Defala Attem, 812 — Floriano-PI"
    }
  ]
};

// horarios padrao de atendimento
var horariosDisponiveis = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
  "14:00", "14:30", "15:00"
];

// dias da semana mapeados
var diasDaSemanaTexto = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado"
];

var nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// abreviacoes usadas pela tela de Consultas
var mesesAbreviados = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

// data de hoje (sem horas), recalculada a cada uso para o calendario nunca ficar desatualizado
function hoje() {
  var agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

function mesmoDia(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// estado atual do agendamento
var dadosAgendamento = {
  especialidade: "Clínica Geral",
  profissional: null,
  data: null,       // objeto Date escolhido no calendario
  horario: "10:00"
};

// mes que aparece no calendario
var mesCalendario = new Date(hoje().getFullYear(), hoje().getMonth(), 1);

var passoAtual = 1;


// alterna entre o painel inicial e o wizard
function mostrarTela(nomeTela) {
  var painel = document.getElementById("telaPainelInicial");
  var fluxo = document.getElementById("telaFluxoAgendamento");

  if (nomeTela === "fluxo") {
    painel.classList.remove("tela-ativa");
    fluxo.classList.add("tela-ativa");
    irParaPasso(1);
  } else {
    fluxo.classList.remove("tela-ativa");
    painel.classList.add("tela-ativa");
  }
}


// navega entre os 4 passos do fluxo
function irParaPasso(numeroPasso) {
  passoAtual = numeroPasso;

  // gerencia o stepper (1 a 4)
  for (var i = 1; i <= 4; i++) {
    var stepElem = document.getElementById("step" + i);
    var circulo = stepElem.querySelector(".stepper-circulo");
    var linhaElem = document.getElementById("line" + (i - 1));

    stepElem.classList.remove("ativo", "concluido");

    if (i < passoAtual) {
      stepElem.classList.add("concluido");
      circulo.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      if (linhaElem) linhaElem.classList.add("concluida");
    } else if (i === passoAtual) {
      stepElem.classList.add("ativo");
      circulo.textContent = i;
      if (linhaElem) linhaElem.classList.add("concluida");
    } else {
      circulo.textContent = i;
      if (linhaElem) linhaElem.classList.remove("concluida");
    }
  }

  // exibe a tela do passo atual
  for (var p = 1; p <= 4; p++) {
    var telaPasso = document.getElementById("passo" + p);
    if (telaPasso) {
      if (p === passoAtual) {
        telaPasso.classList.add("passo-ativo");
      } else {
        telaPasso.classList.remove("passo-ativo");
      }
    }
  }

  // atualiza o botao de acao inferior
  var btnAcao = document.getElementById("btnAcaoPasso");
  if (passoAtual === 4) {
    btnAcao.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="16 10 11 15 8 12"/>
      </svg>
      Confirmar Agendamento
    `;
  } else {
    btnAcao.innerHTML = "Avançar";
  }

  // acoes especificas ao entrar no passo
  if (passoAtual === 2) {
    carregarProfissionais();
  } else if (passoAtual === 3) {
    renderizarCalendario();
    renderizarHorarios();
  } else if (passoAtual === 4) {
    preencherRevisao();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}


// passo 1: selecao e busca de especialidade
function configurarPasso1() {
  var cards = document.querySelectorAll(".card-especialidade");
  var inputBusca = document.getElementById("inputBuscaEspecialidade");

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      cards.forEach(function (c) { c.classList.remove("selecionado"); });
      card.classList.add("selecionado");

      dadosAgendamento.especialidade = card.getAttribute("data-nome");
      // avanca diretamente para a escolha de profissional
      irParaPasso(2);
    });
  });

  inputBusca.addEventListener("input", function () {
    var termo = inputBusca.value.toLowerCase().trim();
    cards.forEach(function (card) {
      var nome = card.getAttribute("data-nome").toLowerCase();
      if (nome.includes(termo)) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
}


// passo 2: renderiza a lista de profissionais da especialidade escolhida
function carregarProfissionais() {
  var container = document.getElementById("listaProfissionais");
  var txtEspec = document.getElementById("txtEspecialidadeAtual");

  txtEspec.textContent = dadosAgendamento.especialidade;

  var lista = bancoProfissionais[dadosAgendamento.especialidade] || bancoProfissionais["Clínica Geral"];
  var html = "";

  // se nao tem profissional definido, seleciona o primeiro
  if (!dadosAgendamento.profissional || dadosAgendamento.profissional.especialidade !== dadosAgendamento.especialidade) {
    dadosAgendamento.profissional = Object.assign({}, lista[0], { especialidade: dadosAgendamento.especialidade });
  }

  for (var i = 0; i < lista.length; i++) {
    var prof = lista[i];
    var isSelecionado = dadosAgendamento.profissional && dadosAgendamento.profissional.id === prof.id;
    var classeSel = isSelecionado ? "selecionado" : "";

    html += `
      <div class="card-profissional ${classeSel}" data-id="${prof.id}" onclick="selecionarProfissional('${prof.id}')">
        <div class="avatar-prof">${prof.avatar}</div>
        <div class="info-prof">
          <p class="nome-prof">${prof.nome}</p>
          <span class="crm-prof">${prof.crm}</span>
          <span class="especialidade-prof">${dadosAgendamento.especialidade}</span>
          <span class="data-livre-prof">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Próxima data livre: ${prof.proximaData}
          </span>
        </div>
        <div class="check-selecao-prof">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563eb">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}


// seleciona o medico no passo 2
function selecionarProfissional(id) {
  var lista = bancoProfissionais[dadosAgendamento.especialidade] || bancoProfissionais["Clínica Geral"];
  var profEncontrado = lista.find(function (p) { return p.id === id; });

  if (profEncontrado) {
    dadosAgendamento.profissional = Object.assign({}, profEncontrado, { especialidade: dadosAgendamento.especialidade });

    var cards = document.querySelectorAll(".card-profissional");
    cards.forEach(function (card) {
      if (card.getAttribute("data-id") === id) {
        card.classList.add("selecionado");
      } else {
        card.classList.remove("selecionado");
      }
    });
  }
}


// horarios que ainda nao passaram (so muda quando a data e hoje)
function horariosLivres(data) {
  if (!mesmoDia(data, hoje())) return horariosDisponiveis;
  var agora = new Date();
  var minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  return horariosDisponiveis.filter(function (h) {
    var partes = h.split(":");
    return +partes[0] * 60 + +partes[1] > minutosAgora;
  });
}

// primeiro dia com horario livre (hoje ou amanha)
function primeiraDataLivre() {
  var data = hoje();
  if (horariosLivres(data).length === 0) data.setDate(data.getDate() + 1);
  return data;
}


// passo 3: calendario do mes atual em diante; todos os dias futuros ficam disponiveis
function renderizarCalendario() {
  var grid = document.getElementById("gradeDiasMes");
  var dataHoje = hoje();
  var ano = mesCalendario.getFullYear();
  var mes = mesCalendario.getMonth();

  if (!dadosAgendamento.data || dadosAgendamento.data < dataHoje) {
    dadosAgendamento.data = primeiraDataLivre();
  }

  document.getElementById("txtMesAnoCalendario").textContent = nomesMeses[mes] + " " + ano;
  document.getElementById("btnMesAnterior").disabled = ano === dataHoje.getFullYear() && mes === dataHoje.getMonth();

  // celulas vazias ate o primeiro dia da semana do mes
  var html = "";
  var primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  for (var v = 0; v < primeiroDiaSemana; v++) {
    html += '<div class="dia-item vazio"></div>';
  }

  var totalDias = new Date(ano, mes + 1, 0).getDate();
  for (var dia = 1; dia <= totalDias; dia++) {
    var data = new Date(ano, mes, dia);
    var disponivel = data >= dataHoje && horariosLivres(data).length > 0;
    var feriado = obterFeriado(data);
    var titulo = feriado ? descreverFeriado(feriado) : "";

    var classes = "dia-item";
    classes += disponivel ? " disponivel" : " desabilitado";
    if (feriado) classes += " feriado";
    if (mesmoDia(data, dataHoje)) {
      classes += " hoje";
      titulo = titulo ? "Hoje · " + titulo : "Hoje";
    }
    if (mesmoDia(data, dadosAgendamento.data)) classes += " selecionado";

    var onclick = disponivel ? `onclick="selecionarDia(${dia})"` : "";
    html += `<div class="${classes}" title="${titulo}" ${onclick}>${dia}</div>`;
  }

  grid.innerHTML = html;
}


// troca o mes exibido no calendario
function mudarMesCalendario(passo) {
  mesCalendario = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + passo, 1);
  renderizarCalendario();
}


// atualiza o dia selecionado no calendario
function selecionarDia(dia) {
  dadosAgendamento.data = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), dia);
  renderizarCalendario();
  renderizarHorarios();
}


// renderiza as opcoes de horarios
function renderizarHorarios() {
  var grid = document.getElementById("gridHorarios");
  var titulo = document.getElementById("txtTituloHorarios");
  var data = dadosAgendamento.data;
  var livres = horariosLivres(data);

  // se o horario escolhido ja passou, seleciona o primeiro livre
  if (livres.indexOf(dadosAgendamento.horario) === -1) {
    dadosAgendamento.horario = livres[0];
  }

  titulo.textContent = "Horários para " + data.getDate() + " de " + nomesMeses[data.getMonth()];

  var feriado = obterFeriado(data);
  var aviso = document.getElementById("avisoFeriadoConsulta");
  if (feriado) {
    aviso.textContent = descreverFeriado(feriado) + ". Confirme o funcionamento da clínica antes de ir.";
    aviso.classList.add("visivel");
  } else {
    aviso.classList.remove("visivel");
  }

  var html = "";
  for (var i = 0; i < horariosDisponiveis.length; i++) {
    var h = horariosDisponiveis[i];
    var isSel = (h === dadosAgendamento.horario);
    var classeSel = isSel ? "selecionado" : "";
    var passou = livres.indexOf(h) === -1;

    html += `
      <button type="button" class="pill-horario ${classeSel}" ${passou ? "disabled" : ""} onclick="selecionarHorario('${h}')">
        ${h}
      </button>
    `;
  }

  grid.innerHTML = html;
}


// seleciona o horario desejado
function selecionarHorario(h) {
  dadosAgendamento.horario = h;
  renderizarHorarios();
}


// dia da semana da data escolhida
function obterDiaSemana(data) {
  return diasDaSemanaTexto[data.getDay()];
}


// passo 4: preenche o card com a revisao completa
function preencherRevisao() {
  var prof = dadosAgendamento.profissional || {
    nome: "Dr. Carlos Souza",
    crm: "CRM-PI 112233",
    avatar: "CS",
    local: "UBS Centro",
    endereco: "Rua Defala Attem, 812 — Floriano-PI"
  };

  var data = dadosAgendamento.data;
  var diaSemana = obterDiaSemana(data);

  // cabecalho azul
  document.getElementById("revAvatar").textContent = prof.avatar;
  document.getElementById("revNomeTopo").textContent = prof.nome;
  document.getElementById("revEspecTopo").textContent = dadosAgendamento.especialidade;

  // detalhes
  document.getElementById("revNomeDetalhe").textContent = prof.nome + " — " + dadosAgendamento.especialidade;
  document.getElementById("revCrmDetalhe").textContent = prof.crm;

  document.getElementById("revDataHoraDetalhe").textContent =
    diaSemana + ", " + data.getDate() + " de " + nomesMeses[data.getMonth()] + " de " + data.getFullYear() + " às " + dadosAgendamento.horario;

  document.getElementById("revLocalNome").textContent = prof.local;
  document.getElementById("revLocalEndereco").textContent = prof.endereco;
}


// grava o agendamento e exibe o modal de sucesso
function confirmarAgendamentoFinal() {
  var data = dadosAgendamento.data;
  var diaFmt = String(data.getDate()).padStart(2, "0");

  var novaConsulta = {
    id: "agend-" + Date.now(),
    dia: diaFmt,
    mes: mesesAbreviados[data.getMonth()],
    ano: String(data.getFullYear()),
    hora: dadosAgendamento.horario,
    nome: dadosAgendamento.profissional.nome,
    especialidade: dadosAgendamento.especialidade,
    local: dadosAgendamento.profissional.local + " – Presencial",
    status: "confirmada"
  };

  // salva no localStorage para que apareca na tela de Consultas
  try {
    var salvas = JSON.parse(localStorage.getItem("fluxconnect_novas_consultas") || "[]");
    salvas.unshift(novaConsulta);
    localStorage.setItem("fluxconnect_novas_consultas", JSON.stringify(salvas));
  } catch (e) {
    console.error("Erro ao salvar agendamento:", e);
  }

  // atualiza o card do painel inicial para exibir a consulta confirmada
  atualizarCardStatusPainel(novaConsulta);

  // exibe o modal de confirmacao com sucesso
  document.getElementById("modalAgendadoSucesso").classList.add("visivel");
}


// atualiza o card da tela inicial caso ja exista agendamento
function atualizarCardStatusPainel(consulta) {
  var card = document.getElementById("cardStatusConsulta");
  if (!card) return;

  card.className = "card-painel card-consulta-agendada";
  card.innerHTML = `
    <div>
      <span style="font-size: 11px; font-weight: 600; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px;">Sua Próxima Consulta</span>
      <h3 style="font-size: 16px; font-weight: 700; color: #0f1923; margin: 4px 0 2px;">${consulta.nome}</h3>
      <p style="font-size: 13px; color: #6b7585;">${consulta.especialidade} · ${consulta.dia}/${consulta.mes}/${consulta.ano} às ${consulta.hora}</p>
    </div>
    <span style="background: #e1f5ee; color: #0f6e56; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 12px;">Confirmada</span>
  `;
}


// eventos dos botoes de navegacao
function configurarEventosNavegacao() {
  // abrir fluxo a partir do painel
  var btnAgendar = document.getElementById("btnIniciarAgendamento");
  if (btnAgendar) {
    btnAgendar.addEventListener("click", function () {
      mostrarTela("fluxo");
    });
  }

  // botao voltar no topo do fluxo
  var btnVoltar = document.getElementById("btnPassoVoltar");
  if (btnVoltar) {
    btnVoltar.addEventListener("click", function () {
      if (passoAtual === 1) {
        mostrarTela("painel");
      } else {
        irParaPasso(passoAtual - 1);
      }
    });
  }

  // botao fechar (X)
  var btnFechar = document.getElementById("btnPassoFechar");
  if (btnFechar) {
    btnFechar.addEventListener("click", function () {
      mostrarTela("painel");
    });
  }

  // botao avancar/confirmar na barra fixa
  var btnAcao = document.getElementById("btnAcaoPasso");
  if (btnAcao) {
    btnAcao.addEventListener("click", function () {
      if (passoAtual < 4) {
        irParaPasso(passoAtual + 1);
      } else {
        confirmarAgendamentoFinal();
      }
    });
  }

  // fechar modal de sucesso e voltar ao painel
  var btnFecharModal = document.getElementById("btnFecharSucessoAgendamento");
  if (btnFecharModal) {
    btnFecharModal.addEventListener("click", function () {
      document.getElementById("modalAgendadoSucesso").classList.remove("visivel");
      mostrarTela("painel");
    });
  }
}


// inicializa ao carregar a pagina
document.addEventListener("DOMContentLoaded", function () {
  configurarEventosNavegacao();
  configurarPasso1();

  // verifica se ja existe alguma consulta agendada salva anteriormente
  try {
    var salvas = JSON.parse(localStorage.getItem("fluxconnect_novas_consultas") || "[]");
    if (salvas.length > 0) {
      atualizarCardStatusPainel(salvas[0]);
    }
  } catch (e) {}

  // se a URL contiver '?novo=1', abre direto no fluxo de agendamento!
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("novo") === "1") {
    mostrarTela("fluxo");
  }
});

