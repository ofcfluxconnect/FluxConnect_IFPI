// dados da proxima consulta exibida no card da tela inicial
var proximaConsulta = {
  id: "inicio-1",
  dia: "14", mes: "JUN", ano: "2026", hora: "10:30",
  nome: "Dr. José Inacio",
  especialidade: "Clínico Geral",
  local: "UBS Centro – Presencial"
};

var CHAVE_CANCELADA = "fluxconnect_consulta_inicio_cancelada";
var CHAVE_CANCELADAS = "fluxconnect_consultas_canceladas";
var CHAVE_REAGENDADAS = "fluxconnect_consultas_reagendadas";

var mesesNumero = {
  JAN: 1, FEV: 2, MAR: 3, ABR: 4, MAI: 5, JUN: 6,
  JUL: 7, AGO: 8, SET: 9, OUT: 10, NOV: 11, DEZ: 12
};
var nomesMeses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
var diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];


// aplica uma data reagendada (se houver) e atualiza o card e o link de reagendar
function atualizarDataConsulta() {
  try {
    var reagendadas = JSON.parse(localStorage.getItem(CHAVE_REAGENDADAS) || "{}");
    if (reagendadas[proximaConsulta.id]) Object.assign(proximaConsulta, reagendadas[proximaConsulta.id]);
  } catch (erro) {}

  var c = proximaConsulta;
  var mes = mesesNumero[c.mes];
  var data = new Date(+c.ano, mes - 1, +c.dia);

  document.getElementById("dataProximaConsulta").textContent =
    diasSemana[data.getDay()] + ", " + data.getDate() + " de " + nomesMeses[mes - 1] + " de " + c.ano;
  document.getElementById("horaProximaConsulta").textContent = c.hora;
  document.getElementById("resumoDataCancelamento").textContent =
    c.dia + "/" + String(mes).padStart(2, "0") + "/" + c.ano + " às " + c.hora;

  var params = new URLSearchParams({
    id: c.id,
    medico: c.nome,
    esp: c.especialidade,
    local: c.local,
    data: c.ano + "-" + String(mes).padStart(2, "0") + "-" + c.dia,
    hora: c.hora,
    volta: "../tela_principal_paciente/index.html"
  });
  document.getElementById("btnReagendarProximaConsulta").href = "../reagendar_consulta/index.html?" + params.toString();
}


// abre o modal limpando o formulario
function abrirCancelamento(e) {
  if (e) e.preventDefault();

  document.getElementById("selectMotivo").value = "";
  document.getElementById("textareaJustificativa").value = "";
  document.getElementById("contadorAtual").textContent = "0";
  document.getElementById("btnSimCancelar").disabled = true;

  document.getElementById("modalCancelamento").classList.add("visivel");
}

function fecharCancelamento() {
  document.getElementById("modalCancelamento").classList.remove("visivel");
}


// troca o card para o estado "cancelada"
function mostrarCardCancelado(motivo) {
  var card = document.getElementById("cardProximaConsulta");
  var botoes = document.getElementById("botoesProximaConsulta");

  card.classList.add("card-cancelado");
  document.getElementById("statusProximaConsulta").textContent = "Cancelada";

  botoes.outerHTML =
    '<div class="aviso-cancelado">' +
    "<span><strong>Consulta cancelada.</strong> Motivo: " + motivo + "</span>" +
    '<a href="../agendar_consulta/index.html?novo=1">Agendar nova consulta</a>' +
    "</div>";
}


// confirma o cancelamento, salva e mostra o modal de sucesso
function confirmarCancelamento() {
  var motivo = document.getElementById("selectMotivo").value;
  if (!motivo) return;

  var justificativa = document.getElementById("textareaJustificativa").value.trim();
  var motivoCompleto = justificativa ? motivo + " – " + justificativa : motivo;

  // guarda o cancelamento para manter o estado ao recarregar
  // e para a consulta aparecer na aba "Canceladas" da tela de Consultas
  try {
    localStorage.setItem(CHAVE_CANCELADA, motivoCompleto);

    var canceladas = JSON.parse(localStorage.getItem(CHAVE_CANCELADAS) || "[]");
    var cancelada = Object.assign({}, proximaConsulta, {
      status: "cancelada",
      motivo: motivoCompleto
    });
    canceladas.unshift(cancelada);
    localStorage.setItem(CHAVE_CANCELADAS, JSON.stringify(canceladas));
  } catch (erro) {}

  fecharCancelamento();
  mostrarCardCancelado(motivoCompleto);
  document.getElementById("modalSucesso").classList.add("visivel");
}


function configurarCancelamento() {
  var modalCanc = document.getElementById("modalCancelamento");
  var modalSuc = document.getElementById("modalSucesso");
  var selectMotivo = document.getElementById("selectMotivo");
  var textarea = document.getElementById("textareaJustificativa");
  var btnSim = document.getElementById("btnSimCancelar");

  document.getElementById("btnCancelarProximaConsulta").addEventListener("click", abrirCancelamento);

  // so libera o botao com um motivo escolhido
  selectMotivo.addEventListener("change", function () {
    btnSim.disabled = !selectMotivo.value;
  });

  textarea.addEventListener("input", function () {
    document.getElementById("contadorAtual").textContent = textarea.value.length;
  });

  btnSim.addEventListener("click", confirmarCancelamento);
  document.getElementById("btnNaoManter").addEventListener("click", fecharCancelamento);
  document.getElementById("btnFecharSucesso").addEventListener("click", function () {
    modalSuc.classList.remove("visivel");
  });

  // fecha ao clicar no fundo escurecido
  modalCanc.addEventListener("click", function (e) {
    if (e.target === modalCanc) fecharCancelamento();
  });
  modalSuc.addEventListener("click", function (e) {
    if (e.target === modalSuc) modalSuc.classList.remove("visivel");
  });
}


// modal "Ver preparo" do card do proximo exame
function configurarPreparo() {
  var modal = document.getElementById("modalPreparo");

  function fechar() {
    modal.classList.remove("visivel");
  }

  document.getElementById("btnVerPreparo").addEventListener("click", function (e) {
    e.preventDefault();
    modal.classList.add("visivel");
  });
  document.getElementById("btnFecharPreparo").addEventListener("click", fechar);
  document.getElementById("btnEntendiPreparo").addEventListener("click", fechar);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });
}


document.addEventListener("DOMContentLoaded", function () {
  atualizarDataConsulta();
  configurarCancelamento();
  configurarPreparo();

  // se a consulta ja foi cancelada antes, mostra o card cancelado
  try {
    var motivoSalvo = localStorage.getItem(CHAVE_CANCELADA);
    if (motivoSalvo) mostrarCardCancelado(motivoSalvo);
  } catch (erro) {}
});
