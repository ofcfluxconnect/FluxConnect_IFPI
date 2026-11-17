// Mostra os dados salvos pela tela de cadastro (tela_criacao_conta)
// e permite sair da conta.

var PAGINA_LOGIN = "../tela_login/fluxconnect_login_enxuto/index.html";

var nomesEstados = {
  PI: "Piauí", MA: "Maranhão", CE: "Ceará", SP: "São Paulo", RJ: "Rio de Janeiro"
};
var nomesSexo = { feminino: "Feminino", masculino: "Masculino", outro: "Outro" };
var meses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

var cpfCompleto = "";
var cpfVisivel = false;


// so devolve o cadastro se ele for da conta que fez login (paciente_sessao.js)
function lerCadastro() {
  return window.PacienteSessao ? PacienteSessao.cadastro : null;
}

// "Maria Oliveira Santos" -> "MS"
function iniciais(nome) {
  var partes = nome.trim().split(/\s+/);
  if (!partes[0]) return "--";
  var primeira = partes[0][0];
  var ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

// "123.456.789-09" -> "123.***.***-09"
function mascararCpf(cpf) {
  return cpf.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, "$1.***.***-$2");
}

// "1990-05-12" -> "12/05/1990 (36 anos)"
function formatarNascimento(iso) {
  var p = iso.split("-");
  var nascimento = new Date(+p[0], +p[1] - 1, +p[2]);
  var hoje = new Date();
  var idade = hoje.getFullYear() - nascimento.getFullYear();
  var fezAniversario = hoje.getMonth() > nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() >= nascimento.getDate());
  if (!fezAniversario) idade--;
  return p[2] + "/" + p[1] + "/" + p[0] + " (" + idade + " anos)";
}

function preencher(id, valor) {
  document.getElementById(id).textContent = valor || "—";
}


function mostrarDados() {
  var dados = lerCadastro();

  if (!dados) {
    // sem cadastro: usa so o nome do login, se houver
    document.getElementById("avisoSemCadastro").classList.add("visivel");
    document.getElementById("btnMostrarCpf").hidden = true;
    var sessao = window.PacienteSessao;
    if (sessao && sessao.logado) {
      preencher("perfilNome", sessao.nome);
      preencher("dadoNome", sessao.nome);
      preencher("perfilEmail", sessao.email);
      preencher("dadoEmail", sessao.email);
      document.getElementById("avatarPerfil").textContent = sessao.iniciais;
    }
    return;
  }

  var avatar = iniciais(dados.nome);
  document.getElementById("avatarPerfil").textContent = avatar;
  document.getElementById("avatarSidebar").textContent = avatar;
  preencher("nomeSidebar", dados.nome.split(/\s+/).slice(0, 2).join(" "));

  preencher("perfilNome", dados.nome);
  preencher("perfilEmail", dados.email || (dados.cpf ? "CPF " + mascararCpf(dados.cpf) : ""));
  if (dados.criadoEm) {
    var criado = new Date(dados.criadoEm);
    preencher("perfilDesde", "Membro desde " + meses[criado.getMonth()] + " de " + criado.getFullYear());
  }

  preencher("dadoNome", dados.nome);
  cpfCompleto = dados.cpf || "";
  preencher("dadoCpf", mascararCpf(cpfCompleto));
  preencher("dadoCns", dados.cns || "Não informado");
  preencher("dadoNascimento", dados.nascimento ? formatarNascimento(dados.nascimento) : "");
  preencher("dadoSexo", nomesSexo[dados.sexo] || dados.sexo);

  preencher("dadoTelefone", dados.telefone);
  preencher("dadoEmail", dados.email || "Não informado");
  preencher("dadoUbs", dados.ubs === "Não sei" ? "Não informada — a UBS mais perto confirma no atendimento" : dados.ubs);

  preencher("dadoRua", dados.rua);
  preencher("dadoNumero", dados.numero);
  preencher("dadoBairro", dados.bairro);
  preencher("dadoCidade", dados.cidade);
  preencher("dadoEstado", nomesEstados[dados.estado] ? nomesEstados[dados.estado] + " (" + dados.estado + ")" : dados.estado);
  preencher("dadoCep", dados.cep);
}


// mostra/oculta o CPF completo
function configurarCpf() {
  var botao = document.getElementById("btnMostrarCpf");
  botao.addEventListener("click", function () {
    cpfVisivel = !cpfVisivel;
    preencher("dadoCpf", cpfVisivel ? cpfCompleto : mascararCpf(cpfCompleto));
    botao.textContent = cpfVisivel ? "Ocultar" : "Mostrar";
  });
}


// sair da conta: confirma, limpa a sessao e volta para o login
function configurarSair() {
  var modal = document.getElementById("modalSair");

  function fechar() {
    modal.classList.remove("visivel");
  }

  document.getElementById("btnSair").addEventListener("click", function () {
    modal.classList.add("visivel");
  });
  document.getElementById("btnCancelarSair").addEventListener("click", fechar);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) fechar();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });

  document.getElementById("btnConfirmarSair").addEventListener("click", function () {
    // os dados do cadastro continuam salvos; so a sessao de login e encerrada
    sessionStorage.removeItem("perfil");
    sessionStorage.removeItem("nomeUsuario");
    window.location.href = PAGINA_LOGIN;
  });
}


document.addEventListener("DOMContentLoaded", function () {
  mostrarDados();
  configurarCpf();
  configurarSair();
});
