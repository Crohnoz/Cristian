(() => {
  const auth = window.CCAAuth;
  const telemetry = window.CrohnozTelemetry || { track: () => {} };
  const core = window.CrohnozAcademyCore;
  const session = auth?.requireAuth({ roles: ['author', 'coordinator', 'admin'], unauthorized: './instructor.html' });
  if (!session) return;

  const tenantId = String(window.CCA_CONFIG?.tenant?.id || 'cristian-demo');
  const STORAGE_KEY = `cca:content-studio:v1:${tenantId}`;
  const MAX_COURSES = 100;
  const MAX_MODULES = 40;
  const MAX_LESSONS = 80;
  const remoteEnabled = Boolean(core?.enabled && session.provider === 'crohnoz-academy' && core.isAuthenticated?.());
  let state = loadState();
  let selectedCourseId = state.courses[0]?.id || null;
  let selectedModuleId = state.courses[0]?.modules?.[0]?.id || null;
  let saveTimer = null;
  let remoteBusy = false;

  const $ = id => document.getElementById(id);
  const text = (value, max = 700) => String(value ?? '').slice(0, max);
  const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const now = () => new Date().toISOString();
  const unpack = payload => Array.isArray(payload) ? payload : (payload?.results || []);

  function slugify(value) {
    return text(value, 120).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  function starterCourse() {
    return {
      id: uid('course'), remoteId: null, remoteStatus: null,
      title: 'API Security Foundations',
      slug: 'api-security-foundations',
      summary: 'Aprende a reconocer fallas de autorización y a diseñar controles de acceso verificables mediante teoría breve, práctica guiada y evidencia.',
      level: 'foundation', locale: 'es', workflow: 'draft', createdAt: now(), updatedAt: now(),
      modules: [{
        id: uid('module'), remoteId: null, title: 'Authorization Essentials', objective: 'Distinguir autenticación, autorización y control a nivel de objeto antes de entrar al laboratorio.',
        lessons: [
          { id: uid('lesson'), remoteId: null, title: 'AuthN vs AuthZ', type: 'lesson', duration: 8, body: 'Conceptos esenciales y errores comunes al decidir quién puede hacer qué.' },
          { id: uid('lesson'), remoteId: null, title: 'BOLA: lectura de evidencia', type: 'lab', duration: 18, body: 'Escenario aislado para identificar autorización insuficiente a nivel de objeto sin objetivos externos.' }
        ]
      }]
    };
  }

  function normalizeLesson(item = {}) {
    return {
      id: text(item.id || uid('lesson'), 120),
      remoteId: item.remoteId ?? null,
      title: text(item.title || 'Nueva lección', 120),
      type: ['lesson', 'quiz', 'lab', 'video'].includes(item.type) ? item.type : 'lesson',
      duration: Math.max(1, Math.min(240, Number(item.duration) || 10)),
      body: text(item.body || '', 4000)
    };
  }

  function normalizeModule(item = {}) {
    return {
      id: text(item.id || uid('module'), 120),
      remoteId: item.remoteId ?? null,
      title: text(item.title || 'Nuevo módulo', 120),
      objective: text(item.objective || '', 500),
      lessons: Array.isArray(item.lessons) ? item.lessons.slice(0, MAX_LESSONS).map(normalizeLesson) : []
    };
  }

  function normalizeCourse(item = {}) {
    return {
      id: text(item.id || uid('course'), 120),
      remoteId: item.remoteId ?? null,
      remoteStatus: item.remoteStatus || null,
      title: text(item.title || 'Nuevo curso', 120),
      slug: slugify(item.slug || item.title || 'nuevo-curso') || `curso-${Date.now()}`,
      summary: text(item.summary || '', 700),
      level: ['foundation', 'intermediate', 'advanced'].includes(item.level) ? item.level : 'foundation',
      locale: item.locale === 'en' ? 'en' : 'es',
      workflow: item.workflow === 'review' ? 'review' : 'draft',
      createdAt: text(item.createdAt || now(), 40),
      updatedAt: text(item.updatedAt || now(), 40),
      modules: Array.isArray(item.modules) ? item.modules.slice(0, MAX_MODULES).map(normalizeModule) : []
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(parsed?.courses)) return { courses: parsed.courses.slice(0, MAX_COURSES).map(normalizeCourse) };
    } catch {}
    return { courses: [starterCourse()] };
  }

  function persist(reason = 'manual') {
    state.courses.forEach(course => { course.updatedAt = course.updatedAt || now(); });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, tenantId, courses: state.courses }));
    const indicator = $('saveState');
    if (indicator) indicator.innerHTML = '<i></i>Guardado local';
    telemetry.track('content_studio_saved', { reason, course_count: state.courses.length });
  }

  function scheduleSave() {
    const indicator = $('saveState');
    if (indicator) indicator.innerHTML = '<i></i>Guardando…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => persist('autosave'), 450);
  }

  function currentCourse() { return state.courses.find(course => course.id === selectedCourseId) || null; }
  function currentModule() { return currentCourse()?.modules.find(module => module.id === selectedModuleId) || null; }
  function courseLocked(course = currentCourse()) { return Boolean(remoteEnabled && course?.remoteId && (course.remoteStatus || 'draft') !== 'draft'); }

  function showToast(message) {
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = text(message, 180);
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function node(tag, value = '', className = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== '') el.textContent = text(value, 1000);
    return el;
  }

  function courseMinutes(course) {
    return course.modules.reduce((total, module) => total + module.lessons.reduce((sum, lesson) => sum + Number(lesson.duration || 0), 0), 0);
  }

  function renderCatalog() {
    const host = $('courseList');
    host.textContent = '';
    $('courseCount').textContent = String(state.courses.length);
    if (!state.courses.length) {
      host.appendChild(node('div', 'No hay cursos. Crea el primero para comenzar.', 'empty-list'));
      return;
    }
    state.courses.forEach(course => {
      const row = node('button', '', `course-row${course.id === selectedCourseId ? ' active' : ''}`);
      row.type = 'button'; row.dataset.courseId = course.id;
      const status = course.remoteStatus || course.workflow;
      row.append(node('strong', course.title), node('span', `${course.modules.length} módulos · ${courseMinutes(course)} min · ${String(status).toUpperCase()}`));
      row.addEventListener('click', () => selectCourse(course.id));
      host.appendChild(row);
    });
  }

  function renderCourseEditor() {
    const course = currentCourse();
    const locked = courseLocked(course);
    const controls = ['courseTitle','courseSlug','courseSummary','courseLevel','courseLocale','courseWorkflow','deleteCourse'];
    controls.forEach(id => { if ($(id)) $(id).disabled = !course || locked; });
    $('newCourse').disabled = remoteBusy;
    $('saveCourse').disabled = !course || locked || remoteBusy;
    $('addModule').disabled = !course || locked || remoteBusy;
    if (!course) {
      $('courseTitle').value = ''; $('courseSlug').value = ''; $('courseSummary').value = '';
      $('courseMeta').textContent = 'Sin curso seleccionado'; $('courseStatusChip').textContent = 'EMPTY';
      updateRemoteActions();
      return;
    }
    $('courseTitle').value = course.title;
    $('courseSlug').value = course.slug;
    $('courseSummary').value = course.summary;
    $('courseLevel').value = course.level;
    $('courseLocale').value = course.locale;
    $('courseWorkflow').value = course.workflow;
    $('courseStatusChip').textContent = String(course.remoteStatus || course.workflow).toUpperCase();
    const remoteCopy = course.remoteId ? ` · Core #${course.remoteId}` : '';
    const lockCopy = locked ? ' · bloqueado por workflow server-side' : '';
    $('courseMeta').textContent = `Actualizado ${new Date(course.updatedAt).toLocaleString('es-CL')} · ${course.modules.length} módulos · ${courseMinutes(course)} min${remoteCopy}${lockCopy}`;
    updateRemoteActions();
  }

  function renderModules() {
    const course = currentCourse();
    const host = $('moduleList'); host.textContent = '';
    $('moduleCount').textContent = String(course?.modules.length || 0);
    $('structureTitle').textContent = course ? course.title : 'Estructura del curso';
    $('addModule').disabled = !course || courseLocked(course) || remoteBusy;
    if (!course?.modules.length) {
      host.appendChild(node('div', course ? 'Este curso aún no tiene módulos.' : 'Selecciona un curso primero.', 'empty-list'));
    } else {
      course.modules.forEach((module, index) => {
        const row = node('button', '', `module-row${module.id === selectedModuleId ? ' active' : ''}`);
        row.type = 'button';
        row.append(node('strong', `${String(index + 1).padStart(2, '0')} · ${module.title}`), node('span', `${module.lessons.length} lecciones · ${module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)} min`));
        row.addEventListener('click', () => { selectedModuleId = module.id; renderModules(); renderModuleEditor(); });
        host.appendChild(row);
      });
    }
    renderModuleEditor();
  }

  function renderModuleEditor() {
    const module = currentModule();
    const locked = courseLocked();
    $('emptyModule').hidden = Boolean(module);
    $('moduleEditor').hidden = !module;
    if (!module) return;
    $('moduleTitle').value = module.title;
    $('moduleObjective').value = module.objective;
    $('moduleTitle').disabled = locked || remoteBusy;
    $('moduleObjective').disabled = locked || remoteBusy;
    $('deleteModule').disabled = locked || remoteBusy;
    $('addLesson').disabled = locked || remoteBusy;
    renderLessons();
  }

  function renderLessons() {
    const module = currentModule();
    const host = $('lessonList'); host.textContent = '';
    const locked = courseLocked();
    if (!module?.lessons.length) {
      host.appendChild(node('div', 'Agrega una lección, quiz, video o laboratorio.', 'empty-list'));
      return;
    }
    module.lessons.forEach((lesson, index) => {
      const wrapper = node('article', '', 'lesson-editor');
      const head = node('div', '', 'lesson-editor-head');
      head.appendChild(node('span', `LESSON ${String(index + 1).padStart(2, '0')}`, 'lesson-index'));
      const remove = node('button', 'Eliminar', 'danger-quiet'); remove.type = 'button'; remove.disabled = locked || remoteBusy;
      remove.addEventListener('click', () => removeLesson(lesson.id)); head.appendChild(remove);

      const fields = node('div', '', 'lesson-fields');
      const title = document.createElement('input'); title.value = lesson.title; title.maxLength = 120; title.placeholder = 'Título de la lección'; title.setAttribute('aria-label', 'Título de la lección');
      const type = document.createElement('select'); type.setAttribute('aria-label', 'Tipo de lección');
      [['lesson','Lección'],['quiz','Quiz'],['lab','Lab'],['video','Video']].forEach(([value,label]) => { const option = document.createElement('option'); option.value = value; option.textContent = label; type.appendChild(option); }); type.value = lesson.type;
      const duration = document.createElement('input'); duration.type = 'number'; duration.min = '1'; duration.max = '240'; duration.value = String(lesson.duration); duration.setAttribute('aria-label', 'Duración estimada en minutos');
      const body = document.createElement('textarea'); body.rows = 4; body.maxLength = 4000; body.value = lesson.body; body.placeholder = 'Guion, instrucciones o resultado esperado.'; body.className = 'lesson-body'; body.setAttribute('aria-label', 'Contenido de la lección');
      [title, type, duration, body].forEach(control => { control.disabled = locked || remoteBusy; });
      fields.append(title, type, duration, body); wrapper.append(head, fields); host.appendChild(wrapper);

      title.addEventListener('input', () => updateLesson(lesson.id, { title: title.value }));
      type.addEventListener('change', () => updateLesson(lesson.id, { type: type.value }));
      duration.addEventListener('input', () => updateLesson(lesson.id, { duration: Number(duration.value) || 1 }));
      body.addEventListener('input', () => updateLesson(lesson.id, { body: body.value }));
    });
  }

  function renderPreview() {
    const course = currentCourse();
    $('previewStatus').textContent = String(course?.remoteStatus || course?.workflow || 'draft').toUpperCase();
    $('previewTitle').textContent = course?.title || 'Nuevo curso';
    $('previewSummary').textContent = course?.summary || 'Agrega una descripción para explicar el resultado de aprendizaje.';
    $('previewKicker').textContent = `CYBERSECURITY · ${(course?.level || 'foundation').toUpperCase()} · ${(course?.locale || 'es').toUpperCase()}`;
    $('previewModules').textContent = String(course?.modules.length || 0);
    const lessonCount = course?.modules.reduce((sum, module) => sum + module.lessons.length, 0) || 0;
    $('previewLessons').textContent = String(lessonCount);
    $('previewMinutes').textContent = String(course ? courseMinutes(course) : 0);
    const host = $('previewOutline'); host.textContent = '';
    if (!course?.modules.length) { host.appendChild(node('div', 'La estructura aparecerá aquí cuando agregues módulos.', 'empty-list')); return; }
    course.modules.forEach((module, index) => {
      const section = node('section', '', 'outline-module');
      const head = node('div'); head.append(node('strong', `${String(index + 1).padStart(2, '0')} · ${module.title}`), node('span', module.objective || 'Objetivo local')); section.appendChild(head);
      const lessons = node('div', '', 'outline-lessons');
      module.lessons.forEach(lesson => {
        const row = node('div', '', 'outline-lesson'); row.append(node('span', lesson.title), node('small', `${lesson.type.toUpperCase()} · ${lesson.duration} min`)); lessons.appendChild(row);
      });
      if (!module.lessons.length) lessons.appendChild(node('div', 'Sin lecciones', 'empty-list'));
      section.appendChild(lessons); host.appendChild(section);
    });
  }

  function renderAll() { renderCatalog(); renderCourseEditor(); renderModules(); renderPreview(); }

  function selectCourse(id) {
    selectedCourseId = id;
    const course = currentCourse();
    selectedModuleId = course?.modules?.[0]?.id || null;
    renderAll();
  }

  function touch(course = currentCourse()) {
    if (!course || courseLocked(course)) return;
    course.updatedAt = now(); scheduleSave(); renderPreview();
  }

  function createCourse() {
    if (state.courses.length >= MAX_COURSES) return showToast('Límite local de cursos alcanzado.');
    const course = normalizeCourse({ title: 'Nuevo curso', slug: `nuevo-curso-${state.courses.length + 1}` });
    state.courses.unshift(course); selectedCourseId = course.id; selectedModuleId = null; persist('course-created'); renderAll();
    $('courseTitle').focus(); telemetry.track('content_studio_course_created', { workflow: 'draft' });
  }

  async function deleteCourse() {
    const course = currentCourse(); if (!course || courseLocked(course)) return;
    if (!confirm(`Eliminar el borrador “${course.title}”?`)) return;
    if (remoteEnabled && course.remoteId) {
      try { await core.deleteStudioCourse(course.remoteId); }
      catch (error) { return showRemoteError(error, 'No se pudo eliminar el borrador en Academy Core'); }
    }
    state.courses = state.courses.filter(item => item.id !== course.id);
    selectedCourseId = state.courses[0]?.id || null; selectedModuleId = state.courses[0]?.modules?.[0]?.id || null;
    persist('course-deleted'); renderAll(); showToast('Borrador eliminado.');
  }

  function addModule() {
    const course = currentCourse(); if (!course || courseLocked(course) || course.modules.length >= MAX_MODULES) return;
    const module = normalizeModule({ title: `Módulo ${course.modules.length + 1}` }); course.modules.push(module); selectedModuleId = module.id; touch(course); renderAll(); $('moduleTitle').focus();
    telemetry.track('content_studio_module_created', { course_slug: course.slug });
  }

  function deleteModule() {
    const course = currentCourse(), module = currentModule(); if (!course || !module || courseLocked(course)) return;
    course.modules = course.modules.filter(item => item.id !== module.id); selectedModuleId = course.modules[0]?.id || null; touch(course); renderAll(); showToast('Módulo marcado para eliminación al sincronizar.');
  }

  function addLesson() {
    const module = currentModule(), course = currentCourse(); if (!module || !course || courseLocked(course) || module.lessons.length >= MAX_LESSONS) return;
    module.lessons.push(normalizeLesson({ title: `Lección ${module.lessons.length + 1}` })); touch(course); renderLessons(); renderModules(); renderPreview(); telemetry.track('content_studio_lesson_created', { course_slug: course.slug });
  }

  function removeLesson(id) {
    const module = currentModule(), course = currentCourse(); if (!module || !course || courseLocked(course)) return;
    module.lessons = module.lessons.filter(item => item.id !== id); touch(course); renderLessons(); renderModules(); renderPreview();
  }

  function updateLesson(id, patch) {
    const module = currentModule(), course = currentCourse(); const lesson = module?.lessons.find(item => item.id === id); if (!lesson || !course || courseLocked(course)) return;
    if (patch.title !== undefined) lesson.title = text(patch.title, 120);
    if (patch.type !== undefined && ['lesson','quiz','lab','video'].includes(patch.type)) lesson.type = patch.type;
    if (patch.duration !== undefined) lesson.duration = Math.max(1, Math.min(240, Number(patch.duration) || 1));
    if (patch.body !== undefined) lesson.body = text(patch.body, 4000);
    touch(course);
  }

  function bindCourseFields() {
    $('courseTitle').addEventListener('input', event => { const course = currentCourse(); if (!course || courseLocked(course)) return; const previous = course.slug; course.title = text(event.target.value, 120); if (!previous || previous.startsWith('nuevo-curso-')) { course.slug = slugify(course.title); $('courseSlug').value = course.slug; } touch(course); renderCatalog(); });
    $('courseSlug').addEventListener('input', event => { const course = currentCourse(); if (!course || courseLocked(course)) return; course.slug = slugify(event.target.value); event.target.value = course.slug; touch(course); });
    $('courseSummary').addEventListener('input', event => { const course = currentCourse(); if (!course || courseLocked(course)) return; course.summary = text(event.target.value, 700); touch(course); });
    $('courseLevel').addEventListener('change', event => { const course = currentCourse(); if (!course || courseLocked(course)) return; course.level = event.target.value; touch(course); });
    $('courseLocale').addEventListener('change', event => { const course = currentCourse(); if (!course || courseLocked(course)) return; course.locale = event.target.value; touch(course); });
    $('courseWorkflow').addEventListener('change', event => { const course = currentCourse(); if (!course || courseLocked(course)) return; course.workflow = event.target.value === 'review' ? 'review' : 'draft'; touch(course); renderCourseEditor(); renderCatalog(); });
    $('moduleTitle').addEventListener('input', event => { const module = currentModule(), course = currentCourse(); if (!module || !course || courseLocked(course)) return; module.title = text(event.target.value, 120); touch(course); renderModules(); });
    $('moduleObjective').addEventListener('input', event => { const module = currentModule(), course = currentCourse(); if (!module || !course || courseLocked(course)) return; module.objective = text(event.target.value, 500); touch(course); renderPreview(); });
  }

  function bindNavigation() {
    document.querySelectorAll('.studio-nav').forEach(button => button.addEventListener('click', () => {
      const panel = button.dataset.panel;
      document.querySelectorAll('.studio-nav').forEach(item => item.classList.toggle('active', item === button));
      document.querySelectorAll('[data-studio-panel]').forEach(section => section.classList.toggle('active', section.dataset.studioPanel === panel));
      if (panel === 'preview') renderPreview();
    }));
  }

  function levelToCore(level) { return level === 'foundation' ? 'initial' : level; }
  function levelFromCore(level) { return level === 'initial' ? 'foundation' : (['intermediate','advanced'].includes(level) ? level : 'foundation'); }
  function kindToCore(type) { return ({ lesson:'lesson', quiz:'assessment', lab:'practice', video:'resource' })[type] || 'lesson'; }
  function kindFromCore(kind) { return ({ lesson:'lesson', assessment:'quiz', practice:'lab', scenario:'lab', resource:'video' })[kind] || 'lesson'; }
  function bilingual(value) { const safe = text(value, 4000); return [safe, safe]; }

  function coursePayload(course) {
    const [titleEs, titleEn] = bilingual(course.title);
    const [descriptionEs, descriptionEn] = bilingual(course.summary);
    return {
      slug: course.slug,
      title_es: titleEs,
      title_en: titleEn,
      description_es: descriptionEs,
      description_en: descriptionEn,
      level: levelToCore(course.level),
      duration_minutes: Math.max(1, courseMinutes(course)),
      is_demo: false
    };
  }

  function modulePayload(course, module, order) {
    const [titleEs, titleEn] = bilingual(module.title);
    return { course: course.remoteId, slug: slugify(module.title) || `module-${order}`, title_es: titleEs, title_en: titleEn, order };
  }

  function lessonPayload(module, lesson, order) {
    const [titleEs, titleEn] = bilingual(lesson.title);
    const [bodyEs, bodyEn] = bilingual(lesson.body);
    return {
      module: module.remoteId,
      slug: slugify(lesson.title) || `lesson-${order}`,
      title_es: titleEs,
      title_en: titleEn,
      body_es: bodyEs,
      body_en: bodyEn,
      kind: kindToCore(lesson.type),
      order,
      estimated_minutes: lesson.duration
    };
  }

  async function withRemoteBusy(work) {
    if (!remoteEnabled || remoteBusy) return;
    remoteBusy = true; updateRemoteActions(); renderCourseEditor(); renderModules();
    try { await work(); }
    finally { remoteBusy = false; updateRemoteActions(); renderCourseEditor(); renderModules(); }
  }

  function showRemoteError(error, prefix = 'Academy Core rechazó la operación') {
    console.error('[CCA Studio]', error);
    const detail = error?.message && !String(error.message).startsWith('ACADEMY_CORE_') ? error.message : 'revisa sesión, rol y estado editorial';
    showToast(`${prefix}: ${detail}`);
    telemetry.track('content_studio_remote_error', { status: error?.status || 0, code: error?.code || 'unknown' });
  }

  async function syncSelectedCourse() {
    const course = currentCourse();
    if (!remoteEnabled || !course) return showToast('Academy Core no está conectado en este entorno.');
    if (courseLocked(course)) return showToast('El backend bloqueó edición: devuelve el contenido a DRAFT antes de modificarlo.');

    await withRemoteBusy(async () => {
      try {
        const remoteCourse = course.remoteId
          ? await core.updateStudioCourse(course.remoteId, coursePayload(course))
          : await core.createStudioCourse(coursePayload(course));
        course.remoteId = remoteCourse.id;
        course.remoteStatus = remoteCourse.status || 'draft';

        const [remoteModulesPayload, remoteLessonsPayload] = await Promise.all([core.studioModules(), core.studioLessons()]);
        const remoteModules = unpack(remoteModulesPayload).filter(item => String(item.course) === String(course.remoteId));
        const remoteModuleIds = new Set(remoteModules.map(item => String(item.id)));
        const remoteLessons = unpack(remoteLessonsPayload).filter(item => remoteModuleIds.has(String(item.module)));

        for (let index = 0; index < course.modules.length; index += 1) {
          const module = course.modules[index];
          const response = module.remoteId
            ? await core.updateStudioModule(module.remoteId, modulePayload(course, module, index + 1))
            : await core.createStudioModule(modulePayload(course, module, index + 1));
          module.remoteId = response.id;

          for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
            const lesson = module.lessons[lessonIndex];
            const lessonResponse = lesson.remoteId
              ? await core.updateStudioLesson(lesson.remoteId, lessonPayload(module, lesson, lessonIndex + 1))
              : await core.createStudioLesson(lessonPayload(module, lesson, lessonIndex + 1));
            lesson.remoteId = lessonResponse.id;
          }
        }

        const localLessonIds = new Set(course.modules.flatMap(module => module.lessons.map(lesson => String(lesson.remoteId)).filter(Boolean)));
        for (const remoteLesson of remoteLessons) {
          if (!localLessonIds.has(String(remoteLesson.id))) await core.deleteStudioLesson(remoteLesson.id);
        }
        const localModuleIds = new Set(course.modules.map(module => String(module.remoteId)).filter(Boolean));
        for (const remoteModule of remoteModules) {
          if (!localModuleIds.has(String(remoteModule.id))) await core.deleteStudioModule(remoteModule.id);
        }

        course.updatedAt = now(); persist('academy-core-sync'); renderAll();
        telemetry.track('content_studio_remote_synced', { course_id: course.remoteId, modules: course.modules.length });
        showToast('Borrador sincronizado con Academy Core.');
      } catch (error) { showRemoteError(error, 'No se pudo sincronizar'); }
    });
  }

  async function loadFromCore() {
    if (!remoteEnabled) return showToast('Academy Core no está conectado en este entorno.');
    await withRemoteBusy(async () => {
      try {
        const [coursesPayload, modulesPayload, lessonsPayload] = await Promise.all([core.studioCourses(), core.studioModules(), core.studioLessons()]);
        const remoteCourses = unpack(coursesPayload);
        const remoteModules = unpack(modulesPayload);
        const remoteLessons = unpack(lessonsPayload);
        const courses = remoteCourses.map(remote => {
          const modules = remoteModules.filter(module => String(module.course) === String(remote.id)).map(module => ({
            id: uid('module'), remoteId: module.id,
            title: module.title_es || module.title_en || module.slug,
            objective: '',
            lessons: remoteLessons.filter(lesson => String(lesson.module) === String(module.id)).map(lesson => ({
              id: uid('lesson'), remoteId: lesson.id,
              title: lesson.title_es || lesson.title_en || lesson.slug,
              type: kindFromCore(lesson.kind),
              duration: lesson.estimated_minutes || 8,
              body: lesson.body_es || lesson.body_en || ''
            }))
          }));
          return normalizeCourse({
            id: uid('course'), remoteId: remote.id, remoteStatus: remote.status,
            title: remote.title_es || remote.title_en || remote.slug,
            slug: remote.slug,
            summary: remote.description_es || remote.description_en || '',
            level: levelFromCore(remote.level),
            locale: 'es', workflow: remote.status === 'review' ? 'review' : 'draft',
            createdAt: remote.created_at, updatedAt: remote.updated_at, modules
          });
        });
        if (!courses.length) return showToast('Academy Core no tiene cursos visibles para este rol.');
        state = { courses }; selectedCourseId = courses[0].id; selectedModuleId = courses[0].modules[0]?.id || null;
        persist('academy-core-pull'); renderAll(); telemetry.track('content_studio_remote_loaded', { courses: courses.length }); showToast('Contenido cargado desde Academy Core.');
      } catch (error) { showRemoteError(error, 'No se pudo cargar Academy Core'); }
    });
  }

  async function submitForReview() {
    const course = currentCourse();
    if (!remoteEnabled || !course) return showToast('Academy Core no está conectado en este entorno.');
    if (course.remoteStatus && course.remoteStatus !== 'draft') return showToast(`El curso ya está en estado ${course.remoteStatus.toUpperCase()}.`);
    await syncSelectedCourse();
    if (!course.remoteId || course.remoteStatus !== 'draft') return;
    await withRemoteBusy(async () => {
      try {
        const response = await core.transitionStudioCourse(course.remoteId, 'review');
        course.remoteStatus = response.status || 'review'; course.workflow = 'review'; course.updatedAt = now(); persist('submitted-review'); renderAll();
        telemetry.track('content_studio_submitted_review', { course_id: course.remoteId }); showToast('Curso enviado a revisión. Edición bloqueada hasta volver a DRAFT.');
      } catch (error) { showRemoteError(error, 'No se pudo enviar a revisión'); }
    });
  }

  function updateRemoteActions() {
    const remoteState = $('remoteState');
    const loadButton = $('loadCore');
    const syncButton = $('syncCourse');
    const reviewButton = $('submitReview');
    if (!remoteState || !loadButton || !syncButton || !reviewButton) return;
    [loadButton, syncButton, reviewButton].forEach(button => { button.hidden = !remoteEnabled; });
    if (!remoteEnabled) {
      remoteState.innerHTML = '<i></i>Core desconectado';
      remoteState.title = 'ACADEMY_CORE permanece deshabilitado hasta configurar un API explícito.';
      return;
    }
    const course = currentCourse();
    remoteState.innerHTML = `<i></i>${remoteBusy ? 'Sincronizando…' : 'Core conectado'}`;
    syncButton.disabled = remoteBusy || !course || courseLocked(course);
    reviewButton.disabled = remoteBusy || !course || courseLocked(course) || Boolean(course?.remoteStatus && course.remoteStatus !== 'draft');
    loadButton.disabled = remoteBusy;
  }

  $('newCourse').addEventListener('click', createCourse);
  $('saveCourse').addEventListener('click', () => { const course = currentCourse(); if (!course || courseLocked(course)) return showToast('Este contenido no admite edición directa.'); course.updatedAt = now(); persist('manual'); renderAll(); showToast('Borrador guardado localmente.'); });
  $('deleteCourse').addEventListener('click', deleteCourse);
  $('addModule').addEventListener('click', addModule);
  $('deleteModule').addEventListener('click', deleteModule);
  $('addLesson').addEventListener('click', addLesson);
  $('loadCore')?.addEventListener('click', loadFromCore);
  $('syncCourse')?.addEventListener('click', syncSelectedCourse);
  $('submitReview')?.addEventListener('click', submitForReview);
  bindCourseFields(); bindNavigation(); renderAll(); persist('studio-opened');

  $('studioMode').textContent = remoteEnabled ? 'ACADEMY CORE CONNECTED · CONTROLLED WORKFLOW' : 'LOCAL DRAFT ENGINE · BACKEND READY';
  updateRemoteActions();
  telemetry.track('content_studio_loaded', { mode: remoteEnabled ? 'academy-core' : 'local-fallback', tenant: tenantId });
})();