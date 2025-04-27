window.addEventListener('load', () => {

    const modal_edit = document.getElementById('modal_edit');
    const btn_abrir_modal_edit = document.getElementById('abrir_modal_edit');
    const btn_fechar_modal_edit = document.getElementById('fechar_modal_edit')
    const datalistPacientesEditar = document.getElementById('listaPacientesEditar');
    const btn_update = document.getElementById('btn_editar');

    // ------------------------------------------------------------------------------------

    btn_abrir_modal_edit.addEventListener('click', () => {

        modal_edit.style.display = 'flex';

    });


    // ------------------------------------------------------------------------------------

    btn_fechar_modal_edit.addEventListener('click', () => {

        modal_edit.style.display = 'none';

    });

    // ------------------------------------------------------------------------------------

    async function carregarPacientes() {

        datalistPacientesEditar.innerHTML = '';

        window.mapaNomeId = {};

        try {
            const resposta = await fetch("https://barretoapps.com.br/lista_pacientes");

            
            const dados = await resposta.json();
            pacientes = dados.data;


            dados.data.forEach(paciente => {

                const option = document.createElement("option");

                option.value = paciente.nome;
                datalistPacientesEditar.appendChild(option);

                window.mapaNomeId[paciente.nome] = paciente.id;
            });

        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        }
    }

    const inputPaciente = document.getElementById('paciente_editar');

    inputPaciente.addEventListener('change', () => {

        const nome = inputPaciente.value.trim();

        const pacienteId = window.mapaNomeId[nome];


        if (!pacienteId) {
            alert('Paciente não encontrado.');
            return;
        }

        const paciente = pacientes.find(p => p.id === pacienteId);


        if (!paciente) {
            alert('Paciente não encontrado.');
            return;
        }


        document.getElementById('nome_editar').value = paciente.nome;
        
        
        const dataNascimento = new Date(paciente.data_nascimento);
        if (!isNaN(dataNascimento)) {
            document.getElementById('data_nasc_editar').value = dataNascimento.toISOString().split('T')[0];
        } else {
            console.error('Data inválida:', paciente.data_nascimento);
        }


        document.getElementById('telefone_editar').value = paciente.telefone;
        document.getElementById('genero_editar').value = paciente.genero;
    });


    btn_update.addEventListener("click", async () => {
        const inputPaciente = document.getElementById('paciente_editar');
        const nome_editado = document.getElementById('nome_editar').value.trim();
        const data_nascimento = document.getElementById('data_nasc_editar').value;
        const telefone_editar = document.getElementById('telefone_editar').value.trim();
        const genero_editar = document.getElementById('genero_editar').value;

        const nome = inputPaciente.value.trim();
        const pacienteId = window.mapaNomeId[nome];

        console.log(pacienteId);

        if (!pacienteId) {
            alert("Selecione um paciente válido!");
            return;
        }

        try {
            const response = await fetch(`https://barretoapps.com.br/update_cadastro/${pacienteId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome_editado,
                    data_nascimento: data_nascimento,
                    telefone: telefone_editar,
                    genero: genero_editar
                })
            });

            const data = await response.json();

            if (response.ok) { alert('Cadastro Alterado Com Sucesso!') };

            await carregarPacientes();
            inputPaciente.value = "";

            modal_edit.style.display = "none";

            window.location.href = 'cadastro.html';

        } catch (error) {
            console.error("Erro ao atualizar paciente:", error);
            alert(error.message || "Erro inesperado");
        }
    });

    carregarPacientes();


})