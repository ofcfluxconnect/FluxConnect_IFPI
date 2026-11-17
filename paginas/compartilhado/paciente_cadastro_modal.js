// Modal "Novo Paciente" da recepcao (tambem serve para editar).
// Precisa de recepcao_dados.js e recepcao_layout.js.
// Uso: CadastroPaciente.abrir({ paciente: <opcional, para editar>, aoSalvar: function (p) {} })
// Qualquer botao com data-novo-paciente tambem abre o modal.

(function () {
  var estilos = `
    .cp-overlay { position: fixed; inset: 0; z-index: 2200; display: none; align-items: center; justify-content: center; padding: 16px;
      background: rgba(15, 25, 35, 0.45); backdrop-filter: blur(2px); font-family: "Inter", sans-serif; }
    .cp-overlay.visivel { display: flex; }
    .cp-caixa { width: 100%; max-width: 640px; max-height: 92vh; display: flex; flex-direction: column; background: #fff; border-radius: 18px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2); overflow: hidden; text-align: left; animation: cpAparecer 0.2s ease; }
    @keyframes cpAparecer { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .cp-topo { display: flex; align-items: flex-start; gap: 14px; padding: 22px 26px 18px; border-bottom: 1px solid #edf0f4; }
    .cp-icone { width: 44px; height: 44px; border-radius: 12px; background: #e8f0fd; color: #1d4ed8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cp-titulo { font-size: 18px; font-weight: 600; color: #0f1923; margin: 0; }
    .cp-sub { font-size: 13px; color: #6b7585; margin: 4px 0 0; }
    .cp-x { margin-left: auto; width: 32px; height: 32px; border: none; border-radius: 8px; background: #f3f5f8; color: #4b5563; cursor: pointer;
      display: flex; align-items: center; justify-content: center; }
    .cp-x:hover { background: #e7ebf0; }
    .cp-corpo { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 26px 18px; }
    .cp-secao { font-size: 12.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #1d5fa8; margin: 18px 0 12px; }
    .cp-campo { display: block; margin-bottom: 14px; }
    .cp-rotulo { display: block; font-size: 13px; font-weight: 500; color: #0f1923; margin-bottom: 7px; }
    .cp-rotulo em { font-style: normal; color: #dc2626; }
    .cp-entrada { position: relative; display: flex; align-items: center; }
    .cp-entrada svg { position: absolute; left: 12px; color: #9ca3af; pointer-events: none; }
    .cp-input { width: 100%; height: 42px; border: 1px solid #e3e8ef; border-radius: 8px; background: #f5f7fb; padding: 0 12px;
      font-size: 13.5px; color: #0f1923; outline: none; font-family: inherit; box-sizing: border-box; }
    .cp-entrada svg + .cp-input { padding-left: 38px; }
    .cp-input:focus { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); }
    .cp-input.invalido { border-color: #dc2626; background: #fffafa; }
    select.cp-input { appearance: none; -webkit-appearance: none; cursor: pointer;
      background: #f5f7fb url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7585' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") right 12px center / 16px no-repeat; }
    .cp-dica { font-size: 11.5px; color: #6b7585; margin: 6px 0 0; }
    .cp-erro { font-size: 11.5px; color: #dc2626; margin: 6px 0 0; font-weight: 500; }
    .cp-erro a { color: #1d4ed8; }
    .cp-linha { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .cp-rodape { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 26px 18px; border-top: 1px solid #edf0f4; }
    .cp-cancelar, .cp-salvar { height: 42px; padding: 0 20px; border-radius: 10px; font-size: 13.5px; font-weight: 500; cursor: pointer;
      display: flex; align-items: center; gap: 8px; font-family: inherit; }
    .cp-cancelar { border: 1px solid #d8dee6; background: #fff; color: #0f1923; }
    .cp-cancelar:hover { background: #f3f5f8; }
    .cp-salvar { border: none; background: #1d64f2; color: #fff; }
    .cp-salvar:hover { background: #1652d1; }
    @media (max-width: 560px) { .cp-linha { grid-template-columns: 1fr; } }
  `;

  var html = `
    <div class="cp-caixa" role="dialog" aria-modal="true" aria-labelledby="cpTitulo">
      <div class="cp-topo">
        <span class="cp-icone">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
        </span>
        <div>
          <h2 class="cp-titulo" id="cpTitulo">Novo Paciente</h2>
          <p class="cp-sub" id="cpSub">Cadastre um novo paciente para realizar agendamentos e atendimentos.</p>
        </div>
        <button type="button" class="cp-x" data-cp-fechar title="Fechar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <form class="cp-corpo" id="cpForm" novalidate autocomplete="off">
        <p class="cp-secao">Dados pessoais</p>
        <label class="cp-campo">
          <span class="cp-rotulo">CPF<em>*</em></span>
          <span class="cp-entrada">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <input class="cp-input" id="cpCpf" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" />
          </span>
          <p class="cp-dica" id="cpCpfDica">O CPF será utilizado para localizar cadastros existentes.</p>
        </label>
        <label class="cp-campo">
          <span class="cp-rotulo">Nome Completo<em>*</em></span>
          <input class="cp-input" id="cpNome" placeholder="Digite o nome completo" />
        </label>
        <div class="cp-linha">
          <label class="cp-campo">
            <span class="cp-rotulo">Data de Nascimento<em>*</em></span>
            <input class="cp-input" id="cpNascimento" type="date" />
          </label>
          <label class="cp-campo">
            <span class="cp-rotulo">Gênero</span>
            <select class="cp-input" id="cpGenero">
              <option value="">Selecione</option>
              <option>Feminino</option>
              <option>Masculino</option>
              <option>Outro</option>
              <option>Prefiro não informar</option>
            </select>
          </label>
        </div>

        <p class="cp-secao">Contato</p>
        <div class="cp-linha">
          <label class="cp-campo">
            <span class="cp-rotulo">Telefone</span>
            <input class="cp-input" id="cpTelefone" type="tel" inputmode="numeric" maxlength="15" placeholder="(00) 00000-0000" />
          </label>
          <label class="cp-campo">
            <span class="cp-rotulo">E-mail</span>
            <input class="cp-input" id="cpEmail" type="email" placeholder="email@exemplo.com" />
          </label>
        </div>

        <p class="cp-secao">Convênio</p>
        <label class="cp-campo">
          <span class="cp-rotulo">Plano de saúde</span>
          <select class="cp-input" id="cpConvenio"></select>
        </label>
        <p class="cp-dica">Telefone, e-mail e convênio podem ser completados depois; o cadastro fica como "Dados pendentes".</p>
      </form>

      <div class="cp-rodape">
        <button type="button" class="cp-cancelar" data-cp-fechar>Cancelar</button>
        <button type="submit" form="cpForm" class="cp-salvar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          <span id="cpTxtSalvar">Salvar Cadastro</span>
        </button>
      </div>
    </div>
  `;

  var overlay, editando = null, aoSalvar = null;

  function el(id) { return document.getElementById(id); }

  function cpfValido(valor) {
    var cpf = valor.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    for (var t = 9; t <= 10; t++) {
      var soma = 0;
      for (var i = 0; i < t; i++) soma += cpf[i] * (t + 1 - i);
      var digito = (soma * 10) % 11;
      if ((digito === 10 ? 0 : digito) != cpf[t]) return false;
    }
    return true;
  }

  function mostrarErroCpf(mensagem, existente) {
    var dica = el("cpCpfDica");
    el("cpCpf").classList.toggle("invalido", !!mensagem);
    if (!mensagem) {
      dica.className = "cp-dica";
      dica.textContent = "O CPF será utilizado para localizar cadastros existentes.";
      return;
    }
    dica.className = "cp-erro";
    dica.textContent = mensagem;
    if (existente) {
      var link = document.createElement("a");
      link.href = "#";
      link.textContent = " Abrir cadastro de " + existente.nome;
      link.addEventListener("click", function (e) {
        e.preventDefault();
        abrir({ paciente: existente, aoSalvar: aoSalvar });
      });
      dica.appendChild(link);
    }
  }

  // procura cadastro existente assim que o CPF fica completo
  function conferirCpf() {
    var valor = el("cpCpf").value;
    if (valor.replace(/\D/g, "").length < 11) return mostrarErroCpf("");
    if (!cpfValido(valor)) return mostrarErroCpf("CPF inválido. Confira os números digitados.");
    var existente = Recepcao.buscarPorCpf(valor);
    if (existente && (!editando || existente.id !== editando.id)) {
      return mostrarErroCpf("Já existe um paciente com este CPF.", existente);
    }
    mostrarErroCpf("");
  }

  function abrir(opcoes) {
    opcoes = opcoes || {};
    editando = opcoes.paciente || null;
    aoSalvar = opcoes.aoSalvar || null;

    el("cpConvenio").innerHTML = '<option value="">Selecione</option>' +
      Recepcao.convenios().map(function (c) { return "<option>" + c + "</option>"; }).join("");

    var p = editando || {};
    el("cpCpf").value = p.cpf || "";
    el("cpNome").value = p.nome || "";
    el("cpNascimento").value = p.nascimento || "";
    el("cpGenero").value = p.genero || "";
    el("cpTelefone").value = p.telefone || "";
    el("cpEmail").value = p.email || "";
    el("cpConvenio").value = p.convenio || "";
    el("cpCpf").disabled = !!editando; // CPF nao muda depois de cadastrado
    el("cpNascimento").max = Recepcao.iso(Recepcao.hoje());

    el("cpTitulo").textContent = editando ? "Editar Paciente" : "Novo Paciente";
    el("cpSub").textContent = editando ? "Atualize os dados de " + editando.nome + "." : "Cadastre um novo paciente para realizar agendamentos e atendimentos.";
    el("cpTxtSalvar").textContent = editando ? "Salvar Alterações" : "Salvar Cadastro";

    overlay.querySelectorAll(".invalido").forEach(function (c) { c.classList.remove("invalido"); });
    mostrarErroCpf("");
    overlay.classList.add("visivel");
    setTimeout(function () { (editando ? el("cpNome") : el("cpCpf")).focus(); }, 50);
  }

  function fechar() {
    overlay.classList.remove("visivel");
  }

  function salvar(e) {
    e.preventDefault();
    var erros = [];
    var cpf = el("cpCpf").value;
    var nome = el("cpNome").value.trim();
    var nascimento = el("cpNascimento").value;
    var email = el("cpEmail").value.trim();
    var telefone = el("cpTelefone").value.trim();

    if (!editando) {
      conferirCpf();
      if (!cpf || el("cpCpf").classList.contains("invalido")) {
        if (!cpf) mostrarErroCpf("Informe o CPF.");
        erros.push(el("cpCpf"));
      }
    }
    if (nome.split(/\s+/).length < 2) erros.push(el("cpNome"));
    if (!nascimento || nascimento > Recepcao.iso(Recepcao.hoje())) erros.push(el("cpNascimento"));
    if (telefone && [10, 11].indexOf(telefone.replace(/\D/g, "").length) === -1) erros.push(el("cpTelefone"));
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.push(el("cpEmail"));

    [el("cpNome"), el("cpNascimento"), el("cpTelefone"), el("cpEmail")].forEach(function (c) {
      c.classList.toggle("invalido", erros.indexOf(c) !== -1);
    });

    if (erros.length) {
      erros[0].focus();
      RecepcaoUI.toast("Confira os campos destacados", "Nome e sobrenome, CPF válido e data de nascimento são obrigatórios.", "erro");
      return;
    }

    var salvo = Recepcao.salvarPaciente({
      id: editando ? editando.id : undefined,
      cpf: editando ? editando.cpf : cpf,
      nome: nome,
      nascimento: nascimento,
      genero: el("cpGenero").value,
      telefone: telefone,
      email: email,
      convenio: el("cpConvenio").value
    });

    fechar();
    RecepcaoUI.toast(editando ? "Cadastro atualizado" : "Paciente cadastrado",
      editando ? "Os dados de " + salvo.nome + " foram salvos." : "O novo paciente foi registrado com sucesso.");
    if (aoSalvar) aoSalvar(salvo);
  }

  function iniciar() {
    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);

    overlay = document.createElement("div");
    overlay.className = "cp-overlay";
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // mascaras iguais as da tela de cadastro
    el("cpCpf").addEventListener("input", function (e) {
      var v = e.target.value.replace(/\D/g, "").slice(0, 11);
      e.target.value = v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      conferirCpf();
    });
    el("cpTelefone").addEventListener("input", function (e) {
      var v = e.target.value.replace(/\D/g, "").slice(0, 11);
      e.target.value = v.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    });
    overlay.querySelectorAll(".cp-input").forEach(function (c) {
      c.addEventListener("input", function () { if (c.id !== "cpCpf") c.classList.remove("invalido"); });
    });

    el("cpForm").addEventListener("submit", salvar);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-cp-fechar]")) fechar();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("visivel")) fechar();
    });

    document.querySelectorAll("[data-novo-paciente]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        abrir({ aoSalvar: window.aoCadastrarPaciente });
      });
    });
  }

  window.CadastroPaciente = { abrir: abrir, fechar: fechar };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
