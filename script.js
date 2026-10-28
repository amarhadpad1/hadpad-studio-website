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
      msg.textContent = 'Message sent. If you do not hear from us within one working day, please message us on WhatsApp.';
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


// Hadpad Studio extras: theme, menu, quote links, fade-in, brand brief quiz
(function () {
  var WA_NUMBER = '916300220509'; // business WhatsApp number
  var r = document.documentElement;
  function $(id) { return document.getElementById(id); }

  $('theme').addEventListener('click', function () {
    var t = r.getAttribute('data-theme');
    var dark = t ? t === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    var n = dark ? 'light' : 'dark';
    r.setAttribute('data-theme', n);
    try { localStorage.setItem('theme', n); } catch (e) {}
  });

  var mb = $('menu'), nv = $('nav');
  function setMenu(o) { nv.classList.toggle('open', o); mb.setAttribute('aria-expanded', o); mb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); }
  mb.addEventListener('click', function () { setMenu(!nv.classList.contains('open')); });
  nv.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-svc]');
    var sel = document.querySelector('#f select[name=service]');
    if (a && sel) sel.value = a.getAttribute('data-svc');
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.sec h2,.svc,.pkg,.proj,.step,.quiz,.faq,.box').forEach(function (el) { el.classList.add('rv'); io.observe(el); });
  }

  // ----- Start your brand quiz -----
  var Q = [
    { k: 'Business type', q: 'What type of business do you have?', t: 'text', req: 1, ph: 'e.g. Construction, salon, restaurant' },
    { k: 'Service needed', q: 'What do you need?', t: 'choice', req: 1, o: ['Logo', 'Visiting card', 'Website', 'Branding', 'Multiple services'] },
    { k: 'Preferred style', q: 'Which design style do you prefer?', t: 'choice', req: 1, o: ['Modern', 'Minimal', 'Premium', 'Colourful', 'Traditional'] },
    { k: 'Budget', q: 'What is your approximate budget? (optional)', t: 'text', ph: 'Type an amount or “not sure”' },
    { k: 'Extra requirements', q: 'Anything else we should know? (optional)', t: 'area' }
  ];
  var A = {}, n = 0, body = $('qbody'), prog = $('qprog'), fill = $('qfill');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function brief() { return 'Hi Hadpad Studio, here is my project brief:\n' + Q.map(function (s) { return '- ' + s.k + ': ' + (A[s.k] || 'Not specified'); }).join('\n'); }
  function val() {
    if (Q[n].t === 'choice') { var c = body.querySelector('input:checked'); return c ? c.value : ''; }
    return body.querySelector('[name=a]').value.trim();
  }
  function render() {
    fill.style.width = (n / Q.length * 100) + '%';
    if (n >= Q.length) {
      prog.textContent = 'Your brief is ready';
      body.innerHTML = '<textarea id="qres" rows="8" readonly aria-label="Your project brief">' + esc(brief()) + '</textarea>' +
        '<div class="qnav"><button type="button" class="btn" data-a="copy">Copy brief</button>' +
        '<a class="btn alt" target="_blank" rel="noopener" href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(brief()) + '">Send on WhatsApp</a>' +
        '<button type="button" class="btn alt" data-a="reset">Start again</button></div><p class="qerr" id="qmsg" role="status"></p>';
      return;
    }
    prog.textContent = 'Step ' + (n + 1) + ' of ' + Q.length;
    var s = Q[n], h = '<fieldset><legend>' + s.q + '</legend>';
    if (s.t === 'choice') s.o.forEach(function (o) { h += '<label class="ch"><input type="radio" name="a" value="' + o + '"' + (A[s.k] === o ? ' checked' : '') + '><span>' + o + '</span></label>'; });
    else if (s.t === 'area') h += '<textarea name="a" rows="3" aria-label="' + esc(s.q) + '">' + esc(A[s.k] || '') + '</textarea>';
    else h += '<input name="a" type="text" aria-label="' + esc(s.q) + '" placeholder="' + (s.ph || '') + '" value="' + esc(A[s.k] || '') + '">';
    h += '</fieldset><p class="qerr" role="alert"></p><div class="qnav">' + (n ? '<button type="button" class="btn alt" data-a="back">Back</button>' : '') +
      '<button type="button" class="btn" data-a="next">' + (n === Q.length - 1 ? 'Create brief' : 'Next') + '</button></div>';
    body.innerHTML = h;
  }
  body.addEventListener('click', function (e) {
    var a = e.target.getAttribute && e.target.getAttribute('data-a');
    if (!a) return;
    if (a === 'back') { A[Q[n].k] = val(); n--; render(); }
    else if (a === 'next') {
      var v = val();
      if (!v && Q[n].req) { body.querySelector('.qerr').textContent = 'Please answer this question to continue.'; return; }
      A[Q[n].k] = v; n++; render();
    } else if (a === 'reset') { A = {}; n = 0; render(); }
    else if (a === 'copy') {
      var m = $('qmsg');
      var ok = function () { m.textContent = 'Brief copied.'; };
      var fb = function () { var ta = $('qres'); ta.select(); try { document.execCommand('copy'); ok(); } catch (x) { m.textContent = 'Please select the text and copy it.'; } };
      if (navigator.clipboard) navigator.clipboard.writeText(brief()).then(ok, fb); else fb();
    }
  });
  render();
})();