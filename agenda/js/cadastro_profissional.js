window.addEventListener('load', function () {

    const btn_abrir_modal = document.getElementById("abrir_modal");
    const btn_cadastrar = document.getElementById("btn_cadastrar");
    const btn_fechar_modal = document.getElementById("fechar_modal");

    

    function atualizarUser() {
        return sessionStorage.getItem("user_name") || "Usuário desconhecido";
    }

    let user_name = atualizarUser();

    window.addEventListener("storage", function () {
        user_name = atualizarUser();
    });


    btn_abrir_modal.addEventListener("click", () => {

        const modal = document.querySelector(".modal_novo_profissional").style.display = "flex";


    });

    btn_fechar_modal.addEventListener("click", function () {

        const modal = document.querySelector(".modal_novo_profissional").style.display = "none";

    });


    

    btn_cadastrar.addEventListener("click", async function (e) {

        e.preventDefault();

        const profissional = document.getElementById('profissional').value;
        const telefone = document.getElementById('telefone').value;
        const empresa = sessionStorage.getItem('empresa');
        const cor = document.getElementById("cor").value;

        

        if (!profissional || !telefone || !empresa || !cor) {
            alert("Por favor, preencha todos os campos.");

            return;
        }

        const novo_cadastro = {
            profissional,
            empresa,
            telefone,
            cor
        };

        try {
            const response = await fetch("https://api-barretoapps.onrender.com/input_profissional", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novo_cadastro)
            });

            if (!response.ok) throw new Error("Erro ao Cadastrar Profissional.");


            Lista_Profissional();
            window.location.href = 'cadastro_profissional.html';
            const modal = document.querySelector(".modal_novo_profissional").style.display = "none";
        } catch (error) {
            alert("Erro ao conectar com o servidor: " + error.message);
        }
    });


    Lista_Profissional();
});

async function Lista_Profissional() {
    try {
        const empresa = sessionStorage.getItem('empresa');
        if (!empresa) {
            console.error('Empresa não encontrada no sessionStorage.');
            return;
        }

        const resposta = await fetch(`https://api-barretoapps.onrender.com/lista_profissional/${empresa}`);
        
        if (!resposta.ok) {
            throw new Error('Erro na requisição: ' + resposta.status);
        }

        const dados = await resposta.json();
        const lista = dados.data;



        const div = document.getElementById("profissionais_cadastrados");
        div.innerHTML = '';

        let tabela = document.createElement("table");
        tabela.border = "1";
        tabela.style.borderCollapse = "collapse";

        let thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
              <th>Profissional</th>
              <th>Telefone</th>
          </tr>
      `;
        tabela.appendChild(thead);

        let tbody = document.createElement("tbody");

        lista.forEach(profissional => {
            let linha = document.createElement("tr");
            linha.innerHTML = `
              <td>${profissional.profissional}</td>
              <td>${profissional.telefone}</td>
          `;
            tbody.appendChild(linha);
        });

        tabela.appendChild(tbody);

        div.appendChild(tabela);

    } catch (erro) {
        console.error('Erro ao fazer o fetch:', erro);
    }
}

