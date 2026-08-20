(() => {
  const auth = window.CCAAuth;
  const core = window.CrohnozAcademyCore;
  const session = auth.requireAuth({ permission: 'manage_users', unauthorized: './instructor.html' });
  if (!session) return;

  const DEMO_KEY = 'cca:user-admin-demo:v1';
  const operatorRole = session.user?.role || 'coordinator';
  const isRemote = Boolean(core?.enabled && session.provider === 'crohnoz-academy');
  const allowedRoles = operatorRole === 'admin'
    ? ['learner', 'instructor', 'author', 'reviewer', 'coordinator', 'admin']
    : ['learner', 'instructor', 'author', 'reviewer', 'coordinator'];

  let model = { profiles: [], invitations: [], cohorts: [], memberships: [], enrollments: [], audit: [] };

  function text(value, max = 180) { return String(value ?? '').slice(0, max); }
  function unpack(payload) { return Array.isArray(payload) ? payload : (payload?.results || []); }
  function nowIso() { return new Date().toISOString(); }
  function node(tag, value = '', className = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== '') el.textContent = text(value, 400);
    return el;
  }
  function initials(value) {
    return text(value || 'CA', 120).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'CA';
  }
  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = text(message, 160);
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  function isSelf(profile) {
    return Boolean(session.user?.email && String(session.user.email).toLowerCase() === String(profile.email || '').toLowerCase());
  }

  function demoSeed() {
    const ago = minutes => new Date(Date.now() - minutes * 60e3).toISOString();
    const profiles = [
      { id:'p1', user_id:1, username:'cristian.demo', email:'cristian@demo.example', display_name:'Cristian', role:'coordinator', locale:'es', onboarding_completed:true, is_active:true, last_login:ago(3) },
      { id:'p2', user_id:2, username:'camila.rojas', email:'camila@demo.example', display_name:'Camila Rojas', role:'learner', locale:'es', onboarding_completed:true, is_active:true, last_login:ago(34) },
      { id:'p3', user_id:3, username:'diego.martin', email:'diego@demo.example', display_name:'Diego Martín', role:'learner', locale:'es', onboarding_completed:true, is_active:true, last_login:ago(190) },
      { id:'p4', user_id:4, username:'valentina.soto', email:'valentina@demo.example', display_name:'Valentina Soto', role:'learner', locale:'es', onboarding_completed:false, is_active:true, last_login:null },
      { id:'p5', user_id:5, username:'matias.vega', email:'matias@demo.example', display_name:'Matías Vega', role:'learner', locale:'es', onboarding_completed:true, is_active:true, last_login:ago(1440) },
      { id:'p6', user_id:6, username:'sofia.reyes', email:'sofia@demo.example', display_name:'Sofía Reyes', role:'learner', locale:'es', onboarding_completed:false, is_active:true, last_login:null },
      { id:'p7', user_id:7, username:'andres.instructor', email:'andres@demo.example', display_name:'Andrés Demo', role:'instructor', locale:'es', onboarding_completed:true, is_active:true, last_login:ago(74) },
      { id:'p8', user_id:8, username:'maria.author', email:'maria@demo.example', display_name:'María Demo', role:'author', locale:'es', onboarding_completed:true, is_active:true, last_login:ago(320) }
    ];
    const cohorts = [
      { id:'c1', name:'AppSec Foundations', code:'APPSEC-01', max_students:18, status:'active' },
      { id:'c2', name:'Cyber Awareness Q3', code:'AWARE-Q3', max_students:24, status:'active' },
      { id:'c3', name:'Blue Team Starter', code:'BLUE-01', max_students:12, status:'active' }
    ];
    const memberships = [
      { id:'m2', cohort:'c1', user:2, status:'active' }, { id:'m3', cohort:'c1', user:3, status:'active' },
      { id:'m4', cohort:'c2', user:4, status:'active' }, { id:'m5', cohort:'c2', user:5, status:'active' },
      { id:'m6', cohort:'c3', user:6, status:'active' }
    ];
    const enrollments = [
      { learner:{id:2}, progress_percent:82 }, { learner:{id:3}, progress_percent:61 },
      { learner:{id:4}, progress_percent:34 }, { learner:{id:5}, progress_percent:74 }, { learner:{id:6}, progress_percent:46 }
    ];
    const invitations = [
      { id:'i1', email:'nuevo.analista@demo.example', role:'learner', locale:'es', expires_at:new Date(Date.now()+36*3600e3).toISOString(), accepted_at:null, revoked_at:null, is_usable:true, metadata:{requested_cohort:'c1'} },
      { id:'i2', email:'instructor.blue@demo.example', role:'instructor', locale:'es', expires_at:new Date(Date.now()+20*3600e3).toISOString(), accepted_at:null, revoked_at:null, is_usable:true, metadata:{} }
    ];
    const audit = [
      { id:'a1', created_at:new Date(Date.now()-18*60e3).toISOString(), action:'access.invitation.created', actor:{username:'cristian.demo'}, metadata:{role:'learner'} },
      { id:'a2', created_at:new Date(Date.now()-52*60e3).toISOString(), action:'cohort.member.added', actor:{username:'cristian.demo'}, metadata:{cohort:'AppSec Foundations'} },
      { id:'a3', created_at:new Date(Date.now()-95*60e3).toISOString(), action:'profile.updated', actor:{username:'cristian.demo'}, metadata:{fields:['role']} }
    ];
    return { profiles, invitations, cohorts, memberships, enrollments, audit };
  }

  function normalizeDemoState(state) {
    state.profiles = (state.profiles || []).map(profile => ({ is_active:true, last_login:null, ...profile }));
    state.invitations ||= [];
    state.cohorts ||= [];
    state.memberships ||= [];
    state.enrollments ||= [];
    state.audit ||= [];
    return state;
  }

  function loadDemo() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null');
      if (parsed?.profiles && parsed?.cohorts) return normalizeDemoState(parsed);
    } catch {}
    const seeded = demoSeed();
    localStorage.setItem(DEMO_KEY, JSON.stringify(seeded));
    return seeded;
  }

  function saveDemo() { if (!isRemote) localStorage.setItem(DEMO_KEY, JSON.stringify(model)); }
  function addDemoAudit(action, metadata = {}) {
    if (isRemote) return;
    model.audit.unshift({ id: crypto.randomUUID?.() || String(Date.now()), created_at:nowIso(), action, actor:{username:session.user?.username || 'cristian.demo'}, metadata });
    model.audit = model.audit.slice(0, 40);
    saveDemo();
  }

  async function loadRemote() {
    const [profiles, invitations, cohorts, memberships, enrollments, audit] = await Promise.all([
      core.opsProfiles(), core.invitations(), core.opsCohorts(), core.opsMemberships(), core.opsEnrollments(), core.opsAuditEvents()
    ]);
    return {
      profiles: unpack(profiles), invitations: unpack(invitations), cohorts: unpack(cohorts),
      memberships: unpack(memberships), enrollments: unpack(enrollments), audit: unpack(audit)
    };
  }

  function isPending(invite) {
    if (invite.accepted_at || invite.revoked_at) return false;
    if (invite.is_usable === false) return false;
    const expiry = new Date(invite.expires_at || 0).getTime();
    return !expiry || expiry > Date.now();
  }

  function membershipsFor(userId) {
    return model.memberships.filter(item => String(item.user?.id ?? item.user) === String(userId) && item.status !== 'removed');
  }

  function progressFor(userId) {
    const rows = model.enrollments.filter(item => String(item.learner?.id ?? item.user_id ?? '') === String(userId));
    if (!rows.length) return null;
    const values = rows.map(item => Number(item.progress_percent || 0)).filter(Number.isFinite);
    return values.length ? Math.round(values.reduce((a,b) => a+b, 0) / values.length) : null;
  }

  function renderKpis() {
    const pending = model.invitations.filter(isPending).length;
    const completed = model.profiles.filter(profile => profile.onboarding_completed).length;
    const onboard = model.profiles.length ? Math.round(completed / model.profiles.length * 100) : 0;
    document.getElementById('usersKpi').textContent = String(model.profiles.length);
    document.getElementById('invitesKpi').textContent = String(pending);
    document.getElementById('cohortsKpi').textContent = String(model.cohorts.filter(c => c.status !== 'archived').length);
    document.getElementById('onboardingKpi').textContent = `${onboard}%`;
    document.getElementById('identityProvider').textContent = isRemote ? 'CROHNOZ ACADEMY CORE' : 'PREVIEW DEMO';
    document.getElementById('operatorLabel').textContent = `Operador: ${session.user?.display_name || 'Cristian'} · ${operatorRole}`;
  }

  function fillCohortSelects() {
    const invite = document.getElementById('inviteCohort');
    const current = invite.value;
    while (invite.options.length > 1) invite.remove(1);
    model.cohorts.filter(c => c.status !== 'archived').forEach(cohort => {
      const option = document.createElement('option'); option.value = cohort.id; option.textContent = cohort.name; invite.appendChild(option);
    });
    if ([...invite.options].some(option => option.value === current)) invite.value = current;
  }

  function createRoleSelect(profile) {
    const select = document.createElement('select');
    allowedRoles.forEach(role => { const option=document.createElement('option'); option.value=role; option.textContent=role; option.selected=profile.role===role; select.appendChild(option); });
    const locked = isSelf(profile) || profile.is_active === false;
    select.disabled = locked;
    select.title = isSelf(profile) ? 'Tu propio rol debe cambiarlo otro administrador.' : profile.is_active === false ? 'Reactiva la cuenta antes de cambiar su rol.' : 'Cambiar rol académico';
    select.addEventListener('change', async () => {
      const previous = profile.role;
      select.disabled = true;
      try {
        if (isRemote) await core.updateOpsProfile(profile.id, { role: select.value });
        else { profile.role = select.value; addDemoAudit('profile.role.changed', { user:profile.username, from:previous, to:select.value }); }
        showToast(`Rol actualizado: ${profile.display_name || profile.username} → ${select.value}`);
        await refresh();
      } catch (error) {
        select.value = previous;
        showToast(error.message || 'No pudimos cambiar el rol');
      } finally { select.disabled = isSelf(profile) || profile.is_active === false; }
    });
    return select;
  }

  function createCohortSelect(profile) {
    const select = document.createElement('select');
    const none = document.createElement('option'); none.value=''; none.textContent='Sin cohorte'; select.appendChild(none);
    const existing = membershipsFor(profile.user_id)[0] || null;
    model.cohorts.filter(c => c.status !== 'archived').forEach(cohort => {
      const option=document.createElement('option'); option.value=cohort.id; option.textContent=cohort.name;
      option.selected = existing && String(existing.cohort?.id ?? existing.cohort) === String(cohort.id);
      select.appendChild(option);
    });
    const locked = profile.role !== 'learner' || profile.is_active === false;
    select.disabled = locked;
    select.title = profile.is_active === false ? 'Reactiva la cuenta antes de modificar cohortes.' : profile.role !== 'learner' ? 'Las cohortes de aprendizaje se asignan a learners.' : 'Asignar cohorte';
    select.addEventListener('change', async () => {
      select.disabled = true;
      try {
        const chosen = select.value;
        if (isRemote) {
          if (existing && chosen) await core.updateMembership(existing.id, { cohort: chosen, status:'active' });
          else if (existing && !chosen) await core.updateMembership(existing.id, { status:'removed' });
          else if (!existing && chosen) await core.createMembership({ cohort:chosen, user:profile.user_id, status:'active' });
        } else {
          if (existing && chosen) { existing.cohort=chosen; existing.status='active'; }
          else if (existing && !chosen) existing.status='removed';
          else if (!existing && chosen) model.memberships.push({ id:crypto.randomUUID?.() || String(Date.now()), cohort:chosen, user:profile.user_id, status:'active' });
          addDemoAudit(chosen ? 'cohort.member.assigned' : 'cohort.member.removed', { user:profile.username, cohort:chosen || null });
        }
        showToast(chosen ? 'Cohorte actualizada' : 'Usuario removido de la cohorte');
        await refresh();
      } catch (error) { showToast(error.message || 'No pudimos actualizar la cohorte'); }
      finally { select.disabled = profile.role !== 'learner' || profile.is_active === false; }
    });
    return select;
  }

  function createLifecycleCell(profile) {
    const cell = node('div', '', 'lifecycle-cell');
    const active = profile.is_active !== false;
    cell.appendChild(node('span', active ? 'ACTIVE' : 'SUSPENDED', `state-chip ${active ? 'good' : 'warn'}`));
    const posture = profile.last_login
      ? `Último acceso · ${new Date(profile.last_login).toLocaleString('es-CL')}`
      : profile.onboarding_completed ? 'Sin login registrado' : 'Onboarding pendiente';
    cell.appendChild(node('small', posture));

    const forbiddenAdmin = profile.role === 'admin' && operatorRole !== 'admin';
    const button = node('button', active ? 'Suspender' : 'Reactivar', 'row-action');
    button.type = 'button';
    button.disabled = isSelf(profile) || forbiddenAdmin;
    button.title = isSelf(profile)
      ? 'No puedes cambiar el estado de tu propia cuenta.'
      : forbiddenAdmin ? 'Solo un admin puede cambiar el estado de otra cuenta admin.' : '';
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      if (active && !window.confirm(`Suspender acceso de ${profile.display_name || profile.username}? Se revocará su sesión activa.`)) return;
      button.disabled = true;
      try {
        if (isRemote) {
          if (active) await core.suspendOpsProfile(profile.id);
          else await core.reactivateOpsProfile(profile.id);
        } else {
          profile.is_active = !active;
          addDemoAudit(active ? 'account.suspended' : 'account.reactivated', { user:profile.username, role:profile.role });
        }
        showToast(active ? 'Cuenta suspendida y sesión revocada' : 'Cuenta reactivada');
        await refresh();
      } catch (error) {
        showToast(error.message || 'No pudimos cambiar el estado de la cuenta');
        button.disabled = false;
      }
    });
    cell.appendChild(button);
    return cell;
  }

  function renderUsers() {
    const host = document.getElementById('userTable'); host.textContent='';
    const search = document.getElementById('userSearch').value.trim().toLowerCase();
    const role = document.getElementById('roleFilter').value;
    const rows = model.profiles.filter(profile => {
      const haystack = `${profile.display_name || ''} ${profile.username || ''} ${profile.email || ''}`.toLowerCase();
      return (!search || haystack.includes(search)) && (!role || profile.role === role);
    });

    const head=node('div','', 'user-row head'); ['IDENTIDAD','ROL','COHORTE','PROGRESO','ACCESO'].forEach(label=>head.appendChild(node('span',label))); host.appendChild(head);
    if (!rows.length) { host.appendChild(node('div','No hay usuarios que coincidan con el filtro.','empty-admin')); return; }

    rows.forEach(profile => {
      const row=node('div','', `user-row${profile.is_active === false ? ' suspended' : ''}`);
      const identity=node('div','', 'user-identity'); identity.appendChild(node('div',initials(profile.display_name || profile.username),'mini-avatar'));
      const copy=node('div'); copy.appendChild(node('strong',profile.display_name || profile.username)); copy.appendChild(node('span',`${profile.username || '—'} · ${profile.email || '—'}`)); identity.appendChild(copy);
      row.appendChild(identity);
      row.appendChild(createRoleSelect(profile));
      row.appendChild(createCohortSelect(profile));
      const progress=progressFor(profile.user_id); row.appendChild(node('strong',progress===null?'—':`${progress}%`));
      row.appendChild(createLifecycleCell(profile));
      host.appendChild(row);
    });
  }

  function renderInvitations() {
    const host=document.getElementById('inviteList'); host.textContent='';
    const pending=model.invitations.filter(isPending);
    document.getElementById('pendingInviteCount').textContent=`${pending.length} PENDING`;
    if (!pending.length) { host.appendChild(node('div','No hay invitaciones pendientes.','empty-admin')); return; }
    pending.forEach(invite => {
      const item=node('div','', 'invite-item'); const copy=node('div'); copy.appendChild(node('strong',invite.email));
      const expiry=invite.expires_at ? new Date(invite.expires_at).toLocaleString('es-CL') : 'sin fecha'; copy.appendChild(node('small',`${invite.role} · expira ${expiry}`));
      const button=node('button','Revocar'); button.type='button'; button.addEventListener('click',async()=>{
        button.disabled=true;
        try {
          if(isRemote) await core.revokeInvitation(invite.id); else { invite.revoked_at=nowIso(); invite.is_usable=false; addDemoAudit('access.invitation.revoked',{email:invite.email}); }
          showToast('Invitación revocada'); await refresh();
        } catch(error){showToast(error.message||'No pudimos revocar la invitación'); button.disabled=false;}
      });
      item.append(copy,button); host.appendChild(item);
    });
  }

  function renderCohorts() {
    const host=document.getElementById('cohortList'); host.textContent='';
    const active=model.cohorts.filter(c=>c.status!=='archived'); document.getElementById('cohortCount').textContent=`${active.length} ACTIVE`;
    active.forEach(cohort=>{
      const members=model.memberships.filter(m=>String(m.cohort?.id??m.cohort)===String(cohort.id)&&m.status!=='removed').length;
      const max=Math.max(1,Number(cohort.max_students||members||1)); const pct=Math.min(100,Math.round(members/max*100));
      const item=node('div','', 'cohort-item'); const copy=node('div'); copy.appendChild(node('strong',cohort.name)); copy.appendChild(node('small',`${cohort.code || 'COHORT'} · ${members}/${max} miembros`));
      const meter=node('div','', 'cohort-meter'); const fill=node('i'); fill.style.width=`${pct}%`; meter.appendChild(fill); item.append(copy,meter); host.appendChild(item);
    });
    if(!active.length) host.appendChild(node('div','No hay cohortes activas.','empty-admin'));
  }

  function renderAudit() {
    const host=document.getElementById('auditList'); host.textContent='';
    const rows=model.audit.slice(0,8);
    if(!rows.length){host.appendChild(node('div','Sin operaciones recientes.','empty-admin'));return;}
    rows.forEach(event=>{
      const item=node('div','', 'audit-item'); const copy=node('div'); copy.appendChild(node('strong',event.action || 'event','audit-action'));
      const actor=event.actor?.username || event.actor || 'system'; const metadata=event.metadata&&typeof event.metadata==='object'?Object.entries(event.metadata).slice(0,3).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(','):v}`).join(' · '):'';
      copy.appendChild(node('small',`${actor}${metadata?` · ${metadata}`:''}`)); const at=event.created_at||event.at; item.append(copy,node('small',at?new Date(at).toLocaleString('es-CL'):'—')); host.appendChild(item);
    });
  }

  function renderAll() { renderKpis(); fillCohortSelects(); renderUsers(); renderInvitations(); renderCohorts(); renderAudit(); }

  async function refresh() {
    try { model = isRemote ? await loadRemote() : loadDemo(); renderAll(); }
    catch (error) { showToast(error.code==='NETWORK_ERROR'?'Academy Core no está disponible':(error.message||'No pudimos cargar Identity Operations')); }
  }

  document.getElementById('userSearch').addEventListener('input',renderUsers);
  document.getElementById('roleFilter').addEventListener('change',renderUsers);
  document.getElementById('copyActivation').addEventListener('click',async()=>{
    const value=document.getElementById('activationLink').textContent;
    try{await navigator.clipboard.writeText(value);showToast('Enlace copiado');}catch{showToast('Selecciona y copia el enlace manualmente');}
  });

  document.getElementById('inviteForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const form=event.currentTarget; const button=form.querySelector('button[type="submit"]'); const feedback=document.getElementById('inviteFeedback');
    const email=document.getElementById('inviteEmail').value.trim().toLowerCase(); const role=document.getElementById('inviteRole').value; const locale=document.getElementById('inviteLocale').value; const requestedCohort=document.getElementById('inviteCohort').value;
    feedback.className='admin-feedback'; feedback.textContent=''; document.getElementById('activationResult').hidden=true; button.disabled=true;
    try {
      let invitation; let activationUrl='';
      if(isRemote){
        invitation=await core.createInvitation({email,role,locale,ttl_hours:48,metadata:{tenant:'cristian-demo',source:'cca-identity-ops',requested_cohort:requestedCohort||null}});
        if(invitation.activation_token) activationUrl=`${location.origin}/activate.html?token=${encodeURIComponent(invitation.activation_token)}`;
      } else {
        if(model.profiles.some(p=>String(p.email).toLowerCase()===email)||model.invitations.some(i=>isPending(i)&&String(i.email).toLowerCase()===email)) throw new Error('Ya existe una cuenta o invitación pendiente para ese correo.');
        const id=crypto.randomUUID?.()||String(Date.now()); invitation={id,email,role,locale,expires_at:new Date(Date.now()+48*3600e3).toISOString(),accepted_at:null,revoked_at:null,is_usable:true,metadata:{requested_cohort:requestedCohort||null}};
        model.invitations.unshift(invitation); addDemoAudit('access.invitation.created',{email,role}); saveDemo(); activationUrl=`${location.origin}/activate.html?demo=${encodeURIComponent(id)}`;
      }
      feedback.className='admin-feedback good'; feedback.textContent=isRemote?'Invitación creada. Academy Core intentará entregarla por correo; el enlace queda disponible como fallback.':'Invitación creada. El usuario debe definir su propia contraseña.';
      if(activationUrl){document.getElementById('activationLink').textContent=activationUrl;document.getElementById('activationResult').hidden=false;}
      form.reset(); await refresh();
    } catch(error){feedback.className='admin-feedback bad';feedback.textContent=error.message||'No pudimos crear la invitación.';}
    finally{button.disabled=false;}
  });

  refresh();
})();