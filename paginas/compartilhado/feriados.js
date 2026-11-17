// Feriados usados pelos calendarios de agendamento (consulta e exame).
// Calcula qualquer ano, entao o calendario nunca fica desatualizado.
// Todas as unidades da rede ficam em Sao Paulo, por isso entram os feriados de SP.

// domingo de Pascoa (algoritmo de Meeus/Jones/Butcher)
function calcularPascoa(ano) {
  var a = ano % 19;
  var b = Math.floor(ano / 100);
  var c = ano % 100;
  var d = Math.floor(b / 4);
  var e = b % 4;
  var f = Math.floor((b + 8) / 25);
  var g = Math.floor((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4);
  var k = c % 4;
  var l = (32 + 2 * e + 2 * i - h - k) % 7;
  var m = Math.floor((a + 11 * h + 22 * l) / 451);
  var mes = Math.floor((h + l - 7 * m + 114) / 31);
  var dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function chaveData(data) {
  return data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate();
}

var cacheFeriados = {};

// retorna { "2026-12-25": { nome, tipo }, ... } para o ano
function feriadosDoAno(ano) {
  if (cacheFeriados[ano]) return cacheFeriados[ano];

  var lista = {};
  function adicionar(data, nome, tipo) {
    lista[chaveData(data)] = { nome: nome, tipo: tipo };
  }

  // nacionais fixos
  adicionar(new Date(ano, 0, 1), "Confraternização Universal", "nacional");
  adicionar(new Date(ano, 3, 21), "Tiradentes", "nacional");
  adicionar(new Date(ano, 4, 1), "Dia do Trabalho", "nacional");
  adicionar(new Date(ano, 8, 7), "Independência do Brasil", "nacional");
  adicionar(new Date(ano, 9, 12), "Nossa Senhora Aparecida", "nacional");
  adicionar(new Date(ano, 10, 2), "Finados", "nacional");
  adicionar(new Date(ano, 10, 15), "Proclamação da República", "nacional");
  if (ano >= 2024) {
    adicionar(new Date(ano, 10, 20), "Dia da Consciência Negra", "nacional");
  }
  adicionar(new Date(ano, 11, 25), "Natal", "nacional");

  // datas que dependem da Pascoa
  var pascoa = calcularPascoa(ano);
  function aPartirDaPascoa(dias) {
    return new Date(pascoa.getFullYear(), pascoa.getMonth(), pascoa.getDate() + dias);
  }
  adicionar(aPartirDaPascoa(-48), "Carnaval", "facultativo");
  adicionar(aPartirDaPascoa(-47), "Carnaval", "facultativo");
  adicionar(aPartirDaPascoa(-2), "Sexta-feira Santa", "nacional");
  adicionar(aPartirDaPascoa(60), "Corpus Christi", "facultativo");

  // Sao Paulo
  adicionar(new Date(ano, 0, 25), "Aniversário de São Paulo", "municipal");
  adicionar(new Date(ano, 6, 9), "Revolução Constitucionalista", "estadual");

  cacheFeriados[ano] = lista;
  return lista;
}

// retorna o feriado da data ou null
function obterFeriado(data) {
  return feriadosDoAno(data.getFullYear())[chaveData(data)] || null;
}

// texto curto para tooltip e avisos
function descreverFeriado(feriado) {
  var tipos = {
    nacional: "Feriado nacional",
    estadual: "Feriado estadual (SP)",
    municipal: "Feriado municipal (São Paulo)",
    facultativo: "Ponto facultativo"
  };
  return feriado.nome + " · " + tipos[feriado.tipo];
}
