// Gestao de laudos: a recepcao anexa o arquivo do laudo (PDF ou imagem) de cada exame
// solicitado. Pedidos feitos pelos medicos na tela de consulta tambem aparecem aqui.

var TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB
var e = Recepcao.escapar;

var filtroStatus = "";
var termoBusca = "";
var ordem = "recentes";
var laudoAlvo = null; // id do exame que vai receber o arquivo

var icones = {
  frasco: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/></svg>',
  relogio: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  ok: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg>',
  upload: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  olho: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
};

function tamanhoLegivel(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return "menos de 1 KB";
  return bytes < 1024 * 1024 ? Math.round(bytes / 1024) + " KB" : (bytes / 1024 / 1024).toFixed(1).replace(".", ",") + " MB";
}

function renderizar() {
  var laudos = Recepcao.laudos();
  var pendentes = laudos.filter(function (l) { return l.status === "pendente"; }).length;

  document.getElementById("numTotal").textContent = laudos.length;
  document.getElementById("numPendentes").textContent = pendentes;
  document.getElementById("numDisponiveis").textContent = laudos.length - pendentes;
  document.getElementById("contTodos").textContent = laudos.length;
  document.getElementById("contPendente").textContent = pendentes;
  document.getElementById("contDisponivel").textContent = laudos.length - pendentes;

  var lista = laudos.filter(function (l) {
    var bateStatus = !filtroStatus || l.status === filtroStatus;
    var bateBusca = !termoBusca || l.paciente.nome.toLowerCase().includes(termoBusca) || l.exame.toLowerCase().includes(termoBusca);
    return bateStatus && bateBusca;
  }).sort(function (a, b) {
    if (ordem === "antigas") return a.data.localeCompare(b.data);
    if (ordem === "paciente") return a.paciente.nome.localeCompare(b.paciente.nome);
    if (ordem === "pendentes") return (a.status === "pendente" ? 0 : 1) - (b.status === "pendente" ? 0 : 1) || b.data.localeCompare(a.data);
    return b.data.localeCompare(a.data);
  });

  document.getElementById("corpoTabela").innerHTML = lista.map(function (l) {
    var pendente = l.status === "pendente";
    return `<tr>
      <td><div class="celula-pessoa">
        <span class="avatar-pessoa avatar-claro">${Recepcao.iniciais(l.paciente.nome)}</span>
        <p class="pessoa-nome">${e(l.paciente.nome)}</p>
      </div></td>
      <td><p class="com-icone">${icones.frasco} ${e(l.exame)}</p>${l.indicacao ? '<p class="texto-suave" title="' + e(l.indicacao) + '">Pedido feito na consulta</p>' : ""}</td>
      <td>${e(l.medico)}</td>
      <td>${Recepcao.formatarData(l.data)}</td>
      <td>${pendente
        ? '<span class="badge badge-pendente">' + icones.relogio + " Pendente</span>"
        : '<span class="badge badge-disponivel">' + icones.ok + " Disponível</span>"}</td>
      <td>${pendente
        ? `<button type="button" class="btn-primario btn-pequeno" data-upload="${l.id}" aria-label="Fazer upload do laudo de ${e(l.exame)} de ${e(l.paciente.nome)}">${icones.upload} Fazer Upload</button>`
        : `<button type="button" class="btn-visualizar" data-ver="${l.id}" aria-label="Visualizar laudo de ${e(l.exame)} de ${e(l.paciente.nome)}">${icones.olho} Visualizar</button>`}</td>
    </tr>`;
  }).join("") || '<tr><td colspan="6" class="tabela-vazia">Nenhuma solicitação encontrada.</td></tr>';

  document.getElementById("txtExibindo").innerHTML = "Exibindo <strong>" + lista.length + "</strong> de <strong>" + laudos.length + "</strong> solicitações";
  var agora = new Date();
  document.getElementById("txtAtualizado").textContent = "Atualizado em " + Recepcao.formatarData(Recepcao.iso(agora)) + " às " +
    String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0");
}

function escolherArquivo(id) {
  laudoAlvo = id;
  var input = document.getElementById("inputArquivo");
  input.value = "";
  input.click();
}

function receberArquivo(arquivo) {
  if (!arquivo || !laudoAlvo) return;
  if (!/^(application\/pdf|image\/)/.test(arquivo.type)) {
    return RecepcaoUI.toast("Formato não aceito", "Envie o laudo em PDF ou imagem (JPG, PNG).", "erro");
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return RecepcaoUI.toast("Arquivo muito grande", "O limite é de 5 MB por laudo.", "erro");
  }
  var leitor = new FileReader();
  leitor.onload = function () {
    var laudo = Recepcao.laudos().find(function (l) { return l.id === laudoAlvo; });
    var resultado = Recepcao.salvarLaudo(laudoAlvo, {
      nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size,
      enviadoEm: new Date().toISOString(), conteudo: leitor.result
    });
    if (resultado === false) {
      return RecepcaoUI.toast("Não foi possível salvar", "O armazenamento do navegador está cheio.", "erro");
    }
    RecepcaoUI.toast("Laudo anexado", laudo.exame + " de " + laudo.paciente.nome + (resultado === "sem-conteudo" ? " (só o nome do arquivo foi guardado neste navegador)" : ""));
    fecharModal();
    renderizar();
  };
  leitor.readAsDataURL(arquivo);
}

var urlTemporaria = null;

function dataUrlParaBlob(dataUrl) {
  var partes = dataUrl.split(",");
  var tipo = partes[0].match(/data:([^;]+)/)[1];
  var binario = atob(partes[1]);
  var bytes = new Uint8Array(binario.length);
  for (var i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: tipo });
}

function abrirModal(id) {
  var l = Recepcao.laudos().find(function (x) { return x.id === id; });
  if (!l) return;
  laudoAlvo = id;
  var a = l.arquivo;
  document.getElementById("laudoTitulo").textContent = l.exame;
  document.getElementById("laudoSub").textContent = l.paciente.nome + " · solicitado por " + l.medico + " em " + Recepcao.formatarData(l.data);

  var previa = document.getElementById("laudoPrevia");
  var baixar = document.getElementById("btnBaixar");
  if (a.conteudo && /^image\//.test(a.tipo)) {
    previa.innerHTML = '<img alt="Prévia do laudo" />';
    previa.querySelector("img").src = a.conteudo;
  } else if (a.conteudo && a.tipo === "application/pdf") {
    // o Chrome nao mostra PDF vindo de "data:" num iframe; vira um link temporario (blob)
    previa.innerHTML = '<iframe title="Prévia do laudo em PDF"></iframe>';
    if (urlTemporaria) URL.revokeObjectURL(urlTemporaria);
    urlTemporaria = URL.createObjectURL(dataUrlParaBlob(a.conteudo));
    previa.querySelector("iframe").src = urlTemporaria;
  } else {
    previa.innerHTML = '<div class="previa-vazia">' + icones.ok.replace('width="12" height="12"', 'width="32" height="32"') +
      "<p>" + (a.exemplo ? "Laudo de exemplo já disponível para o médico." : "Arquivo registrado, sem prévia neste navegador.") + "</p></div>";
  }
  baixar.hidden = !a.conteudo;
  if (a.conteudo) { baixar.href = a.conteudo; baixar.download = a.nome; }

  document.getElementById("laudoArquivo").textContent = a.nome + (a.tamanho ? " · " + tamanhoLegivel(a.tamanho) : "") +
    (a.enviadoEm ? " · enviado em " + Recepcao.formatarData(Recepcao.iso(new Date(a.enviadoEm))) : "");
  document.getElementById("modalLaudo").classList.add("visivel");
}

function fecharModal() {
  document.getElementById("modalLaudo").classList.remove("visivel");
}

document.addEventListener("DOMContentLoaded", function () {
  renderizar();

  document.getElementById("inputBusca").addEventListener("input", function (ev) {
    termoBusca = ev.target.value.toLowerCase().trim();
    renderizar();
  });
  document.getElementById("filtros").addEventListener("click", function (ev) {
    var b = ev.target.closest(".filtro");
    if (!b) return;
    document.querySelectorAll(".filtro").forEach(function (x) { x.classList.toggle("ativo", x === b); });
    filtroStatus = b.dataset.filtro;
    renderizar();
  });
  document.getElementById("ordem").addEventListener("change", function (ev) {
    ordem = ev.target.value;
    renderizar();
  });

  document.getElementById("corpoTabela").addEventListener("click", function (ev) {
    var up = ev.target.closest("[data-upload]");
    if (up) return escolherArquivo(up.dataset.upload);
    var ver = ev.target.closest("[data-ver]");
    if (ver) abrirModal(ver.dataset.ver);
  });

  document.getElementById("inputArquivo").addEventListener("change", function (ev) {
    receberArquivo(ev.target.files[0]);
  });

  var modal = document.getElementById("modalLaudo");
  modal.addEventListener("click", function (ev) {
    if (ev.target === modal || ev.target.closest("[data-fechar]")) fecharModal();
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") fecharModal(); });
  document.getElementById("btnSubstituir").addEventListener("click", function () { escolherArquivo(laudoAlvo); });
  document.getElementById("btnRemover").addEventListener("click", function () {
    var l = Recepcao.laudos().find(function (x) { return x.id === laudoAlvo; });
    Recepcao.salvarLaudo(laudoAlvo, null);
    fecharModal();
    RecepcaoUI.toast("Arquivo removido", l.exame + " de " + l.paciente.nome + " voltou para pendente.");
    renderizar();
  });
});
