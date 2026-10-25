/* Seletores dos elementos da tela */
const senha = document.querySelector("#senha");
const email = document.querySelector("#email");
const mensagem = document.querySelector("#mensagem");
const formulario = document.querySelector("#formLogin");

// Mostra mensagens para o usuário.
function avisar(texto, cor = "#1557d9") {
  mensagem.textContent = texto;
  mensagem.style.color = cor;
  mensagem.style.display = "block";
}

// Mostra ou oculta a senha.
document.querySelector("#verSenha").addEventListener("click", function () {
  const mostrar = senha.type === "password";
  senha.type = mostrar ? "text" : "password";
  this.setAttribute(
    "aria-label",
    mostrar ? "Ocultar senha" : "Mostrar senha"
  );
});

// Valida os campos e verifica as credenciais.
formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const valorEmail = email.value.trim();
  const valorSenha = senha.value;

  // 1. Confere se os campos foram preenchidos.
  if (!valorEmail || !valorSenha.trim()) {
    avisar("Preencha o e-mail e a senha para continuar.", "#d93025");
    return;
  }

  // 2. Confere o formato do e-mail.
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formatoEmail.test(valorEmail)) {
    avisar("Digite um endereço de e-mail válido.", "#d93025");
    email.focus();
    return;
  }

  // 3. Confere o tamanho mínimo da senha.
  if (valorSenha.length < 8) {
    avisar("A senha deve ter pelo menos 8 caracteres.", "#d93025");
    senha.focus();
    return;
  }

  try {
    // 4. Carrega o usuário de teste do arquivo JSON.
    const resposta = await fetch("mock-usuarios.json");

    if (!resposta.ok) {
        throw new Error("Não foi possível carregar o arquivo JSON.");
    }

    const dados = await resposta.json();

    // Senhas alteradas durante a simulação.
    const senhasAtualizadas = JSON.parse(
        localStorage.getItem("senhasAtualizadas") || "{}"
    );

    // Procura uma conta ativa com os dados informados.
    const usuario = dados.usuarios.find(function (item) {
        const senhaCorreta =
            senhasAtualizadas[item.email.toLowerCase()] ?? item.senha;

        return item.email.toLowerCase() === valorEmail.toLowerCase()
            && senhaCorreta === valorSenha
            && item.ativo === true;
});

    // 6. Se encontrou o usuário, libera a próxima página.
    if (usuario) {
      avisar("Login realizado! Redirecionando...");

      sessionStorage.setItem("perfil", usuario.perfil);
      sessionStorage.setItem("nomeUsuario", usuario.nome);

      window.location.href = usuario.paginaInicial;
    } else {
      avisar("E-mail ou senha incorretos.", "#d93025");
    }
  } catch (erro) {
    console.error("Erro ao validar login:", erro);
    avisar(
      "Não foi possível validar o login. Verifique o servidor local.",
      "#d93025"
    );
  }
});

// Link de recuperação de senha.
document.querySelector("#esqueci").addEventListener("click", function (evento) {
  evento.preventDefault();
  avisar("A recuperação de senha será implementada futuramente.");
});

// Botão para criar conta.
document.querySelector("#criarConta").addEventListener("click", function (evento) {
  evento.preventDefault();
  window.location.href = "../../tela_criacao_conta/maur/index.html";
});

// Link da política de privacidade.
document.querySelector("#privacidade").addEventListener("click", function (evento) {
  evento.preventDefault();
  avisar("A página de Política de Privacidade será adicionada futuramente.");
});
