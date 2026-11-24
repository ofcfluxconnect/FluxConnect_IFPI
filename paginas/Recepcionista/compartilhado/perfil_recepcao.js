// Perfil da recepcionista logada (dados de exemplo enquanto nao ha back-end).
// - PerfilRecepcao.dados()          -> objeto com os dados do cadastro
// - PerfilRecepcao.aoAtualizar(fn)  -> chama fn(perfil) agora e sempre que o perfil mudar
// - PerfilRecepcao.abrir()          -> leva para a tela "Minha Conta" (minha_conta_recepcionista)
// - PerfilRecepcao.iniciais(nome)   -> "Ana Clara" -> "AC"
// Tambem coloca o nome e as iniciais no botao do usuario da barra lateral.
// Se houver ajustes salvos no localStorage ("fluxconnect_perfil_recepcao"), eles
// sobrescrevem os dados de exemplo.

(function () {
  var CHAVE = "fluxconnect_perfil_recepcao";
  var BASE = document.currentScript ? document.currentScript.src : location.href;
  var PAGINA_CONTA = new URL("../minha_conta_recepcionista/index.html", BASE).href;

  var PADRAO = {
    nome: "Ana Clara",
    nomeCompleto: "Ana Clara Ribeiro Sousa",
    email: "ana.sousa@fluxconnect.test",
    cpf: "123.456.789-09",
    nascimento: "1996-03-14",
    sexo: "Feminino",
    celular: "(86) 99812-3456",
    ramal: "204",
    cargo: "Recepcionista",
    matricula: "REC-0142",
    unidade: "Clínica FluxConnect — Centro",
    turno: "Manhã e tarde · 08:00 às 18:00",
    admissao: "2023-02-06",
    endereco: {
      rua: "Rua Areolino de Abreu",
      numero: "1520",
      bairro: "Centro",
      cidade: "Teresina",
      uf: "PI",
      estado: "Piauí",
      cep: "64000-180"
    }
  };

  var ouvintes = [];

  function salvo() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || "{}") || {}; } catch (e) { return {}; }
  }

  function dados() {
    var s = salvo();
    var p = Object.assign({}, PADRAO, s);
    p.endereco = Object.assign({}, PADRAO.endereco, s.endereco || {});
    return p;
  }

  function iniciais(nome) {
    var partes = String(nome || "").trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "?";
    var ini = partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "");
    return ini.toUpperCase();
  }

  // botao do usuario na barra lateral: nome e iniciais
  function aplicarBarraLateral(p) {
    document.querySelectorAll(".container-user[data-menu-usuario]").forEach(function (b) {
      var nome = b.querySelector(".nome-user");
      var avatar = b.querySelector(".avatar-user");
      if (nome) nome.textContent = p.nome;
      if (avatar) avatar.textContent = iniciais(p.nomeCompleto || p.nome);
      b.setAttribute("aria-label", p.nome + " — opções da conta");
    });
  }

  function avisar() {
    var p = dados();
    aplicarBarraLateral(p);
    ouvintes.forEach(function (fn) { fn(p); });
  }

  window.PerfilRecepcao = {
    PAGINA_CONTA: PAGINA_CONTA,
    dados: dados,
    iniciais: iniciais,
    abrir: function () { window.location.href = PAGINA_CONTA; },
    aoAtualizar: function (fn) {
      ouvintes.push(fn);
      fn(dados());
    }
  };

  // outra aba mudou o perfil
  window.addEventListener("storage", function (e) {
    if (e.key === CHAVE) avisar();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { aplicarBarraLateral(dados()); });
  } else {
    aplicarBarraLateral(dados());
  }
})();
