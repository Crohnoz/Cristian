(() => {
  const config = window.CCA_CONFIG || {};
  const tenantId = String(config.tenant?.id || 'cristian-demo');
  const STORAGE_KEY = `cca:content-studio:v1:${tenantId}`;
  const MAX_XML_BYTES = 2 * 1024 * 1024;
  const MAX_COURSES = 100;
  const MAX_MODULES = 40;
  const MAX_LESSONS = 80;

  const text = (value, max = 4000) => String(value ?? '').slice(0, max);
  const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;

  function toast(message) {
    const host = document.getElementById('toast');
    if (!host) return;
    host.textContent = text(message, 180);
    host.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => host.classList.remove('show'), 2800);
  }

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return Array.isArray(parsed?.courses) ? parsed : { version: 3, tenantId, courses: [] };
    } catch {
      return { version: 3, tenantId, courses: [] };
    }
  }

  function xmlNode(doc, name, value) {
    const node = doc.createElement(name);
    node.textContent = text(value);
    return node;
  }

  function exportXml() {
    const state = readState();
    const doc = document.implementation.createDocument('', 'academy', null);
    const root = doc.documentElement;
    root.setAttribute('tenant', tenantId);
    root.setAttribute('version', '1');
    root.setAttribute('generatedAt', new Date().toISOString());

    state.courses.slice(0, MAX_COURSES).forEach(course => {
      const courseNode = doc.createElement('course');
      courseNode.setAttribute('id', text(course.id, 120));
      courseNode.setAttribute('slug', text(course.slug, 80));
      courseNode.setAttribute('level', text(course.level || 'foundation', 32));
      courseNode.setAttribute('locale', text(course.locale || 'es', 8));
      courseNode.setAttribute('workflow', text(course.workflow || 'draft', 32));
      courseNode.append(xmlNode(doc, 'title', course.title), xmlNode(doc, 'summary', course.summary));

      (course.modules || []).slice(0, MAX_MODULES).forEach((module, moduleIndex) => {
        const moduleNode = doc.createElement('module');
        moduleNode.setAttribute('id', text(module.id, 120));
        moduleNode.setAttribute('order', String(moduleIndex + 1));
        moduleNode.append(xmlNode(doc, 'title', module.title), xmlNode(doc, 'objective', module.objective));

        (module.lessons || []).slice(0, MAX_LESSONS).forEach((lesson, lessonIndex) => {
          const lessonNode = doc.createElement('lesson');
          lessonNode.setAttribute('id', text(lesson.id, 120));
          lessonNode.setAttribute('order', String(lessonIndex + 1));
          lessonNode.setAttribute('type', text(lesson.type || 'lesson', 24));
          lessonNode.setAttribute('duration', String(Math.max(1, Math.min(240, Number(lesson.duration) || 10))));
          lessonNode.append(xmlNode(doc, 'title', lesson.title), xmlNode(doc, 'body', lesson.body));
          moduleNode.appendChild(lessonNode);
        });
        courseNode.appendChild(moduleNode);
      });
      root.appendChild(courseNode);
    });

    const serialized = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(doc)}\n`;
    const blob = new Blob([serialized], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cristian-academy-${tenantId}-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Workspace exportado como XML');
  }

  function childText(parent, selector, max) {
    return text(parent.querySelector(`:scope > ${selector}`)?.textContent || '', max);
  }

  function parseXml(raw) {
    if (new Blob([raw]).size > MAX_XML_BYTES) throw new Error('El XML excede el límite de 2 MB.');
    if (/<!DOCTYPE|<!ENTITY/i.test(raw)) throw new Error('DOCTYPE y ENTITY no están permitidos en contenido Academy.');

    const doc = new DOMParser().parseFromString(raw, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('El XML no es válido.');
    const root = doc.documentElement;
    if (!root || root.nodeName !== 'academy') throw new Error('El elemento raíz debe ser <academy>.');

    const courseNodes = [...root.children].filter(node => node.nodeName === 'course');
    if (courseNodes.length > MAX_COURSES) throw new Error(`Máximo ${MAX_COURSES} cursos por importación.`);

    const courses = courseNodes.map(courseNode => {
      const moduleNodes = [...courseNode.children].filter(node => node.nodeName === 'module');
      if (moduleNodes.length > MAX_MODULES) throw new Error(`Un curso excede ${MAX_MODULES} módulos.`);

      return {
        id: text(courseNode.getAttribute('id') || uid('course'), 120),
        remoteId: null,
        remoteStatus: null,
        title: childText(courseNode, 'title', 120) || 'Curso importado',
        slug: text(courseNode.getAttribute('slug') || `curso-${Date.now()}`, 80),
        summary: childText(courseNode, 'summary', 700),
        level: ['foundation', 'intermediate', 'advanced'].includes(courseNode.getAttribute('level')) ? courseNode.getAttribute('level') : 'foundation',
        locale: courseNode.getAttribute('locale') === 'en' ? 'en' : 'es',
        workflow: courseNode.getAttribute('workflow') === 'review' ? 'review' : 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        modules: moduleNodes.map(moduleNode => {
          const lessonNodes = [...moduleNode.children].filter(node => node.nodeName === 'lesson');
          if (lessonNodes.length > MAX_LESSONS) throw new Error(`Un módulo excede ${MAX_LESSONS} lecciones.`);
          return {
            id: text(moduleNode.getAttribute('id') || uid('module'), 120),
            remoteId: null,
            title: childText(moduleNode, 'title', 120) || 'Módulo importado',
            objective: childText(moduleNode, 'objective', 500),
            lessons: lessonNodes.map(lessonNode => ({
              id: text(lessonNode.getAttribute('id') || uid('lesson'), 120),
              remoteId: null,
              title: childText(lessonNode, 'title', 120) || 'Lección importada',
              type: ['lesson', 'quiz', 'lab', 'video'].includes(lessonNode.getAttribute('type')) ? lessonNode.getAttribute('type') : 'lesson',
              duration: Math.max(1, Math.min(240, Number(lessonNode.getAttribute('duration')) || 10)),
              body: childText(lessonNode, 'body', 4000)
            }))
          };
        })
      };
    });

    return { version: 3, tenantId, importedAt: new Date().toISOString(), courses };
  }

  async function importFile(file) {
    if (!file) return;
    if (file.size > MAX_XML_BYTES) throw new Error('El XML excede el límite de 2 MB.');
    const raw = await file.text();
    const state = parseXml(raw);
    if (!state.courses.length) throw new Error('El XML no contiene cursos.');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    toast(`${state.courses.length} curso(s) importado(s) desde XML`);
    setTimeout(() => location.reload(), 450);
  }

  function mountControls() {
    const actions = document.querySelector('.studio-actions');
    if (!actions || document.getElementById('xmlExport')) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml,application/xml,text/xml';
    input.id = 'xmlImportFile';
    input.hidden = true;

    const importButton = document.createElement('button');
    importButton.type = 'button';
    importButton.className = 'secondary';
    importButton.id = 'xmlImport';
    importButton.textContent = 'Importar XML';
    importButton.addEventListener('click', () => input.click());

    const exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.className = 'secondary';
    exportButton.id = 'xmlExport';
    exportButton.textContent = 'Exportar XML';
    exportButton.addEventListener('click', exportXml);

    input.addEventListener('change', async () => {
      try {
        await importFile(input.files?.[0]);
      } catch (error) {
        toast(error?.message || 'No fue posible importar el XML');
      } finally {
        input.value = '';
      }
    });

    actions.prepend(input, exportButton, importButton);

    const mode = document.getElementById('studioMode');
    if (mode) mode.textContent = 'LOCAL + XML CONTENT ENGINE';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountControls, { once: true });
  else mountControls();
})();
