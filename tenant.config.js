window.CCA_CONFIG = Object.freeze({
  brand: {
    name: 'Cristian Cyber Academy',
    shortName: 'CCA',
    poweredBy: 'Crohnoz Labs',
    accent: '#819c8e',
    themeColor: '#111715'
  },
  instructor: {
    displayName: 'Cristian',
    role: 'Lead Cybersecurity Instructor',
    initials: 'CG'
  },
  tenant: {
    id: 'cristian-demo',
    environment: 'preview',
    mode: 'white-label'
  },
  product: {
    version: '0.5.0-immersive-learning-preview',
    northStar: 'Learn → Practice → Attack/Defend → Explain → Score → Certify',
    modules: ['immersive-learning', 'visual-academy', 'academy', 'phishing', 'range', 'mentor', 'achievements', 'account', 'identity-ops', 'student-360']
  },
  academyCore: {
    provider: 'crohnoz-academy',
    enabled: false,
    apiBaseUrl: '',
    localFallback: true,
    owns: ['auth', 'profiles', 'account-lifecycle', 'catalog', 'enrollments', 'progress', 'assessments', 'certificates', 'cohorts', 'content-studio', 'academic-audit', 'invitations']
  },
  authentication: {
    provider: 'crohnoz-academy',
    sessionStorageOnly: true,
    minimumPasswordLength: 12,
    passwordReset: true,
    invitationActivation: true,
    accountSuspension: true,
    roleAwareRouting: true,
    productionMfa: 'planned'
  },
  observability: {
    localTelemetry: true,
    remoteAnalyticsDefault: false,
    consentRequired: true,
    sessionRecording: false,
    piiAllowed: false,
    sensitiveLearningContentAllowed: false
  },
  featureFlags: {
    premiumExperience: 'cca-premium-experience',
    liveAiMentor: 'cca-ai-mentor-live',
    liveCyberRange: 'cca-cyber-range-live'
  }
});

(() => {
  const rawFile = location.pathname.split('/').filter(Boolean).pop() || 'index.html';
  const file = rawFile.includes('.') ? rawFile : `${rawFile}.html`;
  const protectedRoutes = new Map([
    ['index.html', []],
    ['instructor.html', ['instructor', 'coordinator', 'admin']],
    ['student.html', ['coordinator', 'admin']],
    ['certificate.html', []]
  ]);
  if (!protectedRoutes.has(file)) return;

  document.documentElement.style.visibility = 'hidden';
  Promise.resolve()
    .then(() => import('./academy-core.adapter.js'))
    .then(() => import('./auth.session.js'))
    .then(() => {
      const session = window.CCAAuth?.requireAuth({ roles: protectedRoutes.get(file) });
      if (!session) return;
      document.documentElement.style.visibility = '';
      setTimeout(() => {
        const academyNav = document.querySelector('.nav-item[data-view="academy"]');
        if (academyNav) academyNav.addEventListener('click', () => { location.href = './catalog.html'; });
        document.querySelectorAll('[data-jump="academy"]').forEach(link => link.addEventListener('click', () => { location.href = './catalog.html'; }));

        const profile = document.querySelector('.profile');
        if (profile) {
          profile.setAttribute('role', 'link');
          profile.setAttribute('tabindex', '0');
          profile.setAttribute('aria-label', 'Abrir mi cuenta');
          profile.style.cursor = 'pointer';
          const openAccount = () => { location.href = './account.html'; };
          profile.addEventListener('click', openAccount);
          profile.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') openAccount(); });
          const name = profile.querySelector('strong');
          const role = profile.querySelector('.profile-copy span');
          const avatar = profile.querySelector('.avatar');
          const displayName = session.user?.display_name || session.user?.username || 'Usuario Academy';
          const roleLabels = { learner:'Security Apprentice', instructor:'Cybersecurity Instructor', coordinator:'Academy Coordinator', admin:'Academy Administrator', author:'Content Author', reviewer:'Content Reviewer' };
          if (name) name.textContent = displayName;
          if (role) role.textContent = roleLabels[session.user?.role] || 'Academy User';
          if (avatar) avatar.textContent = displayName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'CA';
        }
      }, 0);
    })
    .catch(() => { location.replace('./auth.html'); });
})();