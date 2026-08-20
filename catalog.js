(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.();
  if (!session) return;
  const user = session.user || {};
  const name = user.display_name || user.username || 'Usuario Academy';
  const initials = name.trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'CA';
  const userLabel = document.getElementById('catalogUser');
  const initialsLabel = document.getElementById('catalogInitials');
  if (userLabel) userLabel.textContent = name;
  if (initialsLabel) initialsLabel.textContent = initials;

  if (!document.querySelector('link[data-container-catalog]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = './container-catalog.css';
    style.dataset.containerCatalog = 'true';
    document.head.appendChild(style);
  }

  const anchor = document.querySelector('.visual-stats');
  if (!anchor || document.querySelector('.container-labs')) return;

  const section = document.createElement('section');
  section.className = 'container-labs';
  const header = document.createElement('header');
  const heading = document.createElement('div');
  const eyebrow = document.createElement('span'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'CONTAINER LABS';
  const title = document.createElement('h2'); title.textContent = 'Aplicaciones vulnerables, entorno controlado.';
  const desc = document.createElement('p'); desc.textContent = 'Previews integradas hoy; sesiones Docker efímeras y aisladas en el runtime de Academy.';
  heading.append(eyebrow,title,desc);
  const note = document.createElement('span'); note.className = 'container-labs-note'; note.textContent = 'ISOLATED · SYNTHETIC · AUTHORIZED';
  header.append(heading,note);

  const grid = document.createElement('div'); grid.className = 'container-labs-grid';
  const labs = [
    {
      href:'./container-lab.html', visual:'🧃', visualClass:'', kicker:'WEB SECURITY · OWASP',
      name:'OWASP Juice Shop', description:'E-commerce deliberadamente vulnerable para aprender superficie web, OWASP Top 10 y mitigaciones dentro de un workspace guiado.',
      tags:['45 MIN','WEB APP','CONTAINER'], runtime:'bkimminich/juice-shop'
    },
    {
      href:'./api-lab.html', visual:'API', visualClass:'api', kicker:'API SECURITY · OPENAPI 3',
      name:'VAmPI', description:'API vulnerable con interfaz tipo Swagger para razonar sobre autenticación, autorización, objetos y controles de API Security.',
      tags:['40 MIN','OPENAPI','CONTAINER'], runtime:'brightsec/vampi'
    }
  ];

  labs.forEach(lab => {
    const card = document.createElement('a'); card.className = 'container-lab-card'; card.href = lab.href;
    const visual = document.createElement('div'); visual.className = `container-lab-visual ${lab.visualClass}`.trim();
    const badge = document.createElement('span'); badge.textContent = 'LAB PREVIEW';
    const mark = document.createElement('strong'); mark.textContent = lab.visual;
    visual.append(badge,mark);
    const copy = document.createElement('div'); copy.className = 'container-lab-copy';
    const kicker = document.createElement('span'); kicker.textContent = lab.kicker;
    const labName = document.createElement('strong'); labName.textContent = lab.name;
    const description = document.createElement('p'); description.textContent = lab.description;
    const meta = document.createElement('div'); meta.className = 'container-lab-meta';
    lab.tags.forEach(tag => { const item = document.createElement('b'); item.textContent = tag; meta.appendChild(item); });
    const runtime = document.createElement('small'); runtime.textContent = `Runtime previsto: ${lab.runtime}`;
    copy.append(kicker,labName,description,meta,runtime);
    const arrow = document.createElement('span'); arrow.className = 'container-lab-arrow'; arrow.textContent = '→';
    card.append(visual,copy,arrow); grid.appendChild(card);
  });
  section.append(header,grid);
  anchor.insertAdjacentElement('beforebegin',section);
})();