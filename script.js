// 🔥 FIREBASE
import { db } from "./firebase.js";
import { ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {

  console.log("SCRIPT OK 🔥");

  // 📱 MENU MOBILE
  const menuBtn = document.querySelector(".menu-mobile");
  const nav = document.querySelector("nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("active");
    });
  }

  // 📅 ELEMENTOS
  const calendario = document.getElementById("calendario");
  const horariosContainer = document.getElementById("horarios");
  const barbeiroSelecionadoInput = document.getElementById("barbeiroSelecionado"); // Novo input oculto
  const filtroBarbeiro = document.getElementById("filtroBarbeiro");

  let horariosBrutos = []; // Cache dos dados do Firebase

  // 🔥 FIREBASE LISTENER
  if (calendario && horariosContainer) {
    onValue(ref(db, "horarios"), (snapshot) => {
      console.log("DADOS FIREBASE:", snapshot.val());
      horariosBrutos = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          horariosBrutos.push(child.val());
        });
      }
      renderizarAgenda();
    });
  }

  // Função para renderizar com base no filtro
  function renderizarAgenda() {
      const barbeiroAtivo = filtroBarbeiro.value;
      calendario.innerHTML = "";
      horariosContainer.innerHTML = "";

      // Filtra os dados de acordo com o barbeiro selecionado
      const dados = horariosBrutos.filter(h => 
        barbeiroAtivo === "todos" || h.barber === barbeiroAtivo
      );

      const dias = {};

      dados.forEach(h => {
        if (!dias[h.data]) dias[h.data] = [];
        dias[h.data].push(h);
      });

      Object.keys(dias).forEach(data => {

        const diaDiv = document.createElement("div");
        diaDiv.classList.add("dia");

        const [ano, mes, dia] = data.split("-");
        diaDiv.innerHTML = `${dia}/${mes}`;

        const horariosDia = dias[data];

        const ocupados = horariosDia.filter(h => h.status === "ocupado");

        diaDiv.classList.add(ocupados.length >= horariosDia.length && horariosDia.length > 0 ? "ocupado" : "livre");

        diaDiv.addEventListener("click", () => {

          document.querySelectorAll(".dia")
            .forEach(d => d.classList.remove("selecionado"));

          diaDiv.classList.add("selecionado");
          mostrarHorarios(data, horariosDia);
        });

        calendario.appendChild(diaDiv);
      });
  }

  // Ouvinte para o seletor de filtro
  if (filtroBarbeiro) {
    filtroBarbeiro.addEventListener("change", renderizarAgenda);
  }

  // ⏰ MOSTRAR HORÁRIOS
  function mostrarHorarios(data, lista) {
    horariosContainer.innerHTML = "";

    lista.forEach(h => {
      const div = document.createElement("div");
      div.classList.add("horario");

      div.classList.add(h.status === "ocupado" ? "ocupado" : "livre");
      
      // Exibe a hora e o barbeiro
      div.innerHTML = `${h.hora} ${h.barber ? `<br><small>${h.barber}</small>` : ''}`;

      if (h.status !== "ocupado") {
        div.addEventListener("click", () => {

          document.querySelectorAll(".horario")
            .forEach(el => el.classList.remove("selecionado"));
          
          // Define o barbeiro selecionado no input oculto
          barbeiroSelecionadoInput.value = h.barber || "";

          div.classList.add("selecionado");

          document.getElementById("dataSelecionada").value = data;
          document.getElementById("horaSelecionada").value = h.hora;
        });
      }

      horariosContainer.appendChild(div);
    });
  }

  // 📲 FORMULÁRIO
  const form = document.querySelector(".form-agendamento");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      console.log("Tentando salvar...");

      const nome = form.querySelector("input[type='text']").value;
      const telefone = form.querySelector("input[type='tel']").value;
      const servico = form.querySelector("select").value;

      // 🔥 AGORA USA OS CAMPOS CORRETOS
      const data =
        document.getElementById("dataSelecionada").value ||
        form.querySelector("input[type='date']").value;
      const barbeiro = barbeiroSelecionadoInput.value; // Pega o barbeiro do input oculto

      const hora =
        document.getElementById("horaSelecionada").value ||
        form.querySelector("input[type='time']").value;

      if (!nome || !telefone || !servico || !data || !hora) {
        alert("Preencha todos os campos!");
        return; // Adicionado return para parar a execução
      }

      if (!barbeiro) {
        alert("Selecione um horário com um barbeiro disponível!");
        return; // Adicionado return para parar a execução
      }

      try {
        await push(ref(db, "horarios"), {
          nome,
          telefone,
          servico,
          data,
          hora,
          status: "ocupado",
          barber: barbeiro // Salva o barbeiro junto com o agendamento
        });

        console.log("SALVOU 🔥");

        const [ano, mes, dia] = data.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;

        const mensagem = `💈 *Agendamento Barbearia Abner* 💈

👤 Nome: ${nome}
📞 Telefone: ${telefone}
✂️ Serviço: ${servico}
📅 Data: ${dataFormatada}
👨‍🦰 Barbeiro: ${barbeiro}
⏰ Hora: ${hora}

⏳ Status: Aguardando confirmação da barbearia.`;

        const numero = "558193205690";

        const url =
          "https://api.whatsapp.com/send?phone=" +
          numero +
          "&text=" +
          encodeURIComponent(mensagem);

        // 🔥 pequeno delay opcional (seguro)
        setTimeout(() => {
          window.location.href = url;
        }, 500);

      } catch (error) {
        console.error("ERRO AO SALVAR:", error);
        alert("Erro ao salvar agendamento!");
      }
    });
  }

});