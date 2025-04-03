window.addEventListener('load', function () {
    const btn_agendar = document.getElementById("btn_agendar");
    let horariosOcupados = {};

    function atualizarUser() {
        let user_name = sessionStorage.getItem("user_name");
        return user_name || "Usuário desconhecido";
    }

    let user_name = atualizarUser();
    window.addEventListener("storage", function () {
        user_name = atualizarUser();
    });

    document.getElementById('data').addEventListener('change', function () {
        const dataFiltro = this.value;
        if (!dataFiltro) return;

        fetch("https://api-localizacao-e69z.onrender.com/agendamento")
            .then(response => response.json())
            .then(responseData => {
                const agendamentos = responseData.data || [];
                horariosOcupados = {};

                // Filtrando apenas os agendamentos da data selecionada
                const agendamentosFiltrados = agendamentos.filter(reserva => {
                    return new Date(reserva.data).toISOString().split('T')[0] === dataFiltro;
                });

                // Processando apenas os agendamentos da data escolhida
                agendamentosFiltrados.forEach(reserva => {
                    const { id, profissional, hora_inicio, hora_fim, nome } = reserva;

                    if (!horariosOcupados[profissional]) {
                        horariosOcupados[profissional] = {};
                    }
                    if (!horariosOcupados[profissional][dataFiltro]) {
                        horariosOcupados[profissional][dataFiltro] = [];
                    }
                    horariosOcupados[profissional][dataFiltro].push({ id, nome, inicio: hora_inicio, fim: hora_fim });
                });

                atualizarListaOcupados(horariosOcupados);
                atualizarHorarios();
            })
            .catch(error => console.error("Erro ao buscar horários:", error));
    });

    function atualizarHorarios() {
        const dataEscolhida = document.getElementById('data').value;
        const profissionalEscolhido = document.getElementById('sala').value;
        const horaInicioSelect = document.getElementById('hora-inicio');
        const horaFimSelect = document.getElementById('hora-fim');

        if (!dataEscolhida || !profissionalEscolhido) return;

        horaInicioSelect.innerHTML = '';
        horaFimSelect.innerHTML = '';

        let horariosRestantes = gerarHorariosDisponiveis();

        if (horariosOcupados[profissionalEscolhido] && horariosOcupados[profissionalEscolhido][dataEscolhida]) {
            horariosRestantes = horariosRestantes.filter(horario => {
                return !horariosOcupados[profissionalEscolhido][dataEscolhida].some(intervalo =>
                    !(intervalo.fim <= horario || intervalo.inicio >= horario)
                );
            });
        }

        horariosRestantes.forEach(horario => {
            const optionInicio = document.createElement('option');
            optionInicio.value = horario;
            optionInicio.textContent = horario;
            horaInicioSelect.appendChild(optionInicio);

            const optionFim = document.createElement('option');
            optionFim.value = horario;
            optionFim.textContent = horario;
            horaFimSelect.appendChild(optionFim);
        });
    }

    function gerarHorariosDisponiveis() {
        const horarios = [];
        let hora = 7;
        let minuto = 0;

        while (hora < 18) {
            horarios.push(`${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`);
            minuto = minuto === 0 ? 30 : 0;
            if (minuto === 0) hora++;
        }
        return horarios;
    }

    function atualizarListaOcupados(horariosOcupados) {
        const lista = document.getElementById('lista-horarios');
        lista.innerHTML = '';
    
        const userName = sessionStorage.getItem("user_name") || "Usuário desconhecido";
    
        for (let sala in horariosOcupados) {
            for (let data in horariosOcupados[sala]) {
                horariosOcupados[sala][data].forEach(intervalo => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${intervalo.nome}</strong> reservou <strong>${sala}</strong> das ${intervalo.inicio} até ${intervalo.fim} (${data})`;
    
                    if (intervalo.nome === userName) {
                        const btnExcluir = document.createElement('button');
                        btnExcluir.classList.add('btn-excluir');
                        btnExcluir.textContent = 'Excluir';
                        btnExcluir.setAttribute('data-id', intervalo.id);
                        btnExcluir.addEventListener('click', excluirReserva);
                        li.appendChild(btnExcluir);
                    }
    
                    lista.appendChild(li);
                });
            }
        }
    }
    

    function excluirReserva(event) {
        const idReserva = event.target.getAttribute('data-id');
        fetch(`https://api-localizacao-e69z.onrender.com/delete_agendamento/${idReserva}`, {
            method: "DELETE",
        })
        .then(response => response.json())
        .then(data => {
            alert("Reserva excluída com sucesso!");
            window.location.reload();
        })
        .catch(error => alert("Erro ao excluir reserva:" + error));
    }

    btn_agendar.addEventListener("click", async function (e) {
        e.preventDefault();
        const nome = user_name;
        const profissional = document.getElementById('sala').value;
        const dataEscolhida = document.getElementById('data').value;
        const horaInicio = document.getElementById('hora-inicio').value;
        const horaFim = document.getElementById('hora-fim').value;

        if (!profissional || !dataEscolhida || !horaInicio || !horaFim) {
            alert("Por favor, preencha todos os campos.");
            return;
        }
        if (horaFim <= horaInicio) {
            alert("O horário de fim deve ser posterior ao horário de início.");
            return;
        }

        if (horariosOcupados[profissional] && horariosOcupados[profissional][dataEscolhida]) {
            const conflito = horariosOcupados[profissional][dataEscolhida].some(intervalo => {
                return !(intervalo.fim <= horaInicio || intervalo.inicio >= horaFim);
            });

            if (conflito) {
                alert("Este profissional já tem um agendamento neste horário!");
                return;
            }
        }

        const reserva = { nome, profissional, data: dataEscolhida, hora_inicio: horaInicio, hora_fim: horaFim };
        try {
            const response = await fetch("https://api-localizacao-e69z.onrender.com/input_agendamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reserva)
            });
            if (response.ok) {
                alert("Reserva realizada com sucesso!");
                window.location.reload();
            } else {
                alert("Erro ao fazer a reserva.");
            }
        } catch (error) {
            alert("Erro ao conectar com o servidor.");
        }
    });
});
