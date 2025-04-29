window.addEventListener("DOMContentLoaded", function () {
    const btnDelete = document.getElementById('btn_remove');
    const inputPaciente = document.getElementById('profissional_remover');
    const abrirModal = document.getElementById('abrir_modal_remove');
    const fecharModal = document.getElementById('fechar_modal_remove');
    const datalistProfissionais = document.getElementById('listaProfissionaisRemover');
    const modal = document.querySelector(".modal_remove");


    window.mapaNomeId = {};

   
    async function carregarProfissionais() {
        datalistProfissionais.innerHTML = '';
        window.mapaNomeId = {};
    
        try {
            const empresa = sessionStorage.getItem('empresa');
            if (!empresa) {
                console.error('Empresa não encontrada no sessionStorage.');
                return;
            }
    
            const resposta = await fetch(`http://127.0.0.1:3000/lista_profissional/${empresa}`);
            if (!resposta.ok) {
                throw new Error('Erro ao carregar pacientes: ' + resposta.status);
            }
    
            const dados = await resposta.json();
    
            dados.data.forEach(profissional => {
                const option = document.createElement("option");
                option.value = profissional.profissional;
                datalistProfissionais.appendChild(option);
                window.mapaNomeId[profissional.profissional] = profissional.id;
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
        
        const profisionalId = window.mapaNomeId[nome];

        if (!profisionalId) {
            alert("Selecione um profissional válido!");
            return;
        }

        try {
            const response = await fetch(`http://127.0.0.1:3000/delete_profissional/${profisionalId}`, {
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
