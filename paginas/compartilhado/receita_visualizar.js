// Visualizador de receita medica (documento para conferir e imprimir).
// Uso: ReceitaVisualizar.abrir({
//   paciente: { nome, cpf, idade, convenio },
//   medico: "Dr. Carlos Lima", crm: "CRM-PI 004512", especialidade: "Clínica Geral",
//   data: "2026-11-06T14:14:00", itens: [{ nome, via, quantidade, instrucoes }],
//   assinada: true, codigo: "FC-..."
// })
// Com assinada: false mostra a marca "Pré-visualização".

(function () {
  var estilos = `
    .rv-overlay { position: fixed; inset: 0; z-index: 2600; display: none; align-items: flex-start; justify-content: center;
      padding: 28px 16px; overflow-y: auto; background: rgba(15, 25, 35, 0.55); backdrop-filter: blur(2px); font-family: "Inter", sans-serif; }
    .rv-overlay.visivel { display: flex; }
    .rv-janela { width: 100%; max-width: 680px; animation: rvAparecer 0.2s ease; }
    @keyframes rvAparecer { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .rv-acoes { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; color: #fff; }
    .rv-acoes-titulo { font-size: 14px; font-weight: 600; }
    .rv-botoes { display: flex; gap: 8px; }
    .rv-btn { display: flex; align-items: center; gap: 7px; height: 36px; padding: 0 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: inherit; border: 1px solid rgba(255, 255, 255, 0.35); background: rgba(255, 255, 255, 0.12); color: #fff; }
    .rv-btn:hover { background: rgba(255, 255, 255, 0.22); }
    .rv-btn-primario { background: #fff; color: #0b3b6f; border-color: #fff; }
    .rv-btn-primario:hover { background: #eef4fd; }
    .rv-folha { position: relative; overflow: hidden; background: #fff; border-radius: 6px; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
      padding: 40px 44px 34px; color: #0f1923; text-align: left; }
    .rv-marca { position: absolute; top: 46%; left: 50%; transform: translate(-50%, -50%) rotate(-24deg); font-size: 46px; font-weight: 800;
      letter-spacing: 0.08em; color: rgba(220, 38, 38, 0.1); white-space: nowrap; pointer-events: none; text-transform: uppercase; }
    .rv-cabecalho { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 18px; border-bottom: 2px solid #0b3b6f; }
    .rv-clinica { display: flex; align-items: center; gap: 12px; }
    .rv-clinica img { width: 44px; height: 36px; object-fit: contain; }
    .rv-clinica-nome { font-size: 16px; font-weight: 700; color: #0b3b6f; margin: 0; }
    .rv-clinica-sub { font-size: 11px; color: #6b7585; margin: 2px 0 0; }
    .rv-medico { text-align: right; font-size: 12px; color: #374151; line-height: 1.5; }
    .rv-medico strong { display: block; font-size: 14px; color: #0f1923; }
    .rv-titulo { text-align: center; font-size: 15px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin: 22px 0 18px; }
    .rv-paciente { display: grid; grid-template-columns: 2fr 1fr; gap: 6px 18px; background: #f5f7fa; border-radius: 8px; padding: 12px 14px; font-size: 12.5px; }
    .rv-paciente span { color: #6b7585; }
    .rv-paciente strong { font-weight: 600; }
    .rv-alergias { margin-top: 10px; font-size: 12px; font-weight: 600; color: #b91c1c; }
    .rv-lista { list-style: none; margin: 22px 0 0; padding: 0; counter-reset: medicamento; }
    .rv-item { position: relative; padding: 0 0 16px 34px; margin-bottom: 16px; border-bottom: 1px dashed #d1d9e4; counter-increment: medicamento; }
    .rv-item:last-child { border-bottom: none; margin-bottom: 0; }
    .rv-item::before { content: counter(medicamento) "."; position: absolute; left: 0; top: 0; font-size: 15px; font-weight: 700; color: #0b3b6f; }
    .rv-item-topo { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
    .rv-item-nome { font-size: 14.5px; font-weight: 700; }
    .rv-item-qtd { font-size: 12.5px; color: #374151; white-space: nowrap; }
    .rv-item-via { font-size: 12px; color: #6b7585; margin-top: 2px; }
    .rv-item-instrucoes { font-size: 13px; line-height: 1.55; margin-top: 6px; color: #1f2937; }
    .rv-rodape { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-top: 34px; }
    .rv-data { font-size: 12px; color: #374151; }
    .rv-assinatura { text-align: center; min-width: 240px; }
    .rv-assinatura-linha { border-top: 1px solid #0f1923; padding-top: 6px; font-size: 12.5px; font-weight: 600; }
    .rv-assinatura-sub { font-size: 11px; color: #6b7585; margin-top: 2px; }
    .rv-selo { display: flex; align-items: center; gap: 10px; margin-top: 24px; padding: 10px 12px; border-radius: 8px; font-size: 11.5px; line-height: 1.45; }
    .rv-selo-ok { background: #ecfdf3; border: 1px solid #a7f3c4; color: #166534; }
    .rv-selo-pendente { background: #fff7ed; border: 1px solid #fdba74; color: #9a3412; }
    .rv-selo strong { font-family: monospace; font-size: 12px; }
    @media (max-width: 600px) {
      .rv-folha { padding: 26px 20px; }
      .rv-cabecalho, .rv-rodape { flex-direction: column; align-items: flex-start; }
      .rv-medico { text-align: left; }
      .rv-paciente { grid-template-columns: 1fr; }
      .rv-acoes { flex-direction: column; align-items: stretch; }
    }
    /* na impressao sai so a folha da receita */
    @media print {
      body.imprimindo-receita > *:not(.rv-overlay) { display: none !important; }
      body.imprimindo-receita .rv-overlay { position: static; display: block; padding: 0; background: none; backdrop-filter: none; overflow: visible; }
      body.imprimindo-receita .rv-acoes { display: none; }
      body.imprimindo-receita .rv-folha { box-shadow: none; border-radius: 0; padding: 0; }
    }
  `;

  var overlay;

  function escapar(texto) {
    return String(texto == null ? "" : texto).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function formatarDataHora(data) {
    var d = new Date(data);
    var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return d.getDate() + " de " + meses[d.getMonth()] + " de " + d.getFullYear() + ", " +
      String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  // codigo de verificacao estavel para receitas antigas sem codigo salvo
  function gerarCodigo(dados) {
    var base = (dados.data || "") + (dados.itens || []).map(function (i) { return i.nome; }).join("|");
    var h = 0;
    for (var i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
    return "FC-" + h.toString(36).toUpperCase().padStart(7, "0");
  }

  function abrir(dados) {
    var p = dados.paciente || {};
    var assinada = dados.assinada !== false;
    var codigo = dados.codigo || gerarCodigo(dados);

    var itens = (dados.itens || []).map(function (m) {
      return `<li class="rv-item">
        <div class="rv-item-topo">
          <span class="rv-item-nome">${escapar(m.nome)}</span>
          <span class="rv-item-qtd">${escapar(m.quantidade)}</span>
        </div>
        <p class="rv-item-via">Uso ${escapar((m.via || "").toLowerCase())}</p>
        <p class="rv-item-instrucoes">${escapar(m.instrucoes)}</p>
      </li>`;
    }).join("");

    overlay.querySelector(".rv-janela").innerHTML = `
      <div class="rv-acoes">
        <span class="rv-acoes-titulo">${assinada ? "Receita médica" : "Pré-visualização da receita"}</span>
        <div class="rv-botoes">
          <button type="button" class="rv-btn" data-rv-imprimir>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir
          </button>
          <button type="button" class="rv-btn rv-btn-primario" data-rv-fechar>${assinada ? "Fechar" : "Voltar à edição"}</button>
        </div>
      </div>
      <article class="rv-folha" aria-label="Receita médica">
        ${assinada ? "" : '<span class="rv-marca">Pré-visualização</span>'}
        <header class="rv-cabecalho">
          <div class="rv-clinica">
            <img src="../../midias/logo/fluxConnect_2.svg" alt="" />
            <div>
              <p class="rv-clinica-nome">FluxConnect</p>
              <p class="rv-clinica-sub">Rede de clínicas e laboratórios</p>
            </div>
          </div>
          <div class="rv-medico">
            <strong>${escapar(dados.medico)}</strong>
            ${escapar(dados.especialidade || "")}<br />
            ${escapar(dados.crm || "")}
          </div>
        </header>

        <h2 class="rv-titulo">Receituário</h2>

        <div class="rv-paciente">
          <div><span>Paciente:</span> <strong>${escapar(p.nome)}</strong></div>
          <div><span>Idade:</span> <strong>${escapar(p.idade ? p.idade + " anos" : "—")}</strong></div>
          <div><span>CPF:</span> <strong>${escapar(p.cpf || "—")}</strong></div>
          <div><span>Convênio:</span> <strong>${escapar(p.convenio || "—")}</strong></div>
        </div>
        ${p.alergias && p.alergias.length ? `<p class="rv-alergias">Alergias registradas: ${escapar(p.alergias.join(", "))}</p>` : ""}

        <ol class="rv-lista">${itens || '<li class="rv-item">Nenhum medicamento.</li>'}</ol>

        <footer class="rv-rodape">
          <span class="rv-data">Emitida em ${escapar(formatarDataHora(dados.data || new Date()))}</span>
          <div class="rv-assinatura">
            <p class="rv-assinatura-linha">${escapar(dados.medico)}</p>
            <p class="rv-assinatura-sub">${escapar(dados.crm || "")}</p>
          </div>
        </footer>

        ${assinada
          ? `<p class="rv-selo rv-selo-ok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <span>Documento assinado digitalmente por ${escapar(dados.medico)}. Código de verificação: <strong>${escapar(codigo)}</strong></span>
            </p>`
          : `<p class="rv-selo rv-selo-pendente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Receita ainda não assinada. Volte à edição e clique em "Salvar e Assinar Digitalmente" para validar o documento.</span>
            </p>`}
      </article>
    `;

    overlay.classList.add("visivel");
    overlay.querySelector("[data-rv-fechar]").focus();
  }

  function fechar() {
    overlay.classList.remove("visivel");
  }

  function imprimir() {
    document.body.classList.add("imprimindo-receita");
    window.print();
  }

  function iniciar() {
    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);

    overlay = document.createElement("div");
    overlay.className = "rv-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = '<div class="rv-janela"></div>';
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-rv-fechar]")) return fechar();
      if (e.target.closest("[data-rv-imprimir]")) imprimir();
    });
    // fecha so o visualizador (o modal por baixo continua aberto)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("visivel")) {
        e.stopImmediatePropagation();
        fechar();
      }
    }, true);
    window.addEventListener("afterprint", function () {
      document.body.classList.remove("imprimindo-receita");
    });
  }

  window.ReceitaVisualizar = { abrir: abrir, fechar: fechar, gerarCodigo: gerarCodigo };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
