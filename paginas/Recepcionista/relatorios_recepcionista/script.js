// Relatorios operacionais da recepcao.
// Indicadores e graficos sao calculados a partir dos agendamentos (recepcao_dados.js)
// do periodo escolhido; "Exportar Dados" baixa um CSV com as consultas do periodo.

// cores validadas para daltonismo (script de validacao de paleta, modo claro)
var CORES_BARRAS = { agendados: "#5fa0ea", realizados: "#1d4f91", faltas: "#e5484d" };
var CORES_ROSCA = ["#1d4f91", "#e5484d", "#f59e0b", "#7c8aa0"];

var diasCurtos = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
var e = Recepcao.escapar;

var periodo = "semana";
var intervalo = { de: "", ate: "" };


// ========== PERIODOS ==========
function inicioDaSemana(d) {
  var dia = d.getDay();
  return Recepcao.somarDias(d, dia === 0 ? -6 : 1 - dia); // segunda-feira
}

function calcularIntervalo(tipo) {
  var hoje = Recepcao.hoje();
  if (tipo === "hoje") return { de: Recepcao.iso(hoje), ate: Recepcao.iso(hoje) };
  if (tipo === "semana") {
    var seg = inicioDaSemana(hoje);
    return { de: Recepcao.iso(seg), ate: Recepcao.iso(Recepcao.somarDias(seg, 4)) };
  }
  var primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  var ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  return { de: Recepcao.iso(primeiro), ate: Recepcao.iso(ultimo) };
}

function diasEntre(de, ate) {
  return Math.round((Recepcao.lerISO(ate) - Recepcao.lerISO(de)) / 86400000) + 1;
}

// periodo anterior com o mesmo tamanho (para a tendencia)
function intervaloAnterior(i) {
  var tamanho = diasEntre(i.de, i.ate);
  var fimAnterior = Recepcao.somarDias(Recepcao.lerISO(i.de), -1);
  return { de: Recepcao.iso(Recepcao.somarDias(fimAnterior, -(tamanho - 1))), ate: Recepcao.iso(fimAnterior) };
}

function consultasDo(i) {
  return Recepcao.agendamentos().filter(function (a) { return a.data >= i.de && a.data <= i.ate; });
}

function indicadores(lista) {
  var realizadas = lista.filter(function (a) { return a.status === "realizada"; }).length;
  var perdidas = lista.filter(function (a) { return a.status === "falta" || a.status === "cancelada"; }).length;
  var encaixes = lista.filter(function (a) { return a.encaixe && a.status !== "cancelada"; }).length;
  return { realizadas: realizadas, taxa: lista.length ? perdidas / lista.length * 100 : 0, encaixes: encaixes };
}


// ========== KPIs ==========
function tendencia(elemento, atual, anterior, menorMelhor, ehPercentual) {
  var diff = atual - anterior;
  if (!anterior && !atual) { elemento.textContent = ""; return; }
  var subiu = diff > 0;
  var bom = diff === 0 ? null : (menorMelhor ? !subiu : subiu);
  var texto = ehPercentual
    ? (diff >= 0 ? "+" : "") + diff.toFixed(1).replace(".", ",") + " p.p."
    : (anterior ? (diff >= 0 ? "+" : "") + Math.round(diff / anterior * 100) + "%" : "novo");
  elemento.className = "tendencia " + (bom === null ? "neutra" : bom ? "boa" : "ruim");
  elemento.innerHTML = (diff === 0 ? "=" : subiu ? "↗" : "↘") + " <span>" + texto + "</span>";
  elemento.title = "Comparado ao período anterior de mesmo tamanho";
}

function renderizarKpis(lista) {
  var atual = indicadores(lista);
  var anterior = indicadores(consultasDo(intervaloAnterior(intervalo)));
  var nomes = { hoje: "hoje", semana: "esta semana", mes: "este mês" };

  document.getElementById("kpiRealizadas").textContent = atual.realizadas;
  document.getElementById("kpiTaxa").textContent = Math.round(atual.taxa) + "%";
  document.getElementById("kpiEncaixes").textContent = atual.encaixes;
  document.getElementById("subRealizadas").textContent = nomes[periodo]
    ? "No período de " + nomes[periodo]
    : "De " + Recepcao.formatarData(intervalo.de) + " a " + Recepcao.formatarData(intervalo.ate);

  tendencia(document.getElementById("tendRealizadas"), atual.realizadas, anterior.realizadas, false, false);
  tendencia(document.getElementById("tendTaxa"), atual.taxa, anterior.taxa, true, true);
  tendencia(document.getElementById("tendEncaixes"), atual.encaixes, anterior.encaixes, false, false);
}


// ========== BARRAS ==========
// agrupa: hoje -> por medico; ate 14 dias -> por dia; mais que isso -> por semana
function grupos(lista) {
  var tamanho = diasEntre(intervalo.de, intervalo.ate);
  var mapa = [];

  function grupo(chave, rotulo) {
    var g = mapa.find(function (x) { return x.chave === chave; });
    if (!g) { g = { chave: chave, rotulo: rotulo, agendados: 0, realizados: 0, faltas: 0 }; mapa.push(g); }
    return g;
  }

  if (tamanho === 1) {
    Recepcao.medicos().forEach(function (m) { grupo(m.id, m.nome.replace(/^Dra?\.\s*/, "").split(" ")[0]); });
  } else if (tamanho <= 14) {
    for (var i = 0; i < tamanho; i++) {
      var d = Recepcao.somarDias(Recepcao.lerISO(intervalo.de), i);
      if (periodo === "semana" && (d.getDay() === 0 || d.getDay() === 6)) continue;
      grupo(Recepcao.iso(d), tamanho <= 7 ? diasCurtos[d.getDay()] : Recepcao.formatarData(Recepcao.iso(d)).slice(0, 5));
    }
  } else {
    var inicio = inicioDaSemana(Recepcao.lerISO(intervalo.de));
    for (var s = 0; Recepcao.iso(Recepcao.somarDias(inicio, s * 7)) <= intervalo.ate; s++) {
      var ini = Recepcao.somarDias(inicio, s * 7);
      grupo("s" + s, "Sem " + (s + 1) + "\n" + Recepcao.formatarData(Recepcao.iso(ini)).slice(0, 5));
    }
  }

  lista.forEach(function (a) {
    var chave;
    if (tamanho === 1) chave = a.medicoId;
    else if (tamanho <= 14) chave = a.data;
    else chave = "s" + Math.floor((Recepcao.lerISO(a.data) - inicioDaSemana(Recepcao.lerISO(intervalo.de))) / (7 * 86400000));
    var g = mapa.find(function (x) { return x.chave === chave; });
    if (!g) return;
    if (a.status !== "cancelada") g.agendados++;
    if (a.status === "realizada") g.realizados++;
    if (a.status === "falta") g.faltas++;
  });
  return mapa;
}

// passo "redondo" para o eixo Y
function escala(maximo) {
  var passos = [1, 2, 3, 5, 6, 10, 15, 20, 25, 50, 100];
  var passo = passos.find(function (p) { return maximo / p <= 4; }) || Math.ceil(maximo / 4);
  return { passo: passo, topo: Math.max(passo, Math.ceil(maximo / passo) * passo) };
}

function renderizarBarras(lista) {
  var dados = grupos(lista);
  var caixa = document.getElementById("graficoBarras");
  var largura = Math.max(caixa.clientWidth, 320);
  var altura = 260;
  var margem = { topo: 12, dir: 8, base: 40, esq: 34 };
  var areaL = largura - margem.esq - margem.dir;
  var areaA = altura - margem.topo - margem.base;
  var maximo = Math.max(1, Math.max.apply(null, dados.map(function (g) { return g.agendados; })));
  var esc = escala(maximo);
  var y = function (v) { return margem.topo + areaA - v / esc.topo * areaA; };

  var series = ["agendados", "realizados", "faltas"];
  var faixa = areaL / Math.max(dados.length, 1);
  var larguraBarra = Math.min(14, Math.max(6, (faixa - 16) / 3 - 2));
  var grupoL = larguraBarra * 3 + 4; // 2px de espaco entre as barras

  var svg = '<svg width="' + largura + '" height="' + altura + '" role="img" aria-label="Volume de agendamentos">';
  for (var v = 0; v <= esc.topo; v += esc.passo) {
    svg += '<line class="grade-linha" x1="' + margem.esq + '" x2="' + (largura - margem.dir) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
    svg += '<text class="eixo" x="' + (margem.esq - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + v + "</text>";
  }

  dados.forEach(function (g, i) {
    var centro = margem.esq + faixa * i + faixa / 2;
    var x0 = centro - grupoL / 2;
    series.forEach(function (s, j) {
      var valor = g[s];
      var h = Math.max(0, y(0) - y(valor));
      var x = x0 + j * (larguraBarra + 2);
      if (h > 0) {
        var r = Math.min(4, h, larguraBarra / 2); // ponta arredondada so em cima
        svg += '<path fill="' + CORES_BARRAS[s] + '" d="M' + x + "," + y(0) + "V" + (y(valor) + r) +
          "Q" + x + "," + y(valor) + " " + (x + r) + "," + y(valor) + "H" + (x + larguraBarra - r) +
          "Q" + (x + larguraBarra) + "," + y(valor) + " " + (x + larguraBarra) + "," + (y(valor) + r) + "V" + y(0) + 'Z"/>';
      }
    });
    var linhas = g.rotulo.split("\n");
    linhas.forEach(function (t, k) {
      svg += '<text class="eixo" x="' + centro + '" y="' + (altura - margem.base + 18 + k * 12) + '" text-anchor="middle">' + e(t) + "</text>";
    });
    // area de toque maior que as barras, para a dica
    svg += '<rect class="alvo-dica" data-indice="' + i + '" x="' + (margem.esq + faixa * i) + '" y="' + margem.topo + '" width="' + faixa + '" height="' + areaA + '"/>';
  });
  svg += '<line class="eixo-base" x1="' + margem.esq + '" x2="' + (largura - margem.dir) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>';
  svg += "</svg>";

  caixa.innerHTML = svg;
  caixa.dataset.grupos = JSON.stringify(dados);

  document.getElementById("tabelaBarras").innerHTML =
    '<table class="tabela"><thead><tr><th>Período</th><th>Agendados</th><th>Realizados</th><th>Faltas</th></tr></thead><tbody>' +
    dados.map(function (g) {
      return "<tr><td>" + e(g.rotulo.replace("\n", " · ")) + "</td><td>" + g.agendados + "</td><td>" + g.realizados + "</td><td>" + g.faltas + "</td></tr>";
    }).join("") + "</tbody></table>";

  var vazio = !lista.length;
  document.getElementById("subBarras").textContent = vazio
    ? "Sem consultas no período selecionado"
    : "Agendados vs. Realizados vs. Faltas " + (diasEntre(intervalo.de, intervalo.ate) === 1 ? "por profissional" : "por período");
}


// ========== ROSCA ==========
function motivos(lista) {
  var contagem = {};
  lista.forEach(function (a) {
    var motivo = a.status === "falta" ? "Falta sem aviso" : a.status === "cancelada" ? (a.motivo || "Sem motivo informado") : null;
    if (motivo) contagem[motivo] = (contagem[motivo] || 0) + 1;
  });
  var itens = Object.keys(contagem).map(function (m) { return { motivo: m, qtd: contagem[m] }; })
    .sort(function (a, b) { return b.qtd - a.qtd; });
  // no maximo 3 fatias com nome; o resto vira "Outros"
  if (itens.length > 4) {
    var outros = itens.slice(3).reduce(function (s, x) { return s + x.qtd; }, 0);
    itens = itens.slice(0, 3).concat([{ motivo: "Outros", qtd: outros }]);
  }
  return itens;
}

function renderizarRosca(lista) {
  var itens = motivos(lista);
  var total = itens.reduce(function (s, x) { return s + x.qtd; }, 0);
  var caixa = document.getElementById("graficoRosca");
  var legenda = document.getElementById("legendaRosca");

  if (!total) {
    caixa.innerHTML = '<p class="sem-dados">Nenhum cancelamento ou falta no período.</p>';
    legenda.innerHTML = "";
    document.getElementById("tabelaRosca").innerHTML = "";
    return;
  }

  var raio = 70, espessura = 26, tamanho = 200;
  var circ = 2 * Math.PI * raio;
  var deslocamento = 0;
  var svg = '<svg width="' + tamanho + '" height="' + tamanho + '" viewBox="0 0 ' + tamanho + " " + tamanho + '" role="img" aria-label="Motivos de cancelamento">';
  itens.forEach(function (it, i) {
    var parte = it.qtd / total * circ;
    var visivel = Math.max(parte - (itens.length > 1 ? 3 : 0), 0.5); // 3px de folga entre as fatias
    svg += '<circle class="fatia" data-indice="' + i + '" cx="100" cy="100" r="' + raio + '" fill="none" stroke="' + CORES_ROSCA[i] +
      '" stroke-width="' + espessura + '" stroke-dasharray="' + visivel + " " + (circ - visivel) +
      '" stroke-dashoffset="' + (-deslocamento) + '" transform="rotate(-90 100 100)"/>';
    deslocamento += parte;
  });
  svg += '<text class="rosca-total" x="100" y="98" text-anchor="middle">' + total + '</text><text class="rosca-rotulo" x="100" y="116" text-anchor="middle">ocorrências</text>';
  svg += "</svg>";
  caixa.innerHTML = svg;
  caixa.dataset.itens = JSON.stringify(itens);

  legenda.innerHTML = itens.map(function (it, i) {
    return '<li><span><i style="background:' + CORES_ROSCA[i] + '"></i>' + e(it.motivo) + "</span><strong>" + Math.round(it.qtd / total * 100) + "%</strong></li>";
  }).join("");

  document.getElementById("tabelaRosca").innerHTML =
    '<table class="tabela"><thead><tr><th>Motivo</th><th>Ocorrências</th><th>%</th></tr></thead><tbody>' +
    itens.map(function (it) {
      return "<tr><td>" + e(it.motivo) + "</td><td>" + it.qtd + "</td><td>" + Math.round(it.qtd / total * 100) + "%</td></tr>";
    }).join("") + "</tbody></table>";
}


// ========== DICAS (TOOLTIP) ==========
function configurarDicas() {
  var dica = document.getElementById("dica");

  function mostrar(html, ev) {
    dica.innerHTML = html;
    dica.classList.add("visivel");
    var x = Math.min(ev.clientX + 14, window.innerWidth - dica.offsetWidth - 8);
    var y = Math.max(8, ev.clientY - dica.offsetHeight - 12);
    dica.style.left = x + "px";
    dica.style.top = y + "px";
  }

  function esconder() {
    dica.classList.remove("visivel");
    document.querySelectorAll(".alvo-dica.ativo, .fatia.ativa").forEach(function (x) { x.classList.remove("ativo", "ativa"); });
  }

  document.getElementById("graficoBarras").addEventListener("mousemove", function (ev) {
    var alvo = ev.target.closest(".alvo-dica");
    if (!alvo) return esconder();
    document.querySelectorAll(".alvo-dica.ativo").forEach(function (x) { if (x !== alvo) x.classList.remove("ativo"); });
    alvo.classList.add("ativo");
    var g = JSON.parse(this.dataset.grupos)[+alvo.dataset.indice];
    mostrar('<p class="dica-titulo">' + e(g.rotulo.replace("\n", " · ")) + "</p>" +
      '<p><i style="background:' + CORES_BARRAS.agendados + '"></i>Agendados <strong>' + g.agendados + "</strong></p>" +
      '<p><i style="background:' + CORES_BARRAS.realizados + '"></i>Realizados <strong>' + g.realizados + "</strong></p>" +
      '<p><i style="background:' + CORES_BARRAS.faltas + '"></i>Faltas <strong>' + g.faltas + "</strong></p>", ev);
  });
  document.getElementById("graficoBarras").addEventListener("mouseleave", esconder);

  document.getElementById("graficoRosca").addEventListener("mousemove", function (ev) {
    var fatia = ev.target.closest(".fatia");
    if (!fatia) return esconder();
    document.querySelectorAll(".fatia.ativa").forEach(function (x) { if (x !== fatia) x.classList.remove("ativa"); });
    fatia.classList.add("ativa");
    var itens = JSON.parse(this.dataset.itens);
    var total = itens.reduce(function (s, x) { return s + x.qtd; }, 0);
    var it = itens[+fatia.dataset.indice];
    mostrar('<p class="dica-titulo">' + e(it.motivo) + "</p><p>" + it.qtd + " ocorrências · <strong>" + Math.round(it.qtd / total * 100) + "%</strong></p>", ev);
  });
  document.getElementById("graficoRosca").addEventListener("mouseleave", esconder);
}


// ========== EXPORTAR ==========
function exportar() {
  var lista = consultasDo(intervalo).sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); });
  var linhas = [["Data", "Hora", "Paciente", "CPF", "Profissional", "Especialidade", "Tipo", "Status", "Motivo", "Encaixe"]];
  lista.forEach(function (a) {
    linhas.push([Recepcao.formatarData(a.data), a.hora, a.paciente.nome, a.paciente.cpf, a.medico.nome, a.medico.especialidade,
      a.tipo, Recepcao.rotulosStatus[a.status], a.motivo || "", a.encaixe ? "Sim" : "Não"]);
  });
  // ";" e BOM para o Excel em portugues abrir com acentos certos
  var csv = "﻿" + linhas.map(function (l) {
    return l.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(";");
  }).join("\r\n");
  var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  var link = document.createElement("a");
  link.href = url;
  link.download = "relatorio-consultas_" + intervalo.de + "_a_" + intervalo.ate + ".csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  RecepcaoUI.toast("Exportação iniciada", lista.length + " consultas de " + Recepcao.formatarData(intervalo.de) + " a " + Recepcao.formatarData(intervalo.ate) + ".");
}


// ========== TELA ==========
function renderizar() {
  document.getElementById("dataDe").value = intervalo.de;
  document.getElementById("dataAte").value = intervalo.ate;
  document.querySelectorAll(".aba-periodo").forEach(function (b) {
    b.classList.toggle("ativo", b.dataset.periodo === periodo);
    b.setAttribute("aria-selected", String(b.dataset.periodo === periodo));
  });
  var lista = consultasDo(intervalo);
  renderizarKpis(lista);
  renderizarBarras(lista);
  renderizarRosca(lista);
}

function escolherPeriodo(tipo) {
  periodo = tipo;
  intervalo = calcularIntervalo(tipo);
  renderizar();
}

function periodoLivre() {
  var de = document.getElementById("dataDe").value;
  var ate = document.getElementById("dataAte").value;
  if (!de || !ate) return;
  if (de > ate) { var t = de; de = ate; ate = t; }
  periodo = "livre";
  intervalo = { de: de, ate: ate };
  renderizar();
}

document.addEventListener("DOMContentLoaded", function () {
  escolherPeriodo("semana");
  configurarDicas();

  document.querySelectorAll(".aba-periodo").forEach(function (b) {
    b.addEventListener("click", function () { escolherPeriodo(b.dataset.periodo); });
  });
  document.getElementById("dataDe").addEventListener("change", periodoLivre);
  document.getElementById("dataAte").addEventListener("change", periodoLivre);
  document.getElementById("btnExportar").addEventListener("click", exportar);

  document.querySelectorAll("[data-alternar]").forEach(function (b) {
    b.addEventListener("click", function () {
      var nome = b.dataset.alternar === "barras" ? "Barras" : "Rosca";
      var tabela = document.getElementById("tabela" + nome);
      var mostrarTabela = tabela.hidden;
      tabela.hidden = !mostrarTabela;
      document.getElementById("grafico" + nome).hidden = mostrarTabela;
      b.textContent = mostrarTabela ? "Ver gráfico" : "Ver como tabela";
      b.setAttribute("aria-pressed", String(mostrarTabela));
    });
  });

  // redesenha as barras quando a largura muda
  var timer;
  window.addEventListener("resize", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { renderizarBarras(consultasDo(intervalo)); }, 150);
  });
});
