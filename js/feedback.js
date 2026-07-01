const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6eDDMiDwo7mT1AAPs6SXNaaDkZEGCL55EV4HmczZqMr7sSOKU3w4XYPNn4ooiJcRK/exec';

function getRatingValue() {
  const stars = document.querySelectorAll('.rating__star');
  let value = 0;
  stars.forEach(s => {
    if (s.classList.contains('active')) {
      value = Math.max(value, parseInt(s.dataset.value, 10));
    }
  });
  return value;
}

async function submitFeedback(formId, successId, data) {
  const form = document.getElementById(formId);
  const success = document.getElementById(successId);

  if (!data) {
    data = {};
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
      data[input.placeholder || input.name || 'field'] = input.value;
    });
    data.rating = getRatingValue();
  }

  const btn = form.querySelector('.btn');
  const btnText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
  btn.disabled = true;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    form.style.display = 'none';
    success.classList.add('active');

    setTimeout(() => {
      const modal = form.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
      form.reset();
      form.style.display = '';
      success.classList.remove('active');
      document.querySelectorAll('.rating__star').forEach(s => s.classList.remove('active'));
    }, 3000);

  } catch (error) {
    btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка. Попробуйте ещё раз';
    btn.disabled = false;
    console.error('Feedback error:', error);
    setTimeout(() => { btn.innerHTML = btnText; }, 3000);
  }
}

document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    type: 'feedback',
    name: document.getElementById('fb-name').value,
    phone: document.getElementById('fb-phone').value,
    message: document.getElementById('fb-message').value,
    rating: getRatingValue(),
    timestamp: new Date().toISOString()
  };
  await submitFeedback('feedbackForm', 'feedbackSuccess', data);
});

document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('.form-input');
  const data = {
    type: 'booking',
    name: inputs[0].value,
    phone: inputs[1].value,
    date: inputs[2].value,
    guests: inputs[3].value,
    notes: inputs[4].value,
    timestamp: new Date().toISOString()
  };
  await submitFeedback('bookingForm', 'bookingSuccess', data);
});

document.getElementById('franchiseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('.form-input');
  const data = {
    type: 'franchise',
    name: inputs[0].value,
    phone: inputs[1].value,
    email: inputs[2].value,
    city: inputs[3].value,
    timestamp: new Date().toISOString()
  };
  await submitFeedback('franchiseForm', 'franchiseSuccess', data);
});
