
/* Seleciona os elementos do formulário */
const formulario = document.querySelector("#formCadastro");
const mensagem = document.querySelector("#mensagem");

// Busca um campo pelo seu ID.
function buscarCampo(id) {
    return document.getElementById(id);
}

// Remove letras, espaços e símbolos, deixando apenas números.
function somenteNumeros(valor) {
    return valor.replace(/\D/g, "");
}


const hoje = new Date();

// Ajusta a data para o horário local.
const dataAtual = new Date(
    hoje.getTime() - hoje.getTimezoneOffset() * 60000
);

buscarCampo("nascimento").max = dataAtual
    .toISOString()
    .slice(0, 10);


/* Aplica a máscara do CPF */
buscarCampo("cpf").addEventListener("input", function () {
    let cpf = somenteNumeros(this.value).slice(0, 11);

    cpf = cpf
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    this.value = cpf;
});


/* Aplica a máscara do CEP */
buscarCampo("cep").addEventListener("input", function () {
    let cep = somenteNumeros(this.value).slice(0, 8);

    this.value = cep.replace(/^(\d{5})(\d)/, "$1-$2");
});

buscarCampo("telefone").addEventListener("input", function () {
    let telefone = somenteNumeros(this.value).slice(0, 11);

    telefone = telefone
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");

    this.value = telefone;
});


/* Verifica se o CPF informado é válido */
function validarCPF(valor) {
    const cpf = somenteNumeros(valor);

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Confere os dois dígitos verificadores do CPF.
    for (let posicao = 9; posicao <= 10; posicao++) {
        let soma = 0;

        for (let i = 0; i < posicao; i++) {
            soma += Number(cpf[i]) * (posicao + 1 - i);
        }

        let digito = (soma * 10) % 11;

        if (digito === 10) {
            digito = 0;
        }

        if (digito !== Number(cpf[posicao])) {
            return false;
        }
    }

    return true;
}


/* Mostra uma mensagem para o usuário */
function mostrarMensagem(texto, sucesso = false) {
    mensagem.textContent = texto;
    mensagem.className = sucesso ? "sucesso" : "";
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Pega os valores digitados no formulário.
    const nome = buscarCampo("nome").value.trim();
    const cpf = buscarCampo("cpf").value;
    const telefone = buscarCampo("telefone").value;
    const cep = buscarCampo("cep").value;
    const nascimento = buscarCampo("nascimento").value;
    const senha = buscarCampo("senha").value;
    const confirmarSenha = buscarCampo("confirmarSenha").value;

    if (!formulario.checkValidity()) {
        mostrarMensagem("Preencha todos os campos corretamente.");
        return;
    }

    if (nome.split(/\s+/).length < 2) {
        mostrarMensagem("Informe seu nome e sobrenome.");
        return;
    }

    if (!validarCPF(cpf)) {
        mostrarMensagem("CPF inválido.");
        return;
    }

    const quantidadeTelefone = somenteNumeros(telefone).length;

    if (quantidadeTelefone !== 10 && quantidadeTelefone !== 11) {
        mostrarMensagem("Telefone inválido.");
        return;
    }

    if (somenteNumeros(cep).length !== 8) {
        mostrarMensagem("CEP inválido.");
        return;
    }

    // 6. Verifica se a data de nascimento é anterior a hoje.
    if (nascimento >= buscarCampo("nascimento").max) {
        mostrarMensagem("Data de nascimento inválida.");
        return;
    }

    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!senhaForte.test(senha)) {
        mostrarMensagem(
            "A senha precisa ter pelo menos 8 caracteres, " +
            "incluindo letra maiúscula, minúscula, número e símbolo."
        );
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagem("As senhas não coincidem.");
        return;
    }

    mostrarMensagem(
        "Cadastro validado! Os dados não foram enviados.",
        true
    );
});
