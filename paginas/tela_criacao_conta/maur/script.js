
const form = document.querySelector('#formCadastro');
const campo = id => document.getElementById(id);
const numeros = valor => valor.replace(/\D/g, '');

// Data máxima de nascimento
const hoje = new Date();
campo('nascimento').max = new Date(
    hoje.getTime() - hoje.getTimezoneOffset() * 60000
).toISOString().slice(0, 10);

// Máscaras dos campos
campo('cpf').oninput = e => {
    let v = numeros(e.target.value).slice(0, 11);

    e.target.value = v
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Cartão SUS: 15 números no formato 000 0000 0000 0000
campo('cns').oninput = e => {
    let v = numeros(e.target.value).slice(0, 15);

    e.target.value = v
        .replace(/^(\d{3})(\d)/, '$1 $2')
        .replace(/^(\d{3}) (\d{4})(\d)/, '$1 $2 $3')
        .replace(/^(\d{3}) (\d{4}) (\d{4})(\d)/, '$1 $2 $3 $4');
};

campo('cep').oninput = e => {
    let v = numeros(e.target.value).slice(0, 8);

    e.target.value = v.replace(/^(\d{5})(\d)/, '$1-$2');
};

campo('telefone').oninput = e => {
    let v = numeros(e.target.value).slice(0, 11);

    e.target.value = v
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
};

// Validação do CPF
function cpfValido(valor) {
    let cpf = numeros(valor);

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;

    for (let t = 9; t <= 10; t++) {
        let soma = 0;

        for (let i = 0; i < t; i++)
            soma += cpf[i] * (t + 1 - i);

        let digito = (soma * 10) % 11;

        if ((digito === 10 ? 0 : digito) != cpf[t])
            return false;
    }

    return true;
}

// Validação do formulário
form.onsubmit = e => {
    e.preventDefault();

    let msg = '';
    const valor = id => campo(id).value;

    if (!form.checkValidity())
        msg = 'Preencha todos os campos corretamente.';

    else if (valor('nome').trim().split(/\s+/).length < 2)
        msg = 'Informe nome e sobrenome.';

    else if (!cpfValido(valor('cpf')))
        msg = 'CPF inválido.';

    else if (valor('cns') && numeros(valor('cns')).length !== 15)
        msg = 'O Cartão SUS tem 15 números. Confira ou deixe em branco.';

    else if (![10, 11].includes(numeros(valor('telefone')).length))
        msg = 'Telefone inválido.';

    else if (numeros(valor('cep')).length !== 8)
        msg = 'CEP inválido.';

    else if (valor('nascimento') >= campo('nascimento').max)
        msg = 'Data de nascimento inválida.';

    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}/.test(valor('senha')))
        msg = 'A senha precisa de 8 caracteres, letras, número e símbolo.';

    else if (valor('senha') !== valor('confirmarSenha'))
        msg = 'As senhas não coincidem.';

    if (!msg)
        salvarCadastro();

    campo('mensagem').className = msg ? '' : 'sucesso';
    campo('mensagem').textContent =
        msg || 'Cadastro realizado! Seus dados ficaram salvos neste navegador e aparecem em "Minha Conta".';
};

// Guarda os dados do cadastro (sem a senha) para a tela "Minha Conta".
// Ainda não existe backend, então os dados ficam só neste navegador.
function salvarCadastro() {
    const campos = ['nome', 'cpf', 'cns', 'nascimento', 'sexo', 'telefone', 'email',
        'cep', 'numero', 'rua', 'bairro', 'cidade', 'estado', 'ubs'];

    const dados = {};
    campos.forEach(id => dados[id] = campo(id).value.trim());
    dados.criadoEm = new Date().toISOString();

    try {
        localStorage.setItem('fluxconnect_cadastro', JSON.stringify(dados));
    } catch (erro) {
        console.error('Não foi possível salvar o cadastro:', erro);
    }
}
