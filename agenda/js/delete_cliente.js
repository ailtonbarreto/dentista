window.addEventListener("DOMContentLoaded", function () {
    const btnDelete = document.getElementById('btn_remove');
    const inputPaciente = document.getElementById('paciente_remover');
    const abrirModal = document.getElementById('abrir_modal_remove');
    const fecharModal = document.getElementById('fechar_modal_remove');
    const datalistPacientes = document.getElementById('listaPacientesRemover');
    const modal = document.querySelector(".modal_remove");


    window.mapaNomeId = {};

   
    async function carregarPacientes() {
        datalistPacientes.innerHTML = '';
        window.mapaNomeId = {};
    
        try {
            const empresa = sessionStorage.getItem('empresa');
            if (!empresa) {
                console.error('Empresa não encontrada no sessionStorage.');
                return;
            }
    
            const resposta = await fetch(`https://api-barretoapps.onrender.com/lista_pacientes/${empresa}`);
            if (!resposta.ok) {
                throw new Error('Erro ao carregar pacientes: ' + resposta.status);
            }
    
            const dados = await resposta.json();
    
            dados.data.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.nome;
                datalistPacientes.appendChild(option);
                window.mapaNomeId[paciente.nome] = paciente.id;
            });
    
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        }
    }
    

  
    abrirModal.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    
    fecharModal.addEventListener("click", () => {
        modal.style.display = "none";
    });


    btnDelete.addEventListener("click", async () => {

        const nome = inputPaciente.value.trim();
        
        const pacienteId = window.mapaNomeId[nome];

        if (!pacienteId) {
            alert("Selecione um paciente válido!");
            return;
        }

        try {
            const response = await fetch(`https://api-barretoapps.onrender.com/delete/${pacienteId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erro ao excluir");

            
            await carregarPacientes();
            inputPaciente.value = "";
            modal.style.display = "none";

            window.location.href = 'cadastro.html';

        } catch (error) {
            console.error("Erro ao excluir paciente:", error);
            alert(error.message || "Erro inesperado");
        }
    });

    carregarPacientes();
});
