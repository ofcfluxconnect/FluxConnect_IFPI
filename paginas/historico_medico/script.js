
// Campos de pesquisa e filtro
const pesquisa = document.getElementById('pesquisa');
const ano = document.getElementById('ano');
const consultas = document.querySelectorAll('.consulta');
const semResultados = document.getElementById('semResultados');

// Filtrar consultas
function filtrarConsultas() {

    let texto = pesquisa.value.toLowerCase().trim();
    let anoSelecionado = ano.value;
    let encontrados = 0;

    consultas.forEach(function (consulta) {

        let dados = consulta.textContent.toLowerCase();
        let anoConsulta = consulta.dataset.ano;

        let correspondePesquisa = dados.includes(texto);
        let correspondeAno = anoSelecionado === 'todos' ||
                            anoConsulta === anoSelecionado;

        if (correspondePesquisa && correspondeAno) {
            consulta.style.display = 'block';
            encontrados++;
        } else {
            consulta.style.display = 'none';
        }

    });

    // Mensagem quando nenhuma consulta for encontrada
    semResultados.hidden = encontrados > 0;
}

// Executa o filtro ao digitar
pesquisa.addEventListener('input', filtrarConsultas);

// Executa o filtro ao mudar o ano
ano.addEventListener('change', filtrarConsultas);

// Aplica o filtro inicial
filtrarConsultas();
