// Modal "Visualizar Historico" (prontuario somente leitura) da area do profissional.
// Precisa de pacientes_profissional.js. Uso: ProntuarioModal.abrir("00512")

(function () {
  var PAGINA_ATENDIMENTO = "../atendimento_profissional/index.html";

  var estilos = `
    .pront-overlay { position: fixed; inset: 0; z-index: 1800; display: none; align-items: center; justify-content: center;
      padding: 16px; background: rgba(15, 25, 35, 0.45); backdrop-filter: blur(2px); font-family: "Inter", sans-serif; }
    .pront-overlay.visivel { display: flex; }
    .pront-caixa { width: 100%; max-width: 620px; max-height: 92vh; display: flex; flex-direction: column; background: #fff;
      border-radius: 18px; overflow: hidden; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2); animation: prontAparecer 0.2s ease; text-align: left; }
    @keyframes prontAparecer { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .pront-topo { padding: 20px 24px 18px; border-bottom: 1px solid #e8edf3; }
    .pront-cabeca { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .pront-avatar { width: 56px; height: 56px; border-radius: 50%; color: #fff; font-size: 18px; font-weight: 600;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .pront-nome { font-size: 19px; font-weight: 600; color: #0f1923; margin: 0; }
    .pront-sub { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; font-size: 13px; color: #6b7585; }
    .pront-x { margin-left: auto; align-self: flex-start; width: 36px; height: 36px; border: 1px solid #e3e8ef; border-radius: 9px;
      background: #fff; color: #4b5563; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .pront-x:hover { background: #f3f5f8; }
    .pront-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 3px 10px;
      border-radius: 12px; border: 1px solid transparent; }
    .pront-chip-alergia { background: #fde8e8; color: #c81e1e; border-color: #f8b4b4; }
    .pront-chip-condicao { background: #fff3e0; color: #c2410c; border-color: #fcd29f; }
    .pront-btn-iniciar { width: 100%; height: 44px; border: none; border-radius: 10px; background: #0b3b6f; color: #fff;
      font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; font-family: inherit; }
    .pront-btn-iniciar:hover { background: #082c54; }
    .pront-corpo { flex: 1; min-height: 0; overflow-y: auto; background: #f5f7fa; padding: 18px 24px; }
    .pront-alertas { background: #fdf2f2; border: 1px solid #f8c4c4; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px;
      display: flex; gap: 12px; }
    .pront-alertas-titulo { font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #c81e1e; margin: 0 0 8px; }
    .pront-alertas-lista { display: flex; flex-wrap: wrap; gap: 6px; }
    .pront-abas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; background: #fff; border: 1px solid #e3e8ef;
      border-radius: 12px; padding: 4px; margin-bottom: 16px; }
    .pront-aba { display: flex; align-items: center; justify-content: center; gap: 7px; height: 36px; border: none; border-radius: 9px;
      background: transparent; font-size: 13px; color: #4b5563; cursor: pointer; font-family: inherit; }
    .pront-aba:hover { background: #f3f5f8; }
    .pront-aba.ativa { background: #0b3b6f; color: #fff; font-weight: 500; }
    .pront-lista { list-style: none; margin: 0; padding: 0 0 0 26px; position: relative; display: flex; flex-direction: column; gap: 14px; }
    .pront-lista::before { content: ""; position: absolute; left: 6px; top: 12px; bottom: 12px; width: 2px; background: #dbe3ee; }
    .pront-item { position: relative; background: #fff; border: 1px solid #e3e8ef; border-radius: 12px; overflow: hidden; }
    .pront-item::before { content: ""; position: absolute; left: -25px; top: 18px; width: 10px; height: 10px; border-radius: 50%;
      background: #1d64c8; box-shadow: 0 0 0 3px #f5f7fa; }
    .pront-item-corpo { padding: 14px 16px; }
    .pront-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 12.5px; color: #6b7585; }
    .pront-meta svg { flex-shrink: 0; }
    .pront-tag { display: inline-block; margin-top: 10px; background: #e6effc; color: #1d4ed8; font-size: 12px; font-weight: 500;
      padding: 3px 10px; border-radius: 8px; }
    .pront-tag-novo { background: #e7f5dc; color: #3f6212; margin-left: 6px; }
    .pront-titulo-item { font-size: 15px; font-weight: 600; color: #0f1923; margin: 8px 0 0; }
    .pront-detalhe { width: 100%; display: flex; justify-content: space-between; align-items: center; border: none;
      border-top: 1px solid #eef1f5; background: #fafbfc; padding: 10px 16px; font-size: 12.5px; color: #4b5563; cursor: pointer; font-family: inherit; }
    .pront-detalhe svg { transition: transform 0.2s ease; }
    .pront-ver-receita { justify-content: flex-start; color: #1d4ed8; font-weight: 500; }
    .pront-ver-receita span { display: flex; align-items: center; gap: 7px; }
    .pront-ver-receita:hover { background: #eef4fd; }
    .pront-detalhe[aria-expanded="true"] svg { transform: rotate(180deg); }
    .pront-anotacoes { display: none; padding: 12px 16px 14px; font-size: 13px; line-height: 1.55; color: #374151; background: #fafbfc; white-space: pre-line; }
    .pront-anotacoes.aberto { display: block; }
    .pront-receita-item { font-size: 13px; color: #374151; margin-top: 8px; line-height: 1.45; }
    .pront-receita-item strong { color: #0f1923; }
    .pront-vazio { background: #fff; border: 1px dashed #d1d9e4; border-radius: 12px; padding: 26px; text-align: center; font-size: 13px; color: #6b7585; }
    .pront-rodape { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 24px; border-top: 1px solid #e8edf3; }
    .pront-leitura { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #8a94a6; }
    .pront-rodape .pront-btn-iniciar { width: auto; padding: 0 26px; }
    @media (max-width: 560px) { .pront-aba span { display: none; } .pront-rodape { flex-direction: column; align-items: stretch; } }
  `;

  var svg = {
    play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    alerta: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><rect x="11" y="9" width="2" height="5" fill="#fff"/><rect x="11" y="16" width="2" height="2" fill="#fff"/></svg>',
    calendario: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    estetoscopio: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.6A2 2 0 1 0 3 6h3a2 2 0 1 0-1.8-3.4"/><path d="M4.5 6v5a5.5 5.5 0 0 0 11 0V6"/><path d="M19.5 13a2.5 2.5 0 1 0 0 5"/><path d="M22 15.5v2A4.5 4.5 0 0 1 17.5 22h-1A4.5 4.5 0 0 1 12 17.5"/></svg>',
    seta: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
  };

  svg.olho = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

  // CRM dos outros medicos que aparecem nas receitas antigas (mock)
  var crmsConhecidos = {
    "Dra. Ana Paula": "CRM-PI 003871",
    "Dr. Rafael Mendes": "CRM-PI 002956"
  };

  // especialidade da consulta do mesmo dia (para receitas antigas)
  function especialidadeDaReceita(r) {
    var consulta = pacienteAtual.timeline.find(function (t) {
      return t.medico === r.medico && PacientesProfissional.formatarData(t.data) === PacientesProfissional.formatarData(r.data);
    });
    return consulta ? consulta.especialidade : "";
  }

  var overlay, pacienteAtual, abaAtual = "timeline";

  function escapar(texto) {
    return String(texto).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function chipsAlergia(lista, prefixo) {
    return lista.map(function (a) {
      return '<span class="pront-chip pront-chip-alergia">' + svg.alerta + " " + (prefixo || "") + escapar(a) + "</span>";
    }).join("");
  }

  function renderizarAba() {
    var p = pacienteAtual;
    var fmt = PacientesProfissional.formatarData;
    var conteudo = overlay.querySelector(".pront-conteudo");
    var html = "";

    if (abaAtual === "timeline") {
      html = p.timeline.length ? '<ul class="pront-lista">' + p.timeline.map(function (t, i) {
        return `<li class="pront-item">
          <div class="pront-item-corpo">
            <div class="pront-meta">${svg.calendario} ${fmt(t.data)} <span>·</span> ${svg.estetoscopio} ${escapar(t.medico)}</div>
            <span class="pront-tag">${escapar(t.especialidade)}</span>${t.novo ? '<span class="pront-tag pront-tag-novo">Registrado no portal</span>' : ""}
            <p class="pront-titulo-item">${escapar(t.cid)} – ${escapar(t.titulo)}</p>
          </div>
          <button type="button" class="pront-detalhe" aria-expanded="false" data-alvo="anot${i}">Ver anotações completas ${svg.seta}</button>
          <div class="pront-anotacoes" id="anot${i}">${escapar(t.anotacoes)}</div>
        </li>`;
      }).join("") + "</ul>" : '<p class="pront-vazio">Nenhum atendimento anterior registrado.</p>';
    } else if (abaAtual === "receitas") {
      var podeVisualizar = !!window.ReceitaVisualizar;
      html = p.prescricoes.length ? '<ul class="pront-lista">' + p.prescricoes.map(function (r, i) {
        return `<li class="pront-item"><div class="pront-item-corpo">
          <div class="pront-meta">${svg.calendario} ${fmt(r.data)} <span>·</span> ${svg.estetoscopio} ${escapar(r.medico)}</div>
          ${r.novo ? '<span class="pront-tag pront-tag-novo">Assinada digitalmente</span>' : ""}
          ${r.itens.map(function (m) {
            return `<p class="pront-receita-item"><strong>${escapar(m.nome)}</strong> · ${escapar(m.via)} · ${escapar(m.quantidade)}<br>${escapar(m.instrucoes)}</p>`;
          }).join("")}
        </div>
        ${podeVisualizar ? `<button type="button" class="pront-detalhe pront-ver-receita" data-ver-receita="${i}">
          <span>${svg.olho} Visualizar receita</span>
        </button>` : ""}</li>`;
      }).join("") + "</ul>" : '<p class="pront-vazio">Nenhuma prescrição registrada.</p>';
    } else {
      html = p.exames.length ? '<ul class="pront-lista">' + p.exames.map(function (e) {
        return `<li class="pront-item"><div class="pront-item-corpo">
          <div class="pront-meta">${svg.calendario} ${fmt(e.data)}</div>
          <p class="pront-titulo-item">${escapar(e.nome)}</p>
          ${e.pedido ? '<span class="pront-tag pront-tag-novo">Pedido gerado no portal</span>' : ""}
          <p class="pront-receita-item">${escapar(e.resultado)}</p>
          ${e.indicacao ? `<p class="pront-receita-item"><strong>Indicação:</strong> ${escapar(e.indicacao)}</p>` : ""}
        </div></li>`;
      }).join("") + "</ul>" : '<p class="pront-vazio">Nenhum exame ou laudo registrado.</p>';
    }

    conteudo.innerHTML = html;
    overlay.querySelectorAll(".pront-aba").forEach(function (b) {
      b.classList.toggle("ativa", b.dataset.aba === abaAtual);
    });
  }

  function abrir(id) {
    var p = PacientesProfissional.obter(id);
    if (!p) return;
    pacienteAtual = p;
    abaAtual = "timeline";

    var alertas = chipsAlergia(p.alergias, "Alergia: ") + p.condicoes.map(function (c) {
      return '<span class="pront-chip pront-chip-condicao">' + escapar(c) + "</span>";
    }).join("");

    overlay.querySelector(".pront-caixa").innerHTML = `
      <div class="pront-topo">
        <div class="pront-cabeca">
          <span class="pront-avatar" style="background:${p.cor}">${PacientesProfissional.iniciais(p.nome)}</span>
          <div>
            <h2 class="pront-nome" id="prontNome">${escapar(p.nome)}</h2>
            <div class="pront-sub">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${p.idade} anos ${chipsAlergia(p.alergias)}
            </div>
          </div>
          <button type="button" class="pront-x" data-fechar title="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <button type="button" class="pront-btn-iniciar" data-iniciar>${svg.play} Iniciar Atendimento</button>
      </div>
      <div class="pront-corpo">
        ${alertas ? `<div class="pront-alertas">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c81e1e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div><p class="pront-alertas-titulo">Alertas clínicos críticos</p><div class="pront-alertas-lista">${alertas}</div></div>
        </div>` : ""}
        <div class="pront-abas" role="tablist">
          <button type="button" class="pront-aba" data-aba="timeline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Linha do Tempo</span>
          </button>
          <button type="button" class="pront-aba" data-aba="receitas">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>Prescrições &amp; Receitas</span>
          </button>
          <button type="button" class="pront-aba" data-aba="exames">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg><span>Exames &amp; Laudos</span>
          </button>
        </div>
        <div class="pront-conteudo"></div>
      </div>
      <div class="pront-rodape">
        <span class="pront-leitura">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          Prontuário — somente leitura
        </span>
        <button type="button" class="pront-btn-iniciar" data-iniciar>${svg.play} Iniciar Atendimento</button>
      </div>
    `;

    renderizarAba();
    overlay.classList.add("visivel");
  }

  function fechar() {
    overlay.classList.remove("visivel");
  }

  function iniciar() {
    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);

    overlay = document.createElement("div");
    overlay.className = "pront-overlay";
    overlay.innerHTML = '<div class="pront-caixa" role="dialog" aria-modal="true" aria-labelledby="prontNome"></div>';
    document.body.appendChild(overlay);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-fechar]")) return fechar();

      var aba = e.target.closest(".pront-aba");
      if (aba) {
        abaAtual = aba.dataset.aba;
        return renderizarAba();
      }

      var verReceita = e.target.closest("[data-ver-receita]");
      if (verReceita) {
        var r = pacienteAtual.prescricoes[+verReceita.dataset.verReceita];
        var perfil = window.PerfilProfissional ? PerfilProfissional.obter() : {};
        var ehDoPerfil = r.medico === perfil.nome;
        return ReceitaVisualizar.abrir({
          paciente: pacienteAtual,
          medico: r.medico,
          crm: r.crm || (ehDoPerfil ? perfil.crm : crmsConhecidos[r.medico]) || "",
          especialidade: r.especialidade || (ehDoPerfil ? perfil.especialidade : especialidadeDaReceita(r)),
          data: r.data,
          itens: r.itens,
          codigo: r.codigo,
          assinada: true
        });
      }

      var detalhe = e.target.closest(".pront-detalhe");
      if (detalhe) {
        var aberto = detalhe.getAttribute("aria-expanded") === "true";
        detalhe.setAttribute("aria-expanded", String(!aberto));
        document.getElementById(detalhe.dataset.alvo).classList.toggle("aberto", !aberto);
        return;
      }

      if (e.target.closest("[data-iniciar]")) {
        window.location.href = PAGINA_ATENDIMENTO + "?id=" + encodeURIComponent(pacienteAtual.id);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fechar();
    });
  }

  window.ProntuarioModal = { abrir: abrir, fechar: fechar };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
