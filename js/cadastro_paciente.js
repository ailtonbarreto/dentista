window.addEventListener('load', function () {
  const btn_agendar = document.getElementById("btn_agendar");
  const spinner = document.getElementById("spinner");

  function atualizarUser() {
      return sessionStorage.getItem("user_name") || "Usuário desconhecido";
  }

  let user_name = atualizarUser();

  window.addEventListener("storage", function () {
      user_name = atualizarUser();
  });

  btn_agendar.addEventListener("click", async function (e) {
      e.preventDefault();

      spinner.style.display = "flex";

      const nome = document.getElementById('paciente').value;
      const sobrenome = document.getElementById('sobrenome').value;
      const data_nascimento = document.getElementById('data').value;
      const telefone = document.getElementById('fone').value;
      const genero = document.getElementById('genero').value;

      if (!nome || !data_nascimento || !telefone || !genero) {
          alert("Por favor, preencha todos os campos.");
          spinner.style.display = "none";
          return;
      }

      const novo_cadastro = {
          nome,
          sobrenome,
          data_nascimento,
          telefone,
          genero
      };

      try {
          const response = await fetch("http://barretoapps.com.br:3004/input_paciente", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(novo_cadastro)
          });

          if (!response.ok) throw new Error("Erro ao Cadastrar Paciente.");

          Lista_pacientes();
      } catch (error) {
          alert("Erro ao conectar com o servidor: " + error.message);
      } finally {
          spinner.style.display = "none";
      }
  });


  Lista_pacientes();
});

async function Lista_pacientes() {

  try {
      const resposta = await fetch("http://localhost:3000/lista_pacientes");
      if (!resposta.ok) {
          throw new Error('Erro na requisição: ' + resposta.status);
      }

      const dados = await resposta.json();
      const lista = dados.data;


      const div = document.getElementById("pacientes_cadastrados");
      div.innerHTML = '';

      let tabela = document.createElement("table");
      tabela.border = "1";
      tabela.style.borderCollapse = "collapse";

      let thead = document.createElement("thead");
      thead.innerHTML = `
          <tr>
              <th>Nome</th>
              <th>Sobrenome</th>
              <th>Gênero</th>
              <th>Data de Nascimento</th>
              <th>Telefone</th>
          </tr>
      `;
      tabela.appendChild(thead);

      let tbody = document.createElement("tbody");

      lista.forEach(paciente => {
          let linha = document.createElement("tr");
          linha.innerHTML = `
              <td>${paciente.nome}</td>
              <td>${paciente.sobrenome}</td>
              <td>${paciente.genero}</td>
              <td>${new Date(paciente.data_nascimento).toLocaleDateString()}</td>
              <td>${paciente.telefone}</td>
          `;
          tbody.appendChild(linha);
      });

      tabela.appendChild(tbody);

      div.appendChild(tabela);

  } catch (erro) {
      console.error('Erro ao fazer o fetch:', erro);
  }
}
