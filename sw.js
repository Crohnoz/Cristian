const CACHE = 'cca-shell-v21-container-labs';
const SHELL = [
  '/',
  '/dashboard.html',
  '/dashboard.css',
  '/dashboard.js',
  '/premium-ui.css',
  '/premium-layout.css',
  '/premium-ui.js',
  '/clarity-ui.css',
  '/clarity-ui.js',
  '/product-shell.css',
  '/product-shell.js',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/no-ai.js',
  '/privacy-hardening.js',
  '/tenant.config.js',
  '/telemetry.js',
  '/analytics.js',
  '/academy-core.adapter.js',
  '/auth.session.js',
  '/auth.html',
  '/auth.css',
  '/auth.page.js',
  '/onboarding.html',
  '/onboarding.css',
  '/onboarding.js',
  '/account.html',
  '/account.js',
  '/reset-password.html',
  '/reset-password.js',
  '/activate.html',
  '/activate.js',
  '/users.html',
  '/users.css',
  '/users-lifecycle.css',
  '/users.js',
  '/student.html',
  '/student.css',
  '/student.js',
  '/progress.html',
  '/progress.css',
  '/progress.js',
  '/catalog.html',
  '/catalog.css',
  '/catalog.js',
  '/container-catalog.css',
  '/container-lab.html',
  '/container-lab.css',
  '/container-lab.js',
  '/api-lab.html',
  '/api-lab.css',
  '/api-lab.js',
  '/content/container-labs.json',
  '/course.html',
  '/course.css',
  '/course.js',
  '/lesson.html',
  '/lesson.css',
  '/lesson.js',
  '/showcase.html',
  '/showcase.css',
  '/showcase-premium.css',
  '/public-preview.html',
  '/teacher.html',
  '/teacher.css',
  '/teacher.js',
  '/instructor.html',
  '/instructor.css',
  '/instructor.js',
  '/instructor-unified.css',
  '/studio.html',
  '/studio.css',
  '/studio.js',
  '/xml-content.js',
  '/content/course-example.xml',
  '/certificate.html',
  '/certificate.js',
  '/privacy.html',
  '/privacy.js',
  '/brand.svg',
  '/manifest.webmanifest',
  '/art/cristian-avatar.svg',
  '/art/course-phishing.svg',
  '/art/course-web-security.svg',
  '/art/course-soc.svg',
  '/art/course-cloud-identity.svg',
  '/art/lesson-phishing-email.svg',
  '/art/lesson-phishing-inbox.svg',
  '/art/lesson-live-class.svg',
  '/art/lesson-video-replay.svg',
  '/art/lesson-lab-workspace.svg',
  '/art/lesson-quiz-signals.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match('/auth.html')))
  );
});