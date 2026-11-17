// Service worker do portal do paciente (app instalavel e funcionando sem internet).
// Fica na pasta paginas/ para cuidar de todas as telas abaixo dela.
// Ao mudar a lista de arquivos ou qualquer tela, aumente a VERSAO para o app baixar de novo.
//
// Estrategia:
//   - paginas e dados (html/json): tenta a internet primeiro; sem internet, usa a copia salva
//   - css, js, imagens e fontes: usa a copia salva e atualiza por tras (mais rapido em internet fraca)

var VERSAO = "fluxconnect-paciente-v1";

var ARQUIVOS = [
  "./manifest.webmanifest",
  "tela_login/fluxconnect_login_enxuto/index.html",
  "tela_login/fluxconnect_login_enxuto/style.css",
  "tela_login/fluxconnect_login_enxuto/script.js",
  "tela_login/fluxconnect_login_enxuto/LogoFluxconnect.png",
  "tela_login/fluxconnect_login_enxuto/logo-fluxconnect.png",
  "tela_criacao_conta/maur/index.html",
  "tela_criacao_conta/maur/style.css",
  "tela_criacao_conta/maur/script.js",
  "tela_criacao_conta/maur/Logo.png",
  "tela_esqueci_minha_senha/esqueci_senha.html",
  "tela_esqueci_minha_senha/nova_senha.html",
  "tela_esqueci_minha_senha/style.css",
  "tela_esqueci_minha_senha/script.js",
  "tela_principal_paciente/index.html",
  "tela_principal_paciente/style.css",
  "tela_principal_paciente/script.js",
  "Consultas/index.html",
  "Consultas/style.css",
  "Consultas/script.js",
  "Exames/index.html",
  "Exames/style.css",
  "Exames/script.js",
  "Historico/index.html",
  "Historico/style.css",
  "Historico/script.js",
  "MinhaConta/index.html",
  "MinhaConta/style.css",
  "MinhaConta/script.js",
  "agendar_consulta/index.html",
  "agendar_consulta/style.css",
  "agendar_consulta/script.js",
  "agendar_exame/index.html",
  "agendar_exame/style.css",
  "agendar_exame/script.js",
  "reagendar_consulta/index.html",
  "reagendar_consulta/style.css",
  "reagendar_consulta/script.js",
  "compartilhado/paciente_app.js",
  "compartilhado/paciente_app.css",
  "compartilhado/paciente_sessao.js",
  "compartilhado/notificacoes.js",
  "compartilhado/feriados.js",
  "../midias/icones/arrow-back-basic-svgrepo-com.svg",
  "../midias/icones/atenction.svg",
  "../midias/icones/calendar-card.svg",
  "../midias/icones/calendar-color.svg",
  "../midias/icones/calendar.svg",
  "../midias/icones/ceta-green.svg",
  "../midias/icones/close_small.svg",
  "../midias/icones/doctor.svg",
  "../midias/icones/exame-gren.svg",
  "../midias/icones/exeme.svg",
  "../midias/icones/historico.svg",
  "../midias/icones/home.svg",
  "../midias/icones/localition.svg",
  "../midias/icones/nota-color.svg",
  "../midias/icones/notification.svg",
  "../midias/icones/ocultar-senha.svg",
  "../midias/icones/paperplane-svgrepo-com.svg",
  "../midias/icones/perfil.svg",
  "../midias/icones/pulser-gree.svg",
  "../midias/icones/refresh.svg",
  "../midias/icones/salvar.svg",
  "../midias/icones/time.svg",
  "../midias/icones/varifiction.svg",
  "../midias/icones/ver-senha.svg",
  "../midias/logo/fluxConnect_2.svg",
  "../midias/logo/app-icone-192.png",
  "../midias/logo/app-icone-512.png"
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(VERSAO).then(function (cache) {
      // um arquivo que falhar nao impede a instalacao
      return Promise.all(ARQUIVOS.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.filter(function (n) { return n !== VERSAO; })
        .map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function guardar(pedido, resposta) {
  if (resposta && (resposta.ok || resposta.type === "opaque")) {
    var copia = resposta.clone();
    caches.open(VERSAO).then(function (cache) { cache.put(pedido, copia); });
  }
  return resposta;
}

function internetPrimeiro(pedido) {
  return fetch(pedido).then(function (resposta) {
    return guardar(pedido, resposta);
  }).catch(function () {
    return caches.match(pedido, { ignoreSearch: true }).then(function (salvo) {
      return salvo || caches.match(new URL("tela_principal_paciente/index.html", self.registration.scope).href);
    });
  });
}

function salvoPrimeiro(pedido) {
  return caches.match(pedido).then(function (salvo) {
    var daRede = fetch(pedido).then(function (resposta) {
      return guardar(pedido, resposta);
    }).catch(function () { return salvo; });
    return salvo || daRede;
  });
}

self.addEventListener("fetch", function (evento) {
  var pedido = evento.request;
  if (pedido.method !== "GET") return;
  var url = new URL(pedido.url);
  var mesmoSite = url.origin === self.location.origin;
  var fonte = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!mesmoSite && !fonte) return;

  var paginaOuDado = pedido.mode === "navigate" || /\.(html|json)$/.test(url.pathname);
  evento.respondWith(paginaOuDado && mesmoSite ? internetPrimeiro(pedido) : salvoPrimeiro(pedido));
});
