(() => {
  const analytics = window.CrohnozAnalytics;
  const telemetry = window.CrohnozTelemetry;
  const consentState = document.getElementById('consentState');
  const consentMetric = document.getElementById('consentMetric');
  const eventCount = document.getElementById('eventCount');
  const eventList = document.getElementById('eventList');
  const notice = document.getElementById('notice');

  function safe(value, max = 100) { return String(value ?? '').slice(0, max); }

  function renderConsent() {
    const value = analytics?.consent.get() || 'unset';
    consentState.className = `state ${value}`;
    consentState.querySelector('span').textContent = value === 'granted' ? 'Permitida para provider aprobado' : value === 'denied' ? 'Solo telemetría local' : 'Sin decisión';
    consentMetric.textContent = value === 'granted' ? 'READY' : 'OFF';
  }

  function renderEvents() {
    const events = telemetry?.exportEvents() || [];
    eventCount.textContent = String(events.length);
    eventList.textContent = '';
    if (!events.length) {
      const empty = document.createElement('div');
      empty.className = 'event';
      const copy = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = 'Sin eventos locales';
      const detail = document.createElement('small'); detail.textContent = 'Interactúa con la academia para generar telemetría permitida.';
      copy.append(title, detail); empty.appendChild(copy); eventList.appendChild(empty); return;
    }
    events.slice(0, 20).forEach(event => {
      const row = document.createElement('div'); row.className = 'event';
      const copy = document.createElement('div');
      const title = document.createElement('strong'); title.textContent = safe(event.name, 80);
      const detail = document.createElement('small');
      const props = Object.entries(event.properties || {}).map(([k,v]) => `${safe(k,30)}=${safe(v,40)}`).join(' · ');
      detail.textContent = props || 'No properties';
      const time = document.createElement('time');
      const date = new Date(event.at); time.textContent = Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
      copy.append(title, detail); row.append(copy, time); eventList.appendChild(row);
    });
  }

  document.getElementById('grant').addEventListener('click', () => {
    analytics?.consent.set('granted');
    notice.textContent = 'Preferencia guardada. El repositorio público no contiene provider remoto, por lo que no se transmitirá nada hasta una integración productiva aprobada.';
    renderConsent();
  });

  document.getElementById('deny').addEventListener('click', () => {
    analytics?.consent.set('denied');
    notice.textContent = 'Preferencia guardada: solo telemetría local en este navegador.';
    renderConsent();
  });

  document.getElementById('clear').addEventListener('click', () => {
    if (!confirm('¿Eliminar la telemetría local de esta academia en este navegador?')) return;
    telemetry?.clear();
    notice.textContent = 'Telemetría local eliminada.';
    renderEvents();
  });

  document.getElementById('export').addEventListener('click', () => {
    const events = telemetry?.exportEvents() || [];
    const blob = new Blob([JSON.stringify({ exportedAt:new Date().toISOString(), events }, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'cca-local-telemetry.json'; anchor.click();
    URL.revokeObjectURL(url);
    notice.textContent = 'Export local generado. El archivo no fue enviado a ningún servidor.';
  });

  window.addEventListener('crohnoz:telemetry', renderEvents);
  renderConsent();
  renderEvents();
})();
