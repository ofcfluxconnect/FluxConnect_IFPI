// lista de exames (mock) separada por aba
var exames = {
  pendentes: [
    {
      id: "pend-1",
      nome: "Ecocardiograma",
      data: "2026-06-18T08:00",
      local: "Laboratório Municipal — Rua Defala Attem, 822",
      status: "agendado",
      preparo: [
        "Jejum absoluto de 4 horas antes do exame.",
        "Usar roupas confortáveis e de fácil remoção.",
        "Não aplicar cremes ou loções no tórax no dia do exame.",
        "Trazer exames cardíacos anteriores, se houver.",
        "Apresentar documento oficial com foto e pedido médico."
      ]
    },
    {
      id: "pend-2",
      nome: "Hemograma Completo",
      data: "2026-06-19T07:30",
      local: "Centro de Imagem Municipal — Av. Principal, 1200",
      status: "agendado",
      preparo: [
        "Jejum de 4 horas (água liberada).",
        "Evite atividade física intensa nas 24 horas anteriores.",
        "Evite bebidas alcoólicas nas 72 horas anteriores."
      ]
    },
    {
      id: "pend-3",
      nome: "Ultrassonografia Abdominal",
      data: "2026-06-22T10:00",
      local: "Centro de Imagem Municipal — Av. Principal, 1200",
      status: "aguardando",
      preparo: [
        "Jejum de 8 horas antes do exame.",
        "No dia anterior, evite alimentos gordurosos e bebidas gaseificadas.",
        "O horário ainda aguarda confirmação do laboratório. Você será avisado pelas notificações."
      ]
    },
    {
      id: "pend-4",
      nome: "Teste Ergométrico",
      data: "2026-06-25T09:00",
      local: "Laboratório Municipal — Rua Defala Attem, 822",
      status: "agendado",
      preparo: [
        "Faça uma refeição leve até 2 horas antes do exame.",
        "Use roupas leves e tênis confortáveis.",
        "Evite café, chá preto e refrigerantes de cola nas 12 horas anteriores.",
        "Não suspenda medicamentos sem orientação do seu médico."
      ]
    }
  ],
  disponiveis: [
    {
      id: "disp-1",
      nome: "Glicemia em Jejum",
      data: "2026-06-03T07:15",
      liberado: "2026-06-04T14:20",
      local: "Centro de Imagem Municipal — Av. Principal, 1200",
      medico: "Dra. Juliana Ferreira",
      status: "disponivel",
      resumo: "Glicose de 92 mg/dL, dentro dos valores de referência (70 a 99 mg/dL)."
    },
    {
      id: "disp-2",
      nome: "Colesterol Total e Frações",
      data: "2026-06-03T07:15",
      liberado: "2026-06-05T09:10",
      local: "Centro de Imagem Municipal — Av. Principal, 1200",
      medico: "Dr. Paulo Neto",
      status: "disponivel",
      resumo: "Colesterol total de 182 mg/dL. HDL e LDL dentro das metas indicadas pelo laboratório."
    },
    {
      id: "disp-3",
      nome: "TSH e T4 Livre",
      data: "2026-05-20T08:00",
      liberado: "2026-05-22T16:45",
      local: "Laboratório Municipal — Rua Defala Attem, 822",
      medico: "Dra. Juliana Ferreira",
      status: "disponivel",
      resumo: "Função da tireoide dentro dos valores de referência."
    },
    {
      id: "disp-4",
      nome: "Raio-X de Tórax",
      data: "2026-05-12T11:30",
      liberado: "2026-05-13T10:00",
      local: "Centro de Imagem Municipal — Av. Principal, 1200",
      medico: "Dr. Paulo Neto",
      status: "disponivel",
      resumo: "Sem alterações significativas nos campos pulmonares."
    }
  ]
};

var meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// estado atual da tela
var abaAtual = "pendentes";
var termoBusca = "";
var filtroLocal = "";
var ordemAtual = "data-asc";
var exameAberto = null;

// svgs reutilizaveis
var icones = {
  pendente: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8770f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v5"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"/><rect x="8" y="2" width="8" height="4" rx="1"/><circle cx="17" cy="17" r="4.5" fill="#e8770f" stroke="none"/><polyline points="17 15 17 17 18.5 18" stroke="#fff"/></svg>',
  disponivel: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f6e56" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>',
  relogio: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 14"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  calendario: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  localizacao: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  info: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  laudo: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
};


// "2026-06-18T08:00" -> "18 de Junho de 2026 às 08:00"
function formatarData(iso) {
  var partes = iso.split("T");
  var data = partes[0].split("-");
  var dia = parseInt(data[2], 10);
  var mes = meses[parseInt(data[1], 10) - 1];
  return dia + " de " + mes + " de " + data[0] + " às " + partes[1];
}


// cria o html de um card de exame
function criarCard(dados) {
  var labelStatus = {
    agendado: "Agendado",
    aguardando: "Aguardando",
    disponivel: "Resultado pronto"
  };

  var ehDisponivel = dados.status === "disponivel";
  var iconeBadge = ehDisponivel ? icones.check : icones.relogio;

  var linhaData = ehDisponivel
    ? icones.calendario + " Liberado em " + formatarData(dados.liberado)
    : icones.calendario + " " + formatarData(dados.data);

  var botao = ehDisponivel
    ? '<button class="btn-card btn-card-laudo" onclick="abrirLaudo(\'' + dados.id + '\')">' + icones.laudo + " Ver resultado</button>"
    : '<button class="btn-card" onclick="abrirPreparo(\'' + dados.id + '\')">' + icones.info + " Ver Preparo</button>";

  return `
    <div class="card-exame">
      <div class="card-icone ${ehDisponivel ? "card-icone-verde" : ""}">
        ${ehDisponivel ? icones.disponivel : icones.pendente}
      </div>
      <div class="card-info">
        <div class="card-titulo-linha">
          <p class="nome-exame">${dados.nome}</p>
          <span class="badge-status badge-${dados.status}">${iconeBadge} ${labelStatus[dados.status]}</span>
        </div>
        <div class="card-detalhes">
          <span class="detalhe">${linhaData}</span>
          <span class="detalhe">${icones.localizacao} ${dados.local}</span>
        </div>
      </div>
      ${botao}
    </div>
  `;
}


// aplica busca, filtro de local e ordenacao na aba atual
function examesVisiveis() {
  var lista = (exames[abaAtual] || []).filter(function (e) {
    var bateBusca = !termoBusca || e.nome.toLowerCase().includes(termoBusca);
    var bateLocal = !filtroLocal || e.local.indexOf(filtroLocal) === 0;
    return bateBusca && bateLocal;
  });

  lista.sort(function (a, b) {
    if (ordemAtual === "nome") return a.nome.localeCompare(b.nome);
    if (ordemAtual === "data-desc") return b.data.localeCompare(a.data);
    return a.data.localeCompare(b.data);
  });

  return lista;
}


// atualiza os numeros dos cards de resumo e das abas
function atualizarContadores() {
  var disp = exames.disponiveis.length;
  var pend = exames.pendentes.length;

  document.getElementById("totalDisponiveis").textContent = disp;
  document.getElementById("totalPendentes").textContent = pend;
  document.getElementById("totalExames").textContent = disp + pend;

  document.querySelectorAll(".aba").forEach(function (btn) {
    var aba = btn.getAttribute("data-aba");
    btn.querySelector(".badge-aba").textContent = exames[aba].length;
  });
}


// desenha a lista da aba ativa
function renderizar() {
  var lista = document.getElementById("listaExames");
  var dados = examesVisiveis();
  var html = "";

  for (var i = 0; i < dados.length; i++) {
    html += criarCard(dados[i]);
  }

  lista.innerHTML = html || '<p class="lista-vazia">Nenhum exame encontrado.</p>';
  atualizarContadores();
}


// troca de abas
function configurarAbas() {
  var botoes = document.querySelectorAll(".aba");

  botoes.forEach(function (btn) {
    btn.addEventListener("click", function () {
      botoes.forEach(function (b) {
        b.classList.remove("aba-ativa");
      });
      btn.classList.add("aba-ativa");
      abaAtual = btn.getAttribute("data-aba");
      renderizar();
    });
  });
}


// busca por nome do exame
function configurarBusca() {
  var input = document.getElementById("inputBusca");
  input.addEventListener("input", function () {
    termoBusca = input.value.toLowerCase().trim();
    renderizar();
  });
}


// abre e fecha os menus de Filtrar e Ordenar
function configurarMenus() {
  var menuFiltrar = document.getElementById("menuFiltrar");
  var menuOrdenar = document.getElementById("menuOrdenar");

  // monta as opcoes de local a partir dos exames cadastrados
  var locais = [];
  exames.pendentes.concat(exames.disponiveis).forEach(function (e) {
    var nomeLocal = e.local.split(" — ")[0];
    if (locais.indexOf(nomeLocal) === -1) locais.push(nomeLocal);
  });

  var htmlLocais = '<button class="menu-item menu-item-ativo" data-local="">Todos os locais</button>';
  locais.forEach(function (l) {
    htmlLocais += '<button class="menu-item" data-local="' + l + '">' + l + "</button>";
  });
  menuFiltrar.insertAdjacentHTML("beforeend", htmlLocais);

  function alternar(menu, outro) {
    outro.classList.remove("aberto");
    menu.classList.toggle("aberto");
  }

  document.getElementById("btnFiltrar").addEventListener("click", function (e) {
    e.stopPropagation();
    alternar(menuFiltrar, menuOrdenar);
  });

  document.getElementById("btnOrdenar").addEventListener("click", function (e) {
    e.stopPropagation();
    alternar(menuOrdenar, menuFiltrar);
  });

  menuFiltrar.addEventListener("click", function (e) {
    var item = e.target.closest(".menu-item");
    if (!item) return;
    filtroLocal = item.getAttribute("data-local");
    marcarAtivo(menuFiltrar, item);
    document.getElementById("badgeFiltro").textContent = filtroLocal ? "1" : "";
    menuFiltrar.classList.remove("aberto");
    renderizar();
  });

  menuOrdenar.addEventListener("click", function (e) {
    var item = e.target.closest(".menu-item");
    if (!item) return;
    ordemAtual = item.getAttribute("data-ordem");
    marcarAtivo(menuOrdenar, item);
    menuOrdenar.classList.remove("aberto");
    renderizar();
  });

  // fecha os menus ao clicar fora
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".menu-wrapper")) {
      menuFiltrar.classList.remove("aberto");
      menuOrdenar.classList.remove("aberto");
    }
  });
}

function marcarAtivo(menu, item) {
  menu.querySelectorAll(".menu-item").forEach(function (i) {
    i.classList.remove("menu-item-ativo");
  });
  item.classList.add("menu-item-ativo");
}


// botao Atualizar: simula uma nova busca e atualiza o horario
function configurarAtualizar() {
  var btn = document.getElementById("btnAtualizar");
  btn.addEventListener("click", function () {
    btn.classList.add("girando");
    setTimeout(function () {
      var agora = new Date();
      var hora = String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0");
      document.getElementById("horaAtualizacao").textContent = "hoje, " + hora;
      btn.classList.remove("girando");
      renderizar();
      mostrarToast("Exames atualizados");
    }, 700);
  });
}


// modal de preparo
function abrirPreparo(id) {
  var exame = exames.pendentes.find(function (e) { return e.id === id; });
  if (!exame) return;

  var check = '<span class="preparo-check"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';

  document.getElementById("preparoTitulo").textContent = "Preparo para " + exame.nome;
  document.getElementById("preparoLista").innerHTML = exame.preparo
    .map(function (p) { return "<li>" + check + "<span>" + p + "</span></li>"; })
    .join("");

  document.getElementById("modalPreparo").classList.add("visivel");
}


// modal de laudo
function abrirLaudo(id) {
  var exame = exames.disponiveis.find(function (e) { return e.id === id; });
  if (!exame) return;
  exameAberto = exame;

  document.getElementById("laudoTitulo").textContent = exame.nome;
  document.getElementById("laudoLiberado").textContent = "Resultado liberado em " + formatarData(exame.liberado);
  document.getElementById("laudoColeta").textContent = formatarData(exame.data);
  document.getElementById("laudoLocal").textContent = exame.local.split(" — ")[0];
  document.getElementById("laudoMedico").textContent = exame.medico;
  document.getElementById("laudoResumo").textContent = exame.resumo;

  document.getElementById("modalLaudo").classList.add("visivel");
}


function fecharModal(id) {
  document.getElementById(id).classList.remove("visivel");
}


function configurarModais() {
  // botoes com data-fechar (X e Entendi)
  document.querySelectorAll("[data-fechar]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fecharModal(btn.getAttribute("data-fechar"));
    });
  });

  // fecha ao clicar no fundo escurecido
  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) fecharModal(overlay.id);
    });
  });

  // fecha com a tecla Esc
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      fecharModal("modalPreparo");
      fecharModal("modalLaudo");
    }
  });

  // download do laudo ainda e simulado (sem backend)
  document.getElementById("btnBaixarLaudo").addEventListener("click", function () {
    if (!exameAberto) return;
    fecharModal("modalLaudo");
    mostrarToast("Download do resultado de " + exameAberto.nome + " iniciado");
  });
}


// aviso rapido no canto da tela
var timerToast = null;
function mostrarToast(texto) {
  var toast = document.getElementById("toast");
  toast.textContent = texto;
  toast.classList.add("visivel");
  clearTimeout(timerToast);
  timerToast = setTimeout(function () {
    toast.classList.remove("visivel");
  }, 2500);
}


// inicializacao
document.addEventListener("DOMContentLoaded", function () {
  // carrega exames agendados pela tela "Agendar Exame"
  try {
    var salvos = JSON.parse(localStorage.getItem("fluxconnect_novos_exames") || "[]");
    salvos.forEach(function (novo) {
      var jaExiste = exames.pendentes.some(function (e) { return e.id === novo.id; });
      if (!jaExiste) exames.pendentes.push(novo);
    });
  } catch (e) {}

  configurarAbas();
  configurarBusca();
  configurarMenus();
  configurarAtualizar();
  configurarModais();
  renderizar();
});
