(function () {
  var form = document.getElementById('f');
  var msg = document.getElementById('msg');
  var EMAIL = 'aharpad@gmail.com';
  var WA = 'https://wa.me/916300220509?text=';

  // 👇 PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BETWEEN THE QUOTES
  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbwpUX9-Kcj6-ufLvPMzVcDgZUVIbDJgbyeatynaHTrOATHLY-QI3lTWNOO8I-Zy-TXQ/exec';

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
    var btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    var data = new FormData(form);

    // 1) Save to Google Sheet
    var toSheet = fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams(data)
    });

    // 2) Email the owner
    var toEmail = fetch('https://formsubmit.co/ajax/' + EMAIL, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    }).then(function (r) {
      if (!r.ok) throw new Error('fail');
    });

    // Success if at least one of them worked
    Promise.allSettled([toSheet, toEmail]).then(function (res) {
      var ok = res.some(function (x) { return x.status === 'fulfilled'; });
      if (!ok) throw new Error('fail');
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