// Seletores globais (Mapeados corretamente a partir do HTML)
const senha = document.querySelector("#senha");
const email = document.querySelector("#email");
const mensagem = document.querySelector("#mensagem");

// Mostra uma mensagem na tela para ações que ainda precisam de backend.
function avisar(texto) {
  mensagem.textContent = texto;
  mensagem.style.color = "#1557d9";
  mensagem.style.display = "block";
}

// Alterna a senha entre visível e oculta.
document.querySelector("#verSenha").addEventListener("click", function () {
  const mostrar = senha.type === "password";
  senha.type = mostrar ? "text" : "password";
  this.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
});

// Validação do formulário de login
document.querySelector("#formLogin").addEventListener("submit", function (evento) {
  evento.preventDefault();

  const valorEmail = email.value.trim();
  const valorSenha = senha.value;

  // 1. Verifica se os campos foram preenchidos
  if (!valorEmail || !valorSenha.trim()) {
    avisar("Preencha o e-mail e a senha para continuar.");
    return;
  }

  // 2. Verifica se o e-mail tem formato válido
  const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formatoEmail.test(valorEmail)) {
    avisar("Digite um endereço de e-mail válido.");
    email.focus();
    return;
  }

  // 3. Verificar tamanho mínimo da senha
  if (valorSenha.length < 8) {
    avisar("A senha deve ter pelo menos 8 caracteres.");
    senha.focus();
    return;
  }

  // Se passar por todas as validações:
  avisar("Login processado com sucesso! Redirecionando...");
}); 

// Ações demonstrativas dos links e do botão de cadastro (Fora do Submit)
document.querySelector("#esqueci").addEventListener("click", function (evento) {
  evento.preventDefault();
  avisar("Aqui será iniciado o processo de recuperação de senha.");
});

document.querySelector("#criarConta").addEventListener("click", function (evento) {
  evento.preventDefault();
  avisar("Conecte este botão à tela de cadastro de pacientes.");
});

document.querySelector("#privacidade").addEventListener("click", function (evento) {
  evento.preventDefault();
  avisar("Adicione aqui o endereço da Política de Privacidade.");
});
