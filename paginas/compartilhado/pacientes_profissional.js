// Base de pacientes da area do profissional (mock), usada pela agenda, prontuarios,
// atendimento e pelo modal de historico.
// Datas usam "dias atras" para o prontuario sempre parecer atual.
// Atendimentos finalizados e receitas emitidas ficam no localStorage.

(function () {
  var CHAVE_REGISTROS = "fluxconnect_prontuario_registros";

  var pacientes = [
    // ---- pacientes da agenda de hoje ----
    {
      id: "00124", sexo: "Feminino", nome: "Ana Lima", cpf: "123.456.789-10", idade: 34, convenio: "Unimed", cor: "#2563eb",
      alergias: ["Penicilina"], condicoes: [],
      timeline: [{ dias: 60, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "R51", titulo: "Cefaleia",
        anotacoes: "Dor de cabeça frequente há 2 meses, sem sinais de alarme. Solicitado hemograma e orientada hidratação." }],
      prescricoes: [], exames: [{ dias: 55, nome: "Hemograma Completo", resultado: "Dentro da normalidade" }]
    },
    {
      id: "00089", sexo: "Masculino", nome: "Pedro Souza", cpf: "234.567.890-21", idade: 52, convenio: "Bradesco Saúde", cor: "#16a34a",
      alergias: [], condicoes: ["Hipertensão"],
      timeline: [
        { dias: 30, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "I10", titulo: "Hipertensão essencial (primária)",
          anotacoes: "PA 150x90 mmHg em duas medidas. Iniciada losartana 50 mg e orientada dieta com pouco sal." },
        { dias: 200, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "Z00.0", titulo: "Exame médico geral",
          anotacoes: "Check-up anual. Exames de rotina sem alterações." }
      ],
      prescricoes: [{ dias: 30, medico: "Dr. Carlos Lima", itens: [{ nome: "Losartana 50 mg", via: "Oral", quantidade: "30 comprimidos", instrucoes: "1 comprimido pela manhã, uso contínuo." }] }],
      exames: []
    },
    {
      id: "00201", sexo: "Feminino", nome: "Maria Costa", cpf: "345.678.901-32", idade: 41, convenio: "SulAmérica", cor: "#7c3aed",
      alergias: ["Dipirona"], condicoes: [],
      timeline: [{ dias: 90, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "M54.5", titulo: "Dor lombar baixa",
        anotacoes: "Dor lombar mecânica após esforço. Encaminhada para fisioterapia." }],
      prescricoes: [], exames: []
    },
    {
      id: "00155", sexo: "Feminino", nome: "Carla Mendes", cpf: "456.789.012-43", idade: 29, convenio: "Particular", cor: "#64748b",
      alergias: [], condicoes: [], timeline: [], prescricoes: [], exames: []
    },
    {
      id: "00402", sexo: "Masculino", nome: "Ricardo Dias", cpf: "567.890.123-54", idade: 63, convenio: "Unimed", cor: "#ea580c",
      alergias: [], condicoes: ["Diabetes T2"],
      timeline: [{ dias: 70, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "R73.9", titulo: "Hiperglicemia",
        anotacoes: "Glicemia de jejum 128 mg/dL. Solicitada hemoglobina glicada." }],
      prescricoes: [], exames: [{ dias: 65, nome: "Hemoglobina Glicada", resultado: "7,1% (acima da referência)" }]
    },
    {
      id: "00088", sexo: "Feminino", nome: "Lucia Barros", cpf: "678.901.234-65", idade: 47, convenio: "Amil", cor: "#0284c7",
      alergias: ["Látex"], condicoes: ["Rinite alérgica"],
      timeline: [{ dias: 120, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "J30.4", titulo: "Rinite alérgica",
        anotacoes: "Coriza e espirros pela manhã. Prescrito anti-histamínico." }],
      prescricoes: [{ dias: 120, medico: "Dr. Carlos Lima", itens: [{ nome: "Loratadina 10 mg", via: "Oral", quantidade: "12 comprimidos", instrucoes: "1 comprimido ao dia por 10 dias." }] }],
      exames: []
    },
    {
      id: "00317", sexo: "Masculino", nome: "João Ferreira", cpf: "789.012.345-76", idade: 38, convenio: "Particular", cor: "#6d28d9",
      alergias: [], condicoes: [], timeline: [], prescricoes: [], exames: []
    },
    {
      id: "00451", sexo: "Feminino", nome: "Fernanda Alves", cpf: "890.123.456-87", idade: 56, convenio: "Bradesco Saúde", cor: "#15803d",
      alergias: [], condicoes: ["Dislipidemia"],
      timeline: [{ dias: 40, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "E78.5", titulo: "Hiperlipidemia",
        anotacoes: "LDL 162 mg/dL. Orientada dieta e atividade física; retorno com novos exames." }],
      prescricoes: [], exames: []
    },

    // ---- outros pacientes da clinica (tela de prontuarios) ----
    {
      id: "00512", sexo: "Feminino", nome: "Maria Luiza Fernandes", cpf: "012.345.678-90", idade: 42, convenio: "Unimed", cor: "#b91c1c",
      alergias: ["Penicilina", "AAS"], condicoes: ["Hipertensão Arterial", "Diabetes Tipo 2"],
      timeline: [
        { dias: 0, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "J06.9", titulo: "Infecção aguda das vias aéreas superiores",
          anotacoes: "Odinofagia e febre baixa há 3 dias. Orofaringe hiperemiada, sem placas. Conduta sintomática; evitar AAS (alergia)." },
        { dias: 240, medico: "Dra. Ana Paula", especialidade: "Cardiologia", cid: "I10", titulo: "Hipertensão essencial (primária)",
          anotacoes: "PA controlada com losartana. Mantida medicação e solicitado ecocardiograma de controle." },
        { dias: 600, medico: "Dr. Rafael Mendes", especialidade: "Endocrinologia", cid: "E11.9", titulo: "Diabetes mellitus tipo 2 sem complicações",
          anotacoes: "HbA1c 7,4%. Ajustada metformina e reforçada orientação alimentar." }
      ],
      prescricoes: [
        { dias: 240, medico: "Dra. Ana Paula", itens: [{ nome: "Losartana 50 mg", via: "Oral", quantidade: "30 comprimidos", instrucoes: "1 comprimido ao dia, uso contínuo." }] },
        { dias: 600, medico: "Dr. Rafael Mendes", itens: [{ nome: "Metformina 850 mg", via: "Oral", quantidade: "60 comprimidos", instrucoes: "1 comprimido após almoço e jantar." }] }
      ],
      exames: [{ dias: 1, nome: "Hemograma Completo", resultado: "Dentro da normalidade" }]
    },
    {
      id: "00478", sexo: "Masculino", nome: "Carlos Eduardo Silva", cpf: "123.456.789-01", idade: 58, convenio: "SulAmérica", cor: "#1d4ed8",
      alergias: ["Dipirona"], condicoes: ["Cardiopatia", "Dislipidemia"],
      timeline: [{ dias: 0, medico: "Dr. Carlos Lima", especialidade: "Cardiologia", cid: "I25.1", titulo: "Doença aterosclerótica do coração",
        anotacoes: "Dor torácica aos esforços. Solicitado eletrocardiograma e teste ergométrico." }],
      prescricoes: [], exames: [{ dias: 1, nome: "Eletrocardiograma", resultado: "Alteração discreta de repolarização" }]
    },
    {
      id: "00390", sexo: "Feminino", nome: "Fernanda Costa", cpf: "234.567.890-12", idade: 35, convenio: "Amil", cor: "#7c3aed",
      alergias: [], condicoes: ["Hipotireoidismo"],
      timeline: [{ dias: 1, medico: "Dr. Carlos Lima", especialidade: "Endocrinologia", cid: "E03.9", titulo: "Hipotireoidismo não especificado",
        anotacoes: "Cansaço e ganho de peso. TSH elevado; discutido início de levotiroxina." }],
      prescricoes: [], exames: [{ dias: 2, nome: "TSH / T4 Livre", resultado: "TSH 6,2 µUI/mL (acima da referência)" }]
    },
    {
      id: "00367", sexo: "Masculino", nome: "João Paulo Ramos", cpf: "345.678.901-23", idade: 61, convenio: "Unimed", cor: "#d97706",
      alergias: ["Sulfa"], condicoes: ["Diabetes T2", "Obesidade"],
      timeline: [{ dias: 1, medico: "Dr. Carlos Lima", especialidade: "Clínica Geral", cid: "E11.9", titulo: "Diabetes mellitus tipo 2 sem complicações",
        anotacoes: "Controle glicêmico irregular. Reforçada dieta e solicitados exames." }],
      prescricoes: [], exames: [{ dias: 2, nome: "Raio-X de Tórax", resultado: "Sem alterações significativas" }]
    },
    {
      id: "00344", sexo: "Feminino", nome: "Beatriz Oliveira", cpf: "456.789.012-34", idade: 27, convenio: "Particular", cor: "#0369a1",
      alergias: ["Amoxicilina"], condicoes: ["Asma"],
      timeline: [{ dias: 2, medico: "Dr. Carlos Lima", especialidade: "Pneumologia", cid: "J45.0", titulo: "Asma predominantemente alérgica",
        anotacoes: "Crises noturnas na última semana. Ajustado corticoide inalatório." }],
      prescricoes: [], exames: [{ dias: 3, nome: "Colesterol Total e Frações", resultado: "LDL levemente elevado" }]
    },
    {
      id: "00321", sexo: "Masculino", nome: "Ricardo Souza", cpf: "567.890.123-45", idade: 66, convenio: "Bradesco Saúde", cor: "#047857",
      alergias: [], condicoes: ["DPOC", "Tabagismo"],
      timeline: [{ dias: 2, medico: "Dr. Carlos Lima", especialidade: "Pneumologia", cid: "J44.1", titulo: "DPOC com exacerbação aguda",
        anotacoes: "Piora da tosse e dispneia. Iniciado broncodilatador e orientada cessação do tabagismo." }],
      prescricoes: [], exames: [{ dias: 3, nome: "Urina Tipo 1 + Urocultura", resultado: "Negativa" }]
    },
    {
      id: "00298", sexo: "Feminino", nome: "Patrícia Alves", cpf: "678.901.234-56", idade: 39, convenio: "Amil", cor: "#1e3a8a",
      alergias: [], condicoes: ["Enxaqueca"],
      timeline: [{ dias: 3, medico: "Dr. Carlos Lima", especialidade: "Neurologia", cid: "G43.9", titulo: "Enxaqueca não especificada",
        anotacoes: "Crises 2x por semana. Orientado diário da dor e iniciada profilaxia." }],
      prescricoes: [], exames: [{ dias: 4, nome: "Glicemia em Jejum + HbA1c", resultado: "Compatível com pré-diabetes" }]
    },
    {
      id: "00276", sexo: "Masculino", nome: "Marcos Teixeira", cpf: "789.012.345-67", idade: 71, convenio: "Unimed", cor: "#6d28d9",
      alergias: ["Contraste iodado"], condicoes: ["Insuficiência Renal"],
      timeline: [{ dias: 3, medico: "Dr. Carlos Lima", especialidade: "Nefrologia", cid: "N18.3", titulo: "Doença renal crônica estágio 3",
        anotacoes: "Função renal estável. Evitar contraste iodado. Retorno em 3 meses." }],
      prescricoes: [], exames: [{ dias: 5, nome: "Creatinina e Ureia", resultado: "Função renal preservada" }]
    }
  ];


  // ---------- datas ----------
  function dataPorDias(dias) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - dias);
    return d;
  }

  function diasDesde(data) {
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return Math.round((hoje - d) / 86400000);
  }

  function formatarData(data) {
    var d = new Date(data);
    return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
  }

  function textoRelativo(dias) {
    if (dias <= 0) return "hoje";
    if (dias === 1) return "ontem";
    return "há " + dias + " dias";
  }


  // ---------- registros salvos (atendimentos e receitas) ----------
  function lerRegistros() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_REGISTROS) || "{}");
    } catch (e) {
      return {};
    }
  }

  function gravarRegistros(registros) {
    try {
      localStorage.setItem(CHAVE_REGISTROS, JSON.stringify(registros));
    } catch (e) {}
  }

  function registrosDo(id) {
    var todos = lerRegistros();
    var r = todos[id] || {};
    return { atendimentos: r.atendimentos || [], receitas: r.receitas || [], pedidos: r.pedidos || [] };
  }

  function adicionarRegistro(id, tipo, registro) {
    var todos = lerRegistros();
    todos[id] = todos[id] || {};
    todos[id][tipo] = todos[id][tipo] || [];
    todos[id][tipo].unshift(registro);
    gravarRegistros(todos);
  }

  // junta os dados fixos com o que foi salvo; datas viram objetos Date
  function montar(base) {
    var salvos = registrosDo(base.id);
    var p = Object.assign({}, base);

    p.timeline = salvos.atendimentos.map(function (a) {
      return Object.assign({}, a, { data: new Date(a.data), novo: true });
    }).concat(base.timeline.map(function (t) {
      return Object.assign({}, t, { data: dataPorDias(t.dias) });
    }));

    p.prescricoes = salvos.receitas.map(function (r) {
      return Object.assign({}, r, { data: new Date(r.data), novo: true });
    }).concat(base.prescricoes.map(function (r) {
      return Object.assign({}, r, { data: dataPorDias(r.dias) });
    }));

    // pedidos feitos no portal aparecem como "aguardando resultado"
    var pedidos = [];
    salvos.pedidos.forEach(function (pedido) {
      pedido.exames.forEach(function (nome) {
        pedidos.push({ data: new Date(pedido.data), nome: nome, resultado: "Pedido gerado · aguardando resultado", indicacao: pedido.indicacao, pedido: true });
      });
    });
    p.exames = pedidos.concat(base.exames.map(function (e) {
      return Object.assign({}, e, { data: dataPorDias(e.dias) });
    }));

    p.timeline.sort(function (a, b) { return b.data - a.data; });
    p.prescricoes.sort(function (a, b) { return b.data - a.data; });

    var ultima = p.timeline[0];
    p.ultimaVisita = ultima ? ultima.data : null;
    p.ultimaCid = ultima ? ultima.cid : "";
    p.ultimaEspecialidade = ultima ? ultima.especialidade : "";
    p.temAlertas = p.alergias.length > 0;
    return p;
  }

  function iniciais(nome) {
    var partes = nome.trim().split(/\s+/);
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  window.PacientesProfissional = {
    todos: function () { return pacientes.map(montar); },
    obter: function (id) {
      var base = pacientes.find(function (p) { return p.id === id; });
      return base ? montar(base) : null;
    },
    adicionarAtendimento: function (id, atendimento) { adicionarRegistro(id, "atendimentos", atendimento); },
    adicionarReceita: function (id, receita) { adicionarRegistro(id, "receitas", receita); },
    adicionarPedidoExame: function (id, pedido) { adicionarRegistro(id, "pedidos", pedido); },
    iniciais: iniciais,
    formatarData: formatarData,
    diasDesde: diasDesde,
    textoRelativo: textoRelativo
  };
})();
