/**
 * FluxConnect - Portal do Paciente: Tela Principal
 * Modais: Preparo de Exame e Cancelamento de Consulta
 */

document.addEventListener("DOMContentLoaded", function () {
  // Inicializa ícones do Lucide se disponíveis
  if (window.lucide) {
    window.lucide.createIcons();
  }

  configurarPreparo();
  configurarCancelamento();
});

// --------------------------------------------------------------------------
// MODAL: PREPARO PARA O PRÓXIMO EXAME
// --------------------------------------------------------------------------
function configurarPreparo() {
  const modal = document.getElementById("modalPreparo");
  const btnAbrir = document.getElementById("btnVerPreparo");
  const btnFechar = document.getElementById("btnFecharPreparo");
  const btnEntendi = document.getElementById("btnEntendiPreparo");

  if (!modal || !btnAbrir) return;

  function fechar() {
    modal.classList.remove("visivel");
  }

  btnAbrir.addEventListener("click", function (e) {
    e.preventDefault();
    modal.classList.add("visivel");
  });

  if (btnFechar) btnFechar.addEventListener("click", fechar);
  if (btnEntendi) btnEntendi.addEventListener("click", fechar);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) fechar();
  });
}

// --------------------------------------------------------------------------
// MODAL: CANCELAR PRÓXIMA CONSULTA
// --------------------------------------------------------------------------
function configurarCancelamento() {
  const btnAbrir = document.getElementById("btnCancelarProximaConsulta");
  const modalCancelamento = document.getElementById("modalCancelamento");
  const modalSucesso = document.getElementById("modalSucesso");

  if (!btnAbrir || !modalCancelamento) return;

  const selectMotivo = document.getElementById("selectMotivo");
  const textareaJustificativa = document.getElementById("textareaJustificativa");
  const contador = document.getElementById("contadorAtual");

  const btnConfirmar = document.getElementById("btnSimCancelar");
  const btnManter = document.getElementById("btnNaoManter");
  const btnFecharSucesso = document.getElementById("btnFecharSucesso");

  // Elementos de status na tela principal
  const statusEl = document.getElementById("statusProximaConsulta");
  const statusPonto = document.getElementById("pointStatusProximaConsulta") || document.querySelector(".config-status .status-point");
  const botoesCard = document.querySelector(".card-proxima-consulta .buttons-card");

  // Função para aplicar visual de cancelamento no card
  function aplicarVisualCancelado() {
    if (statusEl) {
      statusEl.textContent = "Cancelada";
      statusEl.classList.add("cancelada");
    }
    if (statusPonto) {
      statusPonto.classList.add("cancelada");
    }
    if (botoesCard) {
      botoesCard.style.display = "none";
    }
  }

  // Verifica no localStorage se a consulta já foi cancelada anteriormente
  try {
    const canceladas = JSON.parse(localStorage.getItem("fluxconnect_consultas_canceladas") || "[]");
    const estaCancelada = canceladas.some(function (c) {
      return c.id === "prox-1" || c.status === "cancelada";
    });
    if (estaCancelada) {
      aplicarVisualCancelado();
    }
  } catch (e) {}

  // Abrir modal de cancelamento
  btnAbrir.addEventListener("click", function (evento) {
    evento.preventDefault();

    if (selectMotivo) selectMotivo.value = "";
    if (textareaJustificativa) textareaJustificativa.value = "";
    if (contador) contador.textContent = "0";
    if (btnConfirmar) btnConfirmar.disabled = true;

    modalCancelamento.classList.add("visivel");

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Habilitar botão Confirmar apenas ao selecionar um motivo
  if (selectMotivo && btnConfirmar) {
    selectMotivo.addEventListener("change", function () {
      btnConfirmar.disabled = !selectMotivo.value;
    });
  }

  // Contador de caracteres na justificativa
  if (textareaJustificativa && contador) {
    textareaJustificativa.addEventListener("input", function () {
      contador.textContent = textareaJustificativa.value.length;
    });
  }

  // Manter consulta (fecha o modal)
  if (btnManter) {
    btnManter.addEventListener("click", function () {
      modalCancelamento.classList.remove("visivel");
    });
  }

  // Confirmar cancelamento
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", function () {
      if (!selectMotivo || !selectMotivo.value) return;

      const motivoTexto = selectMotivo.value;
      const justificativaTexto = textareaJustificativa ? textareaJustificativa.value.trim() : "";
      const motivoCompleto = justificativaTexto ? `${motivoTexto}: ${justificativaTexto}` : motivoTexto;

      // 1. Atualizar visual do card na tela principal
      aplicarVisualCancelado();

      // 2. Salvar no localStorage para refletir na tela de Consultas
      try {
        const canceladas = JSON.parse(localStorage.getItem("fluxconnect_consultas_canceladas") || "[]");
        const jaExiste = canceladas.some(function (c) {
          return c.id === "prox-1";
        });
        if (!jaExiste) {
          canceladas.unshift({
            id: "prox-1",
            dia: "14",
            mes: "JUN",
            ano: "2026",
            hora: "10:30",
            nome: "Dr. Carlos Lima",
            especialidade: "Clínico Geral",
            local: "Clínica FluxMed — Rua Defala Attem, 1200",
            status: "cancelada",
            motivo: motivoCompleto
          });
          localStorage.setItem("fluxconnect_consultas_canceladas", JSON.stringify(canceladas));
        }
      } catch (e) {
        console.error("Erro ao salvar consulta cancelada", e);
      }

      // 3. Fechar modal de cancelamento e abrir modal de sucesso
      modalCancelamento.classList.remove("visivel");
      if (modalSucesso) {
        modalSucesso.classList.add("visivel");
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }
    });
  }

  // Fechar modal de sucesso
  if (btnFecharSucesso) {
    btnFecharSucesso.addEventListener("click", function () {
      if (modalSucesso) modalSucesso.classList.remove("visivel");
    });
  }

  // Fechar ao clicar fora dos modais
  [modalCancelamento, modalSucesso].forEach(function (modal) {
    if (modal) {
      modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
          modal.classList.remove("visivel");
        }
      });
    }
  });

  // Fechar com a tecla Escape
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
      if (modalCancelamento) modalCancelamento.classList.remove("visivel");
      if (modalSucesso) modalSucesso.classList.remove("visivel");
    }
  });
}
