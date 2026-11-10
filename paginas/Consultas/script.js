// lista de consultas com ids unicos
var consultas = {
  proximas: [
    {
      id: "prox-1",
      dia: "15", mes: "JUN", ano: "2026", hora: "08:30",
      nome: "Dra. Ana Paula",
      especialidade: "Cardiologia",
      local: "UBS Centro – Presencial",
      status: "confirmada"
    },
    {
      id: "prox-2",
      dia: "22", mes: "JUN", ano: "2026", hora: "10:00",
      nome: "Dr. Carlos Mendes",
      especialidade: "Dermatologia",
      local: "UBS Centro – Presencial",
      status: "pendente"
    },
    {
      id: "prox-3",
      dia: "01", mes: "JUL", ano: "2026", hora: "14:30",
      nome: "Dra. Renata Silva",
      especialidade: "Neurologia",
      local: "UBS Centro – Teleconsulta",
      status: "confirmada"
    },
    {
      id: "prox-4",
      dia: "10", mes: "JUL", ano: "2026", hora: "09:15",
      nome: "Dr. Fábio Almeida",
      especialidade: "Ortopedia",
      local: "UBS Centro – Presencial",
      status: "pendente"
    }
  ],
  realizadas: [
    {
      id: "real-1",
      dia: "03", mes: "JUN", ano: "2026", hora: "09:00",
      nome: "Dra. Mariana Costa",
      especialidade: "Ginecologia",
      local: "UBS Centro – Presencial",
      status: "realizada"
    },
    {
      id: "real-2",
      dia: "05", mes: "MAI", ano: "2026", hora: "08:00",
      nome: "Dra. Juliana Ferreira",
      especialidade: "Endocrinologia",
      local: "Hospital Regional – Presencial",
      status: "realizada"
    },
    {
      id: "real-3",
      dia: "12", mes: "ABR", ano: "2026", hora: "16:00",
      nome: "Dr. Paulo Neto",
      especialidade: "Cardiologia",
      local: "UBS Centro – Presencial",
      status: "realizada"
    },
    {
      id: "real-4",
      dia: "10", mes: "MAR", ano: "2026", hora: "10:30",
      nome: "Dr. Carlos Mendes",
      especialidade: "Dermatologia",
      local: "UBS Centro – Teleconsulta",
      status: "realizada"
    },
    {
      id: "real-5",
      dia: "02", mes: "DEZ", ano: "2025", hora: "10:00",
      nome: "Dr. Paulo Neto",
      especialidade: "Cardiologia",
      local: "UBS Centro – Presencial",
      status: "realizada"
    }
  ],
  canceladas: [
    {
      id: "canc-1",
      dia: "08", mes: "JUN", ano: "2026", hora: "09:00",
      nome: "Dr. Marcos Oliveira",
      especialidade: "Psiquiatria",
      local: "UBS Centro – Teleconsulta",
      status: "cancelada",
      motivo: "Imprevisto pessoal"
    },
    {
      id: "canc-2",
      dia: "25", mes: "MAI", ano: "2026", hora: "14:00",
      nome: "Dra. Beatriz Santos",
      especialidade: "Oftalmologia",
      local: "UBS Centro – Presencial",
      status: "cancelada",
      motivo: "Problema de transporte"
    },
    {
      id: "canc-3",
      dia: "10", mes: "MAI", ano: "2026", hora: "10:30",
      nome: "Dr. André Rocha",
      especialidade: "Urologia",
      local: "Hospital Regional – Presencial",
      status: "cancelada",
      motivo: "Conflito de horário"
    },
    {
      id: "canc-4",
      dia: "28", mes: "ABR", ano: "2026", hora: "08:00",
      nome: "Dra. Camila Dias",
      especialidade: "Reumatologia",
      local: "UBS Centro – Presencial",
      status: "cancelada",
      motivo: "Emergência familiar"
    }
  ]
};

// mapa de meses para formatar a data do modal
var mesesNumero = {
  JAN: "01", FEV: "02", MAR: "03", ABR: "04", MAI: "05", JUN: "06",
  JUL: "07", AGO: "08", SET: "09", OUT: "10", NOV: "11", DEZ: "12"
};

// estado atual
var abaAtual = "proximas";
var consultaParaCancelar = null;

// svgs reutilizaveis
var icones = {
  medico: '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  estetoscopio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.6A2 2 0 1 0 3 6h3a2 2 0 1 0-1.8-3.4"/><path d="M4.5 6v5a5.5 5.5 0 0 0 11 0V6"/><path d="M19.5 13a2.5 2.5 0 1 0 0 5"/><path d="M22 15.5v2A4.5 4.5 0 0 1 17.5 22h-1A4.5 4.5 0 0 1 12 17.5"/></svg>',
  localizacao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  relogio: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  receita: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  detalhes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};


// monta o link da tela de reagendamento com os dados da consulta
function linkReagendar(dados) {
  var params = new URLSearchParams({
    id: dados.id,
    medico: dados.nome,
    esp: dados.especialidade,
    local: dados.local,
    data: (dados.ano || "2026") + "-" + (mesesNumero[dados.mes] || "06") + "-" + dados.dia,
    hora: dados.hora,
    volta: "../Consultas/index.html"
  });
  return "../reagendar_consulta/index.html?" + params.toString();
}


// cria o card html com base nos dados recebidos
function criarCard(dados) {
  var classStatus = "status-" + dados.status;

  var labelMap = {
    confirmada: "Confirmada",
    pendente: "Pendente",
    realizada: "Realizada",
    cancelada: "Cancelada"
  };

  var acoesHtml = "";

  if (dados.status === "confirmada" || dados.status === "pendente") {
    acoesHtml = `
      <div class="card-acoes">
        <a href="${linkReagendar(dados)}" class="btn-acao">${icones.refresh} Reagendar</a>
        <button type="button" class="btn-acao btn-cancelar" onclick="abrirCancelamento('${dados.id}')">Cancelar Consulta</button>
      </div>
    `;
  } else if (dados.status === "realizada") {
    acoesHtml = `
      <div class="card-acoes">
        <a href="#" class="btn-acao">${icones.receita} Ver Receita</a>
        <a href="#" class="btn-acao">${icones.detalhes} Ver Detalhes</a>
      </div>
    `;
  }

  var motivoHtml = "";
  if (dados.motivo) {
    motivoHtml = `<p class="motivo-cancelamento"><strong>Motivo:</strong> ${dados.motivo}</p>`;
  }

  return `
    <div class="card-consulta ${classStatus}">
      <div class="bloco-data">
        <span class="dia">${dados.dia}</span>
        <span class="mes">${dados.mes}</span>
        <span class="hora">${icones.relogio} ${dados.hora}</span>
      </div>

      <div class="card-info">
        <div class="card-topo">
          <div class="medico-info">
            <div class="icone-medico">${icones.medico}</div>
            <div class="medico-textos">
              <p class="nome-medico">${dados.nome}</p>
              <p class="detalhe-medico">${icones.estetoscopio} ${dados.especialidade}</p>
              <p class="detalhe-medico">${icones.localizacao} ${dados.local}</p>
            </div>
          </div>
          <span class="badge-status badge-${dados.status}">
            <span class="ponto"></span>
            ${labelMap[dados.status]}
          </span>
        </div>
        ${motivoHtml}
        ${acoesHtml}
      </div>
    </div>
  `;
}


// atualiza os contadores nas abas
function atualizarBadges() {
  var botoes = document.querySelectorAll(".aba");
  botoes.forEach(function (btn) {
    var aba = btn.getAttribute("data-aba");
    var badge = btn.querySelector(".badge-aba");
    if (badge && consultas[aba]) {
      badge.textContent = consultas[aba].length;
    }
  });
}


// renderiza a lista de consultas da aba ativa
function renderizar(aba) {
  var lista = document.getElementById("listaConsultas");
  var dados = consultas[aba] || [];
  var html = "";

  for (var i = 0; i < dados.length; i++) {
    html += criarCard(dados[i]);
  }

  lista.innerHTML = html || '<p style="text-align:center;color:#6b7585;padding:40px;">Nenhuma consulta nesta aba.</p>';
  atualizarBadges();
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
      renderizar(abaAtual);
    });
  });
}


// filtro de busca por texto
function configurarBusca() {
  var input = document.querySelector(".campo-busca input");

  input.addEventListener("input", function () {
    var termo = input.value.toLowerCase().trim();
    var lista = document.getElementById("listaConsultas");
    var dados = consultas[abaAtual] || [];

    if (!termo) {
      renderizar(abaAtual);
      return;
    }

    var filtrados = dados.filter(function (c) {
      return (
        c.nome.toLowerCase().includes(termo) ||
        c.especialidade.toLowerCase().includes(termo)
      );
    });

    var html = "";
    for (var i = 0; i < filtrados.length; i++) {
      html += criarCard(filtrados[i]);
    }

    lista.innerHTML = html || '<p style="text-align:center;color:#6b7585;padding:40px;">Nenhuma consulta encontrada.</p>';
  });
}


// abre o modal de cancelamento com as informacoes da consulta
function abrirCancelamento(id) {
  var consulta = consultas.proximas.find(function (c) {
    return c.id === id;
  });

  if (!consulta) return;

  consultaParaCancelar = consulta;

  // preenche os dados no resumo
  document.getElementById("resumoNome").textContent = "Consulta com " + consulta.nome;
  document.getElementById("resumoEspecialidade").textContent = consulta.especialidade;

  var mesNum = mesesNumero[consulta.mes] || "06";
  var ano = consulta.ano || "2026";
  document.getElementById("resumoData").textContent = consulta.dia + "/" + mesNum + "/" + ano + " às " + consulta.hora;
  document.getElementById("resumoLocal").textContent = consulta.local;

  // limpa os campos do formulario
  var selectMotivo = document.getElementById("selectMotivo");
  var textarea = document.getElementById("textareaJustificativa");
  var contador = document.getElementById("contadorAtual");
  var btnSim = document.getElementById("btnSimCancelar");

  selectMotivo.value = "";
  textarea.value = "";
  contador.textContent = "0";
  btnSim.disabled = true;

  // exibe o modal
  document.getElementById("modalCancelamento").classList.add("visivel");
}


// fecha o modal de cancelamento sem alterar nada
function fecharCancelamento() {
  document.getElementById("modalCancelamento").classList.remove("visivel");
  consultaParaCancelar = null;
}


// confirma o cancelamento e move a consulta para a aba de canceladas
function confirmarCancelamento() {
  if (!consultaParaCancelar) return;

  var selectMotivo = document.getElementById("selectMotivo");
  var textarea = document.getElementById("textareaJustificativa");

  var motivoTexto = selectMotivo.value;
  if (!motivoTexto) return;

  // se houver justificativa digitada, podemos anexar
  var justificativaTexto = textarea.value.trim();
  var motivoCompleto = motivoTexto;
  if (justificativaTexto) {
    motivoCompleto += " – " + justificativaTexto;
  }

  // remove da lista de proximas
  var index = consultas.proximas.findIndex(function (c) {
    return c.id === consultaParaCancelar.id;
  });

  if (index !== -1) {
    consultas.proximas.splice(index, 1);
  }

  // atualiza dados e move para o topo das canceladas
  consultaParaCancelar.status = "cancelada";
  consultaParaCancelar.motivo = motivoCompleto;
  consultas.canceladas.unshift(consultaParaCancelar);

  // fecha o modal de confirmacao e abre o de sucesso
  fecharCancelamento();
  document.getElementById("modalSucesso").classList.add("visivel");

  // atualiza a exibicao da tela
  renderizar(abaAtual);
}


// fecha o modal de sucesso
function fecharModalSucesso() {
  document.getElementById("modalSucesso").classList.remove("visivel");
}


// eventos dos modais e validacoes
function configurarModais() {
  var modalCanc = document.getElementById("modalCancelamento");
  var modalSuc = document.getElementById("modalSucesso");
  var selectMotivo = document.getElementById("selectMotivo");
  var textarea = document.getElementById("textareaJustificativa");
  var contador = document.getElementById("contadorAtual");
  var btnSim = document.getElementById("btnSimCancelar");
  var btnNao = document.getElementById("btnNaoManter");
  var btnFecharSuc = document.getElementById("btnFecharSucesso");

  // habilita o botao apenas se tiver motivo selecionado
  selectMotivo.addEventListener("change", function () {
    btnSim.disabled = !selectMotivo.value;
  });

  // contador de caracteres na justificativa
  textarea.addEventListener("input", function () {
    contador.textContent = textarea.value.length;
  });

  // botao cancelar no modal
  btnSim.addEventListener("click", confirmarCancelamento);

  // botao manter consulta
  btnNao.addEventListener("click", fecharCancelamento);

  // botao fechar no modal de sucesso
  btnFecharSuc.addEventListener("click", fecharModalSucesso);

  // fecha ao clicar no fundo escurecido
  modalCanc.addEventListener("click", function (e) {
    if (e.target === modalCanc) fecharCancelamento();
  });

  modalSuc.addEventListener("click", function (e) {
    if (e.target === modalSuc) fecharModalSucesso();
  });
}


// inicializacao
document.addEventListener("DOMContentLoaded", function () {
  // carrega eventuais consultas recem-agendadas
  try {
    var salvas = JSON.parse(localStorage.getItem("fluxconnect_novas_consultas") || "[]");
    for (var i = salvas.length - 1; i >= 0; i--) {
      var cSalva = salvas[i];
      var jaExiste = consultas.proximas.some(function (c) { return c.id === cSalva.id; });
      if (!jaExiste) {
        consultas.proximas.unshift(cSalva);
      }
    }
  } catch (e) {}

  // carrega consultas canceladas pela tela inicial
  try {
    var canceladasInicio = JSON.parse(localStorage.getItem("fluxconnect_consultas_canceladas") || "[]");
    canceladasInicio.forEach(function (cCanc) {
      var jaExiste = consultas.canceladas.some(function (c) { return c.id === cCanc.id; });
      if (!jaExiste) consultas.canceladas.unshift(cCanc);
    });
  } catch (e) {}

  // aplica as novas datas das consultas reagendadas
  try {
    var reagendadas = JSON.parse(localStorage.getItem("fluxconnect_consultas_reagendadas") || "{}");
    consultas.proximas.forEach(function (c) {
      if (reagendadas[c.id]) Object.assign(c, reagendadas[c.id]);
    });
  } catch (e) {}

  configurarAbas();
  configurarBusca();
  configurarModais();
  renderizar(abaAtual);
});
