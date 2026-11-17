// atendimentos ja realizados (mock), do mais recente para o mais antigo
var atendimentos = [
  {
    id: "hist-1",
    data: "2026-05-12",
    medico: "Dr. Carlos Lima",
    crm: "CRM-PI 123456",
    especialidade: "Clínica Geral",
    local: "UBS Centro - Rua Defala Attem, 812",
    documentos: {
      receita: ["Dipirona 500 mg - 1 comprimido a cada 6 horas, se dor ou febre", "Loratadina 10 mg - 1 comprimido ao dia por 5 dias"],
      atestado: { dias: 2, cid: "J06.9" }
    }
  },
  {
    id: "hist-2",
    data: "2026-04-03",
    medico: "Dra. Ana Paula",
    crm: "CRM-PI 234567",
    especialidade: "Cardiologia",
    local: "UBS Centro - Rua Defala Attem, 812",
    documentos: {
      receita: ["Losartana 50 mg - 1 comprimido pela manhã, uso contínuo"]
    }
  },
  {
    id: "hist-3",
    data: "2026-02-18",
    medico: "Dr. Ricardo Alves",
    crm: "CRM-PI 345678",
    especialidade: "Ortopedia",
    local: "Hospital Regional - Av. Principal, 1200",
    documentos: {
      receita: ["Ibuprofeno 400 mg - 1 comprimido a cada 8 horas por 5 dias", "Compressa fria no local 3 vezes ao dia"],
      atestado: { dias: 3, cid: "M54.5" }
    }
  },
  {
    id: "hist-4",
    data: "2026-01-07",
    medico: "Dra. Fernanda Rocha",
    crm: "CRM-PI 456789",
    especialidade: "Dermatologia",
    local: "UBS Centro - Rua Defala Attem, 812",
    documentos: {
      receita: ["Protetor solar FPS 50 - aplicar a cada 3 horas", "Hidratante facial - 2 vezes ao dia"]
    }
  },
  {
    id: "hist-5",
    data: "2025-11-21",
    medico: "Dr. Paulo Neto",
    crm: "CRM-PI 567890",
    especialidade: "Cardiologia",
    local: "UBS Centro - Rua Defala Attem, 812",
    documentos: {
      receita: ["Losartana 50 mg - 1 comprimido pela manhã, uso contínuo"]
    }
  },
  {
    id: "hist-6",
    data: "2025-08-14",
    medico: "Dra. Juliana Ferreira",
    crm: "CRM-PI 678901",
    especialidade: "Endocrinologia",
    local: "Hospital Regional - Av. Principal, 1200",
    documentos: {
      receita: ["Vitamina D 7.000 UI - 1 cápsula por semana durante 8 semanas"],
      atestado: { dias: 1, cid: "E55.9" }
    }
  },
  {
    id: "hist-7",
    data: "2025-03-02",
    medico: "Dr. Carlos Lima",
    crm: "CRM-PI 123456",
    especialidade: "Clínica Geral",
    local: "UBS Centro - Rua Defala Attem, 812",
    documentos: {}
  }
];

var meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// nome de quem esta logado (compartilhado/paciente_sessao.js)
function nomePaciente() {
  return window.PacienteSessao ? PacienteSessao.nome : "Paciente";
}

// estado atual da tela
var anoAtual = "";
var termoBusca = "";

var icones = {
  medico: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  especialidade: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
  pasta: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',
  receita: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4a2 2 0 0 1 0 4H7z"/><line x1="7" y1="7" x2="7" y2="17"/><line x1="10" y1="11" x2="15" y2="17"/><line x1="15" y1="13" x2="11" y2="17"/></svg>',
  atestado: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
};


// "2026-05-12" -> objeto Date (sem problema de fuso)
function lerData(iso) {
  var p = iso.split("-");
  return new Date(+p[0], +p[1] - 1, +p[2]);
}

// "12 de Maio de 2026"
function formatarData(iso) {
  var d = lerData(iso);
  return String(d.getDate()).padStart(2, "0") + " de " + meses[d.getMonth()] + " de " + d.getFullYear();
}


// ========== RENDERIZACAO ==========
function criarItem(a) {
  var docs = a.documentos || {};
  var botoes = "";
  if (docs.receita) {
    botoes += '<button class="btn-documento" onclick="baixarDocumento(\'' + a.id + '\', \'receita\')">' + icones.receita + " Baixar Receita</button>";
  }
  if (docs.atestado) {
    botoes += '<button class="btn-documento" onclick="baixarDocumento(\'' + a.id + '\', \'atestado\')">' + icones.atestado + " Baixar Atestado</button>";
  }

  var blocoDocs = botoes
    ? `<div class="card-documentos">
         <p class="documentos-titulo">${icones.pasta} Documentos Disponíveis</p>
         <div class="documentos-botoes">${botoes}</div>
       </div>`
    : `<div class="card-documentos">
         <p class="documentos-vazio">Nenhum documento emitido neste atendimento.</p>
       </div>`;

  return `
    <div class="item-tempo">
      <span class="ponto-tempo"></span>
      <div class="card-atendimento">
        <div class="card-corpo">
          <p class="data-atendimento">${formatarData(a.data)}</p>
          <p class="linha-info">${icones.medico} ${a.medico}</p>
          <p class="linha-info">${icones.especialidade} ${a.especialidade}</p>
          <span class="badge-realizada"><span class="ponto"></span> Realizada</span>
        </div>
        ${blocoDocs}
      </div>
    </div>
  `;
}

function renderizar() {
  var lista = atendimentos.filter(function (a) {
    var bateAno = !anoAtual || a.data.indexOf(anoAtual) === 0;
    var bateBusca = !termoBusca ||
      a.medico.toLowerCase().includes(termoBusca) ||
      a.especialidade.toLowerCase().includes(termoBusca);
    return bateAno && bateBusca;
  });

  var html = lista.map(criarItem).join("");
  document.getElementById("linhaTempo").innerHTML =
    html || '<p class="lista-vazia">Nenhum atendimento encontrado.</p>';
}


// preenche o seletor com os anos que tem atendimento
function configurarFiltros() {
  var select = document.getElementById("selectAno");
  var anos = [];
  atendimentos.forEach(function (a) {
    var ano = a.data.slice(0, 4);
    if (anos.indexOf(ano) === -1) anos.push(ano);
  });
  anos.sort().reverse();

  select.innerHTML = anos.map(function (ano) {
    return '<option value="' + ano + '">' + ano + "</option>";
  }).join("") + '<option value="">Todos</option>';

  anoAtual = anos[0] || "";
  select.value = anoAtual;

  select.addEventListener("change", function () {
    anoAtual = select.value;
    renderizar();
  });

  document.getElementById("inputBusca").addEventListener("input", function (e) {
    termoBusca = e.target.value.toLowerCase().trim();
    renderizar();
  });
}


// ========== DOWNLOAD DOS DOCUMENTOS ==========
function baixarDocumento(id, tipo) {
  var a = atendimentos.find(function (item) { return item.id === id; });
  if (!a) return;

  if (tipo === "atestado") {
    mostrarToast("Atestado sendo baixado...");
    // pequena pausa para simular a geracao do documento
    setTimeout(function () {
      salvarPdf("atestado-" + a.data + ".pdf", linhasAtestado(a));
      mostrarToast("Download iniciado com sucesso!");
    }, 1200);
  } else {
    salvarPdf("receita-" + a.data + ".pdf", linhasReceita(a));
    mostrarToast("Download iniciado com sucesso!");
  }
}

function cabecalho(titulo, a) {
  return [
    { texto: "FluxConnect - Portal do Paciente", tamanho: 10 },
    { texto: titulo, tamanho: 20, espaco: 34 },
    { texto: "" },
    { texto: "Paciente: " + nomePaciente() },
    { texto: "Data do atendimento: " + formatarData(a.data) },
    { texto: "Profissional: " + a.medico + " (" + a.crm + ")" },
    { texto: "Especialidade: " + a.especialidade },
    { texto: "Local: " + a.local },
    { texto: "" }
  ];
}

function linhasReceita(a) {
  var linhas = cabecalho("Receita Médica", a);
  linhas.push({ texto: "Prescrição:", tamanho: 13 });
  a.documentos.receita.forEach(function (item, i) {
    linhas.push({ texto: (i + 1) + ". " + item });
  });
  linhas.push({ texto: "" }, { texto: "" }, { texto: "______________________________" }, { texto: a.medico + " - " + a.crm });
  return linhas;
}

function linhasAtestado(a) {
  var at = a.documentos.atestado;
  var linhas = cabecalho("Atestado Médico", a);
  linhas.push(
    { texto: "Atesto, para os devidos fins, que o(a) paciente acima foi atendido(a)" },
    { texto: "nesta data e necessita de " + at.dias + " dia(s) de afastamento de suas atividades." },
    { texto: "CID: " + at.cid },
    { texto: "" }, { texto: "" },
    { texto: "______________________________" },
    { texto: a.medico + " - " + a.crm }
  );
  return linhas;
}

// monta um PDF simples (uma pagina, fonte Helvetica) sem bibliotecas externas
function gerarPdf(linhas) {
  function escapar(texto) {
    return texto
      .replace(/[—–]/g, "-")
      .replace(/[^\x00-\xff]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  var y = 790;
  var conteudo = "BT\n";
  linhas.forEach(function (l) {
    var tamanho = l.tamanho || 12;
    y -= l.espaco || 20;
    conteudo += "/F1 " + tamanho + " Tf 1 0 0 1 56 " + y + " Tm (" + escapar(l.texto) + ") Tj\n";
  });
  conteudo += "ET";

  var objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Length " + conteudo.length + " >>\nstream\n" + conteudo + "\nendstream"
  ];

  var pdf = "%PDF-1.4\n";
  var posicoes = [];
  objetos.forEach(function (obj, i) {
    posicoes.push(pdf.length);
    pdf += (i + 1) + " 0 obj\n" + obj + "\nendobj\n";
  });

  var inicioXref = pdf.length;
  pdf += "xref\n0 " + (objetos.length + 1) + "\n0000000000 65535 f \n";
  posicoes.forEach(function (p) {
    pdf += String(p).padStart(10, "0") + " 00000 n \n";
  });
  pdf += "trailer\n<< /Size " + (objetos.length + 1) + " /Root 1 0 R >>\nstartxref\n" + inicioXref + "\n%%EOF";

  // cada caractere vira 1 byte (Latin-1), entao o tamanho em bytes bate com o xref
  var bytes = new Uint8Array(pdf.length);
  for (var i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}

function salvarPdf(nomeArquivo, linhas) {
  var url = URL.createObjectURL(gerarPdf(linhas));
  var link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}


// aviso rapido
var timerToast = null;
function mostrarToast(texto) {
  var toast = document.getElementById("toast");
  document.getElementById("toastTexto").textContent = texto;
  toast.classList.add("visivel");
  clearTimeout(timerToast);
  timerToast = setTimeout(function () {
    toast.classList.remove("visivel");
  }, 2800);
}


document.addEventListener("DOMContentLoaded", function () {
  configurarFiltros();
  renderizar();
});
