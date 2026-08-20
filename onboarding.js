(() => {
  const auth = window.CCAAuth;
  const session = auth?.requireAuth?.({ roles:['learner'] });
  if (!session) return;

  const KEY = 'cca:onboarding:v1';
  const form = document.getElementById('onboardingForm');
  const steps = [...document.querySelectorAll('.onboarding-step')];
  const backButton = document.getElementById('backButton');
  const nextButton = document.getElementById('nextButton');
  const finishButton = document.getElementById('finishButton');
  const stepProgress = document.getElementById('stepProgress');
  const stepLabel = document.getElementById('stepLabel');
  const recommendation = document.getElementById('recommendation');
  let current = 0;

  const routeLabels = {
    foundations: 'Cyber Defender Professional',
    appsec: 'Application Security Professional',
    soc: 'Blue Team & Incident Response'
  };

  function selected(name) {
    return form.querySelector(`input[name="${name}"]:checked`)?.value || '';
  }

  function render() {
    steps.forEach((step, index) => step.classList.toggle('active', index === current));
    backButton.disabled = current === 0;
    nextButton.hidden = current === steps.length - 1;
    finishButton.hidden = current !== steps.length - 1;
    stepProgress.style.width = `${((current + 1) / steps.length) * 100}%`;
    stepLabel.textContent = `Paso ${current + 1} de ${steps.length}`;
    recommendation.textContent = routeLabels[selected('goal')] || routeLabels.foundations;
  }

  nextButton.addEventListener('click', () => {
    current = Math.min(steps.length - 1, current + 1);
    render();
  });
  backButton.addEventListener('click', () => {
    current = Math.max(0, current - 1);
    render();
  });
  form.querySelectorAll('input[name="goal"]').forEach(input => input.addEventListener('change', render));

  form.addEventListener('submit', event => {
    event.preventDefault();
    const profile = {
      goal: selected('goal'),
      format: selected('format'),
      weeklyHours: Number(selected('pace') || 2),
      recommendedRoute: routeLabels[selected('goal')] || routeLabels.foundations,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(profile));
    location.replace('./dashboard.html');
  });

  render();
})();