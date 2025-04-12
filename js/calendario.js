document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendar');
  
    const response = await fetch('http://barretoapps.com.br:3004/agendamento');
    const dados = await response.json();
  
    const eventos = dados.data.map(item => {
      const data = item.data.split('T')[0];
      return {
        title: `${item.profissional} - ${item.nome}`,
        start: `${data}T${item.hora_inicio}`,
        end: `${data}T${item.hora_fim}`,
        color: '#e0a80b',
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
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: ''
      },
      events: eventos,
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
            { icon: 'note_add',href : 'agendar.html'},
            { icon: 'person_add',href : 'cadastro.html'}
          ];
  
          icons.forEach(({ icon, href }) => {
            const link = document.createElement('a');
            link.href = href || '#';
            link.title = icon;
            link.style.textDecoration = 'none';
          
            const span = document.createElement('span');
            span.classList.add('material-symbols-outlined');
            span.textContent = icon;
          
            link.appendChild(span);
            iconsContainer.appendChild(link);
          });
          
    
          toolbar.appendChild(iconsContainer);
        }
      }
    });
  
    calendar.render();
  });
  