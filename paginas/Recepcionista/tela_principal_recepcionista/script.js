// Painel da recepcao: resumo do dia, agenda de hoje e proximos agendamentos.
// Os alertas do dia aparecem no sininho de notificacoes (todas as telas da recepcao).

// nome generico: a recepcao pode ter varias recepcionistas usando o mesmo acesso
var NOME_RECEPCIONISTA = "Recepcionista";
var PAGINA_NOVO = "../novo_agendamento_recepcionista/index.html";

var diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

var e = Recepcao.escapar;

function horaAtual() {
  var d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function badge(status) {
  return '<span class="badge badge-' + status + '">' + Recepcao.rotulosStatus[status] + "</span>";
}

function montarTopo() {
  var h = new Date().getHours();
  var saudacao = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  var d = Recepcao.hoje();
  document.getElementById("tituloPagina").textContent = saudacao + ", " + NOME_RECEPCIONISTA;
  document.getElementById("subtituloPagina").textContent =
    diasSemana[d.getDay()] + ", " + String(d.getDate()).padStart(2, "0") + " de " + meses[d.getMonth()] + " de " + d.getFullYear();
}

function renderizar() {
  var hojeISO = Recepcao.iso(Recepcao.hoje());
  var todos = Recepcao.agendamentos();
  var deHoje = todos.filter(function (a) { return a.data === hojeISO; });

  function contar(status) {
    return deHoje.filter(function (a) { return a.status === status; }).length;
  }

  // cards de resumo
  document.getElementById("numTotal").textContent = deHoje.filter(function (a) { return a.status !== "cancelada"; }).length;
  document.getElementById("numConfirmadas").textContent = contar("confirmada");
  document.getElementById("numPendentes").textContent = contar("pendente");
  document.getElementById("numAguardando").textContent = contar("aguardando");

  // agenda de hoje agrupada por horario (de 30 em 30 minutos):
  // cada horario aparece uma vez so; as consultas daquele horario ficam embaixo dele
  // (rowspan). Horario sem consulta vira uma linha "livre" com atalho para agendar.
  var html = "";
  Recepcao.horarios().forEach(function (h) {
    if (h === "14:00") {
      html += '<tr class="linha-intervalo"><td colspan="5">Intervalo · 12:00 às 14:00</td></tr>';
    }
    var doHorario = deHoje.filter(function (a) { return a.hora === h; });
    if (!doHorario.length) {
      var link = PAGINA_NOVO + "?data=" + hojeISO + "&hora=" + h;
      html += `<tr class="grupo-horario linha-vaga">
        <th scope="row" class="hora-celula">${h}</th>
        <td colspan="4"><a class="link-livre" href="${link}">Horário livre — agendar consulta</a></td>
      </tr>`;
      return;
    }
    doHorario.forEach(function (a, i) {
      html += `<tr class="${i === 0 ? "grupo-horario" : "mesmo-horario"}">
        ${i === 0 ? `<th scope="rowgroup" rowspan="${doHorario.length}" class="hora-celula">${h}</th>` : ""}
        <td><p class="texto-forte">${e(a.paciente.nome)}</p><p class="texto-suave">#${e(a.pacienteId)}</p></td>
        <td class="celula-profissional">${e(a.medico.nome)} <span class="prof-esp">— ${e(a.medico.especialidade)}</span></td>
        <td>${e(a.tipo)}${a.encaixe ? " · encaixe" : ""}</td>
        <td>${badge(a.status)}${a.motivo ? '<p class="texto-suave">' + e(a.motivo) + "</p>" : ""}</td>
      </tr>`;
    });
  });
  document.getElementById("corpoAgenda").innerHTML = html;

  // proximos agendamentos (a partir de agora)
  var agora = horaAtual();
  var proximos = todos.filter(function (a) {
    var ativo = a.status === "confirmada" || a.status === "pendente";
    return ativo && (a.data > hojeISO || (a.data === hojeISO && a.hora >= agora));
  }).slice(0, 6);

  var amanhaISO = Recepcao.iso(Recepcao.somarDias(Recepcao.hoje(), 1));
  document.getElementById("listaProximos").innerHTML = proximos.map(function (a) {
    var dia = a.data === hojeISO ? "" : a.data === amanhaISO ? "Amanhã" : Recepcao.formatarData(a.data).slice(0, 5);
    return `<li>
      <span class="prox-hora">${a.hora}${dia ? `<span class="prox-dia">${dia}</span>` : ""}</span>
      <div><p class="prox-nome">${e(a.paciente.nome)}</p><p class="prox-medico">${e(a.medico.nome)} — ${e(a.medico.especialidade)}</p></div>
      ${badge(a.status)}
    </li>`;
  }).join("") || '<li class="lista-vazia">Nenhum agendamento futuro.</li>';

  // os alertas do dia (cancelamentos, faltas, horario vago) ficam no sininho:
  // ver Recepcao.alertas() em compartilhado/recepcao_dados.js
}

document.addEventListener("DOMContentLoaded", function () {
  montarTopo();
  renderizar();

});
