// Nome do paciente logado, igual em todas as telas da area do paciente.
// De onde vem o nome (nesta ordem):
//   1. o cadastro salvo (tela de criacao de conta), se for da mesma conta do login
//   2. o nome da conta usada no login (mock-usuarios.json)
//   3. sem login: o cadastro salvo, se houver; senao "Paciente"
// Preenche sozinho os elementos marcados com:
//   data-paciente="nome"        -> nome completo
//   data-paciente="nome-curto"  -> primeiro + ultimo nome (barra lateral)
//   data-paciente="iniciais"    -> iniciais do avatar
//   data-paciente="email"       -> e-mail da conta
//   data-paciente="ubs"         -> UBS de referencia (do cadastro)

(function () {
  var CHAVE_CADASTRO = "fluxconnect_cadastro";

  function lerSessao(chave) {
    try { return sessionStorage.getItem(chave) || ""; } catch (e) { return ""; }
  }

  function lerCadastro() {
    try { return JSON.parse(localStorage.getItem(CHAVE_CADASTRO) || "null"); } catch (e) { return null; }
  }

  function iniciais(nome) {
    var partes = nome.trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "--";
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
  }

  function calcular() {
    var logadoComoPaciente = lerSessao("perfil") === "paciente";
    var emailLogin = lerSessao("emailUsuario").toLowerCase();
    var cpfLogin = lerSessao("cpfUsuario").replace(/\D/g, "");
    var nomeLogin = lerSessao("nomeUsuario");
    var cadastro = lerCadastro();

    // o cadastro so vale para a conta dona dele (mesmo e-mail ou mesmo CPF)
    var mesmoEmail = !!cadastro && !!emailLogin && (cadastro.email || "").toLowerCase() === emailLogin;
    var mesmoCpf = !!cadastro && !!cpfLogin && (cadastro.cpf || "").replace(/\D/g, "") === cpfLogin;
    var cadastroDaConta = cadastro && (!logadoComoPaciente || (!emailLogin && !cpfLogin) || mesmoEmail || mesmoCpf)
      ? cadastro : null;

    var nome = (cadastroDaConta && cadastroDaConta.nome) || (logadoComoPaciente && nomeLogin) || "Paciente";
    var partes = nome.trim().split(/\s+/);
    // nome curto = primeiro + ultimo nome, sem "de/da/do/dos/das/e"
    var nomes = partes.filter(function (p) { return !/^(de|da|do|dos|das|e)$/i.test(p); });
    var nomeCurto = nomes.length > 1 ? nomes[0] + " " + nomes[nomes.length - 1] : nomes[0] || nome;

    return {
      logado: logadoComoPaciente,
      nome: nome,
      nomeCurto: nomeCurto,
      primeiroNome: partes[0],
      iniciais: iniciais(nome),
      email: (cadastroDaConta && cadastroDaConta.email) || emailLogin,
      ubs: (cadastroDaConta && cadastroDaConta.ubs && cadastroDaConta.ubs !== "Não sei") ? cadastroDaConta.ubs : "UBS de referência",
      cadastro: cadastroDaConta
    };
  }

  function aplicar() {
    var s = calcular();
    s.atualizar = aplicar;
    window.PacienteSessao = s;
    var valores = { "nome": s.nome, "nome-curto": s.nomeCurto, "iniciais": s.iniciais, "email": s.email || "—", "ubs": s.ubs };
    document.querySelectorAll("[data-paciente]").forEach(function (el) {
      var valor = valores[el.dataset.paciente];
      if (valor != null) el.textContent = valor;
    });
  }

  // disponivel ja na carga (os scripts das telas podem ler PacienteSessao.nome)
  window.PacienteSessao = Object.assign(calcular(), { atualizar: aplicar });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", aplicar);
  } else {
    aplicar();
  }
})();
