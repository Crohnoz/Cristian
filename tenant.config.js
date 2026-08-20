window.CCA_CONFIG = Object.freeze({
  brand: { name:'Cristian Cyber Academy', shortName:'CCA', poweredBy:'Crohnoz Labs', accent:'#8b6fd1', themeColor:'#0b111a' },
  instructor: { displayName:'Cristian', role:'Lead Cybersecurity Instructor', initials:'CG' },
  tenant: { id:'cristian-demo', environment:'preview', mode:'white-label' },
  product: {
    version:'1.0.0-rc.1',
    northStar:'Learn → Practice → Explain → Score → Certify',
    modules:['learner-onboarding','teacher-intranet','privacy-hardening','content-studio','xml-content','docker-runtime','clarity-guidance','learner-progress','premium-polish','public-showcase','mission-control','unified-product-shell','immersive-learning','visual-academy','academy','phishing','range','achievements','account','identity-ops','student-360']
  },
  content: { exchangeFormat:'xml', xmlVersion:1, maxImportBytes:2097152, allowDtd:false, allowEntities:false },
  automation: { aiAgentEnabled:false, autonomousPublishing:false, humanReviewRequired:true },
  academyCore: {
    provider:'crohnoz-academy', enabled:false, apiBaseUrl:'', localFallback:true, contentTenantScoped:false, organizationSlug:'cristian-demo',
    owns:['auth','profiles','account-lifecycle','catalog','enrollments','progress','assessments','certificates','cohorts','content-studio','academic-audit','invitations']
  },
  authentication: {
    provider:'crohnoz-academy', sessionStorageOnly:true, minimumPasswordLength:12, passwordReset:true, invitationActivation:true,
    accountSuspension:true, roleAwareRouting:true, productionMfa:'planned'
  },
  observability: {
    localTelemetry:true, remoteAnalyticsDefault:false, consentRequired:true, sessionRecording:false, piiAllowed:false, sensitiveLearningContentAllowed:false
  },
  featureFlags: { premiumExperience:'cca-premium-experience', xmlContentPipeline:'cca-xml-content-v1', liveCyberRange:'cca-cyber-range-live' }
});

(() => {
  const rawFile = location.pathname.split('/').filter(Boolean).pop() || 'dashboard.html';
  const file = rawFile.includes('.') ? rawFile : `${rawFile}.html`;
  const protectedRoutes = new Map([
    ['dashboard.html', []], ['index.html', []], ['catalog.html', []], ['course.html', []], ['lesson.html', []], ['progress.html', []],
    ['onboarding.html', ['learner']], ['teacher.html', ['instructor','coordinator','admin']], ['instructor.html', ['instructor','coordinator','admin']],
    ['studio.html', ['author','coordinator','admin']], ['student.html', ['coordinator','admin']], ['users.html', ['coordinator','admin']],
    ['certificate.html', []], ['account.html', []], ['privacy.html', []]
  ]);
  if (!protectedRoutes.has(file)) return;

  document.documentElement.style.visibility = 'hidden';
  Promise.resolve()
    .then(() => import('./academy-core.adapter.js'))
    .then(() => import('./auth.session.js'))
    .then(async () => {
      const session = window.CCAAuth?.requireAuth({ roles:protectedRoutes.get(file), unauthorized:'./dashboard.html' });
      if (!session) return;
      document.documentElement.style.visibility = '';

      const ensureStyle = (href, key) => {
        if (document.querySelector(`link[data-${key}]`)) return;
        const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = href; style.dataset[key] = 'true'; document.head.appendChild(style);
      };
      ensureStyle('./premium-ui.css','premiumUi');
      ensureStyle('./premium-layout.css','premiumLayout');
      ensureStyle('./clarity-ui.css','clarityUi');

      if (['catalog.html','course.html','lesson.html','progress.html'].includes(file)) await import('./product-shell.js');
      if (file === 'studio.html') { await import('./studio.js'); await import('./xml-content.js'); }
      if (file === 'index.html') {
        const loadIndexHardening = async () => { await import('./no-ai.js'); await import('./privacy-hardening.js'); };
        if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', loadIndexHardening, { once:true });
        else await loadIndexHardening();
      }
      if (file === 'instructor.html' && !document.querySelector('link[data-instructor-unified]')) {
        const theme = document.createElement('link'); theme.rel = 'stylesheet'; theme.href = './instructor-unified.css'; theme.dataset.instructorUnified = 'true'; document.head.appendChild(theme);
      }

      if (!document.querySelector('script[data-premium-ui]')) {
        const premiumScript = document.createElement('script'); premiumScript.src = './premium-ui.js'; premiumScript.defer = true; premiumScript.dataset.premiumUi = 'true'; document.body.appendChild(premiumScript);
      }
      if (!document.querySelector('script[data-clarity-ui]')) {
        const clarityScript = document.createElement('script'); clarityScript.src = './clarity-ui.js'; clarityScript.defer = true; clarityScript.dataset.clarityUi = 'true'; document.body.appendChild(clarityScript);
      }

      setTimeout(() => {
        if (file !== 'index.html') document.querySelectorAll('a[href="./index.html"]').forEach(link => { link.href = './dashboard.html'; });
        const academyNav = document.querySelector('.nav-item[data-view="academy"]');
        if (academyNav) academyNav.addEventListener('click', () => { location.href = './catalog.html'; });
        document.querySelectorAll('[data-jump="academy"]').forEach(link => link.addEventListener('click', () => { location.href = './catalog.html'; }));

        const profile = document.querySelector('.profile');
        if (profile) {
          profile.setAttribute('role','link'); profile.setAttribute('tabindex','0'); profile.setAttribute('aria-label','Abrir mi cuenta'); profile.style.cursor = 'pointer';
          const openAccount = () => { location.href = './account.html'; };
          profile.addEventListener('click',openAccount);
          profile.addEventListener('keydown',event => { if (event.key === 'Enter' || event.key === ' ') openAccount(); });
          const name = profile.querySelector('strong'); const role = profile.querySelector('.profile-copy span'); const avatar = profile.querySelector('.avatar');
          const displayName = session.user?.display_name || session.user?.username || 'Usuario Academy';
          const roleLabels = { learner:'Security Apprentice', instructor:'Cybersecurity Instructor', coordinator:'Academy Coordinator', admin:'Academy Administrator', author:'Content Author', reviewer:'Content Reviewer' };
          if (name) name.textContent = displayName;
          if (role) role.textContent = roleLabels[session.user?.role] || 'Academy User';
          if (avatar) avatar.textContent = displayName.trim().split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'CA';
        }
      }, 0);
    })
    .catch(() => { location.replace('./auth.html'); });
})();