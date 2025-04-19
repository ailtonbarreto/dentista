window.addEventListener('load', function () {

    const btn_abrir_modal = document.getElementById("abrir_modal");
    const btn_cadastrar = document.getElementById("btn_cadastrar");
    const btn_fechar_modal = document.getElementById("fechar_modal");

    const btn_abrir_modal_remove = document.getElementById('abrir_modal_remove');
    const btn_fechar_modal_remove = document.getElementById('fechar_modal_remove');

    const btn_dlt_paciente = document.getElementById('btn_remove');

    function atualizarUser() {
        return sessionStorage.getItem("user_name") || "Usuário desconhecido";
    }

    let user_name = atualizarUser();

    window.addEventListener("storage", function () {
        user_name = atualizarUser();
    });


    btn_abrir_modal.addEventListener("click", () => {

        const modal = document.querySelector(".modal").style.display = "flex";


    });

    btn_fechar_modal.addEventListener("click", function () {

        const modal = document.querySelector(".modal").style.display = "none";

    });

    btn_fechar_modal_remove.addEventListener("click", () => {

        const modal_remove = document.querySelector(".modal_remove").style.display = "none";


    });



    let mapaNomeId = {};

    btn_abrir_modal_remove.addEventListener("click", () => {

        document.querySelector(".modal_remove").style.display = "flex";

        PopularDatalistPacientesRemover();
    });

    async function PopularDatalistPacientesRemover() {

        const datalist = document.getElementById("listaPacientesRemover");
        if (!datalist) return;

        datalist.innerHTML = '';
        mapaNomeId = {};

        try {
            const resposta = await fetch("http://barretoapps.com.br:3004/lista_pacientes");
            const dados = await resposta.json();

            dados.data.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.nome;
                datalist.appendChild(option);
                mapaNomeId[paciente.nome] = paciente.id;
            });
        } catch (error) {
            console.error("Erro ao carregar datalist de pacientes:", error);
        }
    }

    btn_dlt_paciente.addEventListener('click', async () => {
        const nomeDigitado = document.getElementById("paciente_remover").value;
        const idPacienteSelecionado = mapaNomeId[nomeDigitado];
    
        if (!idPacienteSelecionado) {
            console.log("Paciente não encontrado no mapa.");
            alert("Paciente não encontrado.");
            return;
        }
    
        if (confirm(`Tem certeza que deseja excluir o paciente ${nomeDigitado}?`)) {
            try {
                const response = await fetch(`http://barretoapps.com.br:3004/delete_cliente/${idPacienteSelecionado}`, {
                    method: 'DELETE',
                });
    
                if (!response.ok) {
                    throw new Error(`Erro ao excluir paciente. Status: ${response.status}`);
                }
    
                // Tente pegar a resposta JSON apenas se o status for ok
                const responseBody = await response.json();
                alert(responseBody.message || "Paciente excluído com sucesso!");
    
                // Chama a função para atualizar a lista de pacientes
                Lista_pacientes();
    
            } 
            
            catch (error) {
                console.error('Erro ao comunicar com o servidor:', error);
                alert('Erro ao comunicar com o servidor: ' + error.message);
            }
        }
    });
    

    btn_cadastrar.addEventListener("click", async function (e) {

        e.preventDefault();

        const nome = document.getElementById('paciente').value;
        const data_nascimento = document.getElementById('data').value;
        const telefone = document.getElementById('fone').value;
        const genero = document.getElementById('genero').value;

        if (!nome || !data_nascimento || !telefone || !genero) {
            alert("Por favor, preencha todos os campos.");

            return;
        }

        const novo_cadastro = {
            nome,
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
            PopularDatalistPacientesRemover();
            const modal = document.querySelector(".modal").style.display = "none";
        } catch (error) {
            alert("Erro ao conectar com o servidor: " + error.message);
        }
    });


    Lista_pacientes();
});

async function Lista_pacientes() {

    try {
        const resposta = await fetch("http://barretoapps.com.br:3004/lista_pacientes");
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
              <th>Nome Completo</th>
              <th>Data de Nascimento</th>
              <th>Gênero</th>
              <th>Telefone</th>
          </tr>
      `;
        tabela.appendChild(thead);

        let tbody = document.createElement("tbody");

        function formatarDataISOParaBR(dataISOCompleta) {
            const data = dataISOCompleta.split("T")[0];
            const [ano, mes, dia] = data.split("-");
            return `${dia}/${mes}/${ano}`;
        }


        lista.forEach(paciente => {
            let linha = document.createElement("tr");
            linha.innerHTML = `
              <td>${paciente.nome}</td>
              <td>${formatarDataISOParaBR(paciente.data_nascimento)}</td>
              <td>${paciente.genero}</td>
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
