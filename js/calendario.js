document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');
  let idSelecionado = null; // Declarar a variável idSelecionado fora do FullCalendar

  const response = await fetch('http://barretoapps.com.br:3004/agendamento');
  const dados = await response.json();

  const coresProfissional = {
    'profissional a': 'red',
    'profissional b': 'blue'
  };

  const eventos = dados.data.map(item => {
    const data = item.data.split('T')[0];
    const nomeProf = item.profissional.toLowerCase();
    const cor = coresProfissional[nomeProf] || '#e0a80b';
    return {
      id: item.id,
      title: `${item.profissional} - ${item.nome}`,
      start: `${data}T${item.hora_inicio}`,
      end: `${data}T${item.hora_fim}`,
      color: cor,
      extendedProps: {
        profissional: item.profissional,
        nome: item.nome
      }
    };
  });

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    hiddenDays: [0], // Escondendo o fim de semana
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: ''
    },
    events: eventos,
    dayCellClassNames: function(info) {
      if (info.date.getDay() === 6 || info.date.getDay() === 0) {
        return 'fc-sabado-domingo';
      }
      return '';
    },

    eventClick: function(info) {
      document.getElementById('popupProfissional').textContent = info.event.extendedProps.profissional;
      document.getElementById('popupNome').textContent = info.event.extendedProps.nome;
      document.getElementById('popupInicio').textContent = info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      document.getElementById('popupFim').textContent = info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Armazena o id do evento selecionado
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
      const response = await fetch(`http://barretoapps.com.br:3004/delete_agendamento/${idSelecionado}`, {
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
