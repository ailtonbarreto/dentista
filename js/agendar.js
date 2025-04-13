window.addEventListener('load', function () {
    const btn_agendar = document.getElementById("btn_agendar");
    const spinner = document.getElementById("spinner");

    let horariosOcupados = {};

    function atualizarUser() {
        return sessionStorage.getItem("user_name") || "Usuário desconhecido";
    }

    function formatarHorario(horario) {
        return horario.slice(0, 5);
    }

    let user_name = atualizarUser();

    window.addEventListener("storage", function () {
        user_name = atualizarUser();
    });

    document.getElementById('profissional').addEventListener('change', () => {
        carregarHorariosOcupados();
    });

    document.getElementById('data').addEventListener('change', () => {
        carregarHorariosOcupados();
    });

    async function carregarHorariosOcupados() {
        spinner.style.display = "flex";

        const dataFiltro = document.getElementById('data').value;
        const profissionalEscolhido = document.getElementById('profissional').value;

        if (!dataFiltro || !profissionalEscolhido) {
            spinner.style.display = "none";
            return;
        }

        try {
            const response = await fetch("http://barretoapps.com.br:3004/agendamento");
            const resposta = await response.json();

            horariosOcupados = {};
            const reservas = resposta.data;

            reservas.forEach(reserva => {
 
                const { id, profissional, data: dataReserva, hora_inicio, hora_fim, nome, sobrenome } = reserva;
                const dataFormatada = new Date(dataReserva).toISOString().split('T')[0];

                if (dataFormatada === dataFiltro && profissional === profissionalEscolhido) {
                    if (!horariosOcupados[profissional]) horariosOcupados[profissional] = {};
                    if (!horariosOcupados[profissional][dataFiltro]) horariosOcupados[profissional][dataFiltro] = [];

                    horariosOcupados[profissional][dataFiltro].push({
                        id,
                        nome,
                        sobrenome,  // Aqui está o sobrenome
                        inicio: hora_inicio,
                        fim: hora_fim
                    });
                }
            });

            atualizarListaOcupados();
            atualizarHorarios();
        } catch (error) {
            console.error("Erro ao buscar horários:", error);
        } finally {
            spinner.style.display = "none";
        }
    }

    function atualizarHorarios() {

        const dataEscolhida = document.getElementById('data').value;
        const profissionalEscolhido = document.getElementById('profissional').value;
        const horaInicioSelect = document.getElementById('hora-inicio');
        const horaFimSelect = document.getElementById('hora-fim');

        if (!dataEscolhida || !profissionalEscolhido) return;

        let horariosRestantes = gerarHorariosDisponiveis();
        const ocupados = horariosOcupados[profissionalEscolhido]?.[dataEscolhida] || [];

        ocupados.forEach(({ fim }) => {
            const fimFormatado = formatarHorario(fim);
            if (!horariosRestantes.includes(fimFormatado)) {
                horariosRestantes.push(fimFormatado);
            }
        });

        horariosRestantes.sort();

        horariosRestantes = horariosRestantes.filter(horario => {
            return !ocupados.some(({ inicio, fim }) =>
                horario > formatarHorario(inicio) && horario < formatarHorario(fim)
            ) || ocupados.some(({ fim }) => horario === formatarHorario(fim));
        });

        horaInicioSelect.innerHTML = '';
        horaFimSelect.innerHTML = '';
        horariosRestantes.forEach(horario => {
            horaInicioSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
        });

        horaInicioSelect.addEventListener('change', atualizarHoraFim);
    }

    function atualizarHoraFim() {
        const horaInicio = document.getElementById('hora-inicio').value;
        const horaFimSelect = document.getElementById('hora-fim');
        horaFimSelect.innerHTML = '';

        if (!horaInicio) return;

        const profissional = document.getElementById('profissional').value;
        const data = document.getElementById('data').value;
        const ocupados = horariosOcupados[profissional]?.[data] || [];

        const horariosDisponiveis = gerarHorariosDisponiveis().filter(horario =>
            horario > horaInicio || ocupados.some(({ fim }) => horario === fim)
        );

        horariosDisponiveis.forEach(horario => {
            horaFimSelect.innerHTML += `<option value="${horario}">${horario}</option>`;
        });
    }

    function gerarHorariosDisponiveis() {
        const horarios = [];
        for (let h = 7; h < 18; h++) {
            horarios.push(`${h.toString().padStart(2, '0')}:00`);
            horarios.push(`${h.toString().padStart(2, '0')}:30`);
        }
        return horarios;
    }

    function atualizarListaOcupados() {
        const tabela = document.getElementById('lista-horarios');
        const fragment = document.createDocumentFragment();
    
        for (const profissional in horariosOcupados) {
            for (const data in horariosOcupados[profissional]) {
                horariosOcupados[profissional][data]
                    .sort((a, b) => a.inicio.localeCompare(b.inicio))
                    .forEach(intervalo => {

                        const tr = document.createElement('tr');
    
                        const tdNome = document.createElement('td');
                        // Agora estamos pegando o nome e sobrenome diretamente da reserva
                        tdNome.textContent = `${intervalo.nome} ${intervalo.sobrenome || ''}`;
    
                        const tdProfissional = document.createElement('td');
                        tdProfissional.textContent = profissional;
    
                        const tdInicio = document.createElement('td');
                        tdInicio.textContent = formatarHorario(intervalo.inicio);
    
                        const tdFim = document.createElement('td');
                        tdFim.textContent = formatarHorario(intervalo.fim);
    
                        const tdAcoes = document.createElement('td');
                        const btnExcluir = document.createElement('span');
                        btnExcluir.classList.add('btn-excluir', 'material-symbols-outlined');
                        btnExcluir.textContent = 'delete';
                        btnExcluir.title = 'Excluir reserva';
                        btnExcluir.dataset.id = intervalo.id;
                        btnExcluir.style.cursor = 'pointer';
                        btnExcluir.addEventListener('click', excluirReserva);
                        tdAcoes.appendChild(btnExcluir);
    
                        tr.appendChild(tdNome);
                        tr.appendChild(tdProfissional);
                        tr.appendChild(tdInicio);
                        tr.appendChild(tdFim);
                        tr.appendChild(tdAcoes);
    
                        fragment.appendChild(tr);
                    });
            }
        }
    
        tabela.innerHTML = '';
        tabela.appendChild(fragment);
    }
    
    

    async function excluirReserva(event) {
        spinner.style.display = "flex";

        const idReserva = event.target.dataset.id;

        try {
            const response = await fetch(`http://barretoapps.com.br:3004/delete_agendamento/${idReserva}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);

            document.getElementById('data').dispatchEvent(new Event('change'));
        } catch (error) {
            alert("Erro ao excluir reserva: " + error.message);
        } finally {
            spinner.style.display = "none";
        }
    }

    async function popularSelectPacientes() {
        const select = document.getElementById("paciente");

        if (!select) {
            console.error("Elemento com id 'paciente_id_select' não encontrado.");
            return;
        }

        select.innerHTML = '<option value="">Selecione um paciente</option>';

        try {
            const resposta = await fetch("http://localhost:3000/lista_pacientes");

            if (!resposta.ok) {
                throw new Error('Erro na requisição: ' + resposta.status);
            }

            const dados = await resposta.json();
            const lista = dados.data;

            if (!Array.isArray(lista)) {
                console.error("O retorno da API não é um array.");
                return;
            }

            lista.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.nome;
                option.textContent = `${paciente.nome} ${paciente.sobrenome}`;
                select.appendChild(option);
            });


        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        }
    }

    btn_agendar.addEventListener("click", async function (e) {
        e.preventDefault();
        spinner.style.display = "flex";

        const nome = document.getElementById('paciente').value;
        const profissional = document.getElementById('profissional').value;
        const data = document.getElementById('data').value;
        const hora_inicio = document.getElementById('hora-inicio').value;
        const hora_fim = document.getElementById('hora-fim').value;

        if (!nome || !profissional || !data || !hora_inicio || !hora_fim) {
            alert("Por favor, preencha todos os campos.");
            spinner.style.display = "none";
            return;
        }

        if (hora_fim <= hora_inicio) {
            alert("O horário de fim deve ser posterior ao horário de início.");
            spinner.style.display = "none";
            return;
        }

        const reservas = horariosOcupados[profissional]?.[data] || [];

        const conflito = reservas.some(({ inicio, fim }) =>
            !(formatarHorario(fim) <= hora_inicio || formatarHorario(inicio) >= hora_fim) &&
            formatarHorario(fim) !== hora_inicio
        );

        if (conflito) {
            alert("Erro: Já existe uma reserva para esse profissional nesse horário.");
            spinner.style.display = "none";
            return;
        }

        const novaReserva = {
            nome,
            profissional,
            data,
            hora_inicio,
            hora_fim
        };

        try {
            const response = await fetch("http://barretoapps.com.br:3004/input_agendamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novaReserva)
            });

            if (!response.ok) throw new Error("Erro ao fazer a reserva.");

            document.getElementById('data').dispatchEvent(new Event('change'));
        } catch (error) {
            alert("Erro ao conectar com o servidor: " + error.message);
        } finally {
            spinner.style.display = "none";
        }
    });

    if (document.getElementById('data').value) {
        carregarHorariosOcupados();
    }

    popularSelectPacientes();

});

window.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    document.getElementById('data').value = `${ano}-${mes}-${dia}`;
});
