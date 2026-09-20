// 🔥 IMPORTS FIREBASE
import { db, auth } from "./firebase.js";

import {
  ref,
  push,
  onValue,
  remove,
  update,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ELEMENTOS
const msgLogin = document.getElementById("msgLogin");
const msgAdmin = document.getElementById("msgAdmin");
const statusHorario = document.getElementById("statusHorario");
const dadosCliente = document.getElementById("dadosCliente");
const filtroHorarios = document.getElementById("filtroHorarios");
const filtroBarbeiroLista = document.getElementById("filtroBarbeiroLista");
const inputData = document.getElementById("data");
const inputHora = document.getElementById("hora");
const horariosLote = document.getElementById("horariosLote");
const horaInicio = document.getElementById("horaInicio");
const horaFim = document.getElementById("horaFim");
const intervaloHorarios = document.getElementById("intervaloHorarios");
const barbeiro = document.getElementById("barbeiro"); // Novo elemento
const textoHora = document.getElementById("textoHora");
const dataEscolhida = document.getElementById("dataEscolhida");
const resumoFiltroLista = document.getElementById("resumoFiltroLista");
const botoesFiltroStatus = document.querySelectorAll("[data-filtro-status]");
const btnSalvarHorario = document.getElementById("btnSalvarHorario");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");
const btnGerarLote = document.getElementById("btnGerarLote");
const btnLimparLote = document.getElementById("btnLimparLote");
const btnBloquearDia = document.getElementById("btnBloquearDia");
const previewLote = document.getElementById("previewLote");
const adminCalendarioDias = document.getElementById("adminCalendarioDias");
const btnToggleCalendario = document.getElementById("btnToggleCalendario");
const calendarioContainer = document.getElementById("calendarioContainer");
const adminMesAtual = document.getElementById("adminMesAtual");
const adminMesAnterior = document.getElementById("adminMesAnterior");
const adminProximoMes = document.getElementById("adminProximoMes");
const adminMenuToggle = document.getElementById("adminMenuToggle");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const dataHojeTopo = document.querySelector(".data-hoje");
const notificacoesAgendamentos = document.getElementById("notificacoesAgendamentos");
const contadorAgendamentos = document.getElementById("contadorAgendamentos");
const formServico = document.getElementById("formServico");
const novoServicoNome = document.getElementById("novoServicoNome");
const novoServicoPreco = document.getElementById("novoServicoPreco");
const novoServicoDuracao = document.getElementById("novoServicoDuracao");
const btnSalvarServico = document.getElementById("btnSalvarServico");
const btnCancelarServico = document.getElementById("btnCancelarServico");
const listaServicos = document.getElementById("listaServicos");
const lucroTotal = document.getElementById("lucroTotal");
const totalServicosPagos = document.getElementById("totalServicosPagos");
const ticketMedio = document.getElementById("ticketMedio");
const listaFinanceiro = document.getElementById("listaFinanceiro");
const listaClientes = document.getElementById("listaClientes");
const formBloqueioPadrao = document.getElementById("formBloqueioPadrao");
const bloqueioPadraoAtivo = document.getElementById("bloqueioPadraoAtivo");
const bloqueioPadraoIntervalos = document.getElementById("bloqueioPadraoIntervalos");
const btnAdicionarBloqueioPadrao = document.getElementById("btnAdicionarBloqueioPadrao");
const msgBloqueioPadrao = document.getElementById("msgBloqueioPadrao");
const modalEditarAgendamento = document.getElementById("modalEditarAgendamento");
const formEditarAgendamento = document.getElementById("formEditarAgendamento");
const editarAgendamentoId = document.getElementById("editarAgendamentoId");
const editarAgendamentoData = document.getElementById("editarAgendamentoData");
const editarAgendamentoHora = document.getElementById("editarAgendamentoHora");
const editarAgendamentoBarbeiro = document.getElementById("editarAgendamentoBarbeiro");
const editarAgendamentoNome = document.getElementById("editarAgendamentoNome");
const editarAgendamentoTelefone = document.getElementById("editarAgendamentoTelefone");
const editarAgendamentoServico = document.getElementById("editarAgendamentoServico");
const editarAgendamentoServicosSelecionados = document.getElementById("editarAgendamentoServicosSelecionados");
const msgEditarAgendamento = document.getElementById("msgEditarAgendamento");
const btnFecharModalAgendamento = document.getElementById("btnFecharModalAgendamento");
const btnCancelarModalAgendamento = document.getElementById("btnCancelarModalAgendamento");
const btnAdicionarServicoAgendamento = document.getElementById("btnAdicionarServicoAgendamento");
const btnCancelarHorarioModal = document.getElementById("btnCancelarHorarioModal");
const btnExcluirRegistroModal = document.getElementById("btnExcluirRegistroModal");
let horariosCadastrados = [];
let cancelarListenerHorarios = null;
let cancelarListenerServicos = null;
let cancelarListenerConfiguracoes = null;
let servicosCadastrados = [];
let bloqueioPadrao = {
  ativo: false,
  intervalos: [
    { inicio: "12:00", fim: "14:00" }
  ]
};
let dataAtivaAdmin = "";
let mesVisivelAdmin = new Date();
let filtroStatusAtual = "todos";
let timerMensagemAdmin = null;
let horarioEditandoId = null;
let servicoEditandoId = null;
let servicosEdicaoSelecionados = [];

const servicosPadrao = [
  { id: "padrao-corte", nome: "Corte", preco: 30, duracao: 30, padrao: true },
  { id: "padrao-barba", nome: "Barba", preco: 20, duracao: 30, padrao: true },
  { id: "padrao-corte-barba", nome: "Corte + Barba", preco: 45, duracao: 60, padrao: true },
  { id: "padrao-sobrancelha", nome: "Sobrancelha", preco: 10, duracao: 15, padrao: true }
];

const barbeirosPadrao = ["Isac", "Carlos"];
const horaAberturaPadrao = "08:00";
const horaFechamentoPadrao = "22:00";
const intervaloPadraoAgenda = 30;

const titulosSecoes = {
  dashboard: {
    titulo: "Painel da Barbearia",
    subtitulo: "Resumo geral dos agendamentos e vagas."
  },
  agendamentos: {
    titulo: "Agendamentos",
    subtitulo: "Confirme ou cancele as solicitações recebidas pelo site."
  },
  servicos: {
    titulo: "Serviços",
    subtitulo: "Consulte os serviços existentes e cadastre novos."
  },
  horarios: {
    titulo: "Horários",
    subtitulo: "Visualize o calendário e configure bloqueios fixos de atendimento."
  },
  clientes: {
    titulo: "Clientes",
    subtitulo: "Acompanhe os clientes com agendamento."
  },
  financeiro: {
    titulo: "Financeiro",
    subtitulo: "Veja o lucro dos serviços finalizados."
  }
};

const secoesPainel = new Set([
  "dashboard",
  "agendamentos",
  "servicos",
  "horarios",
  "clientes",
  "financeiro"
]);

function abrirSecaoPainel(secao) {
  const secaoAtiva = secoesPainel.has(secao) ? secao : "dashboard";
  const tituloSecao = titulosSecoes[secaoAtiva];

  secoesPainel.forEach((item) => {
    document.body.classList.toggle(`section-${item}`, item === secaoAtiva);
  });

  document.querySelectorAll("[data-painel-section]").forEach((view) => {
    const ativa = view.dataset.painelSection === secaoAtiva;
    view.classList.toggle("is-active", ativa);
    view.hidden = !ativa;
  });

  document.querySelectorAll(".side-nav a, .bottom-nav a, .brand").forEach((link) => {
    const alvo = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("active", alvo === secaoAtiva);
  });

  document.querySelector(".admin-topo h1").textContent = tituloSecao.titulo;
  document.querySelector(".topo-subtitulo").textContent = tituloSecao.subtitulo;

  if (window.location.hash !== `#${secaoAtiva}`) {
    history.replaceState(null, "", `#${secaoAtiva}`);
  }

  fecharMenuAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

abrirSecaoPainel(window.location.hash.replace("#", "") || "dashboard");

if (dataHojeTopo) {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  dataHojeTopo.textContent = `Hoje, ${dataFormatada.replace("-feira", "")}`;
}

function fecharMenuAdmin() {
  document.body.classList.remove("sidebar-open");
  adminMenuToggle?.setAttribute("aria-expanded", "false");
}

adminMenuToggle?.addEventListener("click", () => {
  const aberto = document.body.classList.toggle("sidebar-open");
  adminMenuToggle.setAttribute("aria-expanded", aberto ? "true" : "false");
});

sidebarBackdrop?.addEventListener("click", fecharMenuAdmin);

document.querySelectorAll(".side-nav a, .bottom-nav a, .brand").forEach((link) => {
  link.addEventListener("click", (event) => {
    const secao = link.getAttribute("href")?.replace("#", "");

    if (!secao || !secoesPainel.has(secao)) return;

    event.preventDefault();
    abrirSecaoPainel(secao);
  });
});

notificacoesAgendamentos?.addEventListener("click", () => {
  abrirSecaoPainel("agendamentos");
});

function atualizarCamposCliente() {
  const statusOcupado = statusHorario.value === "ocupado";
  const statusLivre = statusHorario.value === "livre";
  const statusBloqueado = statusHorario.value === "bloqueado";

  // Campos de dados do cliente (nome, telefone, serviço)
  dadosCliente.classList.toggle("hidden", !statusOcupado);
  document.getElementById("nome").disabled = !statusOcupado;
  document.getElementById("telefone").disabled = !statusOcupado;
  document.getElementById("servico").disabled = !statusOcupado;

  // Campos de geração em lote
  horariosLote.disabled = statusOcupado || statusBloqueado;
  horaInicio.disabled = statusOcupado || statusBloqueado;
  horaFim.disabled = statusOcupado || statusBloqueado;
  intervaloHorarios.disabled = statusOcupado || statusBloqueado;
  if (btnGerarLote) btnGerarLote.disabled = statusOcupado || statusBloqueado;
  if (btnLimparLote) btnLimparLote.disabled = statusOcupado || statusBloqueado;

  if (statusOcupado || statusBloqueado) {
    horariosLote.value = "";
  }
  atualizarPreviewLote();
}

statusHorario.addEventListener("change", atualizarCamposCliente);
filtroHorarios.addEventListener("input", () => renderizarHorarios(horariosCadastrados));
filtroBarbeiroLista?.addEventListener("change", () => renderizarHorarios(horariosCadastrados));

function atualizarPreviewLote() {
  const horarios = obterHorariosEmLote();
  if (!horarios.length) {
    previewLote.textContent = statusHorario.value === "ocupado"
      ? "Troque para vaga livre para gerar horários em lote."
      : statusHorario.value === "bloqueado"
        ? "Informe um horário específico para bloquear ou use o botão de bloquear dia."
        : "Agenda padrão: 08:00 às 22:00, a cada 30 min.";
    return;
  }

  previewLote.textContent = `Horários prontos (${horarios.length}): ${horarios.join(", ")}`;
}

btnGerarLote?.addEventListener("click", () => {
  const gerados = gerarHorariosPorIntervalo();

  if (!gerados.length) {
    mostrarMensagemAdmin("⚠️ Preencha início, fim e intervalo válidos.", "orange");
    return;
  }

  horariosLote.value = gerados.join(", ");
  atualizarPreviewLote();
});

btnLimparLote?.addEventListener("click", () => {
  horariosLote.value = "";
  atualizarPreviewLote();
});

btnBloquearDia?.addEventListener("click", async () => {
  if (!dataAtivaAdmin) {
    mostrarMensagemAdmin("⚠️ Escolha um dia no calendário primeiro.", "orange");
    return;
  }

  if (!confirm(`Bloquear todos os horários de ${formatarData(dataAtivaAdmin)}?`)) {
    return;
  }

  await push(ref(db, "horarios"), {
    data: dataAtivaAdmin,
    hora: null,
    nome: null,
    telefone: null,
    servico: null,
    status: "bloqueado",
    barber: null,
    tipoBloqueio: "dia"
  });

  mostrarMensagemAdmin("Dia bloqueado na agenda.", "orange");
});

[horaInicio, horaFim, intervaloHorarios, horariosLote].forEach((el) => {
  el?.addEventListener("input", atualizarPreviewLote);
});

btnToggleCalendario?.addEventListener("click", () => {
  const estaEscondido = calendarioContainer.classList.toggle("hidden");
  btnToggleCalendario.textContent = estaEscondido 
    ? "+ Abrir Calendário" 
    : "Fechar Calendário";
});

atualizarPreviewLote();
atualizarCamposCliente();

botoesFiltroStatus.forEach((botao) => {
  botao.addEventListener("click", () => {
    filtroStatusAtual = botao.dataset.filtroStatus;
    botoesFiltroStatus.forEach((item) => item.classList.remove("ativo"));
    botao.classList.add("ativo");
    renderizarHorarios(horariosCadastrados);
  });
});

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function chaveHorario(horario) {
  return `${horario.data}|${horario.hora || "dia"}|${horario.barber || "geral"}`;
}

function horarioEstaNoPadrao(hora) {
  const minutos = converterHoraParaMinutos(hora);
  return minutos >= converterHoraParaMinutos(horaAberturaPadrao)
    && minutos <= converterHoraParaMinutos(horaFechamentoPadrao);
}

function normalizarIntervalosBloqueio(dados = {}) {
  const origem = Array.isArray(dados.intervalos) && dados.intervalos.length
    ? dados.intervalos
    : [{ inicio: dados.inicio || "12:00", fim: dados.fim || "14:00" }];

  const intervalos = origem
    .map((intervalo) => ({
      inicio: intervalo?.inicio || "",
      fim: intervalo?.fim || ""
    }))
    .filter((intervalo) => intervalo.inicio && intervalo.fim);

  return intervalos.length ? intervalos : [{ inicio: "12:00", fim: "14:00" }];
}

function criarLinhaBloqueioPadrao(intervalo = { inicio: "12:00", fim: "14:00" }) {
  const linha = document.createElement("div");
  linha.className = "bloqueio-intervalo";
  linha.innerHTML = `
    <div class="form-group">
      <label>Início</label>
      <input type="time" class="bloqueio-padrao-inicio" value="${escaparHTML(intervalo.inicio)}">
    </div>
    <div class="form-group">
      <label>Fim</label>
      <input type="time" class="bloqueio-padrao-fim" value="${escaparHTML(intervalo.fim)}">
    </div>
    <button type="button" class="btn-remover-bloqueio" aria-label="Remover bloqueio">×</button>
  `;
  return linha;
}

function renderizarIntervalosBloqueioPadrao(intervalos) {
  if (!bloqueioPadraoIntervalos) return;

  bloqueioPadraoIntervalos.innerHTML = "";
  normalizarIntervalosBloqueio({ intervalos }).forEach((intervalo) => {
    bloqueioPadraoIntervalos.appendChild(criarLinhaBloqueioPadrao(intervalo));
  });
}

function obterIntervalosBloqueioFormulario() {
  if (!bloqueioPadraoIntervalos) return [];

  return [...bloqueioPadraoIntervalos.querySelectorAll(".bloqueio-intervalo")]
    .map((linha) => ({
      inicio: linha.querySelector(".bloqueio-padrao-inicio")?.value || "",
      fim: linha.querySelector(".bloqueio-padrao-fim")?.value || ""
    }));
}

function horarioEstaNoBloqueioPadrao(hora) {
  if (!bloqueioPadrao.ativo || !hora) {
    return false;
  }

  const minutoHorario = converterHoraParaMinutos(hora);

  return normalizarIntervalosBloqueio(bloqueioPadrao).some((intervalo) => {
    const minutoInicio = converterHoraParaMinutos(intervalo.inicio);
    const minutoFim = converterHoraParaMinutos(intervalo.fim);

    return minutoFim > minutoInicio
      && minutoHorario >= minutoInicio
      && minutoHorario < minutoFim;
  });
}

function criarHorariosPadraoDia(data) {
  const horarios = [];
  const inicio = converterHoraParaMinutos(horaAberturaPadrao);
  const fim = converterHoraParaMinutos(horaFechamentoPadrao);

  for (let minuto = inicio; minuto <= fim; minuto += intervaloPadraoAgenda) {
    const hora = converterMinutosParaHora(minuto);

    barbeirosPadrao.forEach((barber) => {
      const bloqueadoPadrao = horarioEstaNoBloqueioPadrao(hora);

      horarios.push({
        id: `padrao-${data}-${barber}-${hora}`,
        data,
        hora,
        nome: null,
        telefone: null,
        servico: null,
        status: bloqueadoPadrao ? "bloqueado" : "livre",
        barber,
        tipoBloqueio: bloqueadoPadrao ? "padrao" : null,
        padrao: true
      });
    });
  }

  return horarios;
}

function diaEstaBloqueado(data, dados = horariosCadastrados) {
  return dados.some(h => h.data === data && h.status === "bloqueado" && h.tipoBloqueio === "dia");
}

function combinarHorariosPadrao(data, dados = horariosCadastrados) {
  const registrosDoDia = dados.filter(h => h.data === data);
  const bloqueado = diaEstaBloqueado(data, dados);
  const mapa = new Map();

  if (!bloqueado) {
    criarHorariosPadraoDia(data).forEach((horario) => {
      mapa.set(chaveHorario(horario), horario);
    });
  }

  registrosDoDia.forEach((horario) => {
    if (horario.tipoBloqueio === "dia") {
      mapa.set(`bloqueio-dia-${data}`, {
        ...horario,
        hora: horario.hora || "--:--",
        barber: horario.barber || "Todos"
      });
      return;
    }

    if (horario.status === "cancelado") return;

    const chave = chaveHorario(horario);
    mapa.set(chave, {
      ...horario,
      padrao: false
    });
  });

  return [...mapa.values()].sort((a, b) => {
    const dataA = `${a.data}T${a.hora === "--:--" ? "00:00" : a.hora}`;
    const dataB = `${b.data}T${b.hora === "--:--" ? "00:00" : b.hora}`;
    return new Date(dataA) - new Date(dataB) || String(a.barber || "").localeCompare(String(b.barber || ""), "pt-BR");
  });
}

function obterDadosParaLista(dados = horariosCadastrados) {
  return dados.filter(h => ["solicitado", "ocupado", "finalizado", "cancelado"].includes(h.status) && !h.padrao && h.nome);
}

function obterInfoStatusHorario(status) {
  const mapa = {
    solicitado: {
      texto: "Solicitado",
      dot: "solicitado"
    },
    ocupado: {
      texto: "Confirmado",
      dot: "finalizado"
    },
    finalizado: {
      texto: "Finalizado",
      dot: "finalizado"
    },
    cancelado: {
      texto: "Cancelado",
      dot: "cancelado"
    },
    livre: {
      texto: "Livre",
      dot: "livre"
    },
    bloqueado: {
      texto: "Indisponível",
      dot: "ocupado"
    }
  };

  return mapa[status] || {
    texto: "Marcado",
    dot: "finalizado"
  };
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function normalizarNomeServico(nome) {
  return String(nome || "").trim().toLowerCase();
}

function obterServicoPorNome(nome) {
  return servicosCadastrados.find((servicoItem) => {
    return normalizarNomeServico(servicoItem.nome) === normalizarNomeServico(nome);
  });
}

function obterServicoPadrao(id) {
  return servicosPadrao.find((servicoItem) => servicoItem.id === id);
}

function cancelarEdicaoServico() {
  servicoEditandoId = null;
  formServico?.reset();
  if (btnSalvarServico) btnSalvarServico.textContent = "Adicionar serviço";
  btnCancelarServico?.classList.add("hidden");
}

function obterValorHorario(horario) {
  if (Number.isFinite(Number(horario.valorServico))) {
    return Number(horario.valorServico);
  }

  return Number(obterServicoPorNome(horario.servico)?.preco || 0);
}

function obterServicosDoHorario(horario = {}) {
  if (Array.isArray(horario.servicos) && horario.servicos.length) {
    return horario.servicos
      .map((servicoItem) => ({
        nome: servicoItem.nome || servicoItem,
        preco: Number(servicoItem.preco ?? obterServicoPorNome(servicoItem.nome || servicoItem)?.preco ?? 0)
      }))
      .filter((servicoItem) => servicoItem.nome);
  }

  return String(horario.servico || "")
    .split(",")
    .map((nome) => nome.trim())
    .filter(Boolean)
    .map((nome) => ({
      nome,
      preco: Number(obterServicoPorNome(nome)?.preco || 0)
    }));
}

function renderizarServicosEdicao() {
  if (!editarAgendamentoServicosSelecionados) return;

  editarAgendamentoServicosSelecionados.classList.toggle("vazio", servicosEdicaoSelecionados.length === 0);
  editarAgendamentoServicosSelecionados.innerHTML = servicosEdicaoSelecionados.map((servicoItem, index) => {
    return `
      <span class="servico-chip">
        ${escaparHTML(servicoItem.nome)}
        <button type="button" onclick="removerServicoAgendamento(${index})" aria-label="Remover ${escaparHTML(servicoItem.nome)}">×</button>
      </span>
    `;
  }).join("");
}

window.removerServicoAgendamento = function (index) {
  servicosEdicaoSelecionados.splice(index, 1);
  renderizarServicosEdicao();
};

function dataHoraJaPassou(data, hora) {
  if (!data || !hora) return false;
  return new Date(`${data}T${hora}`) <= new Date();
}

function existeConflitoAgendamento({ id, data, hora, barber }) {
  return horariosCadastrados.some((horario) => {
    return horario.id !== id
      && horario.data === data
      && horario.hora === hora
      && (horario.barber || "") === barber
      && ["solicitado", "ocupado", "bloqueado"].includes(horario.status);
  });
}

async function liberarHorarioSeFuturo(horario) {
  if (!horario?.data || !horario?.hora || !horario?.barber || dataHoraJaPassou(horario.data, horario.hora)) {
    return;
  }

  const jaExisteLivre = horariosCadastrados.some((item) => {
    return item.id !== horario.id
      && item.data === horario.data
      && item.hora === horario.hora
      && (item.barber || "") === (horario.barber || "")
      && item.status === "livre";
  });

  if (jaExisteLivre) return;

  await push(ref(db, "horarios"), {
    data: horario.data,
    hora: horario.hora,
    nome: null,
    telefone: null,
    servico: null,
    valorServico: null,
    status: "livre",
    barber: horario.barber,
    tipoBloqueio: null,
    liberadoDe: horario.id,
    criadoEm: new Date().toISOString()
  });
}

function renderizarSelectServicos() {
  const selectServico = document.getElementById("servico");
  const valorAtual = selectServico.value;
  const valorAtualModal = editarAgendamentoServico?.value || "";

  selectServico.innerHTML = '<option value="">Escolha o serviço</option>';
  if (editarAgendamentoServico) {
    editarAgendamentoServico.innerHTML = '<option value="">Escolha o serviço</option>';
  }

  servicosCadastrados.forEach((servicoItem) => {
    const option = document.createElement("option");
    option.value = servicoItem.nome;
    option.textContent = servicoItem.preco
      ? `${servicoItem.nome} - ${formatarMoeda(servicoItem.preco)}`
      : servicoItem.nome;
    selectServico.appendChild(option);

    if (editarAgendamentoServico) {
      editarAgendamentoServico.appendChild(option.cloneNode(true));
    }
  });

  selectServico.value = valorAtual;
  if (editarAgendamentoServico) {
    editarAgendamentoServico.value = valorAtualModal;
  }
}

function renderizarServicos() {
  if (!listaServicos) return;

  renderizarSelectServicos();

  if (servicosCadastrados.length === 0) {
    listaServicos.innerHTML = '<p class="empty-state">Nenhum serviço cadastrado.</p>';
    return;
  }

  listaServicos.innerHTML = servicosCadastrados.map((servicoItem) => {
    return `
      <div class="servico-item">
        <div>
          <strong>${escaparHTML(servicoItem.nome)}</strong>
          <span>${formatarMoeda(servicoItem.preco)}${servicoItem.duracao ? ` · ${servicoItem.duracao} min` : ""}</span>
        </div>
        <div class="servico-acoes">
          <button type="button" class="btn-editar mini-action" onclick="editarServico('${servicoItem.id}')">Editar</button>
          <button type="button" class="btn-delete mini-action" onclick="excluirServico('${servicoItem.id}')">Excluir</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderizarFinanceiro(dados) {
  if (!lucroTotal || !listaFinanceiro) return;

  const finalizados = dados.filter(h => h.status === "finalizado");
  const total = finalizados.reduce((soma, horario) => soma + obterValorHorario(horario), 0);
  const media = finalizados.length ? total / finalizados.length : 0;

  lucroTotal.textContent = formatarMoeda(total);
  totalServicosPagos.textContent = finalizados.length;
  ticketMedio.textContent = formatarMoeda(media);

  if (finalizados.length === 0) {
    listaFinanceiro.innerHTML = '<p class="empty-state">Nenhum serviço finalizado para calcular lucro.</p>';
    return;
  }

  listaFinanceiro.innerHTML = finalizados.slice(0, 8).map((horario) => {
    return `
      <div class="financeiro-item">
        <div>
          <strong>${escaparHTML(horario.servico || "Serviço")}</strong>
          <span>${escaparHTML(formatarData(horario.data))} às ${escaparHTML(horario.hora)} · ${escaparHTML(horario.nome || "Cliente")}</span>
        </div>
        <strong>${formatarMoeda(obterValorHorario(horario))}</strong>
      </div>
    `;
  }).join("");
}

function renderizarClientes(dados) {
  if (!listaClientes) return;

  const clientes = dados
    .filter(h => h.status === "ocupado" && h.nome)
    .map((horario) => ({
      nome: horario.nome,
      telefone: horario.telefone || "Sem contato",
      servico: horario.servico || "Serviço não informado",
      data: horario.data,
      hora: horario.hora
    }));

  if (clientes.length === 0) {
    listaClientes.innerHTML = '<p class="empty-state">Nenhum cliente com agendamento marcado.</p>';
    return;
  }

  listaClientes.innerHTML = clientes.map((cliente) => {
    return `
      <div class="cliente-item">
        <div>
          <strong>${escaparHTML(cliente.nome)}</strong>
          <span>${escaparHTML(cliente.telefone)}</span>
        </div>
        <div>
          <strong>${escaparHTML(cliente.servico)}</strong>
          <span>${escaparHTML(formatarData(cliente.data))} às ${escaparHTML(cliente.hora)}</span>
        </div>
      </div>
    `;
  }).join("");
}

function carregarServicos() {
  if (cancelarListenerServicos) return;

  cancelarListenerServicos = onValue(ref(db, "servicos"), (snapshot) => {
    const personalizados = [];

    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        personalizados.push({
          id: child.key,
          ...child.val()
        });
      });
    }

    const ativos = personalizados.filter(item => !item.excluido);
    const excluidos = new Set(personalizados.filter(item => item.excluido).map(item => item.id));
    const idsPadrao = new Set(servicosPadrao.map(item => item.id));
    const mapaPersonalizados = new Map(ativos.map(item => [item.id, item]));
    const nomesPersonalizados = new Set(
      ativos
        .filter(item => !idsPadrao.has(item.id))
        .map(item => normalizarNomeServico(item.nome))
    );

    servicosCadastrados = [
      ...servicosPadrao
        .filter(item => !excluidos.has(item.id))
        .filter(item => mapaPersonalizados.has(item.id) || !nomesPersonalizados.has(normalizarNomeServico(item.nome)))
        .map(item => ({
          ...item,
          ...(mapaPersonalizados.get(item.id) || {})
        })),
      ...ativos.filter(item => !idsPadrao.has(item.id))
    ].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

    renderizarServicos();
    renderizarFinanceiro(horariosCadastrados);
  });
}

function carregarConfiguracoes() {
  if (cancelarListenerConfiguracoes) return;

  cancelarListenerConfiguracoes = onValue(ref(db, "configuracoes/bloqueioPadrao"), (snapshot) => {
    const dados = snapshot.val() || {};

    bloqueioPadrao = {
      ativo: Boolean(dados.ativo),
      intervalos: normalizarIntervalosBloqueio(dados)
    };

    if (bloqueioPadraoAtivo) bloqueioPadraoAtivo.checked = bloqueioPadrao.ativo;
    renderizarIntervalosBloqueioPadrao(bloqueioPadrao.intervalos);

    renderizarCalendarioAdmin();
    renderizarHorarios(horariosCadastrados);
  });
}

btnAdicionarBloqueioPadrao?.addEventListener("click", () => {
  bloqueioPadraoIntervalos?.appendChild(criarLinhaBloqueioPadrao({ inicio: "12:00", fim: "14:00" }));
});

bloqueioPadraoIntervalos?.addEventListener("click", (event) => {
  const botao = event.target.closest(".btn-remover-bloqueio");
  if (!botao) return;

  const linhas = bloqueioPadraoIntervalos.querySelectorAll(".bloqueio-intervalo");
  if (linhas.length <= 1) return;

  botao.closest(".bloqueio-intervalo")?.remove();
});

formBloqueioPadrao?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const intervalos = obterIntervalosBloqueioFormulario();
  const intervalosValidos = intervalos.filter((intervalo) => {
    return intervalo.inicio
      && intervalo.fim
      && converterHoraParaMinutos(intervalo.fim) > converterHoraParaMinutos(intervalo.inicio);
  });

  if (intervalosValidos.length !== intervalos.length || intervalosValidos.length === 0) {
    if (msgBloqueioPadrao) {
      msgBloqueioPadrao.textContent = "Informe apenas intervalos válidos.";
      msgBloqueioPadrao.style.color = "orange";
    }
    return;
  }

  await update(ref(db, "configuracoes/bloqueioPadrao"), {
    ativo: Boolean(bloqueioPadraoAtivo.checked),
    intervalos: intervalosValidos,
    inicio: intervalosValidos[0].inicio,
    fim: intervalosValidos[0].fim
  });

  if (msgBloqueioPadrao) {
    msgBloqueioPadrao.textContent = "Bloqueio padrão salvo.";
    msgBloqueioPadrao.style.color = "lightgreen";
  }
});

formServico?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = novoServicoNome.value.trim();
  const preco = Number(novoServicoPreco.value);
  const duracao = Number(novoServicoDuracao.value);
  const servicoAtual = servicoEditandoId
    ? servicosCadastrados.find((servicoItem) => servicoItem.id === servicoEditandoId)
    : null;

  if (!nome || !Number.isFinite(preco) || preco < 0) {
    mostrarMensagemAdmin("⚠️ Informe nome e preço do serviço.", "orange");
    return;
  }

  const servicoMesmoNome = obterServicoPorNome(nome);

  if (servicoMesmoNome && servicoMesmoNome.id !== servicoEditandoId) {
    mostrarMensagemAdmin("⚠️ Esse serviço já existe.", "orange");
    return;
  }

  if (servicoEditandoId) {
    await update(ref(db, "servicos/" + servicoEditandoId), {
      nome,
      preco,
      duracao: Number.isFinite(duracao) && duracao > 0 ? duracao : null,
      padrao: Boolean(servicoAtual?.padrao || obterServicoPadrao(servicoEditandoId)),
      excluido: false
    });

    cancelarEdicaoServico();
    mostrarMensagemAdmin("✅ Serviço atualizado!", "lightgreen");
    return;
  }

  await push(ref(db, "servicos"), {
    nome,
    preco,
    duracao: Number.isFinite(duracao) && duracao > 0 ? duracao : null
  });

  formServico.reset();
  mostrarMensagemAdmin("✅ Serviço adicionado!", "lightgreen");
});

window.excluirServico = async function (id) {
  if (!confirm("Excluir esse serviço?")) return;

  const servicoAtual = servicosCadastrados.find((item) => item.id === id);
  const servicoPadrao = obterServicoPadrao(id);
  const padraoMesmoNome = servicoAtual
    ? servicosPadrao.find((item) => normalizarNomeServico(item.nome) === normalizarNomeServico(servicoAtual.nome))
    : null;

  if (servicoPadrao) {
    await update(ref(db, "servicos/" + id), {
      ...servicoPadrao,
      excluido: true
    });
  } else {
    await remove(ref(db, "servicos/" + id));

    if (padraoMesmoNome) {
      await update(ref(db, "servicos/" + padraoMesmoNome.id), {
        ...padraoMesmoNome,
        excluido: true
      });
    }
  }

  if (servicoEditandoId === id) {
    cancelarEdicaoServico();
  }

  mostrarMensagemAdmin("Serviço excluído.", "orange");
};

window.editarServico = function (id) {
  const servicoItem = servicosCadastrados.find((item) => item.id === id);

  if (!servicoItem) {
    mostrarMensagemAdmin("⚠️ Serviço não encontrado.", "orange");
    return;
  }

  servicoEditandoId = id;
  novoServicoNome.value = servicoItem.nome || "";
  novoServicoPreco.value = Number(servicoItem.preco || 0);
  novoServicoDuracao.value = servicoItem.duracao || "";
  if (btnSalvarServico) btnSalvarServico.textContent = "Salvar alterações";
  btnCancelarServico?.classList.remove("hidden");
  novoServicoNome.focus();
  mostrarMensagemAdmin("Editando serviço selecionado.", "#f1c94d");
};

btnCancelarServico?.addEventListener("click", () => {
  cancelarEdicaoServico();
  mostrarMensagemAdmin("Edição de serviço cancelada.", "orange");
});

function formatarChaveData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function obterStatusDia(data) {
  const hoje = formatarChaveData(new Date());

  if (data < hoje) {
    return {
      classe: "passado",
      texto: "Passou",
      bloqueado: true
    };
  }

  if (diaEstaBloqueado(data)) {
    return {
      classe: "sem-agenda",
      texto: "Bloqueado"
    };
  }

  const horariosDoDia = combinarHorariosPadrao(data);
  const livres = horariosDoDia.filter(h => h.status === "livre").length;
  const ocupados = horariosDoDia.filter(h => h.status === "ocupado").length;
  const solicitados = horariosDoDia.filter(h => h.status === "solicitado").length;
  const bloqueados = horariosDoDia.filter(h => h.status === "bloqueado").length;

  if (horariosDoDia.length === 0) {
    return {
      classe: "sem-agenda",
      texto: "Sem agenda"
    };
  }

  if (livres > 0) {
    return {
      classe: "vagas",
      texto: ocupados + solicitados > 0
        ? `${livres} vaga${livres > 1 ? "s" : ""} / ${ocupados + solicitados} pend.`
        : `${livres} vaga${livres > 1 ? "s" : ""}`
    };
  }

  if (bloqueados > 0 && ocupados === 0 && solicitados === 0) {
    return {
      classe: "sem-agenda",
      texto: "Bloqueado"
    };
  }

  return {
    classe: "ocupado",
    texto: solicitados > 0
      ? `${solicitados} solicitado${solicitados > 1 ? "s" : ""}`
      : `${ocupados} marcado${ocupados > 1 ? "s" : ""}`
  };
}

function atualizarPassoHora() {
  const temData = Boolean(dataAtivaAdmin);

  inputHora.disabled = !temData;
  textoHora.textContent = temData
    ? "Agora selecione o horário"
    : "Selecione uma data primeiro";
  dataEscolhida.textContent = temData
    ? `Data selecionada: ${formatarData(dataAtivaAdmin)}`
    : "Nenhuma data selecionada.";
}

function mostrarMensagemAdmin(texto, cor) {
  msgAdmin.innerHTML = texto;
  msgAdmin.style.color = cor;

  clearTimeout(timerMensagemAdmin);
  timerMensagemAdmin = setTimeout(() => {
    msgAdmin.innerHTML = "";
  }, 3500);
}

function limparFormularioAdmin(manterData = true) {
  if (!manterData) {
    inputData.value = "";
    dataAtivaAdmin = "";
  }

  inputHora.value = "";
  horariosLote.value = "";
  horaInicio.value = "";
  horaFim.value = "";
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("servico").value = "";
  if (barbeiro) barbeiro.value = "";
  statusHorario.value = "ocupado";
  horarioEditandoId = null;
  btnSalvarHorario.textContent = "Salvar horário";
  btnCancelarEdicao.classList.add("hidden");
  atualizarCamposCliente();
  atualizarPassoHora();
  renderizarCalendarioAdmin();
  atualizarPreviewLote();
}

function selecionarDataAdmin(data) {
  dataAtivaAdmin = data;
  inputData.value = data;
  inputHora.disabled = false;
  filtroStatusAtual = "todos";
  botoesFiltroStatus.forEach((item) => {
    item.classList.toggle("ativo", item.dataset.filtroStatus === "todos");
  });
  atualizarPassoHora();
  renderizarCalendarioAdmin();
  renderizarHorarios(horariosCadastrados);
}

function renderizarCalendarioAdmin() {
  adminCalendarioDias.innerHTML = "";

  const ano = mesVisivelAdmin.getFullYear();
  const mes = mesVisivelAdmin.getMonth();
  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  adminMesAtual.textContent = `${nomesMeses[mes]} ${ano}`;

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const totalDias = ultimoDia.getDate();

  for (let i = 0; i < primeiroDia.getDay(); i++) {
    const vazio = document.createElement("div");
    vazio.className = "dia-vazio";
    adminCalendarioDias.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const data = new Date(ano, mes, dia);
    const chave = formatarChaveData(data);
    const status = obterStatusDia(chave);
    const botao = document.createElement("button");

    botao.type = "button";
    botao.className = `dia-calendario ${status.classe}`;
    botao.disabled = Boolean(status.bloqueado);

    if (chave === dataAtivaAdmin) {
      botao.classList.add("selecionado");
    }

    botao.setAttribute("aria-label", `${dia} de ${nomesMeses[mes]}: ${status.texto}`);
    botao.innerHTML = `<strong>${dia}</strong>`;

    botao.addEventListener("click", () => selecionarDataAdmin(chave));
    adminCalendarioDias.appendChild(botao);
  }
}

function atualizarResumo(dados) {
  const livres = dados.filter(h => h.status === "livre").length;
  const ocupados = dados.filter(h => h.status === "ocupado").length;
  const solicitados = dados.filter(h => h.status === "solicitado").length;

  document.getElementById("totalHorarios").textContent = solicitados;
  document.getElementById("totalLivres").textContent = livres;
  document.getElementById("totalOcupados").textContent = ocupados;
  atualizarNotificacoes(solicitados);
}

function atualizarNotificacoes(total) {
  if (!notificacoesAgendamentos || !contadorAgendamentos) return;

  const descricao = total === 1
    ? "1 solicitação pendente"
    : `${total} solicitações pendentes`;

  contadorAgendamentos.textContent = total > 99 ? "99+" : total;
  notificacoesAgendamentos.classList.toggle("tem-notificacoes", total > 0);
  notificacoesAgendamentos.setAttribute("aria-label", descricao);
  notificacoesAgendamentos.title = descricao;
}

adminMesAnterior.addEventListener("click", () => {
  mesVisivelAdmin = new Date(mesVisivelAdmin.getFullYear(), mesVisivelAdmin.getMonth() - 1, 1);
  renderizarCalendarioAdmin();
});

adminProximoMes.addEventListener("click", () => {
  mesVisivelAdmin = new Date(mesVisivelAdmin.getFullYear(), mesVisivelAdmin.getMonth() + 1, 1);
  renderizarCalendarioAdmin();
});

dataAtivaAdmin = formatarChaveData(new Date());
inputData.value = dataAtivaAdmin;
renderizarCalendarioAdmin();
atualizarPassoHora();


// 🔐 LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    msgLogin.innerHTML = "⚠️ Preencha tudo!";
    msgLogin.style.color = "orange";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (error) {
    msgLogin.innerHTML = "❌ Email ou senha inválidos";
    msgLogin.style.color = "red";
  }
};


// 👁 CONTROLE DE LOGIN
async function limparVagasLivresPassadas() {
  const hoje = formatarChaveData(new Date());
  const snapshot = await get(ref(db, "horarios"));

  if (!snapshot.exists()) return;

  snapshot.forEach((child) => {
    const horario = child.val();

    if (horario.status === "livre" && horario.data < hoje) {
      remove(ref(db, "horarios/" + child.key));
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  const login = document.getElementById("login");
  const painel = document.getElementById("painel");

  if (user) {
    try {
      login.classList.add("hidden");
      painel.classList.remove("hidden");
      await limparVagasLivresPassadas();
      carregarServicos();
      carregarConfiguracoes();
      carregarHorarios();
    } catch (error) {
      console.error("Erro ao inicializar painel:", error);
    }
  } else {
    login.classList.remove("hidden");
    painel.classList.add("hidden");
    atualizarNotificacoes(0);

    if (cancelarListenerHorarios) {
      cancelarListenerHorarios();
      cancelarListenerHorarios = null;
    }

    if (cancelarListenerServicos) {
      cancelarListenerServicos();
      cancelarListenerServicos = null;
    }

    if (cancelarListenerConfiguracoes) {
      cancelarListenerConfiguracoes();
      cancelarListenerConfiguracoes = null;
    }
  }
});


// ➕ ADICIONAR HORÁRIO (SEM BUG)
window.adicionarHorario = async function () {
  const data = inputData.value;
  const hora = inputHora.value;
  let horasEmLote = obterHorariosEmLote();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const servico = document.getElementById("servico").value;
  const servicoSelecionado = obterServicoPorNome(servico);
  const status = statusHorario.value;
  const barbeiroSelecionado = barbeiro.value;

  if (horarioEditandoId && horasEmLote.length > 0) {
    mostrarMensagemAdmin("⚠️ Na edição, altere apenas um horário por vez.", "orange");
    return;
  }

  if (!barbeiroSelecionado) {
    mostrarMensagemAdmin("⚠️ Selecione o barbeiro responsável!", "orange");
    return;
  }

  if (status === "livre" && hora && horasEmLote.length > 0) {
    horasEmLote = [...new Set([hora, ...horasEmLote])].sort();
  }

  if (!data || (!hora && horasEmLote.length === 0)) {
    mostrarMensagemAdmin("⚠️ Escolha a data e informe o horário!", "orange");
    return;
  }

  if (status === "ocupado" && (!nome || !telefone || !servico)) {
    mostrarMensagemAdmin("⚠️ Preencha todos os dados do cliente e selecione o barbeiro!", "orange");
    return;
  }

  const snapshot = await get(ref(db, "horarios"));
  const horariosExistentes = [];

  if (snapshot.exists()) {
    snapshot.forEach((child) => {
      const h = child.val();
      horariosExistentes.push({
        id: child.key,
        ...h
      });
    });
  }

  if (horasEmLote.length > 0) { // Se for lote, chama a função específica
    await adicionarHorariosEmLote(data, horasEmLote, horariosExistentes);
    return;
  }

  const horarioExistente = horariosExistentes.find(h => {
    return h.data === data
      && h.hora === hora
      && (h.barber || "") === barbeiroSelecionado
      && h.id !== horarioEditandoId;
  });

  if (horarioEditandoId && horarioExistente) {
    mostrarMensagemAdmin("❌ Já existe outro cadastro nessa data e hora.", "red");
    return;
  }

  if (horarioExistente && horarioExistente.status === "ocupado") {
    mostrarMensagemAdmin("❌ Esse horário já está marcado!", "red");
    return;
  }

  const dadosCliente = {
    data,
    hora,
    nome: status === "ocupado" ? nome : null,
    telefone: status === "ocupado" ? telefone : null,
    servico: status === "ocupado" ? servico : null,
    valorServico: status === "ocupado" ? Number(servicoSelecionado?.preco || 0) : null,
    status,
    barber: barbeiroSelecionado,
    tipoBloqueio: status === "bloqueado" ? "horario" : null
  };

  if (horarioEditandoId) {
    await update(ref(db, "horarios/" + horarioEditandoId), dadosCliente);
  } else if (horarioExistente) {
    await update(ref(db, "horarios/" + horarioExistente.id), dadosCliente);
  } else {
    await push(ref(db, "horarios"), {
      ...dadosCliente,
      lembreteEnviado: false
    });
  }

  const editouHorario = Boolean(horarioEditandoId);
  limparFormularioAdmin(true);

  mostrarMensagemAdmin(
    editouHorario
      ? "✅ Horário atualizado!"
      : status === "bloqueado" ? "Horário bloqueado!" : status === "ocupado" ? "✅ Cliente adicionado!" : "✅ Vaga livre adicionada!",
    "lightgreen"
  );
};

function obterHorariosEmLote() {
  const digitados = horariosLote.value.match(/\b\d{1,2}:\d{2}\b/g) || [];
  const gerados = gerarHorariosPorIntervalo();
  const encontrados = [...digitados, ...gerados];
  const normalizados = encontrados
    .map((valor) => {
      const [hora, minuto] = valor.split(":").map(Number);

      if (hora > 23 || minuto > 59) return null;

      return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
    })
    .filter(Boolean);

  return [...new Set(normalizados)].sort();
}

function converterHoraParaMinutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

function converterMinutosParaHora(totalMinutos) {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function gerarHorariosPorIntervalo() {
  if (!horaInicio.value || !horaFim.value) return [];

  const inicio = converterHoraParaMinutos(horaInicio.value);
  const fim = converterHoraParaMinutos(horaFim.value);
  const intervalo = Number(intervaloHorarios.value);

  if (fim <= inicio || intervalo <= 0) return [];

  const horarios = [];

  for (let minuto = inicio; minuto <= fim; minuto += intervalo) {
    horarios.push(converterMinutosParaHora(minuto));
  }

  return horarios;
}

async function adicionarHorariosEmLote(data, horas, horariosExistentes) {
  const existentesDoDia = horariosExistentes.filter(h => h.data === data);
  const barbeiroSelecionado = barbeiro.value;
  let criados = 0;
  let ignorados = 0;
  let ocupados = 0;

  for (const hora of horas) {
    const horarioExistente = existentesDoDia.find(h => h.hora === hora && (h.barber || "") === barbeiroSelecionado);

    if (horarioExistente?.status === "ocupado") {
      ocupados++;
      continue;
    }

    if (horarioExistente) {
      ignorados++;
      continue;
    }

    await push(ref(db, "horarios"), {
      data,
      hora,
      nome: null,
      telefone: null,
      servico: null,
      status: "livre",
      barber: barbeiroSelecionado,
      lembreteEnviado: false
    });

    criados++;
  }

  inputHora.value = "";
  horariosLote.value = "";
  horaInicio.value = "";
  horaFim.value = "";
  atualizarPassoHora();
  renderizarCalendarioAdmin();

  mostrarMensagemAdmin(
    `✅ ${criados} vaga${criados === 1 ? "" : "s"} adicionada${criados === 1 ? "" : "s"}. ${ignorados + ocupados} repetida${ignorados + ocupados === 1 ? "" : "s"} ignorada${ignorados + ocupados === 1 ? "" : "s"}.`,
    "lightgreen"
  );
}


// 📡 LISTAR HORÁRIOS
function carregarHorarios() {
  if (cancelarListenerHorarios) return;

  cancelarListenerHorarios = onValue(ref(db, "horarios"), (snapshot) => {
    if (!snapshot.exists()) {
      horariosCadastrados = [];
      atualizarResumo(horariosCadastrados);
      renderizarFinanceiro(horariosCadastrados);
      renderizarClientes(horariosCadastrados);
      renderizarCalendarioAdmin();
      renderizarHorarios(horariosCadastrados);
      return;
    }

    const dados = [];

    snapshot.forEach((child) => {
      dados.push({
        id: child.key,
        ...child.val()
      });
    });

    // ORDENAR
    dados.sort((a, b) => {
      return new Date(a.data + "T" + (a.hora || "00:00")) - new Date(b.data + "T" + (b.hora || "00:00"));
    });

    horariosCadastrados = dados;
    atualizarResumo(horariosCadastrados);
    renderizarFinanceiro(horariosCadastrados);
    renderizarClientes(horariosCadastrados);
    renderizarCalendarioAdmin();
    renderizarHorarios(horariosCadastrados);
  });
}


function renderizarHorarios(dados) {
  const lista = document.getElementById("lista");
  const termo = filtroHorarios.value.trim().toLowerCase();
  const barbeiroFiltro = filtroBarbeiroLista?.value || "todos";
  const dadosLista = obterDadosParaLista(dados);
  const filtrarPorData = Boolean(dataAtivaAdmin && filtroStatusAtual === "todos");

  const filtrados = dadosLista.filter((h) => {
    if (filtrarPorData && h.data !== dataAtivaAdmin) return false;
    if (filtroStatusAtual !== "todos" && h.status !== filtroStatusAtual) return false;
    if (barbeiroFiltro !== "todos" && h.barber !== barbeiroFiltro) return false;

    const texto = `${h.data} ${h.hora || ""} ${h.nome || ""} ${h.servico || ""} ${h.telefone || ""} ${h.barber || ""}`.toLowerCase();
    return texto.includes(termo);
  });

  lista.innerHTML = "";
  resumoFiltroLista.textContent = filtroStatusAtual === "todos" && dataAtivaAdmin
    ? `Mostrando solicitados, confirmados, finalizados e cancelados de ${formatarData(dataAtivaAdmin)}.`
    : "Mostrando agendamentos do filtro selecionado.";

  if (filtrados.length === 0) {
    lista.innerHTML = "<p class=\"empty-state\">Nenhuma solicitação ou agendamento encontrado.</p>";
    return;
  }

  filtrados.forEach((h) => {
    const dataFormatada = formatarData(h.data);
    const statusInfo = obterInfoStatusHorario(h.status);
    const cliente = h.tipoBloqueio === "dia" ? "Dia bloqueado" : h.nome || "Vaga aberta";
    const servico = h.servico || "—";
    const barbeiroNome = h.barber || "—";
    const horaTexto = h.hora || "--:--";
    const bloqueioDia = h.tipoBloqueio === "dia";
    const podeEditar = !(bloqueioDia || !["ocupado", "livre", "bloqueado"].includes(h.status));
    const editarAcao = h.status === "ocupado" && !h.padrao
      ? `editarAgendamentoConfirmado('${h.id}')`
      : h.padrao
      ? `editarHorarioPadrao('${h.data}', '${h.hora}', '${h.barber}')`
      : `editarHorario('${h.id}')`;
    const acoesSolicitacao = h.status === "solicitado"
      ? `
          <button class="btn-confirmar" title="Confirmar solicitação" aria-label="Confirmar solicitação" onclick="confirmarSolicitacao('${h.id}')">Confirmar</button>
          <button class="btn-cancelar" title="Cancelar solicitação" aria-label="Cancelar solicitação" onclick="cancelarSolicitacao('${h.id}')">Cancelar</button>
        `
      : "";

    lista.innerHTML += `
      <li class="${h.status}">
        <div class="table-cell">
          <span class="cell-label">Data</span>
          <strong>${escaparHTML(dataFormatada)}</strong>
        </div>
        <div class="table-cell">
          <span class="cell-label">Horário</span>
          <span>${escaparHTML(horaTexto)}</span>
        </div>
        <div class="table-cell">
          <span class="cell-label">Cliente</span>
          <span>
            ${escaparHTML(cliente)}
            ${h.telefone ? `<small>${escaparHTML(h.telefone)}</small>` : ""}
          </span>
        </div>
        <div class="table-cell">
          <span class="cell-label">Serviço</span>
          <span>${escaparHTML(servico)}</span>
        </div>
        <div class="table-cell">
          <span class="cell-label">Barbeiro</span>
          <span>${escaparHTML(barbeiroNome)}</span>
        </div>
        <div class="table-cell">
          <span class="cell-label">Status</span>
          <span class="status-pill"><i class="status-dot ${statusInfo.dot}"></i>${statusInfo.texto}</span>
        </div>

        <div class="item-acoes table-cell">
          <span class="cell-label">Ações</span>
          <div class="acoes-botoes">
            ${acoesSolicitacao}
            ${podeEditar ? `<button class="btn-editar" title="Editar horário" aria-label="Editar horário" onclick="${editarAcao}">Editar</button>` : ""}
          </div>
        </div>
      </li>
    `;
  });
}


// ❌ CANCELAR
window.confirmarSolicitacao = async function (id) {
  const horario = horariosCadastrados.find(h => h.id === id);

  if (!horario) {
    mostrarMensagemAdmin("⚠️ Solicitação não encontrada.", "orange");
    return;
  }

  if (!confirm(`Confirmar agendamento de ${horario.nome || "cliente"} em ${formatarData(horario.data)} às ${horario.hora}?`)) {
    return;
  }

  await update(ref(db, "horarios/" + id), {
    status: "ocupado",
    confirmadoEm: new Date().toISOString(),
    canceladoEm: null
  });

  mostrarMensagemAdmin("✅ Agendamento confirmado.", "lightgreen");
};

window.finalizarAgendamento = async function (id) {
  const horario = horariosCadastrados.find(h => h.id === id);

  if (!horario) {
    mostrarMensagemAdmin("⚠️ Agendamento não encontrado.", "orange");
    return;
  }

  if (horario.status !== "ocupado") {
    mostrarMensagemAdmin("⚠️ Apenas agendamentos confirmados podem ser finalizados.", "orange");
    return;
  }

  if (!confirm(`Finalizar serviço de ${horario.nome || "cliente"} em ${formatarData(horario.data)} às ${horario.hora}?`)) {
    return;
  }

  await update(ref(db, "horarios/" + id), {
    status: "finalizado",
    valorServico: obterValorHorario(horario),
    finalizadoEm: new Date().toISOString()
  });

  mostrarMensagemAdmin("✅ Serviço finalizado e lançado no financeiro.", "lightgreen");
};

window.cancelarSolicitacao = async function (id) {
  const horario = horariosCadastrados.find(h => h.id === id);

  if (!horario) {
    mostrarMensagemAdmin("⚠️ Solicitação não encontrada.", "orange");
    return;
  }

  if (!confirm(`Cancelar solicitação de ${horario.nome || "cliente"} em ${formatarData(horario.data)} às ${horario.hora}?`)) {
    return;
  }

  const telefone = String(horario.telefone || "").replace(/\D/g, "");
  const telefoneWhatsApp = telefone.startsWith("55") ? telefone : `55${telefone}`;
  const mensagem = `Olá, ${horario.nome || "tudo bem"}. Não estaremos disponíveis nesse horário. Deseja escolher outra data/horário? Se sim, escolha novamente no site.`;
  const urlWhatsApp = telefone
    ? `https://wa.me/${telefoneWhatsApp}?text=${encodeURIComponent(mensagem)}`
    : "";

  await update(ref(db, "horarios/" + id), {
    status: "cancelado",
    canceladoEm: new Date().toISOString()
  });
  await liberarHorarioSeFuturo(horario);

  if (urlWhatsApp) {
    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
  } else {
    mostrarMensagemAdmin("Solicitação cancelada, mas o cliente não possui telefone cadastrado.", "orange");
    return;
  }

  mostrarMensagemAdmin("Solicitação cancelada e horário liberado.", "orange");
};

window.cancelar = async function (id) {
  const horario = horariosCadastrados.find(h => h.id === id);

  if (!horario) {
    mostrarMensagemAdmin("⚠️ Agendamento não encontrado.", "orange");
    return;
  }

  if (!confirm("Cancelar esse agendamento e liberar o horário?")) {
    return;
  }

  await update(ref(db, "horarios/" + id), {
    status: "cancelado",
    canceladoEm: new Date().toISOString()
  });
  await liberarHorarioSeFuturo(horario);

  mostrarMensagemAdmin("Agendamento cancelado e horário liberado.", "orange");
};

window.editarAgendamentoConfirmado = function (id) {
  const horario = horariosCadastrados.find(h => h.id === id);

  if (!horario || horario.status !== "ocupado") {
    mostrarMensagemAdmin("⚠️ Agendamento confirmado não encontrado.", "orange");
    return;
  }

  editarAgendamentoId.value = id;
  editarAgendamentoData.value = horario.data || "";
  editarAgendamentoHora.value = horario.hora || "";
  editarAgendamentoBarbeiro.value = horario.barber || "";
  editarAgendamentoNome.value = horario.nome || "";
  editarAgendamentoTelefone.value = horario.telefone || "";
  renderizarSelectServicos();
  servicosEdicaoSelecionados = obterServicosDoHorario(horario);
  editarAgendamentoServico.value = "";
  renderizarServicosEdicao();
  msgEditarAgendamento.textContent = "";

  if (typeof modalEditarAgendamento.showModal === "function") {
    modalEditarAgendamento.showModal();
  } else {
    modalEditarAgendamento.setAttribute("open", "");
  }
};

function fecharModalEditarAgendamento() {
  formEditarAgendamento?.reset();
  servicosEdicaoSelecionados = [];
  renderizarServicosEdicao();
  if (modalEditarAgendamento?.open) {
    modalEditarAgendamento.close();
  }
}

btnFecharModalAgendamento?.addEventListener("click", fecharModalEditarAgendamento);
btnCancelarModalAgendamento?.addEventListener("click", fecharModalEditarAgendamento);

modalEditarAgendamento?.addEventListener("click", (event) => {
  if (event.target === modalEditarAgendamento) {
    fecharModalEditarAgendamento();
  }
});

btnAdicionarServicoAgendamento?.addEventListener("click", () => {
  const nome = editarAgendamentoServico.value;
  const servicoSelecionado = obterServicoPorNome(nome);

  if (!nome || !servicoSelecionado) {
    msgEditarAgendamento.textContent = "Escolha um serviço para adicionar.";
    msgEditarAgendamento.style.color = "orange";
    return;
  }

  servicosEdicaoSelecionados.push({
    nome: servicoSelecionado.nome,
    preco: Number(servicoSelecionado.preco || 0)
  });
  editarAgendamentoServico.value = "";
  msgEditarAgendamento.textContent = "";
  renderizarServicosEdicao();
});

btnCancelarHorarioModal?.addEventListener("click", async () => {
  const id = editarAgendamentoId.value;

  if (!id) return;
  fecharModalEditarAgendamento();
  await window.cancelar(id);
});

btnExcluirRegistroModal?.addEventListener("click", async () => {
  const id = editarAgendamentoId.value;

  if (!id || !confirm("Excluir esse registro do painel?")) return;

  await remove(ref(db, "horarios/" + id));
  fecharModalEditarAgendamento();
  mostrarMensagemAdmin("Registro excluído.", "orange");
});

formEditarAgendamento?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = editarAgendamentoId.value;
  const data = editarAgendamentoData.value;
  const hora = editarAgendamentoHora.value;
  const barber = editarAgendamentoBarbeiro.value;
  const nome = editarAgendamentoNome.value.trim();
  const telefone = editarAgendamentoTelefone.value.trim();
  const servico = servicosEdicaoSelecionados.map((servicoItem) => servicoItem.nome).join(", ");
  const valorServico = servicosEdicaoSelecionados.reduce((total, servicoItem) => total + Number(servicoItem.preco || 0), 0);

  if (!id || !data || !hora || !barber || !nome || !telefone || servicosEdicaoSelecionados.length === 0) {
    msgEditarAgendamento.textContent = "Preencha todos os campos.";
    msgEditarAgendamento.style.color = "orange";
    return;
  }

  if (dataHoraJaPassou(data, hora)) {
    msgEditarAgendamento.textContent = "Escolha um horário futuro.";
    msgEditarAgendamento.style.color = "orange";
    return;
  }

  if (existeConflitoAgendamento({ id, data, hora, barber })) {
    msgEditarAgendamento.textContent = "Já existe solicitação, confirmação ou bloqueio nesse horário.";
    msgEditarAgendamento.style.color = "orange";
    return;
  }

  await update(ref(db, "horarios/" + id), {
    data,
    hora,
    barber,
    nome,
    telefone,
    servico,
    servicos: servicosEdicaoSelecionados,
    valorServico,
    status: "ocupado",
    tipoBloqueio: null,
    atualizadoEm: new Date().toISOString()
  });

  fecharModalEditarAgendamento();
  mostrarMensagemAdmin("✅ Agendamento atualizado.", "lightgreen");
});

window.editarHorarioPadrao = function (data, hora, barberNome) {
  horarioEditandoId = null;
  dataAtivaAdmin = data;
  inputData.value = data;
  inputHora.value = hora;
  statusHorario.value = "livre";
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("servico").value = "";
  barbeiro.value = barberNome || "";

  const [ano, mes] = data.split("-");
  mesVisivelAdmin = new Date(Number(ano), Number(mes) - 1, 1);

  horariosLote.value = "";
  horaInicio.value = "";
  horaFim.value = "";
  btnSalvarHorario.textContent = "Salvar ajuste";
  btnCancelarEdicao.classList.remove("hidden");
  atualizarCamposCliente();
  atualizarPassoHora();
  renderizarCalendarioAdmin();
  renderizarHorarios(horariosCadastrados);
  abrirSecaoPainel("horarios");
  mostrarMensagemAdmin("Ajustando horário padrão.", "#f1c94d");
};

window.bloquearHorarioPadrao = async function (data, hora, barberNome) {
  if (!confirm(`Bloquear ${hora} de ${formatarData(data)} para ${barberNome}?`)) {
    return;
  }

  await push(ref(db, "horarios"), {
    data,
    hora,
    nome: null,
    telefone: null,
    servico: null,
    valorServico: null,
    status: "bloqueado",
    barber: barberNome,
    tipoBloqueio: "horario"
  });

  mostrarMensagemAdmin("Horário bloqueado.", "orange");
};


// ✏️ EDITAR
window.editarHorario = function (id) {
  const horario = horariosCadastrados.find(h => h.id === id);

  if (!horario) {
    mostrarMensagemAdmin("⚠️ Horário não encontrado.", "orange");
    return;
  }

  horarioEditandoId = id;
  dataAtivaAdmin = horario.data;
  inputData.value = horario.data;
  inputHora.value = horario.hora;
  statusHorario.value = horario.status;
  document.getElementById("nome").value = horario.nome || "";
  document.getElementById("telefone").value = horario.telefone || "";
  document.getElementById("servico").value = horario.servico || "";
  barbeiro.value = horario.barber || ""; // Preenche o barbeiro

  const [ano, mes] = horario.data.split("-");
  mesVisivelAdmin = new Date(Number(ano), Number(mes) - 1, 1);

  horariosLote.value = "";
  horaInicio.value = "";
  horaFim.value = "";
  btnSalvarHorario.textContent = "Salvar alterações";
  btnCancelarEdicao.classList.remove("hidden");
  atualizarCamposCliente();
  atualizarPassoHora();
  renderizarCalendarioAdmin();
  renderizarHorarios(horariosCadastrados);

  abrirSecaoPainel("horarios");
  document.querySelector(".form-card").scrollIntoView({ behavior: "smooth", block: "start" });
  mostrarMensagemAdmin("Editando horário selecionado.", "#f1c94d");
};

window.cancelarEdicao = function () {
  limparFormularioAdmin(true);
  renderizarHorarios(horariosCadastrados);
  mostrarMensagemAdmin("Edição cancelada.", "orange");
};


// 🗑 EXCLUIR
window.excluir = function (id) {
  if (confirm("Excluir horário?")) {
    remove(ref(db, "horarios/" + id));

    mostrarMensagemAdmin("🗑️ Horário excluído!", "orange");
  }
};


// 🚪 LOGOUT
window.logout = function () {
  if (!confirm("Tem certeza de que deseja sair da sua conta?")) return;

  signOut(auth);
};

// 🗑 EXCLUIR TUDO
window.excluirTodos = function () {
  if (confirm("⚠️ ATENÇÃO: Você tem certeza que deseja excluir TODOS os horários cadastrados (livres e marcados)? Esta ação não pode ser desfeita.")) {
    remove(ref(db, "horarios"))
      .then(() => {
        mostrarMensagemAdmin("🗑️ Agenda totalmente limpa!", "orange");
      })
      .catch(() => mostrarMensagemAdmin("❌ Falha ao excluir agenda.", "red"));
  }
};
