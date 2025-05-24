window.addEventListener("DOMContentLoaded", function () {
    const btnDelete = document.getElementById('btn_remove');
    const inputPaciente = document.getElementById('profissional_remover');
    const abrirModal = document.getElementById('abrir_modal_remove');
    const fecharModal = document.getElementById('fechar_modal_remove');
    const datalistServicos = document.getElementById('listaServicosRemover');
    const modal = document.querySelector(".modal_remove");


    window.mapaNomeId = {};

   
    async function carregarProfissionais() {
        datalistServicos.innerHTML = '';
        window.mapaNomeId = {};
    
        try {
            const empresa = sessionStorage.getItem('empresa');
            if (!empresa) {
                console.error('Empresa não encontrada no sessionStorage.');
                return;
            }
    
            const resposta = await fetch(`https://api-barretoapps.onrender.com/lista_procedimento/${empresa}`);
            if (!resposta.ok) {
                throw new Error('Erro ao carregar pacientes: ' + resposta.status);
            }
    
            const dados = await resposta.json();
    
            dados.data.forEach(servico => {
                const option = document.createElement("option");
                option.value = servico.procedimento;
                datalistServicos.appendChild(option);
                window.mapaNomeId[servico.procedimento] = servico.id;
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
        
        const servicoId = window.mapaNomeId[nome];

        if (!servicoId) {
            alert("Selecione um profissional válido!");
            return;
        }

        try {
            const response = await fetch(`https://api-barretoapps.onrender.com/delete_servico/${servicoId}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erro ao excluir");

            
            await carregarProfissionais();
            inputPaciente.value = "";
            modal.style.display = "none";

            window.location.reload();

        } catch (error) {
            console.error("Erro ao excluir paciente:", error);
            alert(error.message || "Erro inesperado");
        }
    });

    carregarProfissionais();
});
