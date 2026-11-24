/**
 * FluxConnect - Portal do Paciente
 * Fluxo de Reagendamento de Consulta
 */

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------------------------------------------------------
  // ELEMENTOS DO DOM
  // --------------------------------------------------------------------------
  const btnVoltarTopo = document.getElementById("btnVoltarTopo");

  // Stepper
  const stepCircle3 = document.getElementById("stepCircle3");
  const stepIcone3 = document.getElementById("stepIcone3");
  const stepLinha3to4 = document.getElementById("stepLinha3to4");
  const stepCircle4 = document.getElementById("stepCircle4");

  // Passo 3
  const passo3Reagendamento = document.getElementById("passo3Reagendamento");
  const gridDiasReagendamento = document.getElementById("gridDiasReagendamento");
  const secaoHorariosDisponiveis = document.getElementById("secaoHorariosDisponiveis");
  const gridHorariosPills = document.getElementById("gridHorariosPills");
  const btnAvancarPasso3 = document.getElementById("btnAvancarPasso3");

  // Passo 4
  const passo4Reagendamento = document.getElementById("passo4Reagendamento");
  const confTextoDataHoraAtual = document.getElementById("confTextoDataHoraAtual");
  const confTextoDataHoraNova = document.getElementById("confTextoDataHoraNova");
  const btnVoltarPasso4 = document.getElementById("btnVoltarPasso4");
  const btnConfirmarReagendamentoFinal = document.getElementById("btnConfirmarReagendamentoFinal");

  // Toast
  const toastReagendamentoSucesso = document.getElementById("toastReagendamentoSucesso");
  const toastReagendamentoMsg = document.getElementById("toastReagendamentoMsg");

  // Lê parâmetro de retorno, se houver
  const paramsUrl = new URLSearchParams(window.location.search);
  const urlVolta = paramsUrl.get("volta") || "../index.html";
  const btnFecharTopo = document.querySelector(".btn-fechar-reagendamento");
  if (btnFecharTopo) btnFecharTopo.setAttribute("href", urlVolta);

  // --------------------------------------------------------------------------
  // ESTADO
  // --------------------------------------------------------------------------
  let passoAtual = 3;
  let diaSelecionado = null;
  let diaSemanaSelecionado = "Quarta-feira";
  let horaSelecionada = null;

  // --------------------------------------------------------------------------
  // NAVEGAÇÃO ENTRE PASSOS
  // --------------------------------------------------------------------------
  function irParaPasso(passo) {
    passoAtual = passo;

    if (passo === 3) {
      passo3Reagendamento.style.display = "flex";
      passo4Reagendamento.style.display = "none";

      // Stepper Passo 3
      stepCircle3.className = "step-circle ativo";
      stepIcone3.textContent = "3";
      stepLinha3to4.className = "step-linha";
      stepCircle4.className = "step-circle pendente";
    } else if (passo === 4) {
      passo3Reagendamento.style.display = "none";
      passo4Reagendamento.style.display = "flex";

      // Stepper Passo 4 (Passo 3 fica com checkmark ✓)
      stepCircle3.className = "step-circle concluido";
      stepIcone3.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
      stepLinha3to4.className = "step-linha concluido";
      stepCircle4.className = "step-circle ativo";

      // Atualiza textos do card comparativo
      confTextoDataHoraAtual.textContent = "14 de Junho de 2026 · 10:30";
      confTextoDataHoraNova.textContent = `${diaSelecionado} de Junho de 2026 · ${horaSelecionada}`;
    }
  }

  // Botão Voltar do Header
  if (btnVoltarTopo) {
    btnVoltarTopo.addEventListener("click", () => {
      if (passoAtual === 4) {
        irParaPasso(3);
      } else {
        window.location.href = urlVolta;
      }
    });
  }

  // Botão Voltar do Passo 4
  if (btnVoltarPasso4) {
    btnVoltarPasso4.addEventListener("click", () => {
      irParaPasso(3);
    });
  }

  // --------------------------------------------------------------------------
  // PASSO 3: SELEÇÃO DE DIA E HORÁRIO
  // --------------------------------------------------------------------------
  const diasDisponiveis = gridDiasReagendamento.querySelectorAll(".dia-disponivel");
  diasDisponiveis.forEach((item) => {
    item.addEventListener("click", () => {
      diasDisponiveis.forEach((d) => d.classList.remove("selecionado"));
      item.classList.add("selecionado");

      diaSelecionado = item.getAttribute("data-dia");
      diaSemanaSelecionado = item.getAttribute("data-dia-semana") || "Quarta-feira";

      // Exibe seção de horários
      secaoHorariosDisponiveis.style.display = "flex";

      // Reseta horário selecionado se trocar de data
      horaSelecionada = null;
      btnAvancarPasso3.disabled = true;
      btnAvancarPasso3.classList.remove("habilitado");

      const pills = gridHorariosPills.querySelectorAll(".pill-horario");
      pills.forEach((p) => p.classList.remove("selecionado"));
    });
  });

  const pillsHorario = gridHorariosPills.querySelectorAll(".pill-horario");
  pillsHorario.forEach((pill) => {
    pill.addEventListener("click", () => {
      pillsHorario.forEach((p) => p.classList.remove("selecionado"));
      pill.classList.add("selecionado");

      horaSelecionada = pill.getAttribute("data-hora");

      // Habilita botão Avançar
      btnAvancarPasso3.disabled = false;
      btnAvancarPasso3.classList.add("habilitado");
    });
  });

  if (btnAvancarPasso3) {
    btnAvancarPasso3.addEventListener("click", () => {
      if (diaSelecionado && horaSelecionada) {
        irParaPasso(4);
      }
    });
  }

  // --------------------------------------------------------------------------
  // PASSO 4: CONFIRMAÇÃO DO REAGENDAMENTO
  // --------------------------------------------------------------------------
  if (btnConfirmarReagendamentoFinal) {
    btnConfirmarReagendamentoFinal.addEventListener("click", () => {
      // Salva no localStorage para a tela principal ler e exibir os novos dados
      const dadosConsulta = {
        medico: "Dr. Carlos Lima",
        especialidade: "Clínico Geral",
        dataCompleta: `${diaSemanaSelecionado}, ${diaSelecionado} de Junho de 2026`,
        horaCompleta: `${horaSelecionada} · Duração estimada 30 min`,
        dia: diaSelecionado,
        hora: horaSelecionada,
        local: "Clínica FluxMed — Rua Defala Attem, 1200",
        atualizado: true
      };

      try {
        localStorage.setItem("fluxconnect_proxima_consulta", JSON.stringify(dadosConsulta));

        // Se a consulta estava cancelada, reagendar reativa ela
        const canceladas = JSON.parse(localStorage.getItem("fluxconnect_consultas_canceladas") || "[]");
        const restantes = canceladas.filter((c) => c.id !== "prox-1");
        localStorage.setItem("fluxconnect_consultas_canceladas", JSON.stringify(restantes));
      } catch (e) {
        console.error("Erro ao salvar no localStorage", e);
      }

      // Mostra o Toast de sucesso
      mostrarToast(
        `Nova data: ${diaSemanaSelecionado}, ${diaSelecionado} de Junho de 2026 às ${horaSelecionada}.`
      );

      // Redireciona de volta para a tela de origem após 1.8 segundos
      setTimeout(() => {
        window.location.href = urlVolta;
      }, 1800);
    });
  }

  function mostrarToast(mensagem) {
    toastReagendamentoMsg.textContent = mensagem;
    toastReagendamentoSucesso.classList.add("visivel");
  }
});
