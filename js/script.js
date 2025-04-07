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
            const response = await fetch("https://api-localizacao-e69z.onrender.com/agendamento");
            const resposta = await response.json();
    
            horariosOcupados = {};
            const reservas = resposta.data;
    
            reservas.forEach(reserva => {
                const { id, profissional, data: dataReserva, hora_inicio, hora_fim, nome } = reserva;
                const dataFormatada = new Date(dataReserva).toISOString().split('T')[0];
    
                if (dataFormatada === dataFiltro && profissional === profissionalEscolhido) {
                    if (!horariosOcupados[profissional]) horariosOcupados[profissional] = {};
                    if (!horariosOcupados[profissional][dataFiltro]) horariosOcupados[profissional][dataFiltro] = [];
    
                    horariosOcupados[profissional][dataFiltro].push({
                        id,
                        nome,
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
        const title = document.getElementById("agenda_title");
        const dataSelecionada = document.getElementById('data').value;

        const data = new Date(`${dataSelecionada}T00:00:00`);
        const dataFormatada = data.toLocaleDateString('pt-BR');

    
        tabela.innerHTML = '';

        title.innerHTML = `Agenda do Dia ${dataFormatada}`;
    
        for (const profissional in horariosOcupados) {
            for (const data in horariosOcupados[profissional]) {
                horariosOcupados[profissional][data]
                    .sort((a, b) => a.inicio.localeCompare(b.inicio))
                    .forEach(intervalo => {
                        const tr = document.createElement('tr');
    
                        const tdNome = document.createElement('td');
                        tdNome.textContent = intervalo.nome;
    
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
    
                        tabela.appendChild(tr);
                    });
            }
        }
    }
    

    async function excluirReserva(event) {
        spinner.style.display = "flex";

        const idReserva = event.target.dataset.id;

        try {
            const response = await fetch(`https://api-localizacao-e69z.onrender.com/delete_agendamento/${idReserva}`, {
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

    btn_agendar.addEventListener("click", async function (e) {
        e.preventDefault();
        spinner.style.display = "flex";

        // const nome = user_name;
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
            const response = await fetch("https://api-localizacao-e69z.onrender.com/input_agendamento", {
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

    // Carrega os horários automaticamente se já tiver data preenchida
    if (document.getElementById('data').value) {
        carregarHorariosOcupados();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    document.getElementById('data').value = `${ano}-${mes}-${dia}`;
    // inputData.value = hoje;
});
