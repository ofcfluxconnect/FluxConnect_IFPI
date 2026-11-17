//Controle de Interatividade da Tela

document.addEventListener("DOMContentLoaded", () => {
  //Dados do exam
  const preparosExames = {
    ecocardiograma: {
      titulo: "Ecocardiograma Transtorácico",
      data: "18 de Junho de 2026 às 08:00",
      local: "Lab FluxLab — Rua Augusta, 500",
      instrucoes: [
        "Não é necessário jejum absoluto. Faça uma refeição leve até 2 horas antes do horário marcado.",
        "Vista roupas confortáveis de duas peças (blusa/camisa e calça/saia) para facilitar o exame.",
        "Evite o consumo de café, chá preto, energéticos ou cigarros nas 4 horas que antecedem o procedimento.",
        "Traga exames cardiológicos anteriores (se houver) e documento com foto."
      ],
      observacao: "O procedimento dura em média 30 minutos e não requer repouso após sua conclusão."
    },
    hemograma: {
      titulo: "Hemograma Completo (Coleta de Sangue)",
      data: "19 de Junho de 2026 às 07:30",
      local: "FluxDiagnósticos — Av. Paulista, 1200",
      instrucoes: [
        "Jejum obrigatório de 8 a 12 horas. O consumo de água filtrada é permitido com moderação.",
        "Não ingerir bebidas alcoólicas nas 72 horas que antecedem a coleta.",
        "Evite a realização de esforço físico intenso no dia anterior à coleta.",
        "Comunique à equipe caso faça uso contínuo de anticoagulantes, antibióticos ou suplementos."
      ],
      observacao: "Resultado estimado em até 24 horas úteis após a coleta."
    },
    ultrassonografia: {
      titulo: "Ultrassonografia Abdominal Total",
      data: "22 de Junho de 2026 às 10:00",
      local: "Centro de Imagem FluxScan — Rua Oscar Freire, 300",
      instrucoes: [
        "Jejum alimentar rigoroso de 6 a 8 horas (evitar alimentos gordurosos e laticínios no dia anterior).",
        "Bexiga cheia: ingerir de 4 a 6 copos de água 1 hora antes do exame e não urinar até a realização.",
        "Não fumar ou mascar chicletes antes do exame para reduzir gases intestinais.",
        "Traga exames de ultrassonografia ou tomografia anteriores para estudo comparativo."
      ],
      observacao: "Exame seguro, indolor e sem radiação ionizante."
    },
    ergometrico: {
      titulo: "Teste Ergométrico (Teste de Esforço em Esteira)",
      data: "25 de Junho de 2026 às 09:00",
      local: "Lab FluxLab — Rua Augusta, 500",
      instrucoes: [
        "Alimentação leve até 2 horas antes do exame. Não realize o exame em jejum.",
        "Traje obrigatório: tênis adequado e roupas esportivas confortáveis (bermuda/calça de ginástica e camiseta).",
        "Não consumir cafeína (café, refrigerante de cola, chocolate) nas 12 horas anteriores.",
        "Consulte seu cardiologista com antecedência sobre a eventual suspensão de remédios (ex: betabloqueadores)."
      ],
      observacao: "Recomenda-se repouso nas primeiras horas após o término do teste."
    }
  };

  // Base de dados dos exames
  const listaExames = [
    // Disponíveis
    {
      id: 1,
      aba: "disponiveis",
      titulo: "Hemograma Completo",
      categoria: "laboratorial",
      dataIso: "2026-06-10",
      dataTexto: "10 de Junho de 2026",
      status: "disponivel",
      statusTexto: "Resultado Disponível",
      solicitante: "Solicitado por Dr. Carlos Lima",
      local: "Lab FluxLab",
      tipoIcone: "sangue"
    },
    {
      id: 2,
      aba: "disponiveis",
      titulo: "Ressonância Magnética — Coluna Lombar",
      categoria: "imagem",
      dataIso: "2026-06-05",
      dataTexto: "5 de Junho de 2026",
      status: "disponivel",
      statusTexto: "Resultado Disponível",
      solicitante: "Solicitado por Dra. Fernanda Martins",
      local: "Centro de Imagem FluxScan",
      tipoIcone: "imagem"
    },
    {
      id: 3,
      aba: "disponiveis",
      titulo: "Tomografia Computadorizada — Abdômen",
      categoria: "imagem",
      dataIso: "2026-05-28",
      dataTexto: "28 de Maio de 2026",
      status: "disponivel",
      statusTexto: "Resultado Disponível",
      solicitante: "Solicitado por Dr. Ricardo Souza",
      local: "Lab FluxLab",
      tipoIcone: "imagem"
    },
    {
      id: 4,
      aba: "disponiveis",
      titulo: "Glicemia de Jejum",
      categoria: "laboratorial",
      dataIso: "2026-05-20",
      dataTexto: "20 de Maio de 2026",
      status: "disponivel",
      statusTexto: "Resultado Disponível",
      solicitante: "Solicitado por Dra. Ana Beatriz Costa",
      local: "FluxDiagnósticos",
      tipoIcone: "sangue"
    },

    // Pendentes
    {
      id: 5,
      aba: "pendentes",
      titulo: "Ecocardiograma",
      categoria: "cardiologico",
      dataIso: "2026-06-18T08:00",
      dataTexto: "18 de Junho de 2026 às 08:00",
      status: "agendado",
      statusTexto: "Agendado",
      local: "Lab FluxLab — Rua Augusta, 500",
      chavePreparo: "ecocardiograma",
      tipoIcone: "pendente"
    },
    {
      id: 6,
      aba: "pendentes",
      titulo: "Hemograma Completo",
      categoria: "laboratorial",
      dataIso: "2026-06-19T07:30",
      dataTexto: "19 de Junho de 2026 às 07:30",
      status: "agendado",
      statusTexto: "Agendado",
      local: "FluxDiagnósticos — Av. Paulista, 1200",
      chavePreparo: "hemograma",
      tipoIcone: "pendente"
    },
    {
      id: 7,
      aba: "pendentes",
      titulo: "Ultrassonografia Abdominal",
      categoria: "imagem",
      dataIso: "2026-06-22T10:00",
      dataTexto: "22 de Junho de 2026 às 10:00",
      status: "aguardando",
      statusTexto: "Aguardando",
      local: "Centro de Imagem FluxScan — Rua Oscar Freire, 300",
      chavePreparo: "ultrassonografia",
      tipoIcone: "pendente"
    },
    {
      id: 8,
      aba: "pendentes",
      titulo: "Teste Ergométrico",
      categoria: "cardiologico",
      dataIso: "2026-06-25T09:00",
      dataTexto: "25 de Junho de 2026 às 09:00",
      status: "agendado",
      statusTexto: "Agendado",
      local: "Lab FluxLab — Rua Augusta, 500",
      chavePreparo: "ergometrico",
      tipoIcone: "pendente"
    }
  ];

  // pegando os elementos via DOM
  const containerExames = document.getElementById("containerExames");
  const estadoVazio = document.getElementById("estadoVazio");

  const tabDisponiveis = document.getElementById("tabDisponiveis");
  const tabPendentes = document.getElementById("tabPendentes");

  const cardMetricDisponiveis = document.getElementById("cardMetricDisponiveis");
  const cardMetricPendentes = document.getElementById("cardMetricPendentes");

  const searchInput = document.getElementById("searchInput");
  const searchClearBtn = document.getElementById("searchClearBtn");

  const btnFiltrar = document.getElementById("btnFiltrar");
  const menuFiltrar = document.getElementById("menuFiltrar");
  const btnOrdenar = document.getElementById("btnOrdenar");
  const menuOrdenar = document.getElementById("menuOrdenar");

  const btnAtualizar = document.getElementById("btnAtualizar");
  const updateText = document.getElementById("updateText");

  // Modal
  const modalPreparo = document.getElementById("modalPreparo");
  const modalExamTitle = document.getElementById("modalExamTitle");
  const modalExamBody = document.getElementById("modalExamBody");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const btnModalEntendi = document.getElementById("btnModalEntendi");

  let currentTab = "disponiveis";
  let currentFilter = "all";
  let currentSort = "recent";

  // renderizacao dos cards
  function obterIconeSvg(tipoIcone) {
    if (tipoIcone === "sangue") {
      return `
        <div class="icone_cartao_exame tema_azul">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M19 14C19 17.866 15.866 21 12 21C8.13401 21 5 17.866 5 14C5 11 8 6 12 3C16 6 19 11 19 14Z" stroke="#1A6FC4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11V15M10 13H14" stroke="#1A6FC4" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>`;
    }
    if (tipoIcone === "imagem") {
      return `
        <div class="icone_cartao_exame tema_azul">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#1A6FC4" stroke-width="1.8"/>
            <circle cx="12" cy="12" r="5" stroke="#1A6FC4" stroke-width="1.8"/>
            <path d="M12 7V17M7 12H17" stroke="#1A6FC4" stroke-width="1.8"/>
          </svg>
        </div>`;
    }
    return `
      <div class="icone_cartao_exame tema_laranja">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="#F79009" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 11V14L14 15" stroke="#F79009" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>`;
  }

  function obterSeloStatus(status, statusTexto) {
    if (status === "disponivel") {
      return `
        <span class="selo_status selo_disponivel">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#12B76A" stroke-width="1.2"/>
            <path d="M4 6L5.5 7.5L8 4.5" stroke="#12B76A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${statusTexto}
        </span>`;
    }
    if (status === "agendado") {
      return `
        <span class="selo_status selo_agendado">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" stroke="#B45309" stroke-width="1.2"/>
            <path d="M5 3V5.2L6.2 6" stroke="#B45309" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          ${statusTexto}
        </span>`;
    }
    return `
      <span class="selo_status selo_aguardando">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <circle cx="4" cy="4" r="3" fill="#64748B"/>
        </svg>
        ${statusTexto}
      </span>`;
  }

  function obterMetadados(exame) {
    let html = `
      <span class="item_metadado">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#6B7585" stroke-width="1.8"/>
          <path d="M16 2V6M8 2V6M3 10H21" stroke="#6B7585" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        ${exame.dataTexto}
      </span>`;

    if (exame.solicitante) {
      html += `
        <span class="item_metadado">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#6B7585" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#6B7585" stroke-width="1.8"/>
          </svg>
          ${exame.solicitante}
        </span>`;
    }

    if (exame.local) {
      const iconeLocal = exame.aba === "pendentes"
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#6B7585" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="#6B7585" stroke-width="1.8"/>
           </svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M14 3V9.5L19 19C19.5 20 18.5 21 17 21H7C5.5 21 4.5 20 5 19L10 9.5V3" stroke="#6B7585" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`;

      html += `
        <span class="item_metadado">
          ${iconeLocal}
          ${exame.local}
        </span>`;
    }

    return html;
  }

  function obterBotaoAcao(exame) {
    if (exame.aba === "disponiveis") {
      return `
        <button class="botao_baixar_laudo" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Baixar Laudo (PDF)</span>
        </button>`;
    }
    return `
      <button class="botao_ver_preparo" type="button" data-exam-key="${exame.chavePreparo}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#1A6FC4" stroke-width="2"/>
          <path d="M12 16V12M12 8H12.01" stroke="#1A6FC4" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Ver Preparo</span>
      </button>`;
  }

  function renderizarCard(exame) {
    return `
      <article class="cartao_exame">
        <div class="conteudo_principal_cartao">
          ${obterIconeSvg(exame.tipoIcone)}
          <div class="info_cartao_exame">
            <div class="linha_titulo_exame">
              <h3 class="titulo_exame">${exame.titulo}</h3>
              ${obterSeloStatus(exame.status, exame.statusTexto)}
            </div>
            <div class="linha_metadados_exame">
              ${obterMetadados(exame)}
            </div>
          </div>
        </div>
        <div class="acoes_cartao_exame">
          ${obterBotaoAcao(exame)}
        </div>
      </article>`;
  }

  // renderizacao e filtragem
  function renderizarExames() {
    const query = searchInput.value.toLowerCase().trim();

    // 1. Filtra pela aba ativa
    let examesFiltrados = listaExames.filter((e) => e.aba === currentTab);

    // 2. Filtra pela categoria
    if (currentFilter !== "all") {
      examesFiltrados = examesFiltrados.filter((e) => e.categoria === currentFilter);
    }

    // 3. Filtra pelo termo de busca
    if (query) {
      examesFiltrados = examesFiltrados.filter((e) => {
        const titulo = e.titulo.toLowerCase();
        const local = (e.local || "").toLowerCase();
        const solicitante = (e.solicitante || "").toLowerCase();
        return titulo.includes(query) || local.includes(query) || solicitante.includes(query);
      });
    }

    // 4. Ordena
    examesFiltrados.sort((a, b) => {
      const dateA = new Date(a.dataIso).getTime();
      const dateB = new Date(b.dataIso).getTime();

      if (currentSort === "recent") return dateB - dateA;
      if (currentSort === "oldest") return dateA - dateB;
      if (currentSort === "az") return a.titulo.localeCompare(b.titulo);
      if (currentSort === "za") return b.titulo.localeCompare(a.titulo);
      return 0;
    });

    // 5. Injeta no DOM
    if (examesFiltrados.length === 0) {
      containerExames.innerHTML = "";
      estadoVazio.style.display = "block";
    } else {
      estadoVazio.style.display = "none";
      containerExames.innerHTML = examesFiltrados.map(renderizarCard).join("");

      // Vincula os cliques dos botões "Ver Preparo" recém-criados
      containerExames.querySelectorAll(".botao_ver_preparo").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const examKey = btn.getAttribute("data-exam-key");
          openModalPreparo(examKey);
        });
      });
    }
  }

  // Alternar as abas
  function switchTab(targetTab) {
    currentTab = targetTab;

    if (targetTab === "disponiveis") {
      tabDisponiveis.classList.add("ativo");
      tabDisponiveis.setAttribute("aria-selected", "true");
      tabPendentes.classList.remove("ativo");
      tabPendentes.setAttribute("aria-selected", "false");
    } else {
      tabPendentes.classList.add("ativo");
      tabPendentes.setAttribute("aria-selected", "true");
      tabDisponiveis.classList.remove("ativo");
      tabDisponiveis.setAttribute("aria-selected", "false");
    }

    renderizarExames();
  }

  tabDisponiveis.addEventListener("click", () => switchTab("disponiveis"));
  tabPendentes.addEventListener("click", () => switchTab("pendentes"));

  //Alterno aba clicando nos cards de cima
  if (cardMetricDisponiveis) {
    cardMetricDisponiveis.addEventListener("click", () => switchTab("disponiveis"));
  }
  if (cardMetricPendentes) {
    cardMetricPendentes.addEventListener("click", () => switchTab("pendentes"));
  }

  // Instrucoes de preparo
  function openModalPreparo(examKey) {
    const dados = preparosExames[examKey];
    if (!dados) return;

    modalExamTitle.textContent = dados.titulo;

    let instructionsHtml = '<ul class="lista_instrucoes_preparo">';
    dados.instrucoes.forEach((inst, index) => {
      instructionsHtml += `
        <li class="item_instrucao_preparo">
          <span class="marcador_instrucao">${index + 1}</span>
          <span class="texto_instrucao">${inst}</span>
        </li>
      `;
    });
    instructionsHtml += "</ul>";

    if (dados.observacao) {
      instructionsHtml += `
        <div class="caixa_info_modal">
          <strong>Importante:</strong> ${dados.observacao}
        </div>
      `;
    }

    modalExamBody.innerHTML = `
      <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">
        <strong>Data e Local:</strong> ${dados.data} • ${dados.local}
      </div>
      ${instructionsHtml}
    `;

    modalPreparo.classList.add("ativo");
    modalPreparo.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModalPreparo() {
    modalPreparo.classList.remove("ativo");
    modalPreparo.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  modalCloseBtn.addEventListener("click", closeModalPreparo);
  btnModalEntendi.addEventListener("click", closeModalPreparo);
  modalPreparo.addEventListener("click", (e) => {
    if (e.target === modalPreparo) {
      closeModalPreparo();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalPreparo.classList.contains("ativo")) {
      closeModalPreparo();
    }
  });

  // busca
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim();
    searchClearBtn.style.display = query ? "block" : "none";
    renderizarExames();
  });

  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchClearBtn.style.display = "none";
    renderizarExames();
    searchInput.focus();
  });

  // Filtrar e ordenar
  btnFiltrar.addEventListener("click", (e) => {
    e.stopPropagation();
    menuFiltrar.classList.toggle("visivel");
    menuOrdenar.classList.remove("visivel");
  });

  btnOrdenar.addEventListener("click", (e) => {
    e.stopPropagation();
    menuOrdenar.classList.toggle("visivel");
    menuFiltrar.classList.remove("visivel");
  });

  document.addEventListener("click", (e) => {
    if (!menuFiltrar.contains(e.target) && e.target !== btnFiltrar) {
      menuFiltrar.classList.remove("visivel");
    }
    if (!menuOrdenar.contains(e.target) && e.target !== btnOrdenar) {
      menuOrdenar.classList.remove("visivel");
    }
  });

  // Ações de Filtrar
  const filterItems = menuFiltrar.querySelectorAll(".item_dropdown");
  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      filterItems.forEach((i) => i.classList.remove("ativo"));
      item.classList.add("ativo");
      currentFilter = item.getAttribute("data-filter");
      menuFiltrar.classList.remove("visivel");

      if (currentFilter !== "all") {
        btnFiltrar.classList.add("filtro_ativo");
      } else {
        btnFiltrar.classList.remove("filtro_ativo");
      }

      renderizarExames();
    });
  });

  // Ações de Ordenar
  const sortItems = menuOrdenar.querySelectorAll(".item_dropdown");
  sortItems.forEach((item) => {
    item.addEventListener("click", () => {
      sortItems.forEach((i) => i.classList.remove("ativo"));
      item.classList.add("ativo");
      currentSort = item.getAttribute("data-sort");
      menuOrdenar.classList.remove("visivel");
      renderizarExames();
    });
  });

  //Atualizar exames
  btnAtualizar.addEventListener("click", () => {
    const refreshIcon = btnAtualizar.querySelector(".icone_atualizar");
    refreshIcon.classList.add("girando");

    setTimeout(() => {
      refreshIcon.classList.remove("girando");
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      updateText.textContent = `Última atualização: hoje, ${hours}:${minutes}`;
      renderizarExames();
    }, 700);
  });

  // Renderização inicial
  renderizarExames();
});
