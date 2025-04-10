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


    // async function excluirReserva(event) {
    //     spinner.style.display = "flex";

    //     const idReserva = event.target.dataset.id;

    //     try {
    //         const response = await fetch(`https://api-localizacao-e69z.onrender.com/delete_agendamento/${idReserva}`, {
    //             method: "DELETE",
    //         });

    //         if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);

    //         document.getElementById('data').dispatchEvent(new Event('change'));
    //     } catch (error) {
    //         alert("Erro ao excluir reserva: " + error.message);
    //     } finally {
    //         spinner.style.display = "none";
    //     }
    // }

    btn_agendar.addEventListener("click", async function (e) {
        e.preventDefault();
        const spinner = document.getElementById("spinner");
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
            const response = await fetch("https://api-localizacao-e69z.onrender.com/input_paciente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novo_cadastro)
            });

            if (!response.ok) throw new Error("Erro ao Cadastrar Paciente.");

        } catch (error) {
            alert("Erro ao conectar com o servidor: " + error.message);
        } finally {
            spinner.style.display = "none";
        }
    });


});


