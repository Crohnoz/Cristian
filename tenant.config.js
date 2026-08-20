window.CCA_CONFIG = Object.freeze({
  brand: {
    name: 'Cristian Cyber Academy',
    shortName: 'CCA',
    poweredBy: 'Crohnoz Labs',
    accent: '#2be6a5',
    themeColor: '#07100f'
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
    version: '0.2.1-premium',
    northStar: 'Learn → Practice → Attack/Defend → Explain → Score → Certify',
    modules: ['academy', 'phishing', 'range', 'mentor', 'achievements']
  },
  academyCore: {
    provider: 'crohnoz-academy',
    enabled: false,
    apiBaseUrl: '',
    localFallback: true,
    owns: ['auth', 'profiles', 'catalog', 'enrollments', 'progress', 'assessments', 'certificates', 'cohorts', 'content-studio', 'academic-audit']
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
