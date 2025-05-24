window.addEventListener('load', () => {
    const modal_edit = document.getElementById('modal_edit');
    const btn_abrir_modal_edit = document.getElementById('abrir_modal_edit');
    const btn_fechar_modal_edit = document.getElementById('fechar_modal_edit');
    const datalistServicosEditar = document.getElementById('listaServicosEditar');
    const btn_update = document.getElementById('btn_editar');
    
    

    let profissionais = [];

 
    window.mapaNomeId = {};


    btn_abrir_modal_edit.addEventListener('click', () => {
        modal_edit.style.display = 'flex';
    });

   
    btn_fechar_modal_edit.addEventListener('click', () => {
        modal_edit.style.display = 'none';
    });



    async function carregarProfissionais() {
        datalistServicosEditar.innerHTML = '';
        window.mapaNomeId = {};

        try {
            const empresa = sessionStorage.getItem('empresa');
            if (!empresa) {
                console.error('Empresa não encontrada no sessionStorage.');
                return;
            }

            const resposta = await fetch(`https://api-barretoapps.onrender.com/lista_procedimento/${empresa}`);
            if (!resposta.ok) {
                throw new Error('Erro ao carregar profissionais: ' + resposta.status);
            }

            const dados = await resposta.json();
            servicos = dados.data;

            profissionais = servicos;

            servicos.forEach(servico => {
                const option = document.createElement("option");
                option.value = servico.procedimento;
                datalistServicosEditar.appendChild(option);
                window.mapaNomeId[servico.procedimento] = servico.id;
            });

        } catch (error) {
            console.error("Erro ao carregar profissionais:", error);
        }
    }

    const inputProfissional = document.getElementById('profissional_editar');

    inputProfissional.addEventListener('change', () => {
        const procedimento = inputProfissional.value.trim();
        const servicoId = window.mapaNomeId[procedimento];

        if (!servicoId) {
            alert('Serviço não encontrado.');
            return;
        }

        const servico = profissionais.find(p => p.id === servicoId);

        if (!servico) {
            alert('Serviço não encontrado.');
            return;
        }

        document.getElementById('nome_editar').value = servico.procedimento;
        document.getElementById('telefone_editar').value = servico.valor;
    });

    btn_update.addEventListener("click", async () => {
        const servico_editado = document.getElementById('nome_editar').value.trim();
        const valor_editado = document.getElementById('telefone_editar').value.trim();
    
        const nome = inputProfissional.value.trim();
        const servicoId = window.mapaNomeId[nome];



    
        if (!servicoId) {
            alert("Selecione um serviço válido!");
            return;
        }
    
        try {
            const response = await fetch(`https://api-barretoapps.onrender.com/update_procedimento/${servicoId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    procedimento: servico_editado,
                    valor: valor_editado
                })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Cadastro Alterado Com Sucesso!');
            }
    
            await carregarProfissionais();
            inputProfissional.value = "";
            modal_edit.style.display = "none";
    
            window.location.reload();
    
        } catch (error) {
            console.error("Erro ao atualizar serviço:", error);
            alert(error.message || "Erro inesperado");
        }
    });
    

    carregarProfissionais();
});
