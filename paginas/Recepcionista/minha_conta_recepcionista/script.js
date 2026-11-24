// Minha Conta da recepcao: mostra os dados do cadastro da recepcionista logada.
// Os dados vem de compartilhado/perfil_recepcao.js (PerfilRecepcao).

var PAGINA_LOGIN = "../../tela_login/fluxconnect_login_enxuto/index.html";
var CPF_MASCARADO = "***.***.***-**";
var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

var cpfVisivel = false;
var cpfCompleto = "";

// "1996-03-14" -> "14/03/1996"
function formatarData(iso) {
  if (!iso) return "—";
  var p = iso.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

// "2023-02-06" -> "fevereiro de 2023"
function mesAno(iso) {
  if (!iso) return "—";
  var p = iso.split("-");
  return meses[Number(p[1]) - 1] + " de " + p[0];
}

function preencher(id, valor) {
  document.getElementById(id).textContent = valor || "—";
}

function mostrarCpf() {
  var botao = document.getElementById("btnMostrarCpf");
  preencher("dadoCpf", cpfVisivel ? cpfCompleto : CPF_MASCARADO);
  botao.textContent = cpfVisivel ? "Ocultar" : "Mostrar";
  botao.setAttribute("aria-pressed", cpfVisivel);
  botao.setAttribute("aria-label", cpfVisivel ? "Ocultar CPF" : "Mostrar CPF");
}

function montar(p) {
  var end = p.endereco || {};

  // cabecalho
  preencher("contaAvatar", PerfilRecepcao.iniciais(p.nomeCompleto || p.nome));
  preencher("contaNome", p.nome);
  preencher("contaEmail", p.email);
  preencher("contaCargo", p.cargo);
  preencher("contaMatricula", "Matrícula " + p.matricula);
  preencher("contaDesde", mesAno(p.admissao));

  // dados pessoais
  preencher("dadoNome", p.nomeCompleto);
  cpfCompleto = p.cpf;
  mostrarCpf();
  preencher("dadoNascimento", formatarData(p.nascimento));
  preencher("dadoSexo", p.sexo);

  // contato
  preencher("dadoCelular", p.celular);
  preencher("dadoEmail", p.email);
  preencher("dadoRamal", p.ramal);

  // dados profissionais
  preencher("dadoUnidade", p.unidade);
  preencher("dadoTurno", p.turno);

  // endereco
  preencher("dadoRua", end.rua);
  preencher("dadoNumero", end.numero);
  preencher("dadoBairro", end.bairro);
  preencher("dadoCidade", end.cidade && end.uf ? end.cidade + " - " + end.uf : end.cidade);
  preencher("dadoEstado", end.estado);
  preencher("dadoCep", end.cep);
}

function configurarCpf() {
  document.getElementById("btnMostrarCpf").addEventListener("click", function () {
    cpfVisivel = !cpfVisivel;
    mostrarCpf();
  });
}

// confirmacao antes de sair da conta
function configurarSair() {
  var modal = document.getElementById("modalSair");
  var btnSair = document.getElementById("btnSair");
  var btnCancelar = document.getElementById("btnCancelarSair");

  function abrir() {
    modal.classList.add("visivel");
    btnCancelar.focus();
  }

  function fechar() {
    if (!modal.classList.contains("visivel")) return;
    modal.classList.remove("visivel");
    btnSair.focus();
  }

  btnSair.addEventListener("click", abrir);
  btnCancelar.addEventListener("click", fechar);

  // fecha ao clicar fora da caixa ou apertar ESC
  modal.addEventListener("click", function (e) {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });

  document.getElementById("btnConfirmarSair").addEventListener("click", function () {
    ["perfil", "nomeUsuario", "emailUsuario"].forEach(function (k) { sessionStorage.removeItem(k); });
    window.location.href = PAGINA_LOGIN;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  configurarCpf();
  configurarSair();
  PerfilRecepcao.aoAtualizar(montar); // refaz a tela se o perfil mudar em outra aba
});
