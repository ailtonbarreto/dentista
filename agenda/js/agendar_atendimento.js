document.addEventListener('DOMContentLoaded', () => {
    const btnAgendar = document.getElementById('btn_agendar');
    const calendar = document.getElementById('calendar');
    const modal = document.getElementById('modal');

    let horariosOcupados = {};

    let corProfissionaisMap = {};

    document.addEventListener('click', function (event) {
        if (event.target.id === 'btn_abrir') {
            event.preventDefault();
            modal.style.display = 'flex';
        }

        if (event.target.id === 'fechar_modal') {
            modal.style.display = 'none';
        }
    });

    async function carregarHorariosOcupados() {
        const dataFiltro = document.getElementById('data').value;
        const profissional = document.getElementById('profissional').value;

        const empresa = sessionStorage.getItem('empresa');
        if (!empresa) {
            console.error('Empresa não encontrada no sessionStorage');
            return;
        }

        if (!dataFiltro || !profissional) return;

        try {
            const response = await fetch(`https://api-barretoapps.onrender.com/filtrar_agendamentos/${empresa}`);

            const { data } = await response.json();

            horariosOcupados = {};

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

    const mapaPrecoProcedimentos = {};

    async function popularSelectProcedimentos() {
        const selectProcedimento = document.getElementById('procedimento');
        if (!selectProcedimento) return;
    
        const empresa = sessionStorage.getItem('empresa');
        if (!empresa) {
            console.error('Empresa não encontrada no sessionStorage');
            return;
        }
    
        try {
            const response = await fetch(`https://api-barretoapps.onrender.com/lista_procedimento/${empresa}`);
            const dadosProcedimentos = await response.json();

  
            selectProcedimento.innerHTML = '';
    
            const optionDefault = document.createElement('option');
            optionDefault.textContent = 'Selecione um serviço';
            optionDefault.value = ''; 
            selectProcedimento.appendChild(optionDefault);
    
            dadosProcedimentos.data.forEach(procedimento => {
                const option = document.createElement('option');
                option.value = procedimento.procedimento;
                option.textContent = procedimento.procedimento;
                selectProcedimento.appendChild(option);
    
            
                mapaPrecoProcedimentos[procedimento.procedimento] = procedimento.valor;
            });
    
        } catch (error) {
            console.error("Erro ao carregar procedimentos:", error);
        }
    }
    
    

    async function popularSelectProfissionais() {
        const selectProfissional = document.getElementById('profissional');
        if (!selectProfissional) return;
    
        try {
            const empresa = sessionStorage.getItem("empresa");
            if (!empresa) {
                console.error("Empresa não encontrada no sessionStorage.");
                return;
            }
    
            const response = await fetch(`https://api-barretoapps.onrender.com/lista_profissional/${empresa}`);
            const dadosProfissionais = await response.json();
    
            selectProfissional.innerHTML = '';
    
            const optionDefault = document.createElement('option');
            optionDefault.value = '';
            optionDefault.textContent = 'Selecione um profissional';
            selectProfissional.appendChild(optionDefault);
    
            dadosProfissionais.data.forEach(profissional => {
                const option = document.createElement('option');
                option.value = profissional.profissional;
                option.textContent = profissional.profissional;
                selectProfissional.appendChild(option);
    
                if (profissional.cor) {
                    corProfissionaisMap[profissional.profissional] = profissional.cor;
                } else {
                    console.warn(`Cor do profissional ${profissional.profissional} não encontrada!`);
                }
            });
    
        } catch (error) {
            console.error("Erro ao carregar profissionais:", error);
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
            const procedimento = document.getElementById('procedimento').value;
            const empresa = sessionStorage.getItem("empresa");


            if (!nome || !profissional || !procedimento || !data || !hora_inicio || !hora_fim) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            if (!nomesPacientes.includes(nome)) {
                alert("Por favor, selecione um paciente válido da lista.");
                return;
            }

            if (hora_fim <= hora_inicio) {
                alert("O horário de fim deve ser posterior ao horário de início.");
                return;
            }

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

            const valor = mapaPrecoProcedimentos[procedimento];
            if (!valor) {
                alert("Erro: Valor do procedimento não encontrado.");
                return;
            }


            const novaReserva = { 
                nome, 
                procedimento, 
                data, 
                hora_inicio, 
                hora_fim, 
                profissional, 
                empresa,
                valor
            };


            try {
                const response = await fetch("https://api-barretoapps.onrender.com/input_agendamento", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(novaReserva)
                });

                if (!response.ok) throw new Error("Erro ao fazer a reserva.");

                await carregarHorariosOcupados();

                modal.style.display = 'none';
                calendar.style.display = 'flex';
                window.location.reload();
            } catch (error) {
                alert("Erro ao conectar com o servidor: " + error.message);
            }
        });
    }

    let nomesPacientes = [];

    async function popularSelectPacientes() {
        const datalist = document.getElementById("listaPacientes");
        if (!datalist) return;
    
        datalist.innerHTML = '';
        nomesPacientes = [];
    
        try {
            const empresa = sessionStorage.getItem('empresa');
            if (!empresa) {
                console.error('Empresa não encontrada no sessionStorage');
                return;
            }
    
            const resposta = await fetch(`https://api-barretoapps.onrender.com/lista_pacientes/${empresa}`);
            const dados = await resposta.json();
    
            dados.data.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.nome;
                datalist.appendChild(option);
                nomesPacientes.push(paciente.nome);
            });
        } catch (error) {
            console.error("Erro ao carregar pacientes:", error);
        }
    }
    

    popularSelectProfissionais();
    document.getElementById('profissional')?.addEventListener('change', carregarHorariosOcupados);
    document.getElementById('data')?.addEventListener('change', carregarHorariosOcupados);

    popularSelectProcedimentos();
    popularSelectPacientes();


});
