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

  // 🔥 FIREBASE LISTENER
  if (calendario && horariosContainer) {
    onValue(ref(db, "horarios"), (snapshot) => {

      console.log("DADOS FIREBASE:", snapshot.val());

      calendario.innerHTML = "";
      horariosContainer.innerHTML = "";

      let dados = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          dados.push(child.val());
        });
      }

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

        const ocupados = horariosDia.filter(h => h.status === "agendado");

        diaDiv.classList.add(ocupados.length ? "ocupado" : "livre");

        diaDiv.addEventListener("click", () => {

          document.querySelectorAll(".dia")
            .forEach(d => d.classList.remove("selecionado"));

          diaDiv.classList.add("selecionado");
          mostrarHorarios(data, horariosDia);
        });

        calendario.appendChild(diaDiv);
      });

    });
  }

  // ⏰ MOSTRAR HORÁRIOS
  function mostrarHorarios(data, lista) {
    horariosContainer.innerHTML = "";

    lista.forEach(h => {
      const div = document.createElement("div");
      div.classList.add("horario");

      div.classList.add(h.status === "agendado" ? "ocupado" : "livre");

      div.innerText = h.hora;

      if (h.status !== "agendado") {
        div.addEventListener("click", () => {

          document.querySelectorAll(".horario")
            .forEach(el => el.classList.remove("selecionado"));

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

      const hora =
        document.getElementById("horaSelecionada").value ||
        form.querySelector("input[type='time']").value;

      if (!nome || !telefone || !servico || !data || !hora) {
        alert("Preencha todos os campos!");
        return;
      }

      try {
        await push(ref(db, "horarios"), {
          nome,
          telefone,
          servico,
          data,
          hora,
          status: "agendado"
        });

        console.log("SALVOU 🔥");

        const [ano, mes, dia] = data.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;

        const mensagem = `💈 *Agendamento Barbearia Abner* 💈

👤 Nome: ${nome}
📞 Telefone: ${telefone}
✂️ Serviço: ${servico}
📅 Data: ${dataFormatada}
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