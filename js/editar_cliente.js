window.addEventListener('load', ()=>{

    const modal_edit = document.getElementById('modal_edit');
    const btn_abrir_modal_edit = document.getElementById('abrir_modal_edit');
    const btn_fechar_modal_edit = document.getElementById('fechar_modal_edit')
    const datalistPacientesEditar = document.getElementById('listaPacientesEditar');

    // ------------------------------------------------------------------------------------

    btn_abrir_modal_edit.addEventListener('click', ()=>{

        modal_edit.style.display = 'flex';

    });


    // ------------------------------------------------------------------------------------

    btn_fechar_modal_edit.addEventListener('click', ()=>{

        modal_edit.style.display = 'none';

    });

    // ------------------------------------------------------------------------------------

    async function carregarPacientes() {

        datalistPacientesEditar.innerHTML = '';
        window.mapaNomeId = {};

        try {
            const resposta = await fetch("https://barretoapps.com.br/lista_pacientes");
            const dados = await resposta.json();

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

    carregarPacientes();

})