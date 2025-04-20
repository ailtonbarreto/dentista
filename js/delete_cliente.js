window.addEventListener("DOMContentLoaded", function () {
    const btnDelete = document.getElementById('btn_remove');
    const inputPaciente = document.getElementById('paciente_remover');
    const abrirModal = document.getElementById('abrir_modal_remove');
    const fecharModal = document.getElementById('fechar_modal_remove');
    const datalistPacientes = document.getElementById('listaPacientesRemover');
    const modal = document.querySelector(".modal_remove");

    // Mapa global entre nome e ID do paciente
    window.mapaNomeId = {};

    // Carrega pacientes e preenche o datalist + mapaNomeId
    async function carregarPacientes() {
        datalistPacientes.innerHTML = '';
        window.mapaNomeId = {}; // Zera o mapa global

        try {
            const resposta = await fetch("http://barretoapps.com.br:3004/lista_pacientes");
            const dados = await resposta.json();

            dados.data.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.nome;
                datalistPacientes.appendChild(option);
                window.mapaNomeId[paciente.nome] = paciente.id;
            });

            console.log("✅ Datalist carregado:", window.mapaNomeId);
        } catch (error) {
            console.error("❌ Erro ao carregar pacientes:", error);
        }
    }

    // Ação do botão de abrir modal
    abrirModal.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // Ação do botão de fechar modal
    fecharModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Ação do botão de deletar paciente
    btnDelete.addEventListener("click", async () => {
        const nome = inputPaciente.value.trim();
        const pacienteId = window.mapaNomeId[nome];

        if (!pacienteId) {
            alert("⚠️ Selecione um paciente válido!");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3004/delete/${pacienteId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erro ao excluir");

            alert(data.message || "Paciente removido com sucesso!");

            
            await carregarPacientes();
            inputPaciente.value = "";
            modal.style.display = "none";

            window.location.href = 'cadastro.html';

        } catch (error) {
            console.error("❌ Erro ao excluir paciente:", error);
            alert(error.message || "Erro inesperado");
        }
    });

    // Carrega lista ao iniciar
    carregarPacientes();
});
