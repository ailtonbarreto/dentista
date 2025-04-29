window.addEventListener('load', () => {
    const modal_edit = document.getElementById('modal_edit');
    const btn_abrir_modal_edit = document.getElementById('abrir_modal_edit');
    const btn_fechar_modal_edit = document.getElementById('fechar_modal_edit');
    const datalistProfissionaisEditar = document.getElementById('listaProfissioanaisEditar');
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
        datalistProfissionaisEditar.innerHTML = '';
        window.mapaNomeId = {};

        try {
            const empresa = sessionStorage.getItem('empresa');
            if (!empresa) {
                console.error('Empresa não encontrada no sessionStorage.');
                return;
            }

            const resposta = await fetch(`https://barretoapps.com.br/lista_profissional/${empresa}`);
            if (!resposta.ok) {
                throw new Error('Erro ao carregar profissionais: ' + resposta.status);
            }

            const dados = await resposta.json();
            profissionais = dados.data;

            profissionais.forEach(profissional => {
                const option = document.createElement("option");
                option.value = profissional.profissional;
                datalistProfissionaisEditar.appendChild(option);
                window.mapaNomeId[profissional.profissional] = profissional.id;
            });

        } catch (error) {
            console.error("Erro ao carregar profissionais:", error);
        }
    }

    const inputProfissional = document.getElementById('profissional_editar');

    inputProfissional.addEventListener('change', () => {
        const nome = inputProfissional.value.trim();
        const profissionalId = window.mapaNomeId[nome];

        if (!profissionalId) {
            alert('Profissional não encontrado.');
            return;
        }

        const profissional = profissionais.find(p => p.id === profissionalId);

        if (!profissional) {
            alert('Profissional não encontrado.');
            return;
        }

        document.getElementById('nome_editar').value = profissional.profissional;
        document.getElementById('telefone_editar').value = profissional.telefone;
        document.getElementById('cor_editar').value = profissional.cor || "#000000";
    });

    btn_update.addEventListener("click", async () => {
        const nome_editado = document.getElementById('nome_editar').value.trim();
        const telefone_editado = document.getElementById('telefone_editar').value.trim();
        const cor_editada = document.getElementById('cor_editar').value;

        const nome = inputProfissional.value.trim();
        const profissionalId = window.mapaNomeId[nome];

        if (!profissionalId) {
            alert("Selecione um profissional válido!");
            return;
        }

        try {
            const response = await fetch(`https://barretoapps.com.br/update_profissional/${profissionalId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    profissional: nome_editado,
                    telefone: telefone_editado,
                    cor: cor_editada
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Cadastro Alterado Com Sucesso!');
            }

            await carregarProfissionais();
            inputProfissional.value = "";
            modal_edit.style.display = "none";

            window.location.href = 'cadastro_profissional.html';

        } catch (error) {
            console.error("Erro ao atualizar profissional:", error);
            alert(error.message || "Erro inesperado");
        }
    });

    carregarProfissionais();
});
