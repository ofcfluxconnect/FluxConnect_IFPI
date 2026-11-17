//Voltar p página de login
const voltarParaLogin = document.getElementById("voltarParaLogin");

voltarParaLogin.addEventListener("click", function () {
    window.location.href = "../tela_login/fluxconnect_login_enxuto/index.html";
});


//Validar email de recuperacao e segur pra proxima pagina(fazer nova senha)
const formularioEmail = document.querySelector("#recuperacao");

if (formularioEmail) {
    const campoEmail = document.querySelector("#email");
    const mensagem = document.querySelector("#mensagem");

    formularioEmail.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const valorEmail = campoEmail.value.trim().toLowerCase();

        mensagem.textContent = "Verificando e-mail...";
        mensagem.style.color = "#1557d9";
        try {
            const resposta = await fetch("../tela_login/fluxconnect_login_enxuto/mock-usuarios.json");

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o JSON.");
            }

            const dados = await resposta.json();
            const usuario = dados.usuarios.find(function (item) {
                return item.email.toLowerCase() === valorEmail
                    && item.ativo === true;
            });

            if (usuario) {
                sessionStorage.setItem(
                    "emailRecuperacao",
                    usuario.email
                );

                mensagem.textContent = "E-mail encontrado! Redirecionando...";
                mensagem.style.color = "#16803c";
                window.location.href = "nova_senha.html";
            } else {
                mensagem.textContent =
                    "E-mail não encontrado ou conta inativa.";
                mensagem.style.color = "#d93025";
            }
        } catch (erro) {
            console.error("Erro ao verificar e-mail:", erro);

            mensagem.textContent =
                "Não foi possível verificar o e-mail. Verifique o servidor local.";
            mensagem.style.color = "#d93025";
        }
    });
}

//Ocultar e mostrar senha
const botoesMostrarSenha = document.querySelectorAll(".mostrarSenha");

botoesMostrarSenha.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const campoSenha = botao.parentElement.querySelector("input");
        const iconeOlho = botao.querySelector(".iconeOlho");

        const mostrar = campoSenha.type === "password";

        campoSenha.type = mostrar ? "text" : "password";

        iconeOlho.src = mostrar
            ? "../../midias/icones/ver-senha.svg"
            : "../../midias/icones/ocultar-senha.svg";

        botao.setAttribute(
            "aria-label",
            mostrar ? "Ocultar senha" : "Mostrar senha"
        );

        botao.setAttribute("aria-pressed", String(mostrar));
    });
});


//Validar e guardar senha no storage do navegador

const formularioSenha = document.querySelector(".senhas");

if (formularioSenha) {
    const senhaNova = document.querySelector("#senhaNova");
    const confirmarSenha = document.querySelector("#confirmarNovaSenha");
    const mensagemSenha = document.querySelector("#mensagemSenha");

    formularioSenha.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const emailRecuperacao =
            sessionStorage.getItem("emailRecuperacao");

        // Confere se existe uma recuperação iniciada.
        if (!emailRecuperacao) {
            mensagemSenha.textContent =
                "Inicie o processo pela tela de recuperação de senha.";
            mensagemSenha.style.color = "#d93025";
            return;
        }

        const novaSenha = senhaNova.value;
        const confirmacao = confirmarSenha.value;

        if (!novaSenha || !confirmacao) {
            mensagemSenha.textContent =
                "Preencha os dois campos de senha.";
            mensagemSenha.style.color = "#d93025";
            return;
        }

        if (novaSenha.length < 8) {
            mensagemSenha.textContent =
                "A senha deve ter pelo menos 8 caracteres.";
            mensagemSenha.style.color = "#d93025";
            senhaNova.focus();
            return;
        }

        if (novaSenha !== confirmacao) {
            mensagemSenha.textContent =
                "As senhas não coincidem.";
            mensagemSenha.style.color = "#d93025";
            confirmarSenha.focus();
            return;
        }

        const senhasAtualizadas = JSON.parse(
            localStorage.getItem("senhasAtualizadas") || "{}"
        );

        senhasAtualizadas[emailRecuperacao.toLowerCase()] = novaSenha;

        localStorage.setItem(
            "senhasAtualizadas",
            JSON.stringify(senhasAtualizadas)
        );

        sessionStorage.removeItem("emailRecuperacao");

        mensagemSenha.textContent =
            "Senha alterada com sucesso! Você já pode voltar ao login.";
        mensagemSenha.style.color = "#16803c";

        formularioSenha.reset();
    });
}
