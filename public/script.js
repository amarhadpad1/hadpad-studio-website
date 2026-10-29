// Contact form: posts to /api/enquiry (Cloudflare Worker), which saves to Google Sheets
// and reports the real result. Success is only shown when the server confirms it.
(function () {
  var form = document.getElementById('f');
  if (!form) return;
  var msg = document.getElementById('msg');
  var btn = form.querySelector('button[type=submit]');
  var WA = 'https://wa.me/916300220509?text=';
  var loadedAt = Date.now();

  function say(cls, html) { msg.className = cls; msg.innerHTML = html; }
  function waLink(d) {
    var t = 'Hello Hadpad Studio, I am ' + d.name + ' (' + d.phone + '). I need: ' + d.service + '. ' + (d.message || '');
    return '<a target="_blank" rel="noopener" href="' + WA + encodeURIComponent(t) + '">Send the same message on WhatsApp</a>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) d[el.name] = el.value.trim(); });
    var bad = [];
    if (!d.name) bad.push(form.name);
    if (d.phone.replace(/\D/g, '').length < 10) bad.push(form.phone);
    if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) bad.push(form.email);
    ['name', 'phone', 'email'].forEach(function (k) { form[k].removeAttribute('aria-invalid'); });
    if (bad.length) {
      bad.forEach(function (el) { el.setAttribute('aria-invalid', 'true'); });
      say('err', 'Please enter your name, a 10-digit phone number, and a valid email if you add one.');
      bad[0].focus();
      return;
    }
    d.elapsed = Date.now() - loadedAt;
    btn.disabled = true; btn.textContent = 'Sending…'; say('', 'Sending your message…');

    fetch('/api/enquiry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, err: j.error }; }); })
      .then(function (res) {
        if (res.ok) { form.reset(); loadedAt = Date.now(); say('ok', 'Thank you! Your message was sent. We’ll get back to you soon.'); return; }
        if (res.err === 'too_fast') { say('err', 'That was very quick. Please press Send again.'); return; }
        throw new Error(res.err || 'fail');
      })
      .catch(function () { say('err', 'Sorry, your message could not be sent. ' + waLink(d) + ' or email aharpad@gmail.com.'); })
      .then(function () { btn.disabled = false; btn.textContent = 'Send message'; });
  });
})();