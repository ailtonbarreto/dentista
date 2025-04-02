window.addEventListener('load', function () {

    const btn_agendar = document.getElementById("btn_agendar");

    function atualizarUser() {

        let user_name = sessionStorage.getItem("user_name");

        if (user_name) {

            console.log("Usuário logado:");

        } else {

            console.log("Nenhum usuário logado ainda.");
        }
        return user_name;
    }

    let user_name = atualizarUser();

    window.addEventListener("storage", function () {

        user_name = atualizarUser();

    });


    document.getElementById('data').addEventListener('change', function () {
        const dataFiltro = this.value;
    
        fetch("https://api-localizacao-e69z.onrender.com/agendamento")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na resposta. Status: ${response.status}`);
                }
                return response.json();
            })
            .then(responseData => {
                console.log("Resposta da API:", responseData);
    
    
                if (!responseData.data || !Array.isArray(responseData.data)) {
                    throw new Error("Formato de resposta inesperado da API");
                }
    
                const agendamentos = responseData.data;
                let horariosOcupados = {};
    
                agendamentos.forEach(reserva => {
                    const { profissional, data: dataReserva, hora_inicio, hora_fim, nome } = reserva;
   
                    const dataReservaFormatada = new Date(dataReserva).toISOString().split('T')[0];
    
                    if (dataReservaFormatada === dataFiltro) {
                        if (!horariosOcupados[profissional]) {
                            horariosOcupados[profissional] = {};
                        }
                        if (!horariosOcupados[profissional][dataFiltro]) {
                            horariosOcupados[profissional][dataFiltro] = [];
                        }
                        horariosOcupados[profissional][dataFiltro].push({ nome, inicio: hora_inicio, fim: hora_fim });
                    }
                });
    
                console.log("Horários Ocupados:", horariosOcupados);
    
                atualizarListaOcupados(horariosOcupados);
                atualizarHorarios(horariosOcupados);
            })
            .catch(error => {
                console.error("Erro ao buscar horários:", error);
                alert("Erro ao buscar horários. Verifique a API ou a sua conexão.");
            });
    });
    

    // ---------------------------------------------------------------------------------------------------------
    // DEFINIR SALA A RESERVA

    let horariosOcupados = {
        "Profissional A": {},
        "Profissional B": {}
    };

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

    function atualizarHorarios() {
        const dataEscolhida = document.getElementById('data').value;
        const salaEscolhida = document.getElementById('sala').value;
        const horaInicioSelect = document.getElementById('hora-inicio');
        const horaFimSelect = document.getElementById('hora-fim');

        if (!dataEscolhida || !salaEscolhida) return;

        horaInicioSelect.innerHTML = '';
        horaFimSelect.innerHTML = '';

        if (!horariosOcupados[salaEscolhida]) {
            horariosOcupados[salaEscolhida] = {};
        }
        if (!horariosOcupados[salaEscolhida][dataEscolhida]) {
            horariosOcupados[salaEscolhida][dataEscolhida] = [];
        }

        let horariosRestantes = gerarHorariosDisponiveis();

        if (horariosOcupados[salaEscolhida][dataEscolhida].length > 0) {
            horariosRestantes = horariosRestantes.filter(horario => {
                return !horariosOcupados[salaEscolhida][dataEscolhida].some(intervalo =>
                    !(intervalo.fim <= horario || intervalo.inicio >= horario)
                );
            });
        }

        if (horariosRestantes.length === 0) {
            horariosRestantes = gerarHorariosDisponiveis();
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


    function atualizarListaOcupados() {
        const lista = document.getElementById('lista-horarios');
        lista.innerHTML = '';

        for (let sala in horariosOcupados) {
            for (let data in horariosOcupados[sala]) {
                horariosOcupados[sala][data].forEach(intervalo => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${intervalo.nome}</strong> reservou <strong>${sala}</strong> das ${intervalo.inicio} até ${intervalo.fim} (${data})`;
                    lista.appendChild(li);
                });
            }
        }
    }

    // ---------------------------------------------------------------------------------------------------------
    // INSERIR RESERVA

    btn_agendar.addEventListener("click", async function (e) {

        e.preventDefault();

        const nome = user_name;
        const profissionalescolhido = document.getElementById('sala').value;
        const dataEscolhida = document.getElementById('data').value;
        const horaInicio = document.getElementById('hora-inicio').value;
        const horaFim = document.getElementById('hora-fim').value;
        const spinner = document.getElementById('spinner');

        spinner.style.display = "flex";


        if (!profissionalescolhido || !dataEscolhida || !horaInicio || !horaFim) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        if (horaFim <= horaInicio) {
            alert("O horário de fim deve ser posterior ao horário de início.");
            return;
        }

        const formatarHora = (hora) => {
            const [hh, mm] = hora.split(":");
            return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`;
        };

        const reserva = {
            nome: nome,
            profissional: profissionalescolhido,
            data: dataEscolhida,
            hora_inicio: formatarHora(horaInicio),
            hora_fim: formatarHora(horaFim)
        };


        try {
            const response = await fetch("https://api-localizacao-e69z.onrender.com/input_agendamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reserva)
            });

            const data = await response.json();
            console.log("Resposta recebida:", data);

            if (response.ok) {
                window.location.reload();
            } else {
                alert(data.error || "Erro ao fazer a reserva.");
            }
        } catch (error) {
            console.error("Erro ao enviar reserva:", error);
            alert("Erro ao conectar com o servidor.");
        }
    });

});

