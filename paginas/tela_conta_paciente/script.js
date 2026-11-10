var PAGINA_LOGIN = "../tela_login/fluxconnect_login_enxuto/index.html";

// Configura o comportamento do botão de mostrar/ocultar CPF
function configurarCpf() {
  var botao = document.getElementById("btnMostrarCpf");
  var elementoCpf = document.getElementById("dadoCpf");

    if (!elementoCpf || !botao) return; 
    let cpfVisivel = false;

    let cpfCompleto =  "123.456.789-10";
    let cpfMascarado = "***.***.***-**";

    // Aplica a máscara assim que a página carrega
    elementoCpf.textContent = cpfMascarado;

    // Adiciona o evento de clique no botão
    botao.addEventListener("click", function (e) {
      e.preventDefault(); // previne q o botao atualize a pagina
      cpfVisivel = !cpfVisivel;

      if (cpfVisivel) {
        elementoCpf.textContent = cpfCompleto;
        botao.textContent = "Ocultar";
      }else{
        elementoCpf.textContent = cpfMascarado;
        botao.textContent = "Mostrar";
      }
    });
}

// Configura o modal de confirmação para sair da conta
function configurarSair() {
  var modal = document.getElementById("modalSair");
  var btnSair = document.getElementById("btnSair");
  var btnCancelar = document.getElementById("btnCancelarSair");
  var btnConfirmar = document.getElementById("btnConfirmarSair");

  if (!modal) return;

  function fechar() {
    modal.classList.remove("visivel");
  }

  if (btnSair) {
    btnSair.addEventListener("click", function () {
      modal.classList.add("visivel");
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", fechar);
  }

  // Fecha o modal ao clicar fora da caixa branca
  modal.addEventListener("click", function (e) {
    if (e.target === modal) fechar();
  });

  // Fecha o modal ao apertar a tecla ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") fechar();
  });

  // Confirma a saída e redireciona
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", function () {
      sessionStorage.removeItem("perfil");
      sessionStorage.removeItem("nomeUsuario");
      window.location.href = PAGINA_LOGIN;
    });
  }
}

// Inicializa as funções apenas quando o HTML terminar de carregar
document.addEventListener("DOMContentLoaded", function () {
  configurarCpf();
  configurarSair();
});