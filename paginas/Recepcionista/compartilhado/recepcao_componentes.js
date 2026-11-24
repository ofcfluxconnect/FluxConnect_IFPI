// Pecas usadas pelas telas da recepcao:
// - RecepcaoComp.grafico(svg, valores, opcoes): grafico pequeno dos cards de resumo
// - RecepcaoComp.paginacao(nav, pagina, totalPaginas): botoes de pagina
// - RecepcaoComp.mascararCpf("123.456.789-01") -> "***.456.789-**"
// - RecepcaoComp.ultimosDias(n): lista de datas ISO dos ultimos n dias (ate hoje)
// - RecepcaoComp.diaMes("2026-11-18") -> "18/11"

(function () {
  var contador = 0;
  var dica = null; // balao que aparece ao passar o mouse no grafico

  var estilos = `
    .rc-dica { position: fixed; z-index: 3500; pointer-events: none; display: none; padding: 7px 11px; border-radius: 8px;
      background: #0f1923; color: #fff; font-family: "Inter", sans-serif; font-size: 14px; font-weight: 500; white-space: nowrap;
      box-shadow: 0 6px 18px rgba(15, 25, 35, 0.25); }
    .rc-dica.visivel { display: block; }
    .rc-dica strong { font-weight: 700; }
    .stat-grafico { cursor: crosshair; transition: opacity 0.15s ease; }
    .stat-grafico:hover { opacity: 1 !important; }
    .stat-grafico .rc-guia { stroke: currentColor; stroke-width: 1.5; stroke-dasharray: 3 3; opacity: 0; }
    .stat-grafico .rc-barra { fill: currentColor; opacity: 0.45; }
    .stat-grafico .rc-barra.rc-ativa { opacity: 1; }
  `;

  function garantirDica() {
    if (dica) return;
    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);
    dica = document.createElement("div");
    dica.className = "rc-dica";
    dica.setAttribute("role", "tooltip");
    document.body.appendChild(dica);
  }

  function escapar(t) {
    return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // "1 consulta" / "3 consultas"
  function comUnidade(valor, unidade) {
    if (!unidade) return String(valor);
    return valor + " " + (valor === 1 ? unidade[0] : unidade[1]);
  }

  // Desenha o grafico de um card dentro de um <svg>. A cor vem do "color" do svg.
  //   valores: lista de numeros (um por ponto/barra)
  //   opcoes.rotulos: texto de cada ponto (ex.: "08:00", "18/11", "Unimed")
  //   opcoes.unidade: ["consulta", "consultas"] para o balao
  //   opcoes.tipo: "linha" (padrao) ou "barras"
  //   opcoes.resumo: frase lida por leitor de tela e mostrada como titulo
  // Passar o mouse mostra o rotulo e o valor de cada ponto.
  function grafico(svg, valores, opcoes) {
    if (!svg) return;
    garantirDica();
    opcoes = opcoes || {};
    var L = 120, A = 48, margem = 5;
    var serie = valores && valores.length ? valores.slice() : [0];
    var barras = opcoes.tipo === "barras";
    if (!barras && serie.length === 1) serie = [serie[0], serie[0]];
    var rotulos = opcoes.rotulos || [];
    var max = Math.max.apply(null, serie);
    var min = barras ? 0 : Math.min.apply(null, serie);
    var faixa = max - min;

    var id = "rcGrad" + (++contador);
    var html = "";

    if (barras) {
      var passo = L / serie.length;
      var largura = Math.max(2, passo * 0.62);
      serie.forEach(function (v, i) {
        var altura = max ? Math.max(v > 0 ? 3 : 1, (v / max) * (A - margem)) : 1;
        html += '<rect class="rc-barra" data-i="' + i + '" x="' + (i * passo + (passo - largura) / 2).toFixed(1) + '" y="' + (A - altura).toFixed(1) +
          '" width="' + largura.toFixed(1) + '" height="' + altura.toFixed(1) + '" rx="1.5"/>';
      });
    } else {
      var pontos = serie.map(function (v, i) {
        var x = (i / (serie.length - 1)) * L;
        // serie toda igual: linha reta no meio
        var y = faixa ? A - margem - ((v - min) / faixa) * (A - margem * 2) : A / 2;
        return [x, y];
      });
      // curva suave: cada trecho usa o ponto medio como controle
      var linha = "M" + pontos[0][0].toFixed(1) + " " + pontos[0][1].toFixed(1);
      for (var i = 1; i < pontos.length; i++) {
        var a = pontos[i - 1], b = pontos[i];
        var meioX = ((a[0] + b[0]) / 2).toFixed(1);
        linha += " C" + meioX + " " + a[1].toFixed(1) + ", " + meioX + " " + b[1].toFixed(1) + ", " + b[0].toFixed(1) + " " + b[1].toFixed(1);
      }
      html =
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="currentColor" stop-opacity="0.28"/>' +
        '<stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>' +
        '<path d="' + linha + " L" + L + " " + A + " L0 " + A + ' Z" fill="url(#' + id + ')"/>' +
        '<path d="' + linha + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
        '<line class="rc-guia" x1="0" y1="0" x2="0" y2="' + A + '" vector-effect="non-scaling-stroke"/>';
    }

    svg.setAttribute("viewBox", "0 0 " + L + " " + A);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = html;
    if (opcoes.resumo) svg.setAttribute("aria-label", opcoes.resumo);

    // guarda os dados no proprio svg; os eventos sao ligados uma vez so
    svg._rc = { serie: serie, rotulos: rotulos, unidade: opcoes.unidade, barras: barras, L: L };
    if (svg._rcLigado) return;
    svg._rcLigado = true;

    svg.addEventListener("mousemove", function (ev) {
      var d = svg._rc;
      var r = svg.getBoundingClientRect();
      var fracao = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
      var indice = d.barras
        ? Math.min(d.serie.length - 1, Math.floor(fracao * d.serie.length))
        : Math.round(fracao * (d.serie.length - 1));

      var guia = svg.querySelector(".rc-guia");
      if (guia) {
        var x = (indice / (d.serie.length - 1)) * d.L;
        guia.setAttribute("x1", x); guia.setAttribute("x2", x);
        guia.style.opacity = 0.7;
      }
      svg.querySelectorAll(".rc-barra").forEach(function (b) { b.classList.toggle("rc-ativa", +b.dataset.i === indice); });

      var rotulo = d.rotulos[indice];
      dica.innerHTML = (rotulo ? escapar(rotulo) + ": " : "") + "<strong>" + escapar(comUnidade(d.serie[indice], d.unidade)) + "</strong>";
      dica.classList.add("visivel");
      var largura = dica.offsetWidth;
      dica.style.left = Math.max(8, Math.min(ev.clientX - largura / 2, window.innerWidth - largura - 8)) + "px";
      dica.style.top = Math.max(8, r.top - dica.offsetHeight - 8) + "px";
    });

    svg.addEventListener("mouseleave", function () {
      dica.classList.remove("visivel");
      var guia = svg.querySelector(".rc-guia");
      if (guia) guia.style.opacity = 0;
      svg.querySelectorAll(".rc-ativa").forEach(function (b) { b.classList.remove("rc-ativa"); });
    });
  }

  // mostra no maximo 5 numeros de pagina em volta da atual
  function paginacao(nav, pagina, total) {
    if (!nav) return;
    if (total <= 1) { nav.innerHTML = ""; return; }
    var ini = Math.max(1, Math.min(pagina - 2, total - 4));
    var fim = Math.min(total, ini + 4);
    var html = '<button type="button" class="pag seta" data-pag="' + (pagina - 1) + '" ' + (pagina === 1 ? "disabled" : "") + ' aria-label="Página anterior">‹</button>';
    for (var i = ini; i <= fim; i++) {
      html += '<button type="button" class="pag' + (i === pagina ? " ativa" : "") + '" data-pag="' + i + '"' + (i === pagina ? ' aria-current="page"' : "") + ">" + i + "</button>";
    }
    html += '<button type="button" class="pag seta" data-pag="' + (pagina + 1) + '" ' + (pagina === total ? "disabled" : "") + ' aria-label="Próxima página">›</button>';
    nav.innerHTML = html;
  }

  // esconde o comeco e o fim do CPF na listagem (LGPD): ***.456.789-**
  function mascararCpf(cpf) {
    var n = String(cpf || "").replace(/\D/g, "");
    if (n.length !== 11) return cpf || "—";
    return "***." + n.slice(3, 6) + "." + n.slice(6, 9) + "-**";
  }

  function ultimosDias(quantos) {
    var lista = [];
    var hoje = Recepcao.hoje();
    for (var i = quantos - 1; i >= 0; i--) lista.push(Recepcao.iso(Recepcao.somarDias(hoje, -i)));
    return lista;
  }

  // "2026-11-18" -> "18/11"
  function diaMes(iso) {
    return iso.slice(8, 10) + "/" + iso.slice(5, 7);
  }

  // a pagina inteira rola (nao so a area de baixo): ao rolar, fecha o menu dos tres pontinhos
  document.addEventListener("DOMContentLoaded", function () {
    var principal = document.querySelector(".conteudo-principal");
    if (!principal) return;
    // passive: o navegador nao espera este codigo para rolar a tela
    principal.addEventListener("scroll", function () {
      document.querySelectorAll(".menu-acoes.aberto").forEach(function (m) { m.classList.remove("aberto"); });
      if (dica) dica.classList.remove("visivel");
    }, { passive: true });
  });

  window.RecepcaoComp = { grafico: grafico, paginacao: paginacao, mascararCpf: mascararCpf, ultimosDias: ultimosDias, diaMes: diaMes };
})();
