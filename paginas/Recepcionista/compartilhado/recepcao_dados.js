// Dados da area da recepcao (mock): medicos, pacientes, agendamentos e laudos.
// - A agenda de hoje e fixa (igual as telas de referencia); datas sao relativas a hoje.
// - As ultimas semanas sao geradas com uma semente fixa, para os relatorios terem dados
//   e o resultado ser sempre o mesmo.
// - Tudo que a recepcionista muda fica no localStorage ("fluxconnect_recepcao").

(function () {
  var CHAVE = "fluxconnect_recepcao";

  var medicos = [
    { id: "m1", nome: "Dr. Carlos Lima", especialidade: "Clínica Geral", cor: "#1d4f91" },
    { id: "m2", nome: "Dr. Rafael Mendes", especialidade: "Clínica Geral", cor: "#0f766e" },
    { id: "m3", nome: "Dra. Ana Paula", especialidade: "Cardiologia", cor: "#7c3aed" },
    { id: "m4", nome: "Dr. Caio Braga", especialidade: "Ortopedia", cor: "#047857" },
    { id: "m5", nome: "Dra. Juliana Faria", especialidade: "Psicologia", cor: "#b45309" }
  ];

  var especialidades = ["Clínica Geral", "Cardiologia", "Ortopedia", "Psicologia"];

  var horarios = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

  var convenios = ["Particular", "Unimed", "Unimed Ouro", "Bradesco Saúde", "SulAmérica", "Amil"];

  var pacientesBase = [
    { id: "00512", nome: "Maria Luiza Fernandes", cpf: "012.345.678-90", nascimento: "1984-03-12", genero: "Feminino", telefone: "(11) 99182-3344", email: "maria.fernandes@email.com", convenio: "Unimed Ouro", cor: "#1e5bb8" },
    { id: "00478", nome: "Carlos Eduardo Silva", cpf: "123.456.789-01", nascimento: "1968-07-22", genero: "Masculino", telefone: "(11) 91234-5678", email: "carlos.silva@email.com", convenio: "Bradesco Saúde", cor: "#7c3aed" },
    { id: "00390", nome: "Fernanda Costa", cpf: "234.567.890-12", nascimento: "1991-01-30", genero: "Feminino", telefone: "(11) 94455-6677", email: "fernanda.costa@email.com", convenio: "", cor: "#0f766e" },
    { id: "00367", nome: "João Paulo Ramos", cpf: "345.678.901-23", nascimento: "1965-11-04", genero: "Masculino", telefone: "(11) 93322-1100", email: "joao.ramos@email.com", convenio: "Unimed", cor: "#b45309" },
    { id: "00344", nome: "Beatriz Oliveira", cpf: "456.789.012-34", nascimento: "1999-05-18", genero: "Feminino", telefone: "(11) 97788-9900", email: "", convenio: "Particular", cor: "#be185d" },
    { id: "00321", nome: "Ricardo Souza", cpf: "567.890.123-45", nascimento: "1960-09-09", genero: "Masculino", telefone: "(11) 96655-4433", email: "ricardo.souza@email.com", convenio: "Bradesco Saúde", cor: "#047857" },
    { id: "00298", nome: "Patrícia Alves", cpf: "678.901.234-56", nascimento: "1987-02-14", genero: "Feminino", telefone: "(11) 95544-3322", email: "patricia.alves@email.com", convenio: "Amil", cor: "#1e3a8a" },
    { id: "00276", nome: "Marcos Teixeira", cpf: "789.012.345-67", nascimento: "1955-06-27", genero: "Masculino", telefone: "(11) 94433-2211", email: "marcos.teixeira@email.com", convenio: "Unimed", cor: "#6d28d9" },
    { id: "00124", nome: "Ana Lima", cpf: "123.456.789-10", nascimento: "1992-08-03", genero: "Feminino", telefone: "(11) 98877-6655", email: "ana.lima@email.com", convenio: "Unimed", cor: "#2563eb" },
    { id: "00089", nome: "Pedro Souza", cpf: "234.567.890-21", nascimento: "1974-04-19", genero: "Masculino", telefone: "(11) 97766-5544", email: "pedro.souza@email.com", convenio: "Bradesco Saúde", cor: "#16a34a" },
    { id: "00201", nome: "Maria Costa", cpf: "345.678.901-32", nascimento: "1985-12-01", genero: "Feminino", telefone: "(11) 96655-1234", email: "maria.costa@email.com", convenio: "SulAmérica", cor: "#9333ea" },
    { id: "00155", nome: "Carla Mendes", cpf: "456.789.012-43", nascimento: "1997-10-25", genero: "Feminino", telefone: "", email: "carla.mendes@email.com", convenio: "Particular", cor: "#64748b" },
    { id: "00088", nome: "Lucia Barros", cpf: "678.901.234-65", nascimento: "1979-03-08", genero: "Feminino", telefone: "(11) 95432-1098", email: "lucia.barros@email.com", convenio: "Amil", cor: "#0284c7" },
    { id: "00603", nome: "Vanessa Lima", cpf: "456.789.012-56", nascimento: "1994-07-11", genero: "Feminino", telefone: "(11) 91122-3344", email: "vanessa.lima@email.com", convenio: "SulAmérica", cor: "#0f766e" },
    { id: "00611", nome: "Lucas Ferreira", cpf: "901.234.567-89", nascimento: "2001-01-21", genero: "Masculino", telefone: "(11) 98811-2233", email: "", convenio: "Particular", cor: "#c2410c" }
  ];

  // agenda de hoje (dias = 0); [hora, paciente, medico, tipo, status, motivo]
  var agendaHoje = [
    ["08:00", "00512", "m2", "Retorno", "em-atendimento"],
    ["08:00", "00344", "m3", "Primeira vez", "aguardando"],
    ["08:00", "00124", "m1", "Consulta geral", "confirmada"],
    ["08:30", "00478", "m2", "Primeira vez", "aguardando"],
    ["08:30", "00276", "m4", "Primeira vez", "confirmada"],
    ["08:30", "00089", "m1", "Retorno", "aguardando"],
    ["09:00", "00390", "m2", "Retorno", "confirmada"],
    ["09:00", "00321", "m3", "Retorno", "pendente"],
    ["09:00", "00201", "m1", "Avaliação", "confirmada"],
    ["09:00", "00611", "m5", "Primeira vez", "confirmada"],
    ["09:30", "00603", "m4", "Retorno", "aguardando"],
    ["09:30", "00088", "m1", "Consulta geral", "pendente"],
    ["10:00", "00367", "m2", "Retorno", "falta"],
    ["10:00", "00155", "m3", "Consulta geral", "cancelada", "Imprevisto pessoal"],
    ["10:00", "00298", "m5", "Retorno", "confirmada"],
    ["10:30", "00088", "m2", "Retorno", "pendente"],
    ["11:00", "00276", "m3", "Retorno", "confirmada"],
    ["14:00", "00201", "m4", "Avaliação", "pendente"],
    ["14:30", "00124", "m5", "Primeira vez", "confirmada"],
    ["15:00", "00390", "m1", "Retorno", "confirmada"],
    ["15:30", "00344", "m2", "Retorno", "pendente"],
    ["16:00", "00478", "m3", "Retorno", "confirmada"]
  ];

  // proximos dias; [dias a frente, hora, paciente, medico, tipo, status]
  var agendaFutura = [
    [1, "08:00", "00390", "m5", "Primeira vez", "pendente"],
    [1, "08:30", "00478", "m4", "Retorno", "confirmada"],
    [1, "10:00", "00512", "m3", "Retorno", "pendente"],
    [2, "09:00", "00603", "m2", "Consulta geral", "confirmada"],
    [2, "10:00", "00367", "m3", "Retorno", "pendente"],
    [2, "14:00", "00298", "m1", "Retorno", "confirmada"],
    [3, "08:30", "00321", "m5", "Primeira vez", "confirmada"],
    [4, "11:00", "00611", "m1", "Consulta geral", "pendente"],
    [6, "09:30", "00155", "m4", "Avaliação", "confirmada"]
  ];

  var motivosCancelamento = ["Imprevisto pessoal", "Imprevisto pessoal", "Reagendamento", "Problema de transporte", "Imprevisto pessoal"];


  // ---------- datas ----------
  function hoje() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function somarDias(data, dias) {
    return new Date(data.getFullYear(), data.getMonth(), data.getDate() + dias);
  }

  function iso(data) {
    return data.getFullYear() + "-" + String(data.getMonth() + 1).padStart(2, "0") + "-" + String(data.getDate()).padStart(2, "0");
  }

  function lerISO(texto) {
    var p = texto.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  // gerador pseudoaleatorio com semente (o historico sai sempre igual)
  function sorteador(semente) {
    return function () {
      semente |= 0;
      semente = (semente + 0x6d2b79f5) | 0;
      var t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // historico das ultimas 6 semanas (dias uteis), igual em toda visita no mesmo dia
  function gerarHistorico() {
    var lista = [];
    var base = hoje();
    var aleatorio = sorteador(20260601);
    for (var dias = 1; dias <= 42; dias++) {
      var data = somarDias(base, -dias);
      var semana = data.getDay();
      if (semana === 0 || semana === 6) continue;
      medicos.forEach(function (m) {
        var livres = horarios.slice();
        var quantos = 3 + Math.floor(aleatorio() * 4);
        for (var i = 0; i < quantos; i++) {
          var hora = livres.splice(Math.floor(aleatorio() * livres.length), 1)[0];
          var paciente = pacientesBase[Math.floor(aleatorio() * pacientesBase.length)];
          var sorte = aleatorio();
          var status = sorte < 0.82 ? "realizada" : sorte < 0.9 ? "falta" : "cancelada";
          lista.push({
            id: "h-" + iso(data) + "-" + m.id + "-" + hora.replace(":", ""),
            data: iso(data),
            hora: hora,
            pacienteId: paciente.id,
            medicoId: m.id,
            tipo: aleatorio() < 0.4 ? "Primeira vez" : "Retorno",
            status: status,
            motivo: status === "cancelada" ? motivosCancelamento[Math.floor(aleatorio() * motivosCancelamento.length)] : "",
            encaixe: aleatorio() < 0.08
          });
        }
      });
    }
    return lista;
  }

  // ---------- cache ----------
  // Montar a lista de agendamentos (~800 itens) e ler o localStorage custa caro,
  // e algumas telas fazem centenas de consultas seguidas (o calendario pergunta
  // "horario ocupado?" para cada dia e horario). Por isso tudo e montado uma vez e
  // guardado aqui; qualquer gravacao (ou mudanca vinda de outra aba) limpa o cache.
  var cache = { dia: null, estado: null, fixos: null, pacientes: null, pacientesPorId: null, agendamentos: null, agPorId: null, ocupacao: null };

  function limparCache(tudo) {
    cache.pacientes = cache.pacientesPorId = cache.agendamentos = cache.agPorId = cache.ocupacao = null;
    if (tudo) cache.estado = cache.fixos = null;
  }

  // virou o dia com a tela aberta: a agenda fixa e o historico mudam
  function conferirDia() {
    var diaAtual = iso(hoje());
    if (cache.dia !== diaAtual) {
      cache.dia = diaAtual;
      limparCache(true);
    }
  }

  // outra aba gravou algo: descarta o que esta em memoria
  window.addEventListener("storage", function (ev) {
    if (ev.key === CHAVE || ev.key === "fluxconnect_prontuario_registros" || ev.key === null) limparCache(true);
  });

  function agendamentosFixos() {
    conferirDia();
    if (!cache.fixos) cache.fixos = montarFixos();
    return cache.fixos;
  }

  function montarFixos() {
    var base = hoje();
    var lista = agendaHoje.map(function (a, i) {
      return {
        id: "hoje-" + i, data: iso(base), hora: a[0], pacienteId: a[1], medicoId: a[2],
        tipo: a[3], status: a[4], motivo: a[5] || "", encaixe: false
      };
    });
    agendaFutura.forEach(function (a, i) {
      lista.push({
        id: "fut-" + i, data: iso(somarDias(base, a[0])), hora: a[1], pacienteId: a[2], medicoId: a[3],
        tipo: a[4], status: a[5], motivo: "", encaixe: false
      });
    });
    return lista.concat(gerarHistorico());
  }


  // ---------- persistencia ----------
  function ler() {
    conferirDia();
    if (!cache.estado) cache.estado = lerDoArmazenamento();
    return cache.estado;
  }

  function lerDoArmazenamento() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
      // a agenda fixa de "hoje" e "proximos dias" e recriada a cada dia,
      // entao as alteracoes feitas nela so valem no proprio dia
      if (salvo.dia !== iso(hoje()) && salvo.alteracoes) {
        Object.keys(salvo.alteracoes).forEach(function (id) {
          if (/^(hoje|fut)-/.test(id)) delete salvo.alteracoes[id];
        });
      }
      return {
        dia: iso(hoje()),
        alteracoes: salvo.alteracoes || {},
        novos: salvo.novos || [],
        pacientes: salvo.pacientes || {},
        excluidos: salvo.excluidos || [],
        laudos: salvo.laudos || {}
      };
    } catch (e) {
      return { dia: iso(hoje()), alteracoes: {}, novos: [], pacientes: {}, excluidos: [], laudos: {} };
    }
  }

  function gravar(estado) {
    limparCache(false);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
      cache.estado = estado;
      return true;
    } catch (e) {
      cache.estado = null; // nao salvou: na proxima leitura volta ao que esta no navegador
      return false;
    }
  }


  // ---------- pacientes ----------
  function montarPacientes() {
    var estado = ler();
    var lista = pacientesBase.map(function (p) {
      return Object.assign({}, p, estado.pacientes[p.id] || {});
    });
    Object.keys(estado.pacientes).forEach(function (id) {
      if (!pacientesBase.some(function (p) { return p.id === id; })) lista.push(Object.assign({}, estado.pacientes[id]));
    });
    // Os pacientes de exemplo nao tem data de cadastro. Para a tela de pacientes mostrar a
    // evolucao do cadastro, cada um ganha uma data de demonstracao: do mais antigo (menor
    // codigo) ao mais novo, espalhados pelos ultimos meses. Paciente cadastrado pela recepcao
    // usa a data real (criadoEm).
    var porCodigo = pacientesBase.map(function (p) { return p.id; }).sort();
    lista = lista.filter(function (p) { return estado.excluidos.indexOf(p.id) === -1; });
    cache.pacientesPorId = {};
    cache.pacientes = lista.map(function (p) {
      if (p.criadoEm) {
        p.cadastradoEm = iso(new Date(p.criadoEm));
      } else {
        var ordem = porCodigo.indexOf(p.id);
        p.cadastradoEm = iso(somarDias(hoje(), -(160 - ordem * 10)));
      }
      p.completo = !!(p.telefone && p.email && p.convenio && p.nascimento);
      cache.pacientesPorId[p.id] = p;
      return p;
    });
  }

  function listarPacientes() {
    ler();
    if (!cache.pacientes) montarPacientes();
    return cache.pacientes.slice();
  }

  function obterPaciente(id) {
    ler();
    if (!cache.pacientes) montarPacientes();
    return cache.pacientesPorId[id] || null;
  }

  function salvarPaciente(dados) {
    var estado = ler();
    var cores = ["#1e5bb8", "#7c3aed", "#0f766e", "#b45309", "#be185d", "#047857", "#1e3a8a", "#c2410c"];
    if (!dados.id) {
      var maior = listarPacientes().map(function (p) { return p.id; }).concat(estado.excluidos)
        .reduce(function (m, id) { return Math.max(m, parseInt(id, 10) || 0); }, 0);
      dados.id = String(maior + 1).padStart(5, "0");
      dados.cor = cores[maior % cores.length];
      dados.criadoEm = new Date().toISOString();
    }
    estado.pacientes[dados.id] = Object.assign({}, estado.pacientes[dados.id] || {}, dados);
    gravar(estado);
    return obterPaciente(dados.id);
  }

  // Excluir paciente: ele sai das listas e da busca. As consultas e os exames que ja
  // existem continuam no historico, mostrados como "Paciente removido".
  function excluirPaciente(id) {
    var estado = ler();
    if (estado.excluidos.indexOf(id) === -1) estado.excluidos.push(id);
    return gravar(estado);
  }

  // desfaz a exclusao (usado pelo "Desfazer" logo depois de excluir)
  function restaurarPaciente(id) {
    var estado = ler();
    estado.excluidos = estado.excluidos.filter(function (x) { return x !== id; });
    return gravar(estado);
  }

  function buscarPorCpf(cpf) {
    var numeros = cpf.replace(/\D/g, "");
    return listarPacientes().find(function (p) { return p.cpf.replace(/\D/g, "") === numeros; }) || null;
  }


  // ---------- agendamentos ----------
  var medicosPorId = {};
  medicos.forEach(function (m) { medicosPorId[m.id] = m; });

  // monta a lista uma vez, junto com os indices por id e por horario ocupado
  function montarAgendamentos() {
    var estado = ler();
    var desconhecido = { nome: "Paciente removido", cpf: "", cor: "#64748b" };
    cache.agPorId = {};
    cache.ocupacao = {};
    cache.agendamentos = agendamentosFixos().concat(estado.novos).map(function (a) {
      var final = Object.assign({}, a, estado.alteracoes[a.id] || {});
      final.paciente = obterPaciente(final.pacienteId) || desconhecido;
      final.medico = medicosPorId[final.medicoId];
      cache.agPorId[final.id] = final;
      if (final.status !== "cancelada") {
        var chave = final.medicoId + "|" + final.data + "|" + final.hora;
        (cache.ocupacao[chave] = cache.ocupacao[chave] || []).push(final.id);
      }
      return final;
    }).sort(function (a, b) {
      return a.data < b.data ? -1 : a.data > b.data ? 1 : a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : 0;
    });
  }

  function garantirAgendamentos() {
    ler();
    if (!cache.agendamentos) montarAgendamentos();
  }

  // devolve uma copia da lista (quem chama pode ordenar/filtrar a vontade)
  function listarAgendamentos() {
    garantirAgendamentos();
    return cache.agendamentos.slice();
  }

  function obterAgendamento(id) {
    garantirAgendamentos();
    return cache.agPorId[id] || null;
  }

  function atualizarAgendamento(id, campos) {
    var estado = ler();
    var novo = estado.novos.find(function (a) { return a.id === id; });
    if (novo) Object.assign(novo, campos);
    else estado.alteracoes[id] = Object.assign({}, estado.alteracoes[id] || {}, campos);
    gravar(estado);
  }

  function criarAgendamento(dados) {
    var estado = ler();
    var agendamento = Object.assign({ id: "rec-" + Date.now(), motivo: "", encaixe: false, status: "confirmada" }, dados);
    estado.novos.push(agendamento);
    gravar(estado);
    return agendamento;
  }

  // ja existe consulta ativa nesse medico/dia/horario?
  function horarioOcupado(medicoId, data, hora, ignorarId) {
    garantirAgendamentos();
    var ids = cache.ocupacao[medicoId + "|" + data + "|" + hora];
    return !!ids && ids.some(function (id) { return id !== ignorarId; });
  }


  // ---------- laudos (gestao de exames) ----------
  var laudosBase = [
    { id: "lab-1", pacienteId: "00512", exame: "Hemograma completo", medico: "Dr. Rafael Mendes", dias: 1 },
    { id: "lab-2", pacienteId: "00478", exame: "Raio-X de tórax", medico: "Dra. Ana Paula", dias: 1, disponivel: true },
    { id: "lab-3", pacienteId: "00390", exame: "Glicemia em jejum", medico: "Dr. Rafael Mendes", dias: 2 },
    { id: "lab-4", pacienteId: "00367", exame: "TSH / T4 livre", medico: "Dra. Ana Paula", dias: 2, disponivel: true },
    { id: "lab-5", pacienteId: "00344", exame: "Eletrocardiograma", medico: "Dr. Rafael Mendes", dias: 3 },
    { id: "lab-6", pacienteId: "00321", exame: "Colesterol total e frações", medico: "Dr. Rafael Mendes", dias: 3 },
    { id: "lab-7", pacienteId: "00298", exame: "Urina tipo 1", medico: "Dra. Ana Paula", dias: 4, disponivel: true },
    { id: "lab-8", pacienteId: "00276", exame: "Creatinina e ureia", medico: "Dr. Rafael Mendes", dias: 4 }
  ];

  // pedidos feitos pelos medicos na tela de consulta tambem chegam aqui
  function pedidosDosMedicos() {
    var lista = [];
    try {
      var registros = JSON.parse(localStorage.getItem("fluxconnect_prontuario_registros") || "{}");
      Object.keys(registros).forEach(function (pacienteId) {
        (registros[pacienteId].pedidos || []).forEach(function (pedido, i) {
          pedido.exames.forEach(function (exame, j) {
            lista.push({
              id: "ped-" + pacienteId + "-" + new Date(pedido.data).getTime() + "-" + j,
              pacienteId: pacienteId, exame: exame, medico: pedido.medico,
              data: iso(new Date(pedido.data)), indicacao: pedido.indicacao
            });
          });
        });
      });
    } catch (e) {}
    return lista;
  }

  function listarLaudos() {
    var estado = ler();
    var base = hoje();
    var lista = laudosBase.map(function (l) {
      return {
        id: l.id, pacienteId: l.pacienteId, exame: l.exame, medico: l.medico,
        data: iso(somarDias(base, -l.dias)),
        arquivo: l.disponivel ? { nome: "laudo-" + l.id + ".pdf", tipo: "application/pdf", exemplo: true } : null
      };
    }).concat(pedidosDosMedicos());

    return lista.map(function (l) {
      var salvo = estado.laudos[l.id];
      if (salvo !== undefined) l.arquivo = salvo; // null = removido
      l.paciente = obterPaciente(l.pacienteId) || { nome: "Paciente removido", cpf: "", cor: "#64748b" };
      l.status = l.arquivo ? "disponivel" : "pendente";
      return l;
    });
  }

  function salvarLaudo(id, arquivo) {
    var estado = ler();
    estado.laudos[id] = arquivo;
    if (gravar(estado)) return true;
    // arquivo grande demais para o navegador: guarda so o nome
    estado.laudos[id] = Object.assign({}, arquivo, { conteudo: null });
    return gravar(estado) ? "sem-conteudo" : false;
  }


  // ---------- auxiliares de tela ----------
  var rotulosStatus = {
    "pendente": "Pendente",
    "confirmada": "Confirmada",
    "aguardando": "Aguardando",
    "em-atendimento": "Em atendimento",
    "realizada": "Realizada",
    "cancelada": "Cancelada",
    "falta": "Falta"
  };

  function iniciais(nome) {
    var partes = nome.replace(/^(dra?\.?)\s+/i, "").trim().split(/\s+/);
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
  }

  function formatarData(texto) {
    var d = lerISO(texto);
    return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  }

  function escapar(texto) {
    return String(texto == null ? "" : texto).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // ---------- alertas do dia (vao para o sininho de notificacoes) ----------
  // Calculados na hora a partir da agenda: consultas canceladas, faltas e o
  // proximo horario vago para encaixe. O id inclui a data para o "lido" valer so no dia.
  var PAGINA_NOVO = "../novo_agendamento_recepcionista/index.html";

  function alertasDoDia() {
    var hojeISO = iso(hoje());
    var agora = new Date();
    var horaAgora = String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0");
    var todos = listarAgendamentos();
    var deHoje = todos.filter(function (a) { return a.data === hojeISO; });
    var lista = [];

    deHoje.filter(function (a) { return a.status === "cancelada"; }).forEach(function (a) {
      lista.push({
        id: "alerta-" + hojeISO + "-cancelada-" + a.id,
        tipo: "alerta",
        titulo: "Horário liberado",
        texto: "Consulta de " + a.paciente.nome + " cancelada — vaga das " + a.hora + " com " + a.medico.nome + " está disponível" +
          (a.motivo ? " (" + a.motivo + ")." : "."),
        quando: "Hoje · " + a.hora,
        acao: "Agendar neste horário",
        link: PAGINA_NOVO + "?medico=" + a.medicoId + "&data=" + a.data + "&hora=" + a.hora
      });
    });

    deHoje.filter(function (a) { return a.status === "falta"; }).forEach(function (a) {
      var faltas = todos.filter(function (x) { return x.pacienteId === a.pacienteId && x.status === "falta"; }).length;
      lista.push({
        id: "alerta-" + hojeISO + "-falta-" + a.id,
        tipo: "falta",
        titulo: "Paciente faltoso",
        texto: a.paciente.nome + " não compareceu às " + a.hora + " com " + a.medico.nome + " · " + faltas + "ª falta sem aviso.",
        quando: "Hoje · " + a.hora,
        urgente: faltas >= 3,
        acao: "Remarcar consulta",
        link: PAGINA_NOVO + "?reagendar=" + encodeURIComponent(a.id)
      });
    });

    // primeiro horario livre a partir de agora, em qualquer medico
    var encaixe = null;
    horarios.some(function (h) {
      if (h < horaAgora) return false;
      var medico = medicos.find(function (m) { return !horarioOcupado(m.id, hojeISO, h); });
      if (medico) encaixe = { hora: h, medico: medico };
      return !!medico;
    });
    if (encaixe) {
      lista.push({
        id: "alerta-" + hojeISO + "-vago-" + encaixe.medico.id + "-" + encaixe.hora,
        tipo: "vago",
        titulo: "Horário vago",
        texto: encaixe.hora + " · " + encaixe.medico.nome + " — disponível para encaixe.",
        quando: "Hoje · " + encaixe.hora,
        acao: "Fazer encaixe",
        link: PAGINA_NOVO + "?medico=" + encaixe.medico.id + "&data=" + hojeISO + "&hora=" + encaixe.hora + "&encaixe=1"
      });
    }
    return lista;
  }

  // o sininho (notificacoes.js) chama isto toda vez que abre
  window.FluxNotificacoesDinamicas = window.FluxNotificacoesDinamicas || {};
  window.FluxNotificacoesDinamicas.recepcao = alertasDoDia;

  window.Recepcao = {
    medicos: function () { return medicos.slice(); },
    medico: function (id) { return medicosPorId[id] || null; },
    especialidades: function () { return especialidades.slice(); },
    horarios: function () { return horarios.slice(); },
    convenios: function () { return convenios.slice(); },
    pacientes: listarPacientes,
    paciente: obterPaciente,
    salvarPaciente: salvarPaciente,
    excluirPaciente: excluirPaciente,
    restaurarPaciente: restaurarPaciente,
    buscarPorCpf: buscarPorCpf,
    agendamentos: listarAgendamentos,
    agendamento: obterAgendamento,
    atualizarAgendamento: atualizarAgendamento,
    criarAgendamento: criarAgendamento,
    horarioOcupado: horarioOcupado,
    laudos: listarLaudos,
    salvarLaudo: salvarLaudo,
    alertas: alertasDoDia,
    rotulosStatus: rotulosStatus,
    hoje: hoje,
    somarDias: somarDias,
    iso: iso,
    lerISO: lerISO,
    iniciais: iniciais,
    formatarData: formatarData,
    escapar: escapar
  };
})();
