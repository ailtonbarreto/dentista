document.addEventListener('DOMContentLoaded', () => {
    const btnAgendar = document.getElementById('btn_agendar');
    const calendar = document.getElementById('calendar');
    const modal = document.getElementById('modal');

    let horariosOcupados = {};

    document.addEventListener('click', function (event) {
        if (event.target.id === 'btn_abrir') {
            event.preventDefault();
            calendar.style.display = 'none';
            modal.style.display = 'flex';
        }

        if (event.target.id === 'fechar_modal') {
            modal.style.display = 'none';
            calendar.style.display = 'flex';
        }
    });

    async function carregarHorariosOcupados() {
        const dataFiltro = document.getElementById('data').value;
        const profissional = document.getElementById('profissional').value;

        if (!dataFiltro || !profissional) return;

        try {
            const response = await fetch("http://barretoapps.com.br:3004/agendamento");
            const { data } = await response.json();

            horariosOcupados = {}; // zera

            data.forEach(reserva => {
                const dataReserva = new Date(reserva.data).toISOString().split('T')[0];

                if (!horariosOcupados[reserva.profissional]) {
                    horariosOcupados[reserva.profissional] = {};
                }

                if (!horariosOcupados[reserva.profissional][dataReserva]) {
                    horariosOcupados[reserva.profissional][dataReserva] = [];
                }

                horariosOcupados[reserva.profissional][dataReserva].push({
                    inicio: reserva.hora_inicio,
                    fim: reserva.hora_fim
                });
            });

        } catch (error) {
            console.error("Erro ao buscar horários:", error);
        }
    }

    if (btnAgendar) {
        btnAgendar.addEventListener('click', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('paciente').value;
            const profissional = document.getElementById('profissional').value;
            const data = document.getElementById('data').value;
            const hora_inicio = document.getElementById('hora-inicio').value;
            const hora_fim = document.getElementById('hora-fim').value;

            if (!nome || !profissional || !data || !hora_inicio || !hora_fim) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            if (hora_fim <= hora_inicio) {
                alert("O horário de fim deve ser posterior ao horário de início.");
                return;
            }

            // Verifica conflito
            const reservas = horariosOcupados[profissional]?.[data] || [];

            const conflito = reservas.some(({ inicio, fim }) => {
                return (
                    hora_inicio < fim && hora_fim > inicio
                );
            });

            if (conflito) {
                alert("Erro: Já existe uma reserva para esse profissional nesse intervalo de tempo.");
                return;
            }

            // Envia reserva
            const novaReserva = { nome, profissional, data, hora_inicio, hora_fim };

            try {
                const response = await fetch("http://barretoapps.com.br:3004/input_agendamento", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(novaReserva)
                });

                if (!response.ok) throw new Error("Erro ao fazer a reserva.");

                alert("Reserva feita com sucesso!");
                await carregarHorariosOcupados();

                modal.style.display = 'none';
                calendar.style.display = 'flex';
                window.location.href = 'home.html';
            } catch (error) {
                alert("Erro ao conectar com o servidor: " + error.message);
            }
        });
    }

    async function popularSelectPacientes() {
        const select = document.getElementById("paciente");
        if (!select) return;

        select.innerHTML = '<option value="">Selecione um paciente</option>';

        try {
            const resposta = await fetch("http://barretoapps.com.br:3004/lista_pacientes");
            const dados = await resposta.json();

            dados.data.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.nome;
                option.textContent = paciente.nome;
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        }
    }

    document.getElementById('profissional')?.addEventListener('change', carregarHorariosOcupados);
    document.getElementById('data')?.addEventListener('change', carregarHorariosOcupados);

    popularSelectPacientes();


});
