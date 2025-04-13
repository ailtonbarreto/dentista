document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

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
      title: `${item.profissional} - ${item.nome}`,
      start: `${data}T${item.hora_inicio}`,
      end: `${data}T${item.hora_fim}`,
      color: cor,
      extendedProps: {
        profissional: item.profissional,
        id: item.id,
        nome: item.nome
      }
    };
  });
  

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    hiddenDays: [0, 6], //ESCONDENDO O FIM DE SEMANA PATETICO
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
      alert(
        `Profissional: ${info.event.extendedProps.profissional}\n` +
        `Nome: ${info.event.extendedProps.nome}\n` +
        `Início: ${info.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n` +
        `Fim: ${info.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      );
    },
    datesSet: function () {
      const toolbar = calendarEl.querySelector('.fc-header-toolbar');

      if (toolbar && !toolbar.querySelector('.custom-icons')) {
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('custom-icons');

        const icons = [
          { icon: 'calendar_month'},
          { icon: 'note_add', href: 'agendar.html',color:'#2ea8be' },
          { icon: 'person_add', href: 'cadastro.html',color:'#2ea8be' }
        ];

        icons.forEach(({ icon, href,color }) => {
          const link = document.createElement('a');
          link.href = href || '#';
          link.title = icon;
          link.style.textDecoration = 'none';

          const span = document.createElement('span');
          span.classList.add('material-symbols-outlined');
          span.textContent = icon;
          span.style.color = color;

          link.appendChild(span);
          iconsContainer.appendChild(link);
        });

        toolbar.appendChild(iconsContainer);
      }
    }
  });

  calendar.render();
});
