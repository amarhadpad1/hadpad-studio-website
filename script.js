// Contact form: saves each enquiry to Google Sheets. The Apps Script emails the owner.
(function () {
  var form = document.getElementById('f');
  var msg = document.getElementById('msg');
  var WA = 'https://wa.me/916300220509?text=';
  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbwpUX9-Kcj6-ufLvPMzVcDgZUVIbDJgbyeatynaHTrOATHLY-QI3lTWNOO8I-Zy-TXQ/exec';
  var loadedAt = Date.now();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = '';
    var name = form.name.value.trim();
    var phone = form.phone.value.replace(/\D/g, '');
    if (!name || phone.length < 10) {
      msg.className = 'err';
      msg.textContent = 'Please enter your name and a 10-digit phone number.';
      return;
    }

    // Bot checks: hidden field filled, or form submitted too fast
    if (form._honey.value || Date.now() - loadedAt < 3000) {
      form.reset();
      msg.className = 'ok';
      msg.textContent = 'Thank you! We received your message and will call you soon.';
      return;
    }

    var btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams(new FormData(form))
    }).then(function () {
      form.reset();
      msg.className = 'ok';
      msg.textContent = 'Thank you! We received your message and will call you soon.';
    }).catch(function () {
      var text = 'Hi Amar, I am ' + name + ' (' + phone + '). I need: ' + form.service.value + '. ' + form.message.value;
      msg.className = 'err';
      msg.innerHTML = 'Could not send the form. <a target="_blank" rel="noopener" href="' + WA + encodeURIComponent(text) + '">Send the same message on WhatsApp</a>.';
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Send message';
    });
  });
})();

