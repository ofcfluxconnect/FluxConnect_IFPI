
document.addEventListener("DOMContentLoaded", function () {

    // Elementos da página
    const botaoAbrir = document.getElementById("btnCancelarProximaConsulta");
    const modalCancelamento = document.getElementById("modalCancelamento");
    const modalSucesso = document.getElementById("modalSucesso");

    const motivo = document.getElementById("selectMotivo");
    const justificativa = document.getElementById("textareaJustificativa");
    const contador = document.getElementById("contadorAtual");

    const botaoConfirmar = document.getElementById("btnSimCancelar");
    const botaoManter = document.getElementById("btnNaoManter");
    const botaoFechar = document.getElementById("btnFecharSucesso");

    // Carregar ícones
    if (window.lucide) {
        lucide.createIcons();
    }

    // Abrir modal de cancelamento
    botaoAbrir.addEventListener("click", function (evento) {
        evento.preventDefault();

        motivo.value = "";
        justificativa.value = "";
        contador.textContent = "0";
        botaoConfirmar.disabled = true;

        modalCancelamento.classList.add("visivel");
    });

    // Habilitar botão quando selecionar motivo
    motivo.addEventListener("change", function () {
        botaoConfirmar.disabled = !motivo.value;
    });

    // Contar caracteres
    justificativa.addEventListener("input", function () {
        contador.textContent = justificativa.value.length;
    });

    // Manter consulta
    botaoManter.addEventListener("click", function () {
        modalCancelamento.classList.remove("visivel");
    });

    // Confirmar cancelamento
    botaoConfirmar.addEventListener("click", function () {

        if (!motivo.value) return;

        // Atualizar status da consulta
        const status = document.getElementById("statusProximaConsulta");

        if (status) {
            status.textContent = "Cancelada";
        }

        // Fechar primeiro modal
        modalCancelamento.classList.remove("visivel");

        // Abrir modal de sucesso
        modalSucesso.classList.add("visivel");
    });

    // Fechar modal de sucesso
    botaoFechar.addEventListener("click", function () {
        modalSucesso.classList.remove("visivel");
    });

    // Fechar ao clicar fora dos modais
    [modalCancelamento, modalSucesso].forEach(function (modal) {

        modal.addEventListener("click", function (evento) {
            if (evento.target === modal) {
                modal.classList.remove("visivel");
            }
        });

    });

});
