// Handles POST /api/enquiry. The Google Apps Script URL lives in the
// APPS_SCRIPT_URL secret (never in browser code). Because this call runs on the
// server, we can read the real response, so success/failure is verified.
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const clip = (v, n) => String(v || '').trim().slice(0, n);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/enquiry') return env.ASSETS.fetch(request);
    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

    let d;
    try { d = await request.json(); } catch { return json({ ok: false, error: 'bad_request' }, 400); }

    if (d.website) return json({ ok: true });                       // honeypot: bots only
    if (Number(d.elapsed) < 2500) return json({ ok: false, error: 'too_fast' }, 429);

    const name = clip(d.name, 100), phone = clip(d.phone, 20), email = clip(d.email, 120);
    if (!name || phone.replace(/\D/g, '').length < 10) return json({ ok: false, error: 'invalid' }, 400);
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'invalid' }, 400);
    if (!env.APPS_SCRIPT_URL) return json({ ok: false, error: 'not_configured' }, 503);

    // Same five fields the existing sheet already receives. Business name and
    // budget are folded into "message" so the sheet's columns stay unchanged.
    const extra = [clip(d.business, 120) && 'Business: ' + clip(d.business, 120),
                   clip(d.budget, 60) && 'Budget: ' + clip(d.budget, 60)].filter(Boolean).join(' | ');
    const message = [extra, clip(d.message, 2000)].filter(Boolean).join('\n');

    try {
      const res = await fetch(env.APPS_SCRIPT_URL, {
        method: 'POST', redirect: 'follow',
        body: new URLSearchParams({ name, phone, email, service: clip(d.service, 60), message }),
      });
      const text = await res.text();
      let body = null; try { body = JSON.parse(text); } catch {}
      const failed = !res.ok || /<html/i.test(text.slice(0, 200)) ||
        (body && (body.result === 'error' || body.success === false || body.ok === false));
      return failed ? json({ ok: false, error: 'upstream' }, 502) : json({ ok: true });
    } catch { return json({ ok: false, error: 'upstream' }, 502); }
  },
};