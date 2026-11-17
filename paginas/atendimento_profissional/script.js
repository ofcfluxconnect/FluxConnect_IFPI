// Tela de consulta (prontuario): sinais vitais, anamnese, diagnostico CID-10,
// receita medica e solicitacao de exames.
// O rascunho e salvo sozinho no navegador; ao finalizar, a consulta vai para o
// prontuario (pacientes_profissional.js) e o status da agenda vira "Finalizado".
// Abra com ?id=<codigo do paciente>.

var CHAVE_AGENDA = "fluxconnect_agenda_profissional";
var PAGINA_AGENDA = "../tela_principal_profissional/index.html";

var idPaciente = new URLSearchParams(window.location.search).get("id") || "";
var paciente = null;
var CHAVE_RASCUNHO = "fluxconnect_rascunho_atendimento_" + idPaciente;

// estado da consulta (vai inteiro para o rascunho)
var consulta = {
  inicio: null,      // data/hora em que a consulta comecou (para o cronometro)
  cid: null,         // { codigo, descricao }
  receitas: [],      // receitas assinadas nesta consulta
  pedidos: []        // pedidos de exame gerados nesta consulta
};

var itensReceita = [];
var examesPedido = [];
var timerSalvar = null;

// base CID-10 resumida com os diagnosticos mais comuns na atencao primaria
var baseCid = [
  ["A09", "Diarreia e gastroenterite de origem infecciosa presumível"],
  ["B34.9", "Infecção viral não especificada"],
  ["D50.9", "Anemia por deficiência de ferro não especificada"],
  ["E03.9", "Hipotireoidismo não especificado"],
  ["E10.9", "Diabetes mellitus tipo 1 sem complicações"],
  ["E11.9", "Diabetes mellitus tipo 2 sem complicações"],
  ["E55.9", "Deficiência de vitamina D não especificada"],
  ["E66.9", "Obesidade não especificada"],
  ["E78.5", "Hiperlipidemia não especificada"],
  ["F32.9", "Episódio depressivo não especificado"],
  ["F41.1", "Ansiedade generalizada"],
  ["G43.9", "Enxaqueca não especificada"],
  ["G44.2", "Cefaleia tensional"],
  ["H10.9", "Conjuntivite não especificada"],
  ["H66.9", "Otite média não especificada"],
  ["I10", "Hipertensão essencial (primária)"],
  ["I25.1", "Doença aterosclerótica do coração"],
  ["I48", "Flutter e fibrilação atrial"],
  ["J02.9", "Faringite aguda não especificada"],
  ["J03.9", "Amigdalite aguda não especificada"],
  ["J06.9", "Infecção aguda das vias aéreas superiores não especificada"],
  ["J11.1", "Influenza com outras manifestações respiratórias, vírus não identificado"],
  ["J18.9", "Pneumonia não especificada"],
  ["J20.9", "Bronquite aguda não especificada"],
  ["J30.4", "Rinite alérgica não especificada"],
  ["J45.0", "Asma predominantemente alérgica"],
  ["J44.1", "Doença pulmonar obstrutiva crônica com exacerbação aguda"],
  ["K21.0", "Doença de refluxo gastroesofágico com esofagite"],
  ["K29.7", "Gastrite não especificada"],
  ["K59.0", "Constipação"],
  ["L20.9", "Dermatite atópica não especificada"],
  ["L70.0", "Acne vulgar"],
  ["M25.5", "Dor articular"],
  ["M54.5", "Dor lombar baixa"],
  ["M79.1", "Mialgia"],
  ["N18.3", "Doença renal crônica, estágio 3"],
  ["N39.0", "Infecção do trato urinário de localização não especificada"],
  ["R05", "Tosse"],
  ["R10.4", "Outras dores abdominais e as não especificadas"],
  ["R50.9", "Febre não especificada"],
  ["R51", "Cefaleia"],
  ["R73.9", "Hiperglicemia não especificada"],
  ["Z00.0", "Exame médico geral"]
];

var catalogoExames = [
  "Hemograma Completo", "Glicemia em Jejum", "Hemoglobina Glicada (HbA1c)", "Colesterol Total e Frações",
  "Triglicerídeos", "TSH e T4 Livre", "Creatinina", "Ureia", "TGO / TGP", "Urina Tipo 1", "Urocultura",
  "Proteína C Reativa (PCR)", "VHS", "Vitamina D (25-OH)", "Vitamina B12", "Ferritina", "PSA Total", "Beta-HCG",
  "Eletrocardiograma (ECG)", "Ecocardiograma", "Teste Ergométrico", "Holter 24h", "MAPA 24h",
  "Raio-X de Tórax", "Ultrassonografia Abdominal Total", "Ultrassonografia de Tireoide",
  "Tomografia Computadorizada de Crânio", "Ressonância Magnética de Coluna Lombar", "Mamografia",
  "Endoscopia Digestiva Alta", "Colonoscopia", "Espirometria", "Densitometria Óssea"
];

// nomes alternativos para o aviso de alergia na receita
var relacoesAlergia = {
  "penicilina": ["penicilina", "amoxicilina", "ampicilina", "benzetacil"],
  "aas": ["aas", "ácido acetilsalicílico", "acido acetilsalicilico", "aspirina"],
  "dipirona": ["dipirona", "metamizol", "novalgina"],
  "sulfa": ["sulfa", "sulfametoxazol", "bactrim"],
  "amoxicilina": ["amoxicilina", "penicilina", "ampicilina"]
};


// ========== AUXILIARES ==========
function el(id) {
  return document.getElementById(id);
}

function campos() {
  return document.querySelectorAll("[data-campo]");
}

// tira acentos para a busca ("hipotensao" acha "hipotensão")
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function horaAgora() {
  var d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function escapar(texto) {
  return String(texto).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

var timerToast = null;
function mostrarToast(texto) {
  el("toastTexto").textContent = texto;
  el("toast").classList.add("visivel");
  clearTimeout(timerToast);
  timerToast = setTimeout(function () { el("toast").classList.remove("visivel"); }, 2800);
}

function chaveHoje() {
  var d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

// atualiza so o status deste paciente na agenda de hoje
function atualizarAgenda(status) {
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE_AGENDA) || "null");
    if (!salvo || salvo.dia !== chaveHoje()) salvo = { dia: chaveHoje(), status: {} };
    salvo.status[idPaciente] = status;
    localStorage.setItem(CHAVE_AGENDA, JSON.stringify(salvo));
  } catch (e) {}
}


// ========== BUSCA COM SUGESTOES (CID e exames) ==========
// liga um campo de busca a uma lista de sugestoes navegavel pelo teclado
function criarBusca(opcoes) {
  var input = opcoes.input;
  var lista = opcoes.lista;
  var itens = [];
  var ativo = -1;

  function fechar() {
    lista.classList.remove("aberta");
    input.setAttribute("aria-expanded", "false");
    ativo = -1;
  }

  function desenhar() {
    itens = opcoes.buscar(input.value);
    if (!itens.length || !input.value.trim()) return fechar();
    lista.innerHTML = itens.map(function (item, i) {
      return `<li role="option" id="${lista.id}-${i}" class="sugestao${i === ativo ? " ativa" : ""}" data-indice="${i}">
        ${item.codigo ? `<strong>${escapar(item.codigo)}</strong>` : ""}<span>${escapar(item.rotulo)}</span>
      </li>`;
    }).join("");
    lista.classList.add("aberta");
    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-activedescendant", ativo >= 0 ? lista.id + "-" + ativo : "");
  }

  function escolher(i) {
    var item = itens[i];
    if (!item) return;
    opcoes.aoEscolher(item);
    fechar();
  }

  input.addEventListener("input", function () {
    ativo = -1;
    desenhar();
    if (opcoes.aoDigitar) opcoes.aoDigitar(input.value);
  });

  input.addEventListener("keydown", function (e) {
    var aberta = lista.classList.contains("aberta");
    if (e.key === "ArrowDown" && aberta) {
      e.preventDefault();
      ativo = Math.min(ativo + 1, itens.length - 1);
      desenhar();
    } else if (e.key === "ArrowUp" && aberta) {
      e.preventDefault();
      ativo = Math.max(ativo - 1, 0);
      desenhar();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (aberta && ativo >= 0) escolher(ativo);
      else if (opcoes.aoEnter) { opcoes.aoEnter(input.value); fechar(); }
    } else if (e.key === "Escape" && aberta) {
      e.stopPropagation();
      fechar();
    }
  });

  // mousedown para escolher antes do campo perder o foco
  lista.addEventListener("mousedown", function (e) {
    var li = e.target.closest("[data-indice]");
    if (!li) return;
    e.preventDefault();
    escolher(+li.dataset.indice);
  });

  input.addEventListener("blur", function () { setTimeout(fechar, 100); });
}


// ========== CABECALHO ==========
function montarCabecalho() {
  var p = paciente;
  var avatar = el("avatarPaciente");
  avatar.textContent = PacientesProfissional.iniciais(p.nome);
  avatar.style.background = p.cor;
  el("nomePaciente").textContent = p.nome;
  el("txtIdadeSexo").textContent = p.idade + " anos · " + p.sexo;
  el("txtPlano").textContent = "Plano: " + p.convenio;
  el("txtProntuario").textContent = "#" + p.id;
  document.querySelectorAll("[data-nome-paciente]").forEach(function (s) { s.textContent = p.nome; });
  document.title = p.nome + " - Consulta - FluxConnect";

  var alertas = [];
  if (p.alergias.length) alertas.push("Alergias: " + p.alergias.join(", "));
  if (p.condicoes.length) alertas.push("Condições: " + p.condicoes.join(", "));
  if (alertas.length) {
    el("txtAlerta").textContent = alertas.join("  ·  ");
    el("faixaAlerta").hidden = false;
  }
}

function atualizarCronometro() {
  var segundos = Math.max(0, Math.floor((Date.now() - new Date(consulta.inicio)) / 1000));
  var h = Math.floor(segundos / 3600);
  var m = String(Math.floor((segundos % 3600) / 60)).padStart(2, "0");
  var s = String(segundos % 60).padStart(2, "0");
  el("txtCronometro").textContent = (h ? h + ":" : "") + m + ":" + s;
}


// ========== RASCUNHO AUTOMATICO ==========
function lerFormulario() {
  var dados = {};
  campos().forEach(function (c) { dados[c.dataset.campo] = c.value; });
  return dados;
}

function mostrarSalvo(texto) {
  el("txtSalvo").textContent = texto;
  el("txtSalvoRodape").textContent = texto === "Salvando..." ? texto : texto + " · rascunho salvo";
  el("indicadorSalvo").classList.add("salvo");
  el("salvoRodape").classList.add("salvo");
}

function salvarRascunho() {
  try {
    localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(Object.assign({ campos: lerFormulario() }, consulta)));
    mostrarSalvo("Salvo às " + horaAgora());
  } catch (e) {}
}

function agendarSalvamento() {
  mostrarSalvo("Salvando...");
  clearTimeout(timerSalvar);
  timerSalvar = setTimeout(salvarRascunho, 700);
}

function carregarRascunho() {
  try {
    var rascunho = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO) || "null");
    if (!rascunho) return false;
    campos().forEach(function (c) {
      if (rascunho.campos && rascunho.campos[c.dataset.campo] != null) c.value = rascunho.campos[c.dataset.campo];
    });
    consulta.inicio = rascunho.inicio || null;
    consulta.cid = rascunho.cid || null;
    consulta.receitas = rascunho.receitas || [];
    consulta.pedidos = rascunho.pedidos || [];
    el("txtSalvo").textContent = "Rascunho recuperado";
    el("txtSalvoRodape").textContent = "Rascunho recuperado";
    el("indicadorSalvo").classList.add("salvo");
    el("salvoRodape").classList.add("salvo");
    return true;
  } catch (e) {
    return false;
  }
}


// ========== FORMULARIO ==========
function atualizarContadores() {
  document.querySelectorAll("[data-contador]").forEach(function (s) {
    var n = document.querySelector('[data-campo="' + s.dataset.contador + '"]').value.length;
    s.textContent = n + (n === 1 ? " caractere" : " caracteres");
  });
}

function mostrarCid() {
  var tem = !!consulta.cid;
  el("cidSelecionado").hidden = !tem;
  el("buscaCid").hidden = tem;
  if (tem) {
    el("cidCodigo").textContent = consulta.cid.codigo;
    el("cidDescricao").textContent = consulta.cid.descricao;
    el("campoBuscaCid").classList.remove("invalido");
  }
}

function buscarCid(texto) {
  var termo = normalizar(texto);
  if (!termo) return [];
  var codigo = termo.replace(/\s/g, "").toUpperCase();
  return baseCid.filter(function (c) {
    return c[0].replace(".", "").startsWith(codigo.replace(".", "")) || normalizar(c[1]).includes(termo);
  }).slice(0, 8).map(function (c) {
    return { codigo: c[0], rotulo: c[1] };
  });
}

function validar() {
  var primeiroVazio = null;
  document.querySelectorAll("[data-obrigatorio]").forEach(function (c) {
    var vazio = !c.value.trim();
    c.classList.toggle("invalido", vazio);
    if (vazio && !primeiroVazio) primeiroVazio = c;
  });
  if (!consulta.cid) {
    el("campoBuscaCid").classList.add("invalido");
    if (!primeiroVazio) primeiroVazio = el("inputCid");
  }
  if (primeiroVazio) {
    primeiroVazio.scrollIntoView({ behavior: "smooth", block: "center" });
    primeiroVazio.focus({ preventScroll: true });
  }
  return !primeiroVazio;
}

function finalizar() {
  if (!validar()) {
    mostrarToast("Preencha a anamnese e o diagnóstico CID-10 para finalizar.");
    return;
  }

  var d = lerFormulario();
  var vitais = [
    d.pa && "PA " + d.pa + " mmHg", d.fc && "FC " + d.fc + " bpm", d.temp && "Temp " + d.temp + " °C",
    d.peso && "Peso " + d.peso + " kg", d.altura && "Altura " + d.altura + " m"
  ].filter(Boolean);

  var exames = [];
  consulta.pedidos.forEach(function (p) { exames = exames.concat(p.exames); });
  var medicamentos = [];
  consulta.receitas.forEach(function (r) { r.itens.forEach(function (m) { medicamentos.push(m.nome); }); });

  var anotacoes = [
    "Queixa principal: " + d.queixa.trim(),
    "História da doença atual: " + d.hda.trim(),
    "Exame físico: " + d.exame.trim(),
    vitais.length ? "Sinais vitais: " + vitais.join(", ") : "",
    medicamentos.length ? "Prescrito: " + medicamentos.join(", ") : "",
    exames.length ? "Exames solicitados: " + exames.join(", ") : ""
  ].filter(Boolean).join("\n\n");

  var perfil = PerfilProfissional.obter();
  PacientesProfissional.adicionarAtendimento(idPaciente, {
    data: new Date().toISOString(),
    medico: perfil.nome,
    especialidade: perfil.especialidade,
    cid: consulta.cid.codigo,
    titulo: consulta.cid.descricao,
    anotacoes: anotacoes
  });

  atualizarAgenda("finalizado");
  try { localStorage.removeItem(CHAVE_RASCUNHO); } catch (e) {}

  el("btnFinalizar").disabled = true;
  mostrarToast("Atendimento finalizado e salvo no prontuário.");
  setTimeout(function () { window.location.href = PAGINA_AGENDA; }, 1600);
}


// ========== DOCUMENTOS DA CONSULTA ==========
function renderizarDocumentos() {
  var itens = consulta.receitas.map(function (r, i) {
    return { data: r.data, tipo: "Receita assinada", texto: r.itens.map(function (m) { return m.nome; }).join(", "), receita: i };
  }).concat(consulta.pedidos.map(function (p) {
    return { data: p.data, tipo: "Pedido de exame", texto: p.exames.join(", ") };
  })).sort(function (a, b) { return new Date(a.data) - new Date(b.data); });

  el("cardDocumentos").hidden = !itens.length;
  el("listaDocumentos").innerHTML = itens.map(function (i) {
    var botao = i.receita != null
      ? `<button type="button" class="btn-ver-doc" data-ver-receita="${i.receita}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Visualizar
        </button>`
      : "";
    return `<li class="documento">
      <div class="documento-textos">
        <span class="documento-tipo">${i.tipo} · ${new Date(i.data).toTimeString().slice(0, 5)}</span>
        <span class="documento-texto">${escapar(i.texto)}</span>
      </div>
      ${botao}
    </li>`;
  }).join("");
}

// monta os dados que o visualizador de receita precisa
function dadosReceita(receita, assinada) {
  var perfil = PerfilProfissional.obter();
  return {
    paciente: paciente,
    medico: receita.medico || perfil.nome,
    crm: receita.crm || perfil.crm,
    especialidade: receita.especialidade || perfil.especialidade,
    data: receita.data,
    itens: receita.itens,
    codigo: receita.codigo,
    assinada: assinada
  };
}

function abrirModal(id) {
  el(id).classList.add("visivel");
}

function fecharModais() {
  document.querySelectorAll(".modal-overlay").forEach(function (m) { m.classList.remove("visivel"); });
}


// ---------- receita ----------
function alergiaDoMedicamento(nome) {
  var texto = nome.toLowerCase();
  if (!texto) return null;
  return paciente.alergias.find(function (alergia) {
    var termos = relacoesAlergia[alergia.toLowerCase()] || [alergia.toLowerCase()];
    return termos.some(function (t) { return texto.includes(t); });
  }) || null;
}

function atualizarModalReceita() {
  var nome = el("medNome").value.trim();
  var completo = nome && el("medVia").value && el("medQuantidade").value.trim() && el("medInstrucoes").value.trim();
  var alergia = alergiaDoMedicamento(nome);

  el("avisoAlergia").hidden = !alergia;
  if (alergia) el("avisoAlergia").textContent = "Atenção: o paciente tem alergia registrada a " + alergia + ". Confirme antes de prescrever.";

  el("btnAdicionarMed").disabled = !completo;
  el("txtAdicionar").textContent = alergia ? "Adicionar mesmo assim" : "Adicionar à Receita";

  var n = itensReceita.length;
  el("txtQtdMed").textContent = n ? n + (n === 1 ? " medicamento adicionado" : " medicamentos adicionados") : "Nenhum medicamento adicionado";
  el("btnAssinar").disabled = n === 0;
  el("btnPreviaReceita").disabled = n === 0;

  el("itensReceita").innerHTML = itensReceita.map(function (m, i) {
    return `<li class="item-doc">
      <div>
        <p class="item-nome">${escapar(m.nome)}</p>
        <p class="item-detalhe">${escapar(m.via)} · ${escapar(m.quantidade)}</p>
        <p class="item-detalhe">${escapar(m.instrucoes)}</p>
      </div>
      <button type="button" class="item-remover" data-remover-med="${i}" title="Remover">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </li>`;
  }).join("");
}

function limparCamposMed() {
  ["medNome", "medQuantidade", "medInstrucoes", "medVia"].forEach(function (id) { el(id).value = ""; });
}

function abrirReceita() {
  itensReceita = [];
  limparCamposMed();
  atualizarModalReceita();
  abrirModal("modalReceita");
  setTimeout(function () { el("medNome").focus(); }, 50);
}

function adicionarMedicamento() {
  itensReceita.push({
    nome: el("medNome").value.trim(),
    via: el("medVia").value,
    quantidade: el("medQuantidade").value.trim(),
    instrucoes: el("medInstrucoes").value.trim()
  });
  limparCamposMed();
  atualizarModalReceita();
  el("medNome").focus();
}

function assinarReceita() {
  if (!itensReceita.length) return;
  var perfil = PerfilProfissional.obter();
  var receita = {
    data: new Date().toISOString(),
    medico: perfil.nome,
    crm: perfil.crm,
    especialidade: perfil.especialidade,
    itens: itensReceita.slice()
  };
  receita.codigo = ReceitaVisualizar.gerarCodigo(receita);
  PacientesProfissional.adicionarReceita(idPaciente, receita);
  consulta.receitas.push(receita);
  renderizarDocumentos();
  salvarRascunho();
  fecharModais();
  mostrarToast("Receita salva e assinada digitalmente.");
}


// ---------- exames ----------
function buscarExames(texto) {
  var termo = normalizar(texto);
  if (!termo) return [];
  return catalogoExames.filter(function (nome) {
    return normalizar(nome).includes(termo) && examesPedido.indexOf(nome) === -1;
  }).slice(0, 8).map(function (nome) { return { rotulo: nome }; });
}

function adicionarExame(nome) {
  nome = nome.trim();
  if (!nome) return;
  var jaTem = examesPedido.some(function (e) { return normalizar(e) === normalizar(nome); });
  if (!jaTem) examesPedido.push(nome);
  el("inputExame").value = "";
  atualizarModalExames();
  el("inputExame").focus();
}

function atualizarModalExames() {
  var n = examesPedido.length;
  var indicacao = el("inputIndicacao").value;
  el("contIndicacao").textContent = indicacao.length + (indicacao.length === 1 ? " caractere" : " caracteres");
  el("btnAdicionarExame").disabled = !el("inputExame").value.trim();
  el("txtQtdExames").textContent = n ? n + (n === 1 ? " exame selecionado" : " exames selecionados") : "Nenhum exame selecionado";
  el("btnGerarPedido").disabled = !(n && indicacao.trim());

  el("chipsExames").innerHTML = examesPedido.map(function (nome, i) {
    return `<li class="chip-exame">${escapar(nome)}
      <button type="button" data-remover-exame="${i}" title="Remover ${escapar(nome)}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </li>`;
  }).join("");
}

function abrirExames() {
  examesPedido = [];
  el("inputExame").value = "";
  el("inputIndicacao").value = "";
  el("inputIndicacao").classList.remove("invalido");
  atualizarModalExames();
  abrirModal("modalExames");
  setTimeout(function () { el("inputExame").focus(); }, 50);
}

function gerarPedido() {
  var indicacao = el("inputIndicacao").value.trim();
  if (!examesPedido.length || !indicacao) return;
  var pedido = {
    data: new Date().toISOString(),
    medico: PerfilProfissional.obter().nome,
    exames: examesPedido.slice(),
    indicacao: indicacao
  };
  PacientesProfissional.adicionarPedidoExame(idPaciente, pedido);
  consulta.pedidos.push(pedido);
  renderizarDocumentos();
  salvarRascunho();
  fecharModais();
  mostrarToast("Pedido de exame gerado (" + pedido.exames.length + (pedido.exames.length === 1 ? " exame)." : " exames)."));
}


// ========== INICIALIZACAO ==========
document.addEventListener("DOMContentLoaded", function () {
  paciente = PacientesProfissional.obter(idPaciente);
  if (!paciente) {
    el("formulario").hidden = true;
    el("avisoErro").hidden = false;
    el("btnFinalizar").disabled = true;
    document.querySelectorAll(".atalho").forEach(function (b) { b.disabled = true; });
    return;
  }

  montarCabecalho();
  carregarRascunho();
  if (!consulta.inicio) consulta.inicio = new Date().toISOString();
  atualizarContadores();
  mostrarCid();
  renderizarDocumentos();
  atualizarCronometro();
  setInterval(atualizarCronometro, 1000);

  // abrir esta tela ja coloca o paciente "em atendimento" na agenda
  atualizarAgenda("em-atendimento");

  campos().forEach(function (c) {
    c.addEventListener("input", function () {
      c.classList.remove("invalido");
      atualizarContadores();
      agendarSalvamento();
    });
  });

  el("btnOcultarVitais").addEventListener("click", function () {
    var grade = el("gradeVitais");
    grade.hidden = !grade.hidden;
    this.setAttribute("aria-expanded", String(!grade.hidden));
  });

  // CID-10
  criarBusca({
    input: el("inputCid"),
    lista: el("listaCid"),
    buscar: buscarCid,
    aoEscolher: function (item) {
      consulta.cid = { codigo: item.codigo, descricao: item.rotulo };
      el("inputCid").value = "";
      mostrarCid();
      agendarSalvamento();
    },
    aoDigitar: function () { el("campoBuscaCid").classList.remove("invalido"); }
  });
  el("btnTrocarCid").addEventListener("click", function () {
    consulta.cid = null;
    mostrarCid();
    agendarSalvamento();
    el("inputCid").focus();
  });

  // atalhos laterais
  el("btnAbrirReceita").addEventListener("click", abrirReceita);
  el("btnAbrirExames").addEventListener("click", abrirExames);
  el("btnHistorico").addEventListener("click", function () { ProntuarioModal.abrir(idPaciente); });
  el("btnFinalizar").addEventListener("click", finalizar);

  // modais
  document.querySelectorAll(".modal-overlay").forEach(function (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal || e.target.closest("[data-fechar-modal]")) return fecharModais();
      var med = e.target.closest("[data-remover-med]");
      if (med) {
        itensReceita.splice(+med.dataset.removerMed, 1);
        atualizarModalReceita();
      }
      var exame = e.target.closest("[data-remover-exame]");
      if (exame) {
        examesPedido.splice(+exame.dataset.removerExame, 1);
        atualizarModalExames();
      }
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") fecharModais(); });

  ["medNome", "medVia", "medQuantidade", "medInstrucoes"].forEach(function (id) {
    el(id).addEventListener("input", atualizarModalReceita);
  });
  el("btnAdicionarMed").addEventListener("click", adicionarMedicamento);
  el("btnAssinar").addEventListener("click", assinarReceita);

  // pre-visualizacao antes de assinar (o modal de edicao continua aberto por baixo)
  el("btnPreviaReceita").addEventListener("click", function () {
    if (!itensReceita.length) return;
    ReceitaVisualizar.abrir(dadosReceita({ data: new Date().toISOString(), itens: itensReceita.slice() }, false));
  });

  // receitas ja assinadas nesta consulta
  el("listaDocumentos").addEventListener("click", function (e) {
    var botao = e.target.closest("[data-ver-receita]");
    if (botao) ReceitaVisualizar.abrir(dadosReceita(consulta.receitas[+botao.dataset.verReceita], true));
  });

  criarBusca({
    input: el("inputExame"),
    lista: el("listaExames"),
    buscar: buscarExames,
    aoEscolher: function (item) { adicionarExame(item.rotulo); },
    aoEnter: adicionarExame,
    aoDigitar: atualizarModalExames
  });
  el("btnAdicionarExame").addEventListener("click", function () { adicionarExame(el("inputExame").value); });
  el("inputIndicacao").addEventListener("input", atualizarModalExames);
  el("btnGerarPedido").addEventListener("click", gerarPedido);
});
