const CACHE = 'cca-shell-v12-mission-control';
const SHELL = [
  '/',
  '/dashboard.html',
  '/dashboard.css',
  '/dashboard.js',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/tenant.config.js',
  '/telemetry.js',
  '/analytics.js',
  '/academy-core.adapter.js',
  '/auth.session.js',
  '/auth.html',
  '/auth.css',
  '/auth.page.js',
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
  '/catalog.html',
  '/catalog.css',
  '/catalog.js',
  '/course.html',
  '/course.css',
  '/course.js',
  '/lesson.html',
  '/lesson.css',
  '/lesson.js',
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
  '/art/lesson-quiz-signals.svg',
  '/instructor.html',
  '/instructor.css',
  '/instructor.js',
  '/certificate.html',
  '/certificate.js',
  '/privacy.html',
  '/privacy.js',
  '/brand.svg',
  '/manifest.webmanifest'
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
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match('/auth.html')))
  );
});