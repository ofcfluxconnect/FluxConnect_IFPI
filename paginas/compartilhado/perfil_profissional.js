// Modal "Meu perfil" da area do profissional (dados pessoais, foto e senha).
// Uso: inclua este arquivo e marque os elementos da tela:
//   data-abrir-perfil        -> abre o modal ao clicar
//   data-perfil="nome"       -> recebe o nome
//   data-perfil="iniciais"   -> recebe as iniciais (ou a foto, se houver)
//   data-perfil="especialidade"
// Os dados ficam no localStorage (ainda nao existe backend).

(function () {
  var CHAVE = "fluxconnect_perfil_profissional";
  var CAMINHO_USUARIOS = "../tela_login/fluxconnect_login_enxuto/mock-usuarios.json";
  var PAGINA_LOGIN = "../tela_login/fluxconnect_login_enxuto/index.html";

  var padrao = {
    nome: "Dr. Carlos Lima",
    especialidade: "Clínica Geral",
    crm: "CRM-PI 004512",
    email: "profissional@fluxconnect.test",
    cpf: "082.345.678-90",
    nascimento: "",
    telefone: "(86) 99812-3456",
    foto: ""
  };

  var ouvintes = [];
  var fotoTemporaria = null;

  function obter() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
      var perfil = Object.assign({}, padrao, salvo);
      // e-mail de quem fez login, se houver
      var emailLogin = sessionStorage.getItem("emailUsuario");
      if (emailLogin && sessionStorage.getItem("perfil") === "profissional") perfil.email = emailLogin;
      return perfil;
    } catch (e) {
      return Object.assign({}, padrao);
    }
  }

  function salvar(perfil) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(perfil));
    } catch (e) {
      // a foto pode estourar o limite do navegador; salva sem ela
      var semFoto = Object.assign({}, perfil, { foto: "" });
      localStorage.setItem(CHAVE, JSON.stringify(semFoto));
    }
  }

  // "Dr. Carlos Lima" -> "CL" (ignora Dr./Dra.)
  function iniciais(nome) {
    var partes = nome.replace(/^(dra?\.?)\s+/i, "").trim().split(/\s+/);
    if (!partes[0]) return "--";
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
  }

  // preenche nome/avatar/especialidade em qualquer tela que use os data-atributos
  function aplicarNaTela() {
    var perfil = obter();
    document.querySelectorAll('[data-perfil="nome"]').forEach(function (el) { el.textContent = perfil.nome; });
    document.querySelectorAll('[data-perfil="especialidade"]').forEach(function (el) { el.textContent = perfil.especialidade; });
    document.querySelectorAll('[data-perfil="iniciais"]').forEach(function (el) {
      if (perfil.foto) {
        el.innerHTML = '<img src="' + perfil.foto + '" alt="Foto de perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
      } else {
        el.textContent = iniciais(perfil.nome);
      }
    });
    ouvintes.forEach(function (fn) { fn(perfil); });
  }

  var estilos = `
    .perfil-overlay { position: fixed; inset: 0; z-index: 2000; display: none; align-items: center; justify-content: center;
      padding: 16px; background: rgba(15, 25, 35, 0.35); backdrop-filter: blur(2px); font-family: "Inter", sans-serif; }
    .perfil-overlay.visivel { display: flex; }
    .perfil-caixa { width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto; border-radius: 18px;
      background: linear-gradient(180deg, #f3f7fe 0%, #eaf1fd 100%); box-shadow: 0 20px 60px rgba(15, 25, 35, 0.18);
      padding: 26px 24px 22px; animation: perfilAparecer 0.2s ease; text-align: left; }
    @keyframes perfilAparecer { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .perfil-topo { display: flex; justify-content: space-between; align-items: flex-start; }
    .perfil-titulo { font-size: 17px; font-weight: 600; color: #0f1923; margin: 0; }
    .perfil-sub { font-size: 13px; color: #6b7585; margin: 6px 0 0; }
    .perfil-x { width: 30px; height: 30px; border: none; background: transparent; border-radius: 50%; color: #6b7585; cursor: pointer;
      display: flex; align-items: center; justify-content: center; }
    .perfil-x:hover { background: rgba(15, 25, 35, 0.06); }
    .perfil-foto-area { display: flex; justify-content: center; margin: 22px 0 18px; }
    .perfil-foto { position: relative; width: 84px; height: 84px; border-radius: 50%; background: #dbe7fb; color: #1d4ed8;
      font-size: 24px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .perfil-foto img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
    .perfil-camera { position: absolute; right: -2px; bottom: -2px; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #eef4fd;
      background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .perfil-camera:hover { background: #1d4ed8; }
    .perfil-abas { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid #d7e2f3; margin-bottom: 18px; }
    .perfil-aba { border: none; background: transparent; padding: 10px 0 12px; font-size: 13px; color: #4b5563; cursor: pointer;
      border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: inherit; }
    .perfil-aba.ativa { color: #2563eb; font-weight: 500; border-bottom-color: #2563eb; }
    .perfil-painel { display: none; }
    .perfil-painel.ativo { display: block; }
    .perfil-campo { display: block; margin-bottom: 14px; }
    .perfil-label { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 500; color: #0f1923; margin-bottom: 8px; }
    .perfil-bloqueado { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 400; color: #6b7585;
      background: rgba(15, 25, 35, 0.05); padding: 2px 6px; border-radius: 4px; }
    .perfil-input { width: 100%; height: 42px; border: 1px solid transparent; border-radius: 8px; background: #f8fafc; padding: 0 14px;
      font-size: 13.5px; color: #0f1923; font-family: inherit; outline: none; box-sizing: border-box; }
    .perfil-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12); background: #fff; }
    .perfil-input:disabled { background: #eef0f3; color: #9ca3af; cursor: not-allowed; }
    .perfil-linha { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .perfil-dica { font-size: 11.5px; color: #6b7585; margin: -4px 0 12px; }
    .perfil-msg { font-size: 12.5px; min-height: 18px; margin: 4px 0 0; }
    .perfil-msg.erro { color: #dc2626; }
    .perfil-msg.ok { color: #15803d; }
    .perfil-rodape { display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 14px; }
    .perfil-sair { margin-right: auto; display: flex; align-items: center; gap: 7px; border: 1px solid #f8c4c4; background: #fff;
      color: #dc2626; font-size: 13px; font-weight: 500; height: 38px; padding: 0 14px; border-radius: 8px; cursor: pointer; font-family: inherit; }
    .perfil-sair:hover { background: #fdf2f2; }
    .perfil-sair.confirmar { background: #dc2626; border-color: #dc2626; color: #fff; }
    .perfil-cancelar { border: none; background: transparent; font-size: 13px; color: #4b5563; padding: 10px 12px; cursor: pointer; font-family: inherit; }
    .perfil-cancelar:hover { color: #0f1923; }
    .perfil-salvar { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 18px; border: none; border-radius: 8px;
      background: #2563eb; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; }
    .perfil-salvar:hover { background: #1d4ed8; }
    .perfil-salvar:disabled { opacity: 0.6; cursor: wait; }
    .perfil-toast { position: fixed; top: 20px; left: 50%; transform: translate(-50%, -10px); z-index: 2100; display: flex; align-items: center; gap: 8px;
      background: #ecfdf3; border: 1px solid #86efac; color: #15803d; font-size: 12.5px; padding: 10px 14px; border-radius: 6px;
      box-shadow: 0 8px 24px rgba(15, 25, 35, 0.08); opacity: 0; pointer-events: none; transition: all 0.25s ease; font-family: "Inter", sans-serif; }
    .perfil-toast.visivel { opacity: 1; transform: translate(-50%, 0); }
    @media (max-width: 520px) { .perfil-linha { grid-template-columns: 1fr; } }
  `;

  var html = `
    <div class="perfil-caixa" role="dialog" aria-modal="true" aria-labelledby="perfilTitulo">
      <div class="perfil-topo">
        <div>
          <h2 class="perfil-titulo" id="perfilTitulo">Meu perfil</h2>
          <p class="perfil-sub">Mantenha suas informações atualizadas para agilizar seus atendimentos.</p>
        </div>
        <button type="button" class="perfil-x" data-fechar-perfil title="Fechar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="perfil-foto-area">
        <div class="perfil-foto" id="perfilFoto">
          <span id="perfilFotoConteudo">CL</span>
          <label class="perfil-camera" for="perfilArquivo" title="Trocar foto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </label>
          <input type="file" id="perfilArquivo" accept="image/*" hidden />
        </div>
      </div>

      <div class="perfil-abas" role="tablist">
        <button type="button" class="perfil-aba ativa" data-aba="dados" role="tab">Dados pessoais</button>
        <button type="button" class="perfil-aba" data-aba="seguranca" role="tab">Segurança</button>
      </div>

      <div class="perfil-painel ativo" data-painel="dados">
        <label class="perfil-campo">
          <span class="perfil-label">Nome completo</span>
          <input class="perfil-input" id="perfilNome" type="text" autocomplete="name" />
        </label>
        <div class="perfil-linha">
          <label class="perfil-campo">
            <span class="perfil-label">CPF
              <span class="perfil-bloqueado">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                bloqueado
              </span>
            </span>
            <input class="perfil-input" id="perfilCpf" type="text" disabled />
          </label>
          <label class="perfil-campo">
            <span class="perfil-label">Data de nascimento</span>
            <input class="perfil-input" id="perfilNascimento" type="date" />
          </label>
        </div>
        <label class="perfil-campo">
          <span class="perfil-label">Telefone de contato</span>
          <input class="perfil-input" id="perfilTelefone" type="tel" maxlength="15" placeholder="(00) 00000-0000" />
        </label>
      </div>

      <!-- Os campos de senha ficam num form proprio com o usuario oculto.
           Sem isso o navegador acha que a pagina inteira e um login e
           preenche o e-mail salvo na barra de busca da tela. -->
      <form class="perfil-painel" data-painel="seguranca" id="perfilFormSenha" autocomplete="on">
        <input type="email" id="perfilUsuario" name="username" autocomplete="username" hidden readonly />
        <label class="perfil-campo">
          <span class="perfil-label">Senha atual</span>
          <input class="perfil-input" id="perfilSenhaAtual" type="password" autocomplete="current-password" />
        </label>
        <label class="perfil-campo">
          <span class="perfil-label">Nova senha</span>
          <input class="perfil-input" id="perfilSenhaNova" type="password" autocomplete="new-password" />
        </label>
        <p class="perfil-dica">Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e símbolo.</p>
        <label class="perfil-campo">
          <span class="perfil-label">Confirmar nova senha</span>
          <input class="perfil-input" id="perfilSenhaConfirma" type="password" autocomplete="new-password" />
        </label>
      </form>

      <p class="perfil-msg" id="perfilMsg"></p>

      <div class="perfil-rodape">
        <button type="button" class="perfil-sair" id="perfilSair">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair da conta
        </button>
        <button type="button" class="perfil-cancelar" data-fechar-perfil>Cancelar</button>
        <button type="button" class="perfil-salvar" id="perfilSalvar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Salvar alterações
        </button>
      </div>
    </div>
  `;

  var overlay, toast, abaAtual = "dados";

  function el(id) { return document.getElementById(id); }

  function mensagem(texto, tipo) {
    var m = el("perfilMsg");
    m.textContent = texto || "";
    m.className = "perfil-msg" + (tipo ? " " + tipo : "");
  }

  function mostrarFoto(foto, nome) {
    el("perfilFotoConteudo").innerHTML = foto
      ? '<img src="' + foto + '" alt="Foto de perfil">'
      : iniciais(nome);
  }

  function trocarAba(aba) {
    abaAtual = aba;
    overlay.querySelectorAll(".perfil-aba").forEach(function (b) { b.classList.toggle("ativa", b.dataset.aba === aba); });
    overlay.querySelectorAll(".perfil-painel").forEach(function (p) { p.classList.toggle("ativo", p.dataset.painel === aba); });
    mensagem("");
  }

  function abrir() {
    var perfil = obter();
    fotoTemporaria = null;
    el("perfilNome").value = perfil.nome;
    el("perfilCpf").value = perfil.cpf;
    el("perfilNascimento").value = perfil.nascimento;
    el("perfilTelefone").value = perfil.telefone;
    el("perfilUsuario").value = perfil.email;
    ["perfilSenhaAtual", "perfilSenhaNova", "perfilSenhaConfirma"].forEach(function (id) { el(id).value = ""; });
    mostrarFoto(perfil.foto, perfil.nome);
    trocarAba("dados");
    overlay.classList.add("visivel");
  }

  function fechar() {
    overlay.classList.remove("visivel");
  }

  function mostrarToast(texto) {
    toast.querySelector("span").textContent = texto;
    toast.classList.add("visivel");
    setTimeout(function () { toast.classList.remove("visivel"); }, 2600);
  }

  // reduz a foto para no maximo 256px para caber no localStorage
  function lerFoto(arquivo) {
    if (!arquivo || !/^image\//.test(arquivo.type)) {
      mensagem("Escolha um arquivo de imagem.", "erro");
      return;
    }
    var leitor = new FileReader();
    leitor.onload = function () {
      var img = new Image();
      img.onload = function () {
        var lado = 256;
        var canvas = document.createElement("canvas");
        canvas.width = lado;
        canvas.height = lado;
        var menor = Math.min(img.width, img.height);
        canvas.getContext("2d").drawImage(img, (img.width - menor) / 2, (img.height - menor) / 2, menor, menor, 0, 0, lado, lado);
        fotoTemporaria = canvas.toDataURL("image/jpeg", 0.85);
        mostrarFoto(fotoTemporaria, el("perfilNome").value);
        mensagem("Foto pronta. Clique em Salvar alterações para confirmar.");
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  }

  function salvarDados() {
    var nome = el("perfilNome").value.trim();
    var telefone = el("perfilTelefone").value.trim();
    var nascimento = el("perfilNascimento").value;
    var digitosTelefone = telefone.replace(/\D/g, "");

    if (nome.split(/\s+/).length < 2) return mensagem("Informe nome e sobrenome.", "erro");
    if (telefone && [10, 11].indexOf(digitosTelefone.length) === -1) return mensagem("Telefone inválido.", "erro");
    if (nascimento && nascimento >= new Date().toISOString().slice(0, 10)) return mensagem("Data de nascimento inválida.", "erro");

    var perfil = obter();
    perfil.nome = nome;
    perfil.telefone = telefone;
    perfil.nascimento = nascimento;
    if (fotoTemporaria) perfil.foto = fotoTemporaria;
    salvar(perfil);

    fechar();
    aplicarNaTela();
    mostrarToast("Perfil atualizado com sucesso!");
  }

  // troca de senha usando o mesmo mecanismo do login ("senhasAtualizadas")
  async function salvarSenha() {
    var atual = el("perfilSenhaAtual").value;
    var nova = el("perfilSenhaNova").value;
    var confirma = el("perfilSenhaConfirma").value;

    if (!atual || !nova || !confirma) return mensagem("Preencha os três campos de senha.", "erro");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(nova)) return mensagem("A nova senha não atende aos requisitos.", "erro");
    if (nova !== confirma) return mensagem("As senhas não coincidem.", "erro");
    if (nova === atual) return mensagem("A nova senha deve ser diferente da atual.", "erro");

    var botao = el("perfilSalvar");
    botao.disabled = true;
    try {
      var email = obter().email.toLowerCase();
      var resposta = await fetch(CAMINHO_USUARIOS);
      if (!resposta.ok) throw new Error("JSON indisponível");
      var usuarios = Object.values(await resposta.json()).flat();
      var usuario = usuarios.find(function (u) { return u.email.toLowerCase() === email; });
      var atualizadas = JSON.parse(localStorage.getItem("senhasAtualizadas") || "{}");
      var senhaCorreta = usuario ? (atualizadas[email] ?? usuario.senha) : null;

      if (!usuario) return mensagem("Conta não encontrada para " + email + ".", "erro");
      if (senhaCorreta !== atual) return mensagem("Senha atual incorreta.", "erro");

      atualizadas[email] = nova;
      localStorage.setItem("senhasAtualizadas", JSON.stringify(atualizadas));
      fechar();
      mostrarToast("Senha alterada com sucesso!");
    } catch (e) {
      mensagem("Não foi possível validar a senha. Abra o portal pelo servidor local.", "erro");
    } finally {
      botao.disabled = false;
    }
  }

  function iniciar() {
    var estilo = document.createElement("style");
    estilo.textContent = estilos;
    document.head.appendChild(estilo);

    overlay = document.createElement("div");
    overlay.className = "perfil-overlay";
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    toast = document.createElement("div");
    toast.className = "perfil-toast";
    toast.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12.5 11 15.5 16.5 9.5"/></svg><span></span>';
    document.body.appendChild(toast);

    document.querySelectorAll("[data-abrir-perfil]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        abrir();
      });
    });
    overlay.querySelectorAll("[data-fechar-perfil]").forEach(function (b) { b.addEventListener("click", fechar); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) fechar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });
    overlay.querySelectorAll(".perfil-aba").forEach(function (b) {
      b.addEventListener("click", function () { trocarAba(b.dataset.aba); });
    });
    el("perfilArquivo").addEventListener("change", function (e) { lerFoto(e.target.files[0]); e.target.value = ""; });

    // mascara de telefone igual a do cadastro
    el("perfilTelefone").addEventListener("input", function (e) {
      var v = e.target.value.replace(/\D/g, "").slice(0, 11);
      e.target.value = v.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    });

    // sair da conta: primeiro clique pede confirmacao, o segundo encerra a sessao
    el("perfilSair").addEventListener("click", function () {
      var botao = this;
      if (!botao.classList.contains("confirmar")) {
        botao.classList.add("confirmar");
        botao.lastChild.textContent = " Confirmar saída";
        setTimeout(function () {
          botao.classList.remove("confirmar");
          botao.lastChild.textContent = " Sair da conta";
        }, 4000);
        return;
      }
      ["perfil", "nomeUsuario", "emailUsuario"].forEach(function (k) { sessionStorage.removeItem(k); });
      window.location.href = PAGINA_LOGIN;
    });

    // Enter dentro do form de senha salva em vez de recarregar a pagina
    el("perfilFormSenha").addEventListener("submit", function (e) {
      e.preventDefault();
      salvarSenha();
    });

    el("perfilSalvar").addEventListener("click", function () {
      if (abaAtual === "dados") salvarDados();
      else salvarSenha();
    });

    aplicarNaTela();
  }

  // outras telas podem reagir a mudancas no perfil (ex.: "Ola, Dr. ...")
  window.PerfilProfissional = {
    obter: obter,
    abrir: function () { abrir(); },
    aoAtualizar: function (fn) { ouvintes.push(fn); fn(obter()); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
