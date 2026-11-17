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
    avisar("Preencha o CPF (ou Cartão SUS) e a senha para continuar.", "#d93025");
    return;
  }

  // 2. Descobre o que foi digitado: e-mail (profissional/recepção), CPF (11 números) ou Cartão SUS (15 números).
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const digitos = valorEmail.replace(/\D/g, "");
  const ehEmail = valorEmail.includes("@");

  if (ehEmail && !formatoEmail.test(valorEmail)) {
    avisar("Digite um endereço de e-mail válido.", "#d93025");
    email.focus();
    return;
  }

  if (!ehEmail && digitos.length !== 11 && digitos.length !== 15) {
    avisar("Digite o CPF (11 números) ou o Cartão SUS (15 números).", "#d93025");
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

    // Junta as contas de todos os grupos do JSON (paciente, profissional...).
    const usuarios = Object.values(dados).flat();

    // Procura uma conta ativa com os dados informados.
    const usuario = usuarios.find(function (item) {
        const senhaCorreta =
            senhasAtualizadas[item.email.toLowerCase()] ?? item.senha;

        const mesmaConta = ehEmail
            ? item.email.toLowerCase() === valorEmail.toLowerCase()
            : [item.cpf, item.cns].some(function (doc) {
                return doc && doc.replace(/\D/g, "") === digitos;
              });

        return mesmaConta
            && senhaCorreta === valorSenha
            && item.ativo === true;
});

    // 6. Se encontrou o usuário, libera a próxima página.
    if (usuario) {
      avisar("Login realizado! Redirecionando...");

      sessionStorage.setItem("perfil", usuario.perfil);
      sessionStorage.setItem("nomeUsuario", usuario.nome);
      sessionStorage.setItem("emailUsuario", usuario.email);
      sessionStorage.setItem("cpfUsuario", usuario.cpf || "");

      window.location.href = usuario.paginaInicial;
    } else {
      avisar(ehEmail ? "E-mail ou senha incorretos." : "CPF/Cartão SUS ou senha incorretos.", "#d93025");
    }
  } catch (erro) {
    console.error("Erro ao validar login:", erro);
    avisar(
      "Não foi possível validar o login. Verifique o servidor local.",
      "#d93025"
    );
  }
});

// "Esqueceu a senha?" é um link normal para tela_esqueci_minha_senha/esqueci_senha.html

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
