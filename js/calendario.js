document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');
  let idSelecionado = null;


  const empresa = sessionStorage.getItem("empresa");

  const response = await fetch(`https://barretoapps.com.br/filtrar_agendamentos/${empresa}`);

  const dados = await response.json();


  const eventos = dados.data.map(item => {
    const data = item.data.split('T')[0];
    const cor = item.cor || '#e0a80b';

    return {
      id: item.id,
      title: `${item.profissional} - ${item.nome}`,
      start: `${data}T${item.hora_inicio}`,
      end: `${data}T${item.hora_fim}`,
      color: cor,
      extendedProps: {
        profissional: item.profissional,
        nome: item.nome,
        procedimento: item.procedimento
      }
    };
  });


  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    // initialView: 'timeGridWeek',
    locale: 'pt-br',
    hiddenDays: [0],
    nowIndicator: true,
    slotMinTime: "07:00:00",
    slotMaxTime: "18:00:00",
    handleWindowResize: true,
    allDaySlot: false,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      // right: ''
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: eventos,
    dayCellClassNames: function (info) {
      if (info.date.getDay() === 6 || info.date.getDay() === 0) {
        return 'fc-sabado-domingo';
      }
      return '';
    },

    eventClick: function (info) {

      document.getElementById('popupProfissional').textContent = info.event.extendedProps.profissional;
      document.getElementById('popupNome').textContent = info.event.extendedProps.nome;
      document.getElementById('popupInicio').textContent = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById('popupFim').textContent = info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById('procedimento_popup').textContent = info.event.extendedProps.procedimento;


      idSelecionado = info.event.id;

      document.getElementById('popupReserva').classList.remove('hidden');
    },

    datesSet: function () {
      const toolbar = calendarEl.querySelector('.fc-header-toolbar');

      if (toolbar && !toolbar.querySelector('.custom-icons')) {
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('custom-icons');

        const icons = [
          { icon: 'note_add', color: '#ffffff', id: 'btn_abrir' },
        ];

        icons.forEach(({ icon, color, id }) => {
          const link = document.createElement('a');
          link.title = icon;
          link.style.textDecoration = 'none';

          const span = document.createElement('span');
          span.classList.add('material-symbols-outlined');
          span.textContent = icon;
          span.style.color = color;
          span.id = id;

          link.appendChild(span);
          iconsContainer.appendChild(link);
        });

        toolbar.appendChild(iconsContainer);
      }
    }
  });


  document.getElementById('btnExcluir').addEventListener('click', async () => {

    if (confirm('Tem certeza que deseja excluir este atendimento?')) {

      const response = await fetch(`https://barretoapps.com.br/delete_agendamento/${idSelecionado}`, {

        method: 'DELETE'

      });

      if (response.ok) {

        document.getElementById('popupReserva').classList.add('hidden');


        const evento = calendar.getEventById(idSelecionado);

        if (evento) evento.remove();

      } else {

        alert('Erro ao excluir a reserva.');

      }

    }

  });

  calendar.render();


  document.querySelector('.popup .close').addEventListener('click', () => {
    document.getElementById('popupReserva').classList.add('hidden');
  });


});
